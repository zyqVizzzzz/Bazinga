<template>
	<div class="home">
		<!-- 标题 -->
		<div class="retro-title-box text-center mb-10">
			<!-- 左侧图标 -->
			<div class="side-icon left-icon" @click="createCatArea">
				<img src="/src/assets/logo-m.png" alt="Left Icon" />
			</div>

			<h1 class="text-2xl font-bold">
				<div class="text-shadow-retro">
					<span><mark class="retro-highlight">Molidoki</mark></span>
				</div>
				<div class="pronunciation">
					<span>int. 魔力心脏 - /pongˈpong/</span>
				</div>
			</h1>

			<!-- 右侧图标 -->
			<div class="side-icon right-icon" @click="createNewCard">
				<img src="/src/assets/logo-d.png" alt="Right Icon" />
			</div>
		</div>

		<!-- 卡片展示区 -->
		<div class="flex flex-wrap justify-center my-10 gap-12">
			<div
				v-for="scene in displayedScenes"
				:key="scene.id"
				class="retro-card"
				@click="goToCollection(scene._id)"
			>
				<div class="card-shadow">
					<div class="card-edge">
						<div class="card-face">
							<!-- Banner -->
							<div class="banner-container h-[160px]">
								<div v-if="scene.banner" class="banner-wrapper h-full">
									<img
										:src="scene.banner"
										alt="logo"
										class="banner-image w-full h-full object-cover"
									/>
								</div>
								<div
									v-else
									class="banner-placeholder h-full w-full"
									:style="{ backgroundColor: scene.theme }"
								></div>
							</div>
							<!-- 内容区域 -->
							<div class="content-container" :style="{ color: scene.theme }">
								<h2 class="text-lg font-bold">{{ scene.showName }}</h2>
								<p class="subtitle mt-2">{{ scene.name }}</p>
								<div class="status-badge" v-if="!scene.isCustom">Public</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- More -->
		<div class="text-center" v-if="displayedScenes.length > 3">
			<button class="retro-btn-medium" @click="toggleExpand">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face text-sm">
							{{ isExpanded ? "收起" : "查看更多" }}
						</div>
					</div>
				</div>
			</button>
		</div>
	</div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { showToast } from "@/components/common/toast.js";
import { useRouter } from "vue-router";
import apiClient from "@/api";

import { useLoginStore } from "@/store/index";

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);

const router = useRouter();
const scenes = ref([]);

onMounted(() => {
	getCatalogs();
});

const getCatalogs = async () => {
	try {
		const response = await apiClient.get("/catalogs");
		if (response.data.code === 200) {
			scenes.value = response.data.data.filter((catalog) => !catalog.isCustom);
		} else {
			showToast({
				message: response.data.message,
				type: "error",
				duration: 3000,
			});
		}
	} catch (error) {
		console.error("Failed to fetch catalogs", error);
	}
};

const isExpanded = ref(false);
const displayedScenes = computed(() => {
	return isExpanded.value ? scenes.value : scenes.value.slice(0, 3);
});

const toggleExpand = () => {
	isExpanded.value = !isExpanded.value;
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

const createCatArea = async () => {
	router.push("/mochi");
};

const goToCollection = (id) => {
	// if (!isLogin.value) return;
	router.push("/collections/" + id);
};
</script>
<style scoped>
.home {
	width: 100%;
	margin-top: 50px;
}

/* 复古标题样式 */
.retro-title-box {
	position: relative;
	display: inline-block;
	padding: 1rem 3rem;
	margin: 0 auto;
}

/* 侧边图标样式 */
.side-icon {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	width: 120px;
	height: 120px;
	opacity: 0.3;
	transition: opacity 0.3s ease;
	cursor: pointer;
	z-index: 10;
}

.side-icon:hover {
	opacity: 0.8;
}

.side-icon img {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.left-icon {
	left: -320px;
}

.right-icon {
	right: -320px;
	width: 110px;
	height: 110px;
}

/* 响应式设计 - 在小屏幕上隐藏图标 */
@media (max-width: 768px) {
	.side-icon {
		display: none;
	}
}

.text-shadow-retro {
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2),
		-1px -1px 0 rgba(255, 255, 255, 0.2);
}

.pronunciation {
	font-size: 0.875rem;
	color: #666;
	font-weight: normal;
	margin-top: 0.5rem;
}

.retro-highlight {
	background: linear-gradient(
		transparent 60%,
		rgba(var(--secondary-color-rgb), 0.2) 40%
	);
	padding: 0 0.5rem;
	border-radius: 4px;
}

.text-shadow-retro {
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2),
		-1px -1px 0 rgba(255, 255, 255, 0.2);
}

.pronunciation {
	font-size: 0.875rem;
	color: #666;
	font-weight: normal;
	margin-top: 0.5rem;
}

.retro-highlight {
	background: linear-gradient(
		transparent 60%,
		rgba(var(--secondary-color-rgb), 0.2) 40%
	);
	padding: 0 0.5rem;
	border-radius: 4px;
}

/* 复古卡片样式 */
.retro-card {
	position: relative;
	width: 20rem;
	cursor: pointer;
	transition: transform 0.3s;
}

.retro-card:hover {
	transform: translateY(-5px);
}

.retro-card:hover .card-edge,
.retro-card:hover .card-face {
	transform: translateY(-6px);
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

/* Banner样式 */
.banner-container {
	height: 160px;
	overflow: hidden;
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

/* 角标样式 */
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

.retro-btn-medium:hover .btn-face {
	background-color: white;
}

.retro-btn-medium:active .btn-edge,
.retro-btn-medium:active .btn-face {
	transform: translateY(0);
}

.retro-btn-medium {
	position: relative;
	width: 8rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

/* 按钮通用样式 */
.btn-shadow,
.btn-edge,
.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 8px;
}

.btn-shadow {
	background-color: #666;
	transform: translateY(2px);
}

.btn-edge {
	background-color: #b3b3b3;
	transform: translateY(-2px);
}

.btn-face {
	background-color: #f0f0f0;
	border: 2px solid #333;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
