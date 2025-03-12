<template>
	<div class="scroll-container" ref="praticeContainerRef">
		<div class="space-y-8">
			<!-- 对话历史 -->
			<PodcastCustom
				v-if="podcastData && podcastData.length > 0"
				:podcastData="podcastData"
				:showTranslation="showTranslation"
				:isGlobalPlaying="globalPlayer.isPlaying.value"
				@play-dialogue="handlePlayDialogue"
				:currentPage="currentPage"
				ref="podcastCustomRef"
			/>
			<PodcastFeatured
				v-if="displayedDialogues && displayedDialogues.length > 0"
				:dialogues="displayedDialogues"
				:showTranslation="showTranslation"
				:isGlobalPlaying="globalPlayer.isPlaying.value"
				@play-dialogue="handlePlayDialogue"
				:currentPage="currentPage"
				ref="podcastFeaturedRef"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onUpdated, watch } from "vue";
import PodcastFeatured from "@/components/card/PodcastFeatured.vue";
import PodcastCustom from "@/components/card/PodcastCustom.vue";
import apiClient from "@/api";

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
	displayedDialogues.value = props.currentPractice.dialogues;
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

		const response = await apiClient.get(
			`/podcasts/resource/${resourceId}/scene/${props.currentPage}`
		);
		if (response.data.code === 200 && response.data.data.podcasts) {
			podcastData.value = response.data.data.podcasts;
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

// 添加一个重置播放器状态的方法
const resetPlayerState = () => {
	// 重置全局播放器
	globalPlayer.cleanup();
	singlePlayer.cleanup();

	// 重置自定义播客组件
	if (podcastCustomRef.value) {
		podcastCustomRef.value.resetPlayer();
	}

	// 重置特色播客组件
	if (podcastFeaturedRef.value) {
		podcastFeaturedRef.value.setPlayingState(false, null);
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

// 监听 currentPage 变化
watch(
	() => props.currentPage,
	(newPage, oldPage) => {
		console.log("Practice 组件检测到页面变更为:", newPage);
		// 只有当页面真正变化时才重新获取数据
		if (newPage !== oldPage) {
			// 重置播放器状态
			globalPlayer.cleanup();
			singlePlayer.cleanup();

			// 如果没有对话数据，尝试获取播客数据
			if (!props.currentPractice || !props.currentPractice.conversation_id) {
				fetchPodcastData();
			}

			// 如果有自定义播客组件，重置它
			if (podcastCustomRef.value) {
				podcastCustomRef.value.resetPlayer();
			}
		}
	},
	{ immediate: true } // 添加立即执行选项
);

defineExpose({
	playAllDialogues,
	fetchPodcastData,
	resetPlayerState,
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
</style>
