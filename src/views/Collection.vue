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

				<!-- 描述文本 -->
				<h2 class="font-semibold my-2 text-gray-200 w-4/5 retro-text-shadow">
					{{ infoData.description }}
				</h2>

				<!-- 难度等级 -->
				<div class="retro-display-box w-3/5 mt-4 mb-4">
					<div class="display-face p-4">
						<div
							class="font-semibold flex items-center justify-center text-gray-800"
						>
							<div
								class="rating rating-sm ml-2"
								v-for="item in parseInt(infoData.difficulty)"
							>
								<div class="retro-star"></div>
							</div>
						</div>
						<p
							class="text-sm text-left text-gray-700 mt-2"
							v-if="infoData.difficultyDetails"
						>
							{{ infoData.difficultyDetails }}
						</p>
					</div>
				</div>

				<!-- 设置 -->
				<!--  -->
				<button
					v-if="!isDefault"
					@click="goToCollectionEdit"
					class="retro-btn-small mt-6"
				>
					<div class="btn-face">
						<i class="bi bi-gear-fill text-lg"></i>
					</div>
				</button>
			</div>
		</div>

		<!-- 内容区域 -->
		<div class="w-2/3 relative mt-4">
			<!-- 进度提示 -->
			<!-- <div v-if="currentProgress.course" class="mb-10">
				<div class="alert-content">
					<span @click="goToLessonProgress" class="retro-link text-sm">
						{{ t("collection.continue") }}
					</span>
				</div>
			</div> -->
			<!-- 剧集 -->

			<!-- 使用 draggable 替换原来的 div -->
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
					/>
				</template>
			</draggable>

			<!-- 添加新集按钮 -->
			<div v-if="isEditMode" class="retro-add-button" @click="addNewEpisode">
				<div class="card-shadow">
					<div class="card-edge">
						<div class="card-face">
							<i class="bi bi-plus-lg"></i>
							<span class="ml-2">添加新集</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div v-if="!isDefault" class="fixed-knob">
			<div
				class="retro-knob"
				:class="{ 'is-active': isEditMode }"
				@click="isEditMode = !isEditMode"
			>
				<div class="knob-base">
					<div class="knob-indicator"></div>
					<div class="knob-label">编辑</div>
				</div>
				<div class="knob-shadow"></div>
			</div>
		</div>
	</div>
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

// 添加编辑相关的状态
const isEditMode = ref(false);
const editingEp = ref(null);
const isDragging = ref(false);

// 拖拽相关的方法
const dragStart = () => {
	isDragging.value = true;
};

const dragEnd = () => {
	isDragging.value = false;
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

// 处理解锁点击
const handleUnlock = () => {
	if (!isLogin.value) {
		router.push("/login");
		return;
	}

	router.push({
		path: "/purchase",
		query: {
			catalogId: route.params.id,
			returnTo: route.fullPath,
		},
	});
};

const goToLessonProgress = () => {
	router.push({
		path: `/collections/${route.params.id}/${currentProgress.value.season}/${currentProgress.value.episode}`,
		query: { sign: currentProgress.value.sign, progress: true },
	});
};

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

.title-decoration {
	position: absolute;
	width: 30px;
	height: 30px;
	border: 4px solid white;
}

.title-decoration.left {
	left: -15px;
	top: 50%;
	transform: translateY(-50%) rotate(45deg);
}

.title-decoration.right {
	right: -15px;
	top: 50%;
	transform: translateY(-50%) rotate(45deg);
}

.retro-display-box {
	position: relative;
}

.display-shadow {
	background-color: #666;
	border-radius: 12px;
	transform: translateY(3px);
}

.display-edge {
	background-color: rgb(136, 136, 136);
	border-radius: 12px;
	transform: translateY(-3px);
}

.display-face {
	background-color: rgba(240, 240, 240, 0.8);
	border: 3px solid #333;
	border-radius: 12px;
	transform: translateY(-3px);
}

/* 星星 */
.retro-star {
	width: 20px;
	height: 20px;
	background-color: #333;
	clip-path: polygon(
		50% 0%,
		61% 35%,
		98% 35%,
		68% 57%,
		79% 91%,
		50% 70%,
		21% 91%,
		32% 57%,
		2% 35%,
		39% 35%
	);
	margin: 0 2px;
}

.retro-btn-small {
	position: relative;
	width: 4rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

.retro-nav-btn {
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
}

.retro-btn-small .btn-face {
	background-color: rgba(240, 240, 240, 0.8);
}

.retro-episode-card {
	position: relative;
	aspect-ratio: 4/3;
	cursor: pointer;
	transition: transform 0.3s;
}

.card-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 12px;
	transform: translateY(4px);
}

.card-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(102, 102, 102, 0.5);
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.1s;
}

.card-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: white;
	border: 3px solid #333;
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.retro-episode-card:hover {
	transform: translateY(-2px);
}

.retro-episode-card:active .card-edge,
.retro-episode-card:active .card-face {
	transform: translateY(-2px);
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

.retro-alert {
	position: relative;
	border: 3px solid #333;
	border-radius: 8px;
	background-color: rgba(var(--primary-color-rgb), 0.1);
	padding: 0.75rem 1rem;
	box-shadow: 4px 4px 0 rgba(var(--primary-color-rgb), 0.3);
}

.retro-link {
	color: var(--primary-color);
	font-weight: bold;
	cursor: pointer;
	position: relative;
	text-decoration: underline;
	text-decoration-style: dotted;
	text-underline-offset: 4px;
}

/* 字幕框装饰 */
.manga-subtitle-box {
	position: relative;
	display: inline-block;
	padding: 0.5rem 2rem;
}

.package-status {
	z-index: 10;
	width: 100%;
	max-width: 480px;
	margin: 0 auto;
	text-align: center;
}

/* 已解锁状态 */
.retro-badge.success {
	width: 50%;
	background: rgba(var(--accent-color-rgb), 0.6);
	padding: 8px 16px;
	border-radius: 8px;
	border: 2px solid #fff;
	box-shadow: 0 2px 0 #000, 2px 4px 8px rgba(0, 0, 0, 0.1);
	margin: 0 auto;
}

.badge-content {
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: 500; /* 减小字重 */
	font-size: 0.9rem; /* 减小字号 */
}

.badge-content i {
	font-size: 0.9rem; /* 减小图标大小 */
}
/* 未解锁促销样式 */
.retro-promo {
	background: rgba(255, 255, 255, 0.95);
	border: 3px solid #000;
	border-radius: 12px;
	padding: 16px 24px;
	cursor: pointer;
	position: relative;
	transition: all 0.3s ease;
	box-shadow: 0 4px 0 #000, 4px 8px 15px rgba(0, 0, 0, 0.2);
}

.retro-promo:hover {
	transform: translateY(-2px);
	box-shadow: 0 6px 0 #000, 4px 10px 20px rgba(0, 0, 0, 0.25);
}
.retro-promo:active {
	transform: translateY(2px);
	box-shadow: 0 2px 0 #000, 2px 4px 10px rgba(0, 0, 0, 0.2);
}

.promo-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #000;
	gap: 16px;
}

.promo-text h3 {
	color: #000;
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
	white-space: nowrap; /* 确保文本不换行 */
}

.promo-price {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 8px;
}

.unlock-btn {
	display: flex;
	align-items: center;
	background: var(--secondary-color);
	color: white;
	padding: 8px 16px;
	border-radius: 8px;
	border: 2px solid #000;
	font-weight: 600;
	transition: all 0.2s ease;
	box-shadow: 0 2px 0 #000;
	white-space: nowrap; /* 确保按钮内容不换行 */
}

.price {
	font-weight: bold;
	color: white; /* 改为白色以配合按钮背景 */
	text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.unlock-btn:hover {
	background: rgba(var(--secondary-color-rgb), 0.95);
	transform: translateY(-1px);
}

.unlock-btn:active {
	transform: translateY(1px);
	box-shadow: 0 1px 0 #000;
}

/* 装饰元素 */
.promo-decoration {
	position: absolute;
	font-size: 1.5rem;
	color: var(--secondary-color);
	animation: spin 4s linear infinite;
}
.left-star {
	left: -10px;
	top: 50%;
	transform: translateY(-50%);
}

.right-star {
	right: -10px;
	top: 50%;
	transform: translateY(-50%);
}

@keyframes spin {
	from {
		transform: translateY(-50%) rotate(0deg);
	}
	to {
		transform: translateY(-50%) rotate(360deg);
	}
}

.retro-add-button {
	position: relative;
	height: 3rem;
	cursor: pointer;
	transition: transform 0.3s;
}

.retro-add-button .card-shadow,
.retro-add-button .card-edge,
.retro-add-button .card-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 12px;
}

.retro-add-button .card-shadow {
	transform: translateY(4px);
}

.retro-add-button .card-edge {
	background-color: rgba(102, 102, 102, 0.5);
	transform: translateY(-4px);
}

.retro-add-button .card-face {
	background-color: white;
	border: 3px solid #333;
	transform: translateY(-4px);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.875rem;
	color: #666;
}

.retro-add-button:hover {
	transform: translateY(-2px);
}

.retro-add-button:hover .card-face {
	color: var(--primary-color);
}

.fixed-knob {
	position: fixed;
	right: 40px;
	top: 50%;
	transform: translateY(-50%);
	z-index: 100;
}

.retro-knob {
	position: relative;
	width: 60px;
	height: 60px;
	cursor: pointer;
	transition: transform 0.3s ease;
}

.knob-base {
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background: #fff;
	border: 3px solid #333;
	display: flex;
	align-items: center;
	justify-content: center;
	transform-origin: center center;
	transition: transform 0.3s ease;
	box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.8),
		inset -2px -2px 4px rgba(0, 0, 0, 0.1);
}

.knob-shadow {
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	/* background: rgba(0, 0, 0, 0.2); */
	transform: translateY(4px);
}

.knob-indicator {
	position: absolute;
	width: 4px;
	height: 20px;
	background: #333;
	top: 6px;
	left: 50%;
	transform: translateX(-50%);
	border-radius: 2px;
}

.knob-label {
	position: absolute;
	bottom: 10px;
	font-size: 14px;
	font-weight: bold;
	letter-spacing: 1px;
	color: #333;
}

.retro-knob:hover .knob-base {
	transform: translateY(-2px);
}

.retro-knob.is-active .knob-base {
	transform: rotate(90deg);
	background: var(--primary-color);
	color: white;
}

.retro-knob.is-active .knob-indicator,
.retro-knob.is-active .knob-label {
	color: white;
}

.retro-knob.is-active .knob-base {
	transform: rotate(90deg);
	background: #fff;
	border-color: var(--primary-color);
}

.retro-knob.is-active .knob-indicator {
	background: var(--primary-color);
}

.retro-knob.is-active .knob-label {
	color: var(--primary-color);
}
</style>
