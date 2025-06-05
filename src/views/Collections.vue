<template>
	<div class="all-collections">
		<!-- 合集 -->
		<div class="flex justify-end items-center mx-8" v-if="!isMobile">
			<button class="retro-btn" @click="createNewCard">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face flex justify-center items-center">
							<i class="bi bi-lightning-charge"></i>
							<span class="ml-2">快速开始</span>
						</div>
					</div>
				</div>
			</button>
		</div>

		<div class="grid-container justify-items-center mt-10">
			<div
				v-for="scene in scenes"
				:key="scene.id"
				class="retro-card"
				@click="goToCollection(scene._id)"
			>
				<div class="card-shadow">
					<div class="card-edge">
						<div class="card-face">
							<!-- Banner图片 -->
							<div class="banner-container">
								<div v-if="scene.banner" class="banner-wrapper">
									<img :src="scene.banner" alt="logo" class="banner-image" />
								</div>
								<div
									v-else
									class="banner-placeholder"
									:style="{ backgroundColor: scene.theme }"
								></div>
							</div>

							<!-- 内容区域 -->
							<div class="content-container" :style="{ color: scene.theme }">
								<h2 class="title text-lg">{{ scene.showName }}</h2>
								<p class="subtitle">{{ scene.name }}</p>
								<div class="status-badge" v-if="!scene.isCustom">Public</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				v-if="defaultCatalog"
				class="retro-card"
				@click="goToCollection(defaultCatalog._id)"
			>
				<div class="card-shadow">
					<div class="card-edge">
						<div class="card-face">
							<!-- 默认合集图标区域 - 替代Banner -->
							<div class="banner-container default-banner">
								<div class="default-icon">
									<i class="bi bi-journal-text text-5xl"></i>
								</div>
							</div>

							<!-- 内容区域 -->
							<div
								class="content-container"
								:style="{ color: 'var(--primary-color)' }"
							>
								<h2 class="title text-lg">未分类文档</h2>
								<p class="subtitle text-sm mb-4">
									通过「快速开始」创建的文档合集
								</p>
								<div class="document-badge">
									{{ getDocumentCount() }} 个文档
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- 新增合集 -->
			<div class="retro-card add-card" @click="addNewScene" v-if="!isMobile">
				<div class="card-shadow">
					<div class="card-edge">
						<div class="card-face">
							<div class="add-content">
								<i class="bi bi-folder-plus text-3xl mb-2"></i>
								<span class="font-bold">创建合集</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useLoginStore } from "@/store/index";
import { useMobile } from "@/composables/useBreakpoint";

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);

// 移动端检测
const { isMobile } = useMobile();

const router = useRouter();
const scenes = ref([]);
const defaultCatalog = ref(null);

onMounted(() => {
	getAllScenes();
	if (isLogin.value) {
		getDefaultCatalog();
	}
});

const getAllScenes = async () => {
	try {
		const res = await apiClient.get("/catalogs");
		if (res.data.code === 200) {
			scenes.value = res.data.data;
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} catch (error) {
		console.error("Failed to fetch scenes", error);
	}
};

// 创建新卡片
const createNewCard = async () => {
	if (!isLogin.value) {
		showToast({
			message: "登录后解锁全部功能",
			type: "info",
			duration: 3000,
		});
		return;
	}
	try {
		const today = new Date();
		const dateStr = today.toLocaleDateString("zh-CN").replace(/\//g, "-");
		const defaultDocName = `Doc-${dateStr}`;
		// 获取用户的默认合集
		const res = await apiClient.get("/catalogs/default");
		if (res.data.code === 200 && res.data.data) {
			const defaultCatalog = res.data.data;
			// 获取默认合集的第一个季节
			if (defaultCatalog.seasons && defaultCatalog.seasons.length > 0) {
				const season = defaultCatalog.seasons[0];

				// 检查是否有episodes
				if (season.episodes && season.episodes.length > 0) {
					// 获取最后一个episode
					const lastEpisode = season.episodes[season.episodes.length - 1];

					// 如果最后一个episode的scriptUrl为空，直接打开它
					if (!lastEpisode.scriptUrl || lastEpisode.scriptUrl === "") {
						router.push({
							path: `/card-editor/${defaultCatalog._id}/${season.seasonNumber}/${lastEpisode.ep}`,
							query: { mode: "edit", sign: lastEpisode._id },
						});
						return; // 提前返回，不创建新的
					}

					// 如果最后一个episode有内容，创建新的
					const nextEp = season.episodes.length + 1;
					const createRes = await apiClient.post("/catalogs/episodes/create", {
						catalogId: defaultCatalog._id,
						ep: nextEp,
						epName: defaultDocName,
						seasonNumber: season.seasonNumber,
					});

					if (createRes.data.code === 200) {
						const newEpisode = createRes.data.data;
						router.push({
							path: `/card-editor/${defaultCatalog._id}/${season.seasonNumber}/${nextEp}`,
							query: { mode: "edit", sign: newEpisode._id },
						});
					}
				} else {
					// 没有episodes，创建第一个
					const createRes = await apiClient.post("/catalogs/episodes/create", {
						catalogId: defaultCatalog._id,
						ep: 1,
						epName: defaultDocName,
						seasonNumber: season.seasonNumber,
					});

					if (createRes.data.code === 200) {
						const newEpisode = createRes.data.data;
						router.push({
							path: `/card-editor/${defaultCatalog._id}/${season.seasonNumber}/1`,
							query: { mode: "edit", sign: newEpisode._id },
						});
					}
				}
			} else {
				showToast({ message: "默认合集没有可用的季节", type: "error" });
			}
		} else {
			showToast({ message: "未找到默认合集", type: "error" });
		}
	} catch (error) {
		console.error("获取默认合集失败:", error);
		showToast({ message: "获取默认合集失败", type: "error" });
	}
};

const getDefaultCatalog = async () => {
	try {
		const res = await apiClient.get("/catalogs/default");
		if (res.data.code === 200 && res.data.data) {
			defaultCatalog.value = res.data.data;
		}
	} catch (error) {
		console.error("Failed to fetch default catalog", error);
	}
};

const getDocumentCount = () => {
	if (!defaultCatalog.value || !defaultCatalog.value.seasons) return 0;

	let count = 0;
	defaultCatalog.value.seasons.forEach((season) => {
		if (season.episodes) {
			count += season.episodes.length;
		}
	});

	return count;
};

const goToCollection = (id) => {
	// if (!isLogin.value) return;
	router.push("/collections/" + id);
};

const addNewScene = () => {
	if (!isLogin.value) {
		showToast({ message: "登录后可创建合集", type: "info" });
		return;
	}
	router.push("/setup-collection");
};
</script>

<style scoped>
.all-collections {
	width: 100%;
	margin-top: 40px;
	margin-bottom: 100px;
	min-height: 500px;
	padding: 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
	.all-collections {
		margin-top: 0;
		padding: 10px;
		margin-bottom: 60px;
	}
}

.grid-container {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 2rem;
	padding: 1rem;

	/* 移动端响应式布局 */
	@media (max-width: 768px) {
		grid-template-columns: 1fr; /* 单列布局 */
		gap: 1.5rem;
		padding: 0.5rem;
	}

	@media (min-width: 769px) and (max-width: 1024px) {
		grid-template-columns: repeat(2, 1fr); /* 平板双列 */
		gap: 1.5rem;
	}
}

/* 移动端卡片优化 */
@media (max-width: 768px) {
	.retro-card {
		max-width: 100%;
		margin: 0 auto;
	}

	.banner-container {
		height: 120px; /* 稍微降低高度 */
	}

	.content-container {
		height: 140px; /* 减少内容区域高度 */
		padding: 1rem;
	}
}

/* 默认合集样式 */
.default-banner {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f5f7fa, #e4e8f0);
}

.default-icon {
	display: flex;
	justify-content: center;
	align-items: center;
	color: var(--primary-color);
	height: 100%;
}

.document-badge {
	display: inline-block;
	padding: 0.25rem 0.75rem;
	background-color: var(--primary-color);
	color: white;
	border-radius: 20px;
	font-size: 0.875rem;
	font-weight: bold;
	margin-top: 0.5rem;
}

.document-count {
	display: inline-block;
	padding: 0.25rem 0.75rem;
	background-color: var(--primary-color);
	color: white;
	border-radius: 20px;
	font-size: 0.875rem;
	font-weight: bold;
}

.retro-title-box {
	position: relative;
	display: inline-block;
	padding: 1rem 3rem;
	margin: 0 auto;
}

.title-decoration {
	position: absolute;
	width: 40px;
	height: 40px;
	border: 4px solid currentColor;
}

.title-decoration.left {
	left: -20px;
	top: 50%;
	transform: translateY(-50%) rotate(45deg);
}

.title-decoration.right {
	right: -20px;
	top: 50%;
	transform: translateY(-50%) rotate(45deg);
}

.text-shadow-retro {
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2),
		-1px -1px 0 rgba(255, 255, 255, 0.2);
}

.pronunciation {
	display: block;
	font-size: 0.875rem;
	color: #666;
	font-weight: normal;
}

.retro-highlight {
	background: linear-gradient(
		transparent 60%,
		rgba(var(--secondary-color-rgb), 0.2) 40%
	);
	padding: 0 0.5rem;
	border-radius: 4px;
}

.retro-card {
	position: relative;
	width: 100%;
	max-width: 320px;
	cursor: pointer;
	transition: transform 0.3s;
}

.retro-card:hover {
	transform: translateY(-5px);
}

.card-shadow {
	background-color: #666;
	border-radius: 12px;
	transform: translateY(4px);
}

.card-edge {
	background-color: #b3b3b3;
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.2s;
}

.card-face {
	background-color: white;
	border: 3px solid #333;
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.2s;
	overflow: hidden;
}

/* 卡片装饰效果 */
.card-face::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 40%;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
	pointer-events: none;
}

.retro-card:hover .card-edge,
.retro-card:hover .card-face {
	transform: translateY(-6px);
}

.retro-card:active .card-edge,
.retro-card:active .card-face {
	transform: translateY(-2px);
}

.banner-container {
	height: 150px;
	overflow: hidden;
}

.banner-wrapper {
	width: 100%;
	height: 100%;
}

.banner-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.banner-placeholder {
	width: 100%;
	height: 100%;
}

.status-badge {
	position: absolute;
	bottom: 10px;
	right: 10px;
	padding: 2px 8px;
	font-size: 0.75rem;
	border-radius: 4px;
	background-color: #333;
	color: white;
	font-weight: bold;
	box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.content-container {
	position: relative;
	height: 180px;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.05) 2px,
		rgba(0, 0, 0, 0.05) 4px
	);
}

.title {
	font-weight: bold;
	text-align: center;
	margin-bottom: 0.5rem;
}

.subtitle {
	font-weight: 900;
	text-align: center;
}

.add-card .card-face {
	background-color: #f8f8f8;
	border: 3px solid #333;
	height: 330px;
}

.add-content {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #666;
}

.retro-btn {
	position: relative;
	width: 7rem;
	height: 3rem;
	border: none;
	background: none;
	cursor: pointer;
	transition: transform 0.1s;
}

.retro-btn.option {
	width: 4rem;
	height: 2.2rem;
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face,
.retro-btn.btn-active .btn-edge,
.retro-btn.btn-active .btn-face {
	transform: translateY(0);
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 12px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 12px;
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
	border-radius: 12px;
	color: #333;
	transform: translateY(-2px);
	transition: transform 0.1s;
}
.retro-btn:hover .btn-face {
	background-color: #fff;
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face {
	transform: translateY(0);
}
.retro-btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
.retro-btn:disabled .btn-face {
	background-color: #ddd;
	border-color: #999;
	color: #999;
}
</style>
