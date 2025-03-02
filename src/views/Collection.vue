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
				<div class="retro-display-box w-3/5 mt-4">
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
		<div class="w-2/3">
			<!-- 季数 -->
			<div
				class="manga-subtitle-box"
				:class="{ 'mb-10': !currentProgress.course }"
			>
				<h2 class="text-xl font-bold text-shadow-retro h-[30px]">
					{{
						viewMode === "gallery"
							? currentSeason?.seasonNumber
							: currentSeason?.seasonName
					}}
					<div class="tooltip" data-tip="切换视图">
						<span
							@click="toggleViewMode"
							class="cursor-pointer w-[30px]"
							style="display: inline-block"
							><i v-if="viewMode === 'gallery'" class="bi bi-list"></i
							><i v-else class="bi bi-grid" style="font-size: 1rem"></i>
						</span>
					</div>
				</h2>
			</div>

			<!-- 进度提示 -->
			<div v-if="currentProgress.course" class="mb-10">
				<div class="alert-content">
					<span @click="goToLessonProgress" class="retro-link text-sm">
						{{ t("collection.continue") }}
					</span>
				</div>
			</div>
			<!-- 剧集 -->
			<template v-if="viewMode === 'gallery'">
				<div class="grid grid-cols-3 md:grid-cols-4 gap-6 mb-10">
					<div
						v-for="(episode, index) in currentSeasonEpisodes"
						:key="index"
						@click="goToLesson(currentSeason?.seasonNumber, episode)"
						class="retro-episode-card"
					>
						<div class="card-shadow">
							<div class="card-edge">
								<div class="card-face">
									<p class="text-sm font-bold">
										{{ `episode ${episode.ep}` }}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
			<template v-else>
				<!-- 列表视图 -->
				<div class="flex flex-col space-y-4 mb-10">
					<div
						v-for="(episode, index) in currentSeasonEpisodes"
						:key="index"
						@click="goToLesson(currentSeason?.seasonNumber, episode)"
						class="retro-episode-card p-4 flex items-center justify-between hover:bg-gray-100 cursor-pointer rounded-lg border border-gray-200"
					>
						<div class="flex items-center justify-center space-x-4">
							<span class="text-sm font-bold">
								{{
									`${episode.epName ? episode.epName : "episode " + episode.ep}`
								}}
							</span>
							<span v-if="episode.title" class="text-sm text-gray-600">
								{{ episode.title }}
							</span>
						</div>
						<i class="bi bi-chevron-right text-gray-400" />
					</div>
				</div>
			</template>

			<!-- 控制区 -->
			<div class="flex justify-between w-full mt-8" v-if="seasons.length > 1">
				<button
					class="retro-nav-btn"
					:disabled="currentSeasonIndex === 0"
					@click="previousSeason"
				>
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">上一季</div>
						</div>
					</div>
				</button>

				<button
					class="retro-nav-btn"
					:disabled="currentSeasonIndex === seasons.length - 1"
					@click="nextSeason"
				>
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">下一季</div>
						</div>
					</div>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { showToast } from "@/components/common/toast.js";

import apiClient from "@/api";
import { useAppStore } from "@/store";
import { useRouter, useRoute } from "vue-router";
import { hexToRgba, formatNumber } from "@/utils";
import { useI18n } from "vue-i18n";
import { useLoginStore } from "@/store/index";
import { canAccessResource } from "@/utils";

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);
const userInfo = computed(() => loginStore.userInfo);

const { t, locale } = useI18n();

const appStore = useAppStore();
const router = useRouter();
const route = useRoute();

const infoData = ref(null); // 存储 Info 数据
const seasons = ref([]); // 存储 season 的 key (如 S01, S02)
const episodes = ref({}); // 存储每季的集数
const currentSeasonIndex = ref(0); // 当前季的索引
const isDefault = ref(true); // 是否是系统默认数据
const currentProgress = ref({}); // 当前进度
const viewMode = ref("gallery");

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

onMounted(async () => {
	await loadCategoryData();
	isLogin.value && getUserProfile();
});

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

const previousSeason = () => {
	if (currentSeasonIndex.value > 0) {
		currentSeasonIndex.value--;
	}
};

const nextSeason = () => {
	if (currentSeasonIndex.value < seasons.value.length - 1) {
		currentSeasonIndex.value++;
	}
};

const toggleViewMode = () => {
	if (viewMode.value === "gallery") {
		viewMode.value = "list";
	} else {
		viewMode.value = "gallery";
	}
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
	height: 3rem;
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
</style>
