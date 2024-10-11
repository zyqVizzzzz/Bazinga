<template>
	<div class="container mt-10 mx-auto flex flex-col items-center">
		<!-- 剧集信息展示 -->
		<div v-if="infoData" class="mb-6 text-center">
			<h1 class="text-3xl font-semibold mb-2 flex justify-center">
				{{ isChinese ? infoData.name_zh : infoData.name }}
			</h1>
			<button
				@click="toggleLanguage"
				class="text-xs py-2 px-6 mt-1 mb-4 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-full transition duration-300"
			>
				{{ isChinese ? "English" : "中文" }}
			</button>
			<h2 class="text-xl font-semibold mb-2 text-gray-600">
				{{ isChinese ? infoData.description_zh : infoData.description }}
			</h2>

			<div class="bg-blue-100 mt-4 p-4 rounded-lg shadow-md">
				<p class="font-semibold">
					{{ isChinese ? "难度等级" : "Level" }}:
					{{ isChinese ? infoData.level_zh : infoData.level }}
				</p>
				<p class="text-sm my-2 text-left">
					{{ isChinese ? infoData.level_info_zh : infoData.level_info }}
				</p>
			</div>
		</div>

		<!-- 加载状态 -->
		<div v-if="loading" class="text-center">
			<p>Loading...</p>
		</div>

		<!-- 当前季的课程卡片 -->
		<div v-else-if="currentSeasonEpisodes.length > 0">
			<h2 class="text-xl font-semibold mb-4">{{ currentSeason }}</h2>

			<!-- 卡片样式的课程列表 -->
			<div class="grid grid-cols-2 md:grid-cols-3 gap-6">
				<div
					v-for="episode in currentSeasonEpisodes"
					:key="episode"
					class="card shadow-lg px-6 py-4 text-center cursor-pointer hover:shadow-xl transition-all duration-300"
				>
					<p
						class="text-base font-bold"
						@click="goToLesson(currentSeason, episode)"
					>
						{{ isChinese ? `第 ${episode} 集` : `Episode ${episode}` }}
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
			<p class="text-red-500">No data found for this category.</p>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);

// 状态变量
const infoData = ref(null); // 用于存储 Info 数据
const seasons = ref([]); // 用于存储季节的 key (如 S01, S02)
const episodes = ref({}); // 用于存储每季的集数
const currentSeasonIndex = ref(0); // 当前季的索引
const loading = ref(true); // 加载状态
const isChinese = ref(false); // 控制是否显示中文

const toggleLanguage = () => {
	isChinese.value = !isChinese.value;
};

const goToLesson = (season, episode) => {
	// 跳转到具体的课程页面
	const episodeStr = `E${episode.toString().padStart(2, "0")}`; // 格式化集数，如 E01
	router.push(`/Category/${route.params.id}/${season}/${episodeStr}`);
};

// 异步加载 JSON 数据
const loadCategoryData = async () => {
	try {
		const response = await fetch("/constants/Category.json");
		const data = await response.json();

		// 检查 id 是否存在于 JSON 数据中
		if (data[id.value]) {
			const category = data[id.value];

			// 存储 Info 信息
			if (category.Info) {
				infoData.value = category.Info;
			}

			// 存储季节数据
			seasons.value = Object.keys(category).filter((key) => key !== "Info");
			episodes.value = seasons.value.reduce((acc, season) => {
				acc[season] = category[season];
				return acc;
			}, {});
		} else {
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
});
</script>

<style scoped>
.container {
	max-width: 800px;
	padding: 2rem;
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
</style>
