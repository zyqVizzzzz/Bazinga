<template>
	<div
		class="w-full mx-auto flex flex-col items-center"
		style="margin-top: -64px"
	>
		<div
			class="relative w-full mb-8"
			style="padding-top: 96px"
			:style="isDefault ? 'padding-bottom: 46px' : 'padding-bottom: 26px'"
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
				<h1 class="text-4xl font-semibold mb-4 relative">
					{{ isChinese ? infoData.showName : infoData.name }}
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
					v-if="!isDefault"
					class="text-sm mt-6 py-2 px-6 bg-gray-200 text-gray-600 opacity-50 flex space-x-6 text-sm hover:opacity-70 rounded-full transition duration-300"
				>
					<div class="tooltip" data-tip="设置合集信息">
						<div class="hover:text-gray-800" @click="goToCollectionEdit">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
								/>
							</svg>
						</div>
					</div>

					<dialog id="collection_delete_modal" v-if="!isDefault" class="modal">
						<div class="modal-box">
							<h3 class="text-lg my-4 mb-8 font-bold">
								确认删除当前合集？此操作不可撤销！
							</h3>
							<div class="flex space-x-4 justify-center">
								<!-- if there is a button in form, it will close the modal -->
								<button
									@click="confirmDelete"
									class="btn bg-red-400 px-4 text-white hover:bg-red-500 transition duration-300"
								>
									确认
								</button>
								<button class="btn px-4" @click="closeDeleteModal">取消</button>
							</div>
						</div>
						<form method="dialog" class="modal-backdrop">
							<button>close</button>
						</form>
					</dialog>
				</button>
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
				path: `/collections/${route.params.id}/${season}/${episodeStr}`,
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

const hexToRgba = (hex, alpha) => {
	let r = parseInt(hex.slice(1, 3), 16);
	let g = parseInt(hex.slice(3, 5), 16);
	let b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isDefault = ref(true);
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
			if (infoData.value.userId && infoData.value.isCustom) {
				isDefault.value = false;
			}
		} else {
			showToast({ message: response.data.message, type: "error" });
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
		path: `/collections/${route.params.id}/${currentProgress.value.season}/${currentProgress.value.episode}`,
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

const goToCollectionEdit = () => {
	router.push({
		path: "/setup-collection",
		query: {
			resource: route.params.id,
		},
	});
};

const deleteCollection = () => {
	document.getElementById("collection_delete_modal").showModal();
};

const confirmDelete = async () => {
	try {
		const res = await apiClient.delete("/catalogs/" + route.params.id);
		if ((res.data.code = 200)) {
			showToast({ message: "删除合集成功", type: "success" });
			router.replace({
				path: "/collections",
			});
		} else {
			showToast({ message: "删除合集失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "删除合集失败", type: "error" });
	}
};

const closeDeleteModal = () => {
	document.getElementById("collection_delete_modal").close();
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
.tooltip:before {
	margin-bottom: 4px;
	background-color: rgba(0, 0, 0, 0.7);
	letter-spacing: 1px;
}
.tooltip:after {
	margin-bottom: 4px;
}
</style>
<!-- bg-gradient-to-b from-transparent to-black opacity-90 -->
