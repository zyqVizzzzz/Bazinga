<template>
	<div
		:class="[
			'collection w-full mx-auto flex flex-col items-center',
			{ 'default-collection': isDefault },
			isMobile ? 'px-2' : '',
		]"
	>
		<!-- Banner -->
		<div
			v-if="!isDefault"
			class="collection-content relative w-full mb-8 retro-banner"
			:style="!isCustom ? 'padding-bottom: 46px' : 'padding-bottom: 26px'"
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
					v-if="isCustom"
					@click="goToCollectionEdit"
					class="retro-btn-small mt-10"
				>
					<div class="btn-face">
						<i class="bi bi-gear-fill text-lg"></i>
					</div>
				</button>
			</div>
		</div>
		<div :class="isMobile ? 'w-full px-2' : 'w-4/5'" class="relative mt-4">
			<div
				v-if="isCustom && !isMobile"
				class="flex justify-between items-center mb-6"
			>
				<h2 class="text-xl font-bold relative top-[-2px]">文档</h2>
				<div>
					<button
						class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out border-primary border-gray-300 text-gray-700 hover:bg-gray-100"
						@click="addNewEpisode"
					>
						<i class="bi bi-plus-lg mr-2"></i>
						<span>新增</span>
					</button>
					<button
						v-if="currentSeasonEpisodes.length"
						class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out border-gray-300 text-gray-700 hover:bg-gray-100"
						@click="isEditMode = !isEditMode"
					>
						<i
							class="bi mr-2"
							:class="isEditMode ? 'bi-check2 ' : 'bi-pencil-fill'"
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
				:class="[
					'grid mb-10',
					isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-3 md:grid-cols-4 gap-6',
				]"
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

	<!-- 移动 -->
	<dialog ref="moveModal" class="modal">
		<div class="modal-box vintage-modal max-w-md min-h-[300px] p-6">
			<form method="dialog" class="absolute right-4 top-4">
				<button class="btn btn-sm btn-circle btn-ghost">
					<i class="bi bi-x-lg"></i>
				</button>
			</form>

			<h3 class="font-bold text-lg mb-6">移动到其他合集</h3>

			<div class="space-y-4">
				<div
					v-if="collections.length === 0"
					class="text-center text-gray-500 py-8"
				>
					暂无其他合集
				</div>
				<div v-for="collection in collections" :key="collection._id">
					<div
						class="collection-item flex items-center justify-between p-4 border-2 border-black rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
						@click="selectedTargetCollection = collection"
						:class="{
							'border-primary':
								selectedTargetCollection?._id === collection._id,
						}"
					>
						<div class="font-medium">{{ collection.showName }}</div>
						<i class="bi bi-chevron-right"></i>
					</div>
					<!-- 确认提示 -->
					<div
						v-if="selectedTargetCollection?._id === collection._id"
						class="mt-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
					>
						<p class="text-sm text-gray-600">
							是否确定移动到 合集 "{{ collection.showName }}"？
						</p>
						<div class="flex justify-end mt-4 gap-2">
							<button
								class="retro-btn-small"
								@click="selectedTargetCollection = null"
							>
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face">取消</div>
									</div>
								</div>
							</button>
							<button
								class="retro-btn-small"
								@click="confirmMove(collection._id, selectedEpisode)"
							>
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face">确定</div>
									</div>
								</div>
							</button>
						</div>
					</div>
				</div>
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
import { useMobile } from "@/composables/useBreakpoint";

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
const isDefault = ref(false); // 是否是系统默认数据
const isCustom = ref(false); // 是否由用户创建
const currentProgress = ref({}); // 当前进度

const hasPackageAccess = ref(false); // 检测是否已购入资源包

// 编辑相关状态
const isEditMode = ref(false);
const editingEp = ref(null);
const isDragging = ref(false);
const { isMobile } = useMobile();

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
				(c) => c._id !== route.params.id && !c.isDefault
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

const selectedTargetCollection = ref(null);
// 确认移动
const confirmMove = async (targetCatalogId, episode) => {
	try {
		const res = await apiClient.post("/catalogs/episodes/move", {
			episodeId: episode._id,
			fromCatalogId: route.params.id,
			toCatalogId: targetCatalogId,
			seasonNumber: currentSeason.value.seasonNumber,
		});

		if (res.data.code === 200) {
			await loadCategoryData();
			showToast({ message: "移动成功", type: "success" });
			selectedTargetCollection.value = null; // 重置选中状态
			moveModal.value?.close();
		}
	} catch (error) {
		console.error("Failed to move episode:", error);
		showToast({ message: "移动失败", type: "error" });
	}
};

// 修改 closeMoveModal 方法
const closeMoveModal = () => {
	moveModal.value?.close();
	selectedEpisode.value = null;
	selectedTargetCollection.value = null; // 重置选中状态
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
				isCustom.value = true;
			}
			if (infoData.value.isDefault) {
				isDefault.value = true;
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
	const query = { sign: episode._id, title: episode.epName };
	episode.scriptUrl
		? isMobile.value
			? router.push({
					path: `/card-editor/${params}`,
					query: { sign: episode._id, title: episode.epName },
			  })
			: router.push({ path: `/collections/${params}`, query })
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

.default-collection {
	margin-top: 20px; /* 默认合集不需要负margin */
}

.collection-content {
	padding-top: 96px;
}

.default-collection-header {
	text-align: center;
	margin-bottom: 2rem;
	padding: 2rem 1rem;
	width: 100%;
	max-width: 800px;
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
	width: 6rem;
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
	font-size: 0.875rem;
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

.vintage-modal {
	background: #ffffff;
	border: 2px solid #000;
	box-shadow: 3px 3px 0 #000;
	overflow: hidden;
}

.collection-item {
	background: #f5f5f5;
	/* box-shadow: 2px 2px 0 #000; */
}

.retro-btn {
	position: relative;
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
	border-radius: 6px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 6px;
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
	border: 2px solid #333;
	border-radius: 6px;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 8px 16px;
}

.retro-btn:hover .btn-face {
	background-color: white;
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face {
	transform: translateY(0);
}

/* 移动端Banner适配 */
@media (max-width: 768px) {
	.collection-content {
		padding-top: 80px; /* 减少顶部padding */
		padding-bottom: 20px;
		margin-bottom: 4px;
	}

	.manga-title-box h1 {
		font-size: 1.875rem; /* 从text-4xl减小到text-3xl */
	}

	.manga-sub-box h1 {
		font-size: 1.125rem; /* 从text-xl减小 */
	}

	.retro-display-box {
		width: 90%; /* 从w-3/5增加到90% */
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}

	.collection-status-badge {
		top: 10px;
		right: 10px;
		font-size: 0.7rem;
		padding: 2px 8px;
	}
}

@media (max-width: 768px) {
	.grid {
		grid-template-columns: repeat(2, 1fr) !important; /* 强制两列 */
		gap: 1rem; /* 减少间距 */
	}
}

/* 移动端编辑控制区域 */
@media (max-width: 768px) {
	.flex.justify-between.items-center {
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
	}

	.flex.justify-between.items-center h2 {
		margin-bottom: 0;
	}

	.flex.justify-between.items-center > div {
		display: flex;
		gap: 0.5rem;
		width: 100%;
		justify-content: flex-end;
	}

	.flex.justify-between.items-center button {
		flex: 1;
		max-width: 120px;
		font-size: 0.875rem;
		padding: 0.5rem 1rem;
	}
}

/* 移动端整体适配 */
@media (max-width: 768px) {
	.collection {
		margin-top: -60px; /* 调整负margin */
	}

	.default-collection {
		margin-top: 10px;
	}

	/* 模态框移动端适配 */
	.vintage-modal {
		max-width: 95vw;
		margin: 0 auto;
	}

	.modal-box {
		padding: 1rem;
		min-height: 250px;
	}

	.collection-item {
		padding: 0.75rem;
		font-size: 0.875rem;
	}
}
</style>
