<template>
	<div class="collection w-full mx-auto flex flex-col items-center">
		<!-- Banner 区域 -->
		<div
			class="collection-content relative w-full mb-8 retro-banner"
			:style="isDefault ? 'padding-bottom: 46px' : 'padding-bottom: 26px'"
		>
			<div
				v-if="infoData"
				class="absolute inset-0 bg-cover bg-center opacity-50"
				:style="{
					backgroundImage: 'url(' + infoData.banner + ')',
					backgroundColor: infoData.theme,
				}"
			></div>

			<!-- 纹理遮罩 -->
			<div class="absolute inset-0 retro-overlay"></div>

			<!-- 内容区域 -->
			<div
				v-if="infoData"
				class="relative z-10 text-center text-white flex flex-col items-center justify-center h-full"
			>
				<!-- 标题 -->
				<div class="manga-title-box">
					<h1 class="text-4xl font-bold relative text-shadow-retro">
						{{ infoData.showName }}
					</h1>
				</div>

				<div class="manga-sub-box">
					<h1 class="text-xl -mt-1 mb-1 font-bold relative text-shadow-retro">
						{{ infoData.name }}
					</h1>
				</div>

				<!-- 公开/私人标识 -->
				<div v-if="!infoData.isCustom" class="collection-status-badge">
					public
				</div>

				<!-- 描述文本 -->
				<div
					class="retro-display-box w-3/5 mt-8 mb-4"
					v-if="infoData.description"
				>
					<div class="display-face p-4">
						<p class="text-sm text-center text-gray-700">
							{{ infoData.description }}
						</p>
					</div>
				</div>

				<!-- 设置 -->
				<button
					v-if="!isDefault"
					@click="goToCollectionEdit"
					class="retro-btn-small mt-10"
				>
					<div class="btn-face">
						<i class="bi bi-gear-fill text-lg"></i>
					</div>
				</button>
			</div>
		</div>

		<!-- 内容区域 -->
		<div class="w-2/3 relative mt-4">
			<!-- 添加编辑控制区域 -->
			<div v-if="!isDefault" class="flex justify-between items-center mb-6">
				<h2 class="text-xl font-bold relative top-[-2px]">文档</h2>
				<div>
					<button
						v-if="isEditMode"
						class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out border-primary border-gray-300 text-gray-700 hover:bg-gray-100"
						@click="addNewEpisode"
					>
						<i class="bi bi-plus-lg mr-2"></i>
						<span>新增</span>
					</button>
					<button
						class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out border-gray-300 text-gray-700 hover:bg-gray-100"
						@click="isEditMode = !isEditMode"
					>
						<i
							class="bi mr-2"
							:class="isEditMode ? 'bi-check2' : 'bi-pencil-fill'"
						></i>
						<span>{{ isEditMode ? "完成" : "编辑" }}</span>
					</button>
				</div>
			</div>

			<draggable
				v-model="currentSeasonEpisodes"
				:disabled="!isEditMode"
				item-key="_id"
				handle=".drag-handle"
				ghost-class="ghost"
				class="grid grid-cols-3 md:grid-cols-4 gap-6 mb-10"
				@start="dragStart"
				@end="dragEnd"
				@change="handleChange"
			>
				<template #item="{ element: episode }">
					<EpisodeCard
						:episode="episode"
						:is-edit-mode="isEditMode"
						:layout="getRandomLayout()"
						@click="
							isEditMode
								? openTitleEditor(episode)
								: goToLesson(currentSeason?.seasonNumber, episode)
						"
						@delete="deleteEpisode"
						@update="updateEpisodeTitle"
						@move="handleMoveEpisode"
					/>
				</template>
			</draggable>
		</div>
	</div>

	<!-- 添加移动模态框 -->
	<dialog ref="moveModal" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg mb-4">移动到其他合集</h3>
			<div class="space-y-4">
				<div v-if="collections.length === 0" class="text-center text-gray-500">
					暂无其他合集
				</div>
				<div
					v-for="collection in collections"
					:key="collection._id"
					class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
					@click="confirmMove(collection._id, selectedEpisode)"
				>
					<div>{{ collection.showName }}</div>
					<i class="bi bi-chevron-right"></i>
				</div>
			</div>
			<div class="modal-action">
				<button class="btn" @click="closeMoveModal">取消</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { showToast } from "@/components/common/toast.js";
import EpisodeCard from "@/components/card/episode.vue";

import apiClient from "@/api";
import { useAppStore } from "@/store";
import { useRouter, useRoute } from "vue-router";
import { useLoginStore } from "@/store/index";
import draggable from "vuedraggable";

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);
const userInfo = computed(() => loginStore.userInfo);

const appStore = useAppStore();
const router = useRouter();
const route = useRoute();

const infoData = ref(null); // 存储 Info 数据
const seasons = ref([]); // 存储 season 的 key (如 S01, S02)
const episodes = ref({}); // 存储每季的集数
const currentSeasonIndex = ref(0); // 当前季的索引
const isDefault = ref(true); // 是否是系统默认数据
const currentProgress = ref({}); // 当前进度

const hasPackageAccess = ref(false); // 检测是否已购入资源包

// 编辑相关状态
const isEditMode = ref(false);
const editingEp = ref(null);
const isDragging = ref(false);

// 移动相关状态
const moveModal = ref(null);
const collections = ref([]);
const selectedEpisode = ref(null);

// 拖拽相关的方法
const dragStart = () => {
	isDragging.value = true;
};

const dragEnd = () => {
	isDragging.value = false;
};

// 获取可移动的目标合集列表
const loadCollections = async () => {
	try {
		const res = await apiClient.get("/catalogs/user-catalogs");
		if (res.data.code === 200) {
			// 过滤掉当前合集
			collections.value = res.data.data.filter(
				(c) => c._id !== route.params.id
			);
		}
	} catch (error) {
		console.error("Failed to load collections:", error);
		showToast({ message: "加载合集列表失败", type: "error" });
	}
};

// 处理移动按钮点击
const handleMoveEpisode = async (episode) => {
	selectedEpisode.value = episode;
	await loadCollections();
	moveModal.value?.showModal();
};

// 确认移动
const confirmMove = async (targetCatalogId, episode) => {
	try {
		console.log({
			episodeId: episode._id,
			fromCatalogId: route.params.id,
			toCatalogId: targetCatalogId,
			seasonNumber: currentSeason.value.seasonNumber,
		});
		const res = await apiClient.post("/catalogs/episodes/move", {
			episodeId: episode._id,
			fromCatalogId: route.params.id,
			toCatalogId: targetCatalogId,
			seasonNumber: currentSeason.value.seasonNumber,
		});

		if (res.data.code === 200) {
			await loadCategoryData();
			showToast({ message: "移动成功", type: "success" });
			moveModal.value?.close();
		}
	} catch (error) {
		console.error("Failed to move episode:", error);
		showToast({ message: "移动失败", type: "error" });
	}
};

// 关闭移动模态框
const closeMoveModal = () => {
	moveModal.value?.close();
	selectedEpisode.value = null;
};

const handleChange = async (evt) => {
	// 处理移动事件
	if (evt.moved) {
		try {
			const newOrder = [...currentSeasonEpisodes.value];
			const movedItem = newOrder.splice(evt.moved.oldIndex, 1)[0];
			newOrder.splice(evt.moved.newIndex, 0, movedItem);

			const res = await apiClient.post(`/catalogs/episodes/reorder`, {
				catalogId: route.params.id,
				seasonNumber: currentSeason.value.seasonNumber,
				episodes: newOrder.map((ep, index) => ({
					_id: ep._id,
					order: index + 1,
				})),
			});

			if (res.data.code === 200) {
				await loadCategoryData();
			} else {
				showToast({ message: "保存排序失败", type: "error" });
			}
		} catch (error) {
			showToast({ message: "保存排序失败", type: "error" });
		}
	}
};

// 删除集数
const deleteEpisode = async (episode) => {
	if (confirm("确定要删除这一集吗？")) {
		try {
			const res = await apiClient.delete(`/catalogs/episodes/${episode._id}`);
			if (res.data.code === 200) {
				await loadCategoryData();
				showToast({ message: "删除成功", type: "success" });
			}
		} catch (error) {
			showToast({ message: "删除失败", type: "error" });
		}
	}
};

// 添加更新标题的方法
const updateEpisodeTitle = async (updatedEpisode) => {
	try {
		const res = await apiClient.post(`/catalogs/episodes/update-title`, {
			catalogId: route.params.id,
			seasonNumber: currentSeason.value.seasonNumber,
			episodeId: updatedEpisode._id,
			epName: updatedEpisode.epName,
		});

		if (res.data.code === 200) {
			await loadCategoryData();
			showToast({ message: "标题更新成功", type: "success" });
		}
	} catch (error) {
		showToast({ message: "更新失败", type: "error" });
	}
};

// 添加新集
const addNewEpisode = async () => {
	const currentEpisodes = episodes.value[currentSeason.value.seasonNumber];
	const newEp = {
		catalogId: route.params.id,
		ep: currentEpisodes.length + 1,
		epName: ``,
		seasonNumber: currentSeason.value.seasonNumber,
	};

	try {
		const res = await apiClient.post("/catalogs/episodes/create", newEp);
		if (res.data.code === 200) {
			// 添加成功后重新加载数据
			await loadCategoryData();
			showToast({ message: "添加成功", type: "success" });
		}
	} catch (error) {
		showToast({ message: "添加失败", type: "error" });
	}
};

// 获取当前季的集数
const currentSeason = computed(() => seasons.value[currentSeasonIndex.value]);
const currentSeasonEpisodes = computed(() => {
	if (!currentSeason.value || !currentSeason.value.seasonNumber) return [];
	return episodes.value[currentSeason.value.seasonNumber] || [];
});

// 异步加载 JSON 数据
const loadCategoryData = async () => {
	try {
		const res = await apiClient.get(`/catalogs/${route.params.id}`);
		if (res.data.code === 200) {
			infoData.value = res.data.data;
			if (infoData.value.seasons && infoData.value.seasons.length > 0) {
				infoData.value.seasons.forEach((item) => {
					if (item && item.seasonNumber) {
						seasons.value.push({
							seasonNumber: item.seasonNumber,
							seasonName: item.seasonName || item.seasonNumber,
						});
						episodes.value[item.seasonNumber] = item.episodes || [];
					}
				});
			}
			// 判断是否是默认课程
			if (infoData.value.userId && infoData.value.isCustom) {
				isDefault.value = false;
			}
		} else {
			showToast({ message: res.data.message, type: "error" });
			infoData.value = null;
			seasons.value = [];
			episodes.value = {};
		}
	} catch (error) {
		showToast({ message: error, type: "error" });
	}
};

const getUserProfile = async () => {
	const learningProgress = userInfo.value.learningProgress || [];
	if (learningProgress.length) {
		const foundProgress = learningProgress.find(
			(p) => p.course === route.params.id
		);
		foundProgress && (currentProgress.value = foundProgress);
		appStore.initProgress(learningProgress);
	}
};

// 检查资源包访问权限
const checkPackageAccess = async () => {
	try {
		if (!isLogin.value) {
			hasPackageAccess.value = false;
			return;
		}

		const res = await apiClient.get(`/users/catalog-access/${route.params.id}`);
		if (res.data.code === 200) {
			hasPackageAccess.value = res.data.data.hasAccess;
		} else {
			hasPackageAccess.value = false;
		}
	} catch (error) {
		console.error("Failed to check package access:", error);
		hasPackageAccess.value = false;
	}
};

onMounted(async () => {
	await loadCategoryData();
	await checkPackageAccess();
	isLogin.value && getUserProfile();
});

const goToLesson = (seasonNumber, episode) => {
	if (!seasonNumber || !episode) return;
	const params = `${route.params.id}/${seasonNumber}/${episode.ep.toString()}`;
	const query = { sign: episode._id };
	episode.scriptUrl
		? router.push({ path: `/collections/${params}`, query })
		: router.push({
				path: `/card-editor/${params}`,
				query: { mode: "edit", sign: episode._id },
		  });
};

const goToCollectionEdit = () => {
	router.push({
		path: "/setup-collection",
		query: {
			resource: route.params.id,
		},
	});
};

// 布局随机函数
const getRandomLayout = () => {
	// 为了保持视觉一致性，可以根据 ep 编号固定布局
	const layouts = ["1", "2", "3", "4"];
	return layouts[3];
};
</script>

<style scoped>
.collection {
	margin-top: -64px;
}

.collection-content {
	padding-top: 96px;
}

/* 纹理遮罩 */
.retro-overlay {
	background-image: repeating-linear-gradient(
		45deg,
		rgba(0, 0, 0, 0.1) 0px,
		rgba(0, 0, 0, 0.1) 1px,
		transparent 1px,
		transparent 4px
	);
	backdrop-filter: blur(5px);
	background-color: rgba(0, 0, 0, 0.4);
}

.manga-title-box {
	position: relative;
	padding: 0.5rem 2rem;
	margin-bottom: 1rem;
}

.retro-display-box {
	position: relative;
}

.display-face {
	background-color: rgba(240, 240, 240, 0.8);
	border: 3px solid #333;
	border-radius: 12px;
	transform: translateY(-3px);
}

.retro-btn-small {
	position: relative;
	width: 4rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 8px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	border: 3px solid #333;
	border-radius: 8px;
	color: #333;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
}

.retro-btn-small .btn-face {
	background-color: rgba(240, 240, 240, 0.8);
}

button:hover .btn-face {
	background-color: white;
}

button:active .btn-edge,
button:active .btn-face {
	transform: translateY(0);
}

button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

/* 集合状态标识样式 */
.collection-status-badge {
	position: absolute;
	top: 0px;
	right: 20px;
	padding: 4px 12px;
	font-size: 0.8rem;
	border-radius: 4px;
	background-color: #333;
	color: white;
	font-weight: bold;
	box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	text-transform: uppercase;
	letter-spacing: 1px;
	z-index: 20;
	border: 2px solid rgba(255, 255, 255, 0.7);
	transform: rotate(3deg);
}

.collection-status-badge.private {
	background-color: #333;
}
</style>
