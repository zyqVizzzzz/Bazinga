<template>
	<div class="collection w-full mx-auto flex flex-col items-center">
		<div
			class="collection-content relative w-full mb-8"
			:style="isDefault ? 'padding-bottom: 46px' : 'padding-bottom: 26px'"
		>
			<!-- Banner 图片 -->
			<div
				v-if="infoData"
				class="absolute inset-0 bg-cover bg-center opacity-50 filter-blur"
				:style="{
					backgroundImage: 'url(' + infoData.banner + ')',
					backgroundColor: infoData.theme,
				}"
			></div>
			<!-- Banner 遮罩层 -->
			<div
				class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"
			></div>
			<!-- Collection 信息 -->
			<div
				v-if="infoData"
				class="relative z-10 text-center text-white flex flex-col items-center justify-center h-full"
			>
				<h1 class="text-4xl font-semibold mb-4 relative">
					{{ infoData.showName }}
				</h1>
				<h2 class="text-xl font-semibold mb-2 text-gray-200 w-4/5">
					{{ infoData.description }}
				</h2>
				<div
					class="bg-white bg-opacity-70 mt-4 p-4 rounded-lg shadow-md text-black w-3/5"
				>
					<p class="font-semibold">
						难度等级:
						{{ infoData.difficulty }}
					</p>
					<p class="text-sm my-2 text-left">
						{{ infoData.difficultyDetails }}
					</p>
				</div>
				<button
					@click="goToCollectionEdit"
					class="text-sm mt-6 py-2 px-6 bg-gray-200 text-gray-600 opacity-50 flex space-x-6 text-sm hover:opacity-70 rounded-full transition duration-300"
				>
					<div class="tooltip" data-tip="设置合集信息">
						<div class="hover:text-gray-800">
							<SetupIcon size="5" />
						</div>
					</div>
				</button>
			</div>
		</div>

		<!-- 剧集列表 -->
		<div class="w-2/3">
			<!-- 当前进度 -->
			<div
				v-if="currentProgress.course"
				role="alert"
				class="mb-2 alert alert-primary text-sm"
			>
				<div class="relative" style="top: -2px">
					当前进度：{{
						`${currentProgress.season}-E${formatNumber(
							currentProgress.episode
						)}`
					}}，<span
						@click="goToLessonProgress"
						class="text-primary font-bold cursor-pointer"
						>继续学习</span
					>
				</div>
			</div>
			<!-- 剧集列表 -->
			<h2 class="text-xl font-semibold my-4">{{ currentSeason }}</h2>
			<div class="grid grid-cols-3 md:grid-cols-4 gap-6">
				<div
					v-for="(episode, index) in currentSeasonEpisodes"
					:key="index"
					@click="goToLesson(currentSeason, episode)"
					class="card shadow-lg px-6 py-4 text-center cursor-pointer hover:shadow-xl transition-all duration-300"
					:style="{
						boxShadow: '0 4px 12px ' + hexToRgba(infoData.theme, 0.3),
					}"
				>
					<p class="text-sm font-bold">
						{{ `第 ${episode.ep} 集` }}
					</p>
				</div>
			</div>
			<!-- 分页按钮 -->
			<div class="flex justify-between w-full mt-8" v-if="seasons.length > 1">
				<button
					class="btn btn-primary"
					:disabled="currentSeasonIndex === 0"
					@click="previousSeason"
				>
					上一季
				</button>
				<button
					class="btn btn-primary"
					:disabled="currentSeasonIndex === seasons.length - 1"
					@click="nextSeason"
				>
					下一季
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import SetupIcon from "@/components/icons/setup.vue";
import { showToast } from "@/components/common/toast.js";

import apiClient from "@/api";
import { useAppStore } from "@/store";
import { useRouter, useRoute } from "vue-router";
import { hexToRgba, formatNumber } from "@/utils";

const appStore = useAppStore();
const router = useRouter();
const route = useRoute();

const infoData = ref(null); // 存储 Info 数据
const seasons = ref([]); // 存储 season 的 key (如 S01, S02)
const episodes = ref({}); // 存储每季的集数
const currentSeasonIndex = ref(0); // 当前季的索引
const isDefault = ref(true); // 是否是系统默认数据
const currentProgress = ref({}); // 当前进度

// 获取当前季的集数
const currentSeason = computed(() => seasons.value[currentSeasonIndex.value]);
const currentSeasonEpisodes = computed(
	() => episodes.value[currentSeason.value] || []
);

// 异步加载 JSON 数据
const loadCategoryData = async () => {
	try {
		const res = await apiClient.get(`/catalogs/${route.params.id}`);
		if (res.data.code === 200) {
			infoData.value = res.data.data;
			infoData.value.seasons.forEach((item) => {
				seasons.value.push(item.seasonNumber);
				episodes.value[item.seasonNumber] = item.episodes;
			});
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
	try {
		const res = await apiClient.get("/users/me");
		if (res.data.code === 200) {
			const learningProgress = res.data.data.learningProgress;
			const foundProgress = learningProgress.find(
				(p) => p.course === route.params.id
			);
			foundProgress && (currentProgress.value = foundProgress);
			appStore.initProgress(learningProgress);
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} catch (error) {
		showToast({ message: error, type: "error" });
	}
};

onMounted(() => {
	loadCategoryData();
	getUserProfile();
	console.log(currentProgress.value);
});

const goToLessonProgress = () => {
	router.push({
		path: `/collections/${route.params.id}/${currentProgress.value.season}/${currentProgress.value.episode}`,
		query: {
			mode: "preview",
			script: currentProgress.value.scriptUrl,
			sign: currentProgress.value.sign,
			progress: true,
		},
	});
};

const goToLesson = (season, episode) => {
	const params = `${route.params.id}/${season}/${episode.ep.toString()}`; // 格式化集数，如 E01
	const query = {
		mode: episode.scriptUrl ? "preview" : "edit",
		script: episode.scriptUrl,
		sign: episode._id,
	};
	episode.scriptUrl
		? router.push({ path: `/collections/${params}`, query })
		: router.push({ path: `/card-editor/${params}`, query });
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
</script>

<style scoped>
.collection {
	margin-top: -64px;
}
.collection-content {
	padding-top: 96px;
}
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
.tooltip:before {
	margin-bottom: 4px;
	background-color: rgba(0, 0, 0, 0.7);
	letter-spacing: 1px;
}
.tooltip:after {
	margin-bottom: 4px;
}
</style>
