<template>
	<div class="scroll-container" ref="praticeContainerRef">
		<div class="space-y-8">
			<div
				class="podcast-header my-6 text-left relative p-4 bg-white border-2 border-black rounded-lg shadow-custom"
			>
				<div class="podcast-title flex items-center">
					<div class="podcast-icon mr-3">
						<PodcastIcon />
					</div>
					<div class="flex-1">
						<h3 class="font-bold text-lg text-black">
							Ayyyyyo! Welcome Back To BAZINGA ! ! !
						</h3>
						<div class="flex items-center text-sm text-gray-600">
							<span>第{{ props.currentPage }}期</span>
							<!-- <span class="mx-2">•</span> -->
							<!-- <span>{{ currentPractice.conversation_id }}</span> -->
						</div>
					</div>
					<div
						class="podcast-badge px-2 py-1 bg-secondary/10 border border-secondary/30 rounded-md text-xs font-medium text-secondary transform rotate-2"
					>
						BAZINGA DAILY
					</div>
				</div>
			</div>

			<!-- 对话历史 -->
			<PodcastCustom
				v-if="podcastData && podcastData.length > 0"
				:podcastData="podcastData"
				:showTranslation="showTranslation"
				:isGlobalPlaying="globalPlayer.isPlaying.value"
				@play-dialogue="handlePlayDialogue"
				ref="podcastCustomRef"
			/>
			<PodcastFeatured
				v-else
				:dialogues="displayedDialogues"
				:showTranslation="showTranslation"
				:isGlobalPlaying="globalPlayer.isPlaying.value"
				@play-dialogue="handlePlayDialogue"
				ref="podcastFeaturedRef"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onUpdated, watch } from "vue";
import PodcastIcon from "@/components/icons/Podcast.vue";
import PodcastFeatured from "@/components/card/PodcastFeatured.vue";
import PodcastCustom from "@/components/card/PodcastCustom.vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

// 全局播放器类
class GlobalPlayer {
	constructor() {
		this.isPlaying = ref(false);
		this.currentIndex = ref(0);
		this.currentAudio = null;
	}

	async playAudio(voiceUrl, text, character) {
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio = null;
		}

		return new Promise((resolve, reject) => {
			this.currentAudio = new Audio(voiceUrl);
			this.currentAudio.onended = () => {
				resolve();
			};
			this.currentAudio.onerror = (error) => {
				reject(error);
			};
			this.currentAudio.play().catch(reject);
		});
	}

	cleanup() {
		this.isPlaying.value = false;
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio = null;
		}

		// 移除所有对话框的 playing 类
		const allDialogueElements = document.querySelectorAll(".log-item");
		allDialogueElements.forEach((element) => {
			element.classList.remove("playing");
		});
	}

	reset() {
		this.cleanup();
		this.currentIndex.value = 0; // 只在需要完全重置时重置索引
	}
}

// 单独播放器类
class SinglePlayer {
	constructor() {
		this.isPlaying = ref(false);
		this.currentAudio = null;
		this.currentIndex = ref(null); // 新增：跟踪当前播放的索引
	}

	async playAudio(voiceUrl, text, character, dialogueElements, dialogueIndex) {
		// 如果点击的是当前正在播放的音频，则停止播放
		if (this.isPlaying.value && this.currentIndex.value === dialogueIndex) {
			this.cleanup();
			dialogueElements[dialogueIndex].classList.remove("playing");
			return;
		}

		// 如果有其他音频在播放，先停止它
		if (this.isPlaying.value) {
			this.cleanup();
			dialogueElements.forEach((element) => {
				element.classList.remove("playing");
			});
		}

		// 开始新的播放
		this.currentIndex.value = dialogueIndex;
		dialogueElements[dialogueIndex].classList.add("playing");
		this.isPlaying.value = true;

		try {
			this.currentAudio = new Audio(voiceUrl);
			await this.currentAudio.play();

			return new Promise((resolve) => {
				this.currentAudio.onended = () => {
					this.cleanup();
					dialogueElements[dialogueIndex].classList.remove("playing");
					resolve();
				};
			});
		} catch (error) {
			console.error("播放失败:", error);
			this.cleanup();
			dialogueElements[dialogueIndex].classList.remove("playing");
		}
	}

	cleanup() {
		this.isPlaying.value = false;
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio = null;
		}
		this.currentIndex.value = null;
	}
}

// 创建播放器实例
const globalPlayer = new GlobalPlayer();
const singlePlayer = new SinglePlayer();
const podcastFeaturedRef = ref(null);
const podcastCustomRef = ref(null);

const props = defineProps({
	currentPractice: {
		type: Object,
		required: true,
	},
	currentPage: {
		type: Number,
		required: true,
	},
	showHints: {
		type: Boolean,
		required: true,
	},
	showTranslation: {
		type: Boolean,
		required: true,
	},
});

const displayedDialogues = ref([]);
const praticeContainerRef = ref(null);
const podcastData = ref(null);

onMounted(() => {
	console.log("pre");
	displayedDialogues.value = props.currentPractice.dialogues;
	// 如果没有对话数据，尝试获取播客数据
	if (!props.currentPractice || !props.currentPractice.conversation_id) {
		console.log("in");
		fetchPodcastData();
	}
});

const emit = defineEmits(["play-complete"]);

// 获取播客数据的方法
const fetchPodcastData = async () => {
	try {
		// 从URL中获取当前资源ID
		const urlParams = new URLSearchParams(window.location.search);
		const resourceId = urlParams.get("sign");

		if (!resourceId) {
			console.error("无法获取资源ID");
			return;
		}

		console.log(resourceId);

		const response = await apiClient.get(`/podcasts/resource/${resourceId}`);

		if (response.data.code === 200 && response.data.data.podcasts) {
			podcastData.value = response.data.data.podcasts;
			console.log("获取到播客数据:", podcastData.value);
			// 这里暂时不进行后续操作，等待进一步指示
		}
	} catch (error) {
		console.error("获取播客数据失败:", error);
	}
};

const playAllDialogues = async () => {
	if (globalPlayer.isPlaying.value) {
		// 只暂停播放，不清理索引
		globalPlayer.isPlaying.value = false;
		if (globalPlayer.currentAudio) {
			globalPlayer.currentAudio.pause();
			globalPlayer.currentAudio = null;
		}
		// 移除当前播放对话框的 playing 类
		const allDialogueElements = document.querySelectorAll(".log-item");
		allDialogueElements.forEach((element) => {
			element.classList.remove("playing");
		});
		emit("play-complete");
		return;
	}

	// 停止单独播放器
	singlePlayer.cleanup();

	globalPlayer.isPlaying.value = true;
	// 如果没有暂停位置记录，从头开始播放
	if (globalPlayer.currentIndex.value >= displayedDialogues.value.length) {
		globalPlayer.currentIndex.value = 0;
	}

	const playNext = async () => {
		if (
			globalPlayer.currentIndex.value >= displayedDialogues.value.length ||
			!globalPlayer.isPlaying.value
		) {
			globalPlayer.cleanup();
			emit("play-complete");
			return;
		}

		const dialogue = displayedDialogues.value[globalPlayer.currentIndex.value];
		try {
			// 获取当前对话框元素
			const dialogueElements = document.querySelectorAll(".dialogue-wrapper");
			const currentElement = dialogueElements[globalPlayer.currentIndex.value];

			// 滚动到当前对话框
			if (
				currentElement &&
				globalPlayer.isPlaying.value &&
				praticeContainerRef.value
			) {
				const container = praticeContainerRef.value;
				const containerRect = container.getBoundingClientRect();
				const elementRect = currentElement.getBoundingClientRect();
				const targetScrollTop =
					container.scrollTop +
					(elementRect.top - containerRect.top) -
					containerRect.height / 2 +
					elementRect.height / 2;

				container.scrollTo({
					top: targetScrollTop,
					behavior: "smooth",
				});
			}

			// 移除所有对话框的 playing 类
			const allDialogueElements = document.querySelectorAll(".log-item");
			allDialogueElements.forEach((element) => {
				element.classList.remove("playing");
			});

			// 只给当前播放的对话框添加 playing 类
			if (globalPlayer.isPlaying.value) {
				const currentDialogueElement =
					allDialogueElements[globalPlayer.currentIndex.value];
				if (currentDialogueElement) {
					currentDialogueElement.classList.add("playing");
				}
			}

			if (globalPlayer.isPlaying.value) {
				await globalPlayer.playAudio(
					dialogue.voiceUrl,
					dialogue.english,
					dialogue.character
				);
				if (globalPlayer.isPlaying.value) {
					// 确保仍在全局播放状态
					globalPlayer.currentIndex.value++;
					await playNext();
				}
			}
		} catch (error) {
			console.error("播放失败:", error);
			globalPlayer.cleanup();
		}
	};

	await playNext();
};

// 处理子组件的播放请求
const handlePlayDialogue = async ({
	voiceUrl,
	text,
	character,
	index,
	isPlaying,
	currentPlayingIndex,
}) => {
	if (globalPlayer.isPlaying.value) {
		return;
	}

	const dialogueElements = document.querySelectorAll(".log-item");

	// 如果点击的是当前正在播放的音频，则停止播放
	if (isPlaying && currentPlayingIndex === index) {
		singlePlayer.cleanup();
		// 根据当前激活的组件更新状态
		if (podcastData.value && podcastData.value.length > 0) {
			if (podcastCustomRef.value) {
				podcastCustomRef.value.setPlayingState(false, null);
			}
		} else {
			if (podcastFeaturedRef.value) {
				podcastFeaturedRef.value.setPlayingState(false, null);
			}
		}
		return;
	}

	// 开始播放
	await singlePlayer.playAudio(
		voiceUrl,
		text,
		character,
		dialogueElements,
		index
	);

	// 播放完成后更新子组件状态
	if (podcastData.value && podcastData.value.length > 0) {
		if (podcastCustomRef.value) {
			podcastCustomRef.value.setPlayingState(false, null);
		}
	} else {
		if (podcastFeaturedRef.value) {
			podcastFeaturedRef.value.setPlayingState(false, null);
		}
	}
};

// 在组件卸载时清理资源
onUnmounted(() => {
	globalPlayer.cleanup();
	singlePlayer.cleanup();
});

// 在组件更新时检查状态
onUpdated(() => {
	if (!globalPlayer.isPlaying.value && !singlePlayer.isPlaying.value) {
		// 只在播放完成时重置
		// 添加安全检查，确保 displayedDialogues.value 存在且是数组
		if (
			displayedDialogues.value &&
			Array.isArray(displayedDialogues.value) &&
			globalPlayer.currentIndex.value >= displayedDialogues.value.length
		) {
			globalPlayer.reset();
		} else {
			// 否则只清理播放状态，保持索引
			globalPlayer.cleanup();
		}
		singlePlayer.cleanup();
	}
});

// 监听 currentPractice 变化，如果为空则尝试获取播客数据
watch(
	() => props.currentPractice,
	(newVal) => {
		if (!newVal || !newVal.conversation_id) {
			fetchPodcastData();
		}
	},
	{ immediate: true }
);

defineExpose({
	playAllDialogues,
	fetchPodcastData, // 导出获取播客数据的方法
});
</script>

<style scoped>
.scroll-container {
	position: relative;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding: 0 24px 48px 24px;
	position: relative;
	z-index: 3;
	height: 0;
	-webkit-overflow-scrolling: touch;
	scroll-behavior: smooth;
	overscroll-behavior-y: contain;
}

/* 播客标题区域的特殊样式 */
.podcast-header {
	position: relative;
	overflow: hidden;
}

.podcast-header::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 10px,
		rgba(0, 0, 0, 0.03) 10px,
		rgba(0, 0, 0, 0.03) 12px
	);
	z-index: 0;
}

.podcast-header > * {
	position: relative;
	z-index: 1;
}

.podcast-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	background-color: white;
	border: 2px solid black;
	border-radius: 50%;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.shadow-custom {
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
}
</style>
