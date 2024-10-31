<template>
	<div
		class="w-full mx-auto flex flex-col items-center"
		style="margin-top: -64px"
	>
		<div
			class="relative w-full mb-8"
			style="padding-top: 96px; padding-bottom: 64px"
		>
			<div
				v-if="infoData"
				class="absolute inset-0 bg-cover bg-center opacity-50 filter-blur"
				:style="{
					backgroundImage: 'url(' + infoData.banner + ')',
					backgroundColor: infoData.theme,
				}"
			></div>

			<div
				class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"
			></div>
			<div
				v-if="infoData"
				class="relative z-10 text-center text-white flex flex-col items-center justify-center h-full"
			>
				<h1 class="text-4xl font-semibold mb-4">
					{{ isChinese ? infoData.showName : infoData.name }}
				</h1>
				<!-- <button
					@click="toggleLanguage"
					class="text-sm py-2 px-6 bg-gray-200 text-gray-600 opacity-80 hover:bg-gray-300 rounded-full transition duration-300 mb-4"
				>
					{{ isChinese ? "English" : "中文" }}
				</button> -->
				<h2 class="text-xl font-semibold mb-2 text-gray-200 w-4/5">
					{{ infoData.description }}
				</h2>

				<div
					class="bg-white bg-opacity-70 mt-4 p-4 rounded-lg shadow-md text-black w-3/5"
				>
					<p class="font-semibold">
						{{ isChinese ? "难度等级" : "Level" }}:
						{{ infoData.difficulty }}
					</p>
					<p class="text-sm my-2 text-left">
						{{ infoData.difficultyDetails }}
					</p>
				</div>
			</div>
		</div>

		<!-- 加载状态 -->
		<div v-if="loading" class="text-center">
			<p>Loading...</p>
		</div>

		<!-- 当前季的课程卡片 -->
		<div v-else-if="currentSeasonEpisodes.length > 0" class="w-2/3">
			<div
				v-if="currentProgress.course"
				role="alert"
				class="mb-2 alert alert-primary text-sm"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div class="relative" style="top: -2px">
					当前进度：{{
						currentProgress.season +
						"-E" +
						formatEpisode(currentProgress.episode)
					}}，<span
						@click="linkToProgress"
						class="text-primary font-bold cursor-pointer"
						>继续学习</span
					>
				</div>
			</div>
			<h2 class="text-xl font-semibold mb-4">{{ currentSeason }}</h2>

			<!-- 卡片样式的课程列表 -->
			<div class="grid grid-cols-3 md:grid-cols-4 gap-6">
				<div
					v-for="episode in currentSeasonEpisodes"
					:key="episode"
					@click="goToLesson(currentSeason, episode)"
					class="card shadow-lg px-6 py-4 text-center cursor-pointer hover:shadow-xl transition-all duration-300"
				>
					<p class="text-sm font-bold">
						{{ `第 ${episode.ep} 集` }}
					</p>
				</div>
			</div>

			<!-- 分页按钮 -->
			<div class="flex justify-between w-full mt-8">
				<button
					class="btn btn-primary"
					:disabled="currentSeasonIndex === 0"
					@click="previousSeason"
				>
					{{ isChinese ? "上一季" : "Previous Season" }}
				</button>
				<button
					class="btn btn-primary"
					:disabled="currentSeasonIndex === seasons.length - 1"
					@click="nextSeason"
				>
					{{ isChinese ? "下一季" : "Next Season" }}
				</button>
			</div>
		</div>

		<!-- 如果没有找到对应的季数据 -->
		<div v-else class="text-center">
			<p>
				没有找到数据，<span class="text-primary cursor-pointer" @click="addData"
					>添加第一集卡片笔记</span
				>
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import apiClient from "@/api";
import { useAppStore } from "@/store";
import { showToast } from "@/components/common/toast.js";
const appStore = useAppStore();

const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);

// 状态变量
const infoData = ref(null); // 用于存储 Info 数据
const seasons = ref([]); // 用于存储季节的 key (如 S01, S02)
const episodes = ref({}); // 用于存储每季的集数
const currentSeasonIndex = ref(0); // 当前季的索引
const loading = ref(true); // 加载状态
const isChinese = ref(true); // 控制是否显示中文

const goToLesson = (season, episode) => {
	const episodeStr = `${episode.ep.toString()}`; // 格式化集数，如 E01
	episode.scriptUrl
		? router.push({
				path: `/category/${route.params.id}/${season}/${episodeStr}`,
				query: {
					mode: "preview",
					script: episode.scriptUrl,
					sign: episode._id,
				},
		  })
		: router.push({
				path: `/card-edit/${route.params.id}/${season}/${episodeStr}`,
				query: {
					mode: "edit",
					script: episode.scriptUrl,
					sign: episode._id,
				},
		  });
};

// 异步加载 JSON 数据
const loadCategoryData = async () => {
	try {
		// const response = await fetch("/constants/Category.json");
		const response = await apiClient.get(`/catalogs/${route.params.id}`);
		if (response.data.code === 200) {
			infoData.value = response.data.data;
			infoData.value.seasons.forEach((item) => {
				seasons.value.push(item.seasonNumber);
				episodes.value[item.seasonNumber] = item.episodes;
			});
		} else {
			showToast({
				message: response.data.message,
				type: "error",
				duration: 3000,
			});
			infoData.value = null;
			seasons.value = [];
			episodes.value = {};
		}
	} catch (error) {
		console.error("Error loading JSON:", error);
		infoData.value = null;
		seasons.value = [];
		episodes.value = {};
	} finally {
		loading.value = false;
	}
};

const addData = async () => {};

const currentProgress = ref({});
const getUserProfile = async () => {
	try {
		const response = await apiClient.get("/users/me");
		if (response.data.code === 200) {
			appStore.initProgress(response.data.data.learningProgress);
			const foundProgress = response.data.data.learningProgress.find(
				(p) => p.course === route.params.id
			);

			if (foundProgress) {
				currentProgress.value = foundProgress;
			}
		} else {
			showToast({
				message: response.data.message,
				type: "error",
				duration: 3000,
			});
		}
	} catch (error) {
		console.log(error);
	}
};
const formatEpisode = (episode) => {
	return episode < 10 ? `0${episode}` : episode.toString();
};
const linkToProgress = () => {
	router.push({
		path: `/category/${route.params.id}/${currentProgress.value.season}/${currentProgress.value.episode}`,
		query: {
			mode: "preview",
			script: currentProgress.value.scriptUrl,
			sign: currentProgress.value.sign,
			progress: true,
		},
	});
};

// 获取当前季的集数
const currentSeason = computed(() => seasons.value[currentSeasonIndex.value]);
const currentSeasonEpisodes = computed(
	() => episodes.value[currentSeason.value] || []
);

// 切换到上一季
const previousSeason = () => {
	if (currentSeasonIndex.value > 0) {
		currentSeasonIndex.value--;
	}
};

// 切换到下一季
const nextSeason = () => {
	if (currentSeasonIndex.value < seasons.value.length - 1) {
		currentSeasonIndex.value++;
	}
};

// 页面加载时调用
onMounted(() => {
	loadCategoryData();
	getUserProfile();
});
</script>

<style scoped>
.bg-cover {
	background-size: cover;
	background-position: center;
}

.card {
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 4px 10px rgba(0, 0, 255, 0.1); /* 蓝色阴影 */
	transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.card:hover {
	transform: translateY(-5px);
	box-shadow: 0 8px 16px rgba(0, 0, 255, 0.2); /* 悬停时蓝色阴影增强 */
}

button[disabled] {
	opacity: 0.5;
	cursor: not-allowed;
}
.filter-blur {
	filter: blur(5px) brightness(100%);
	backdrop-filter: blur(10px);
}
</style>
<!-- bg-gradient-to-b from-transparent to-black opacity-90 -->
