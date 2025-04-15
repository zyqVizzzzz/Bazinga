<template>
	<div class="scroll-container" ref="praticeContainerRef">
		<!-- 对话历史 -->
		<PodcastCustom
			v-if="podcastData && podcastData.length > 0"
			:podcastData="podcastData"
			:showTranslation="showTranslation"
			:currentPage="currentPage"
			ref="podcastCustomRef"
		/>
		<div v-else class="vintage-radio-container">
			<div class="radio-sidebar">
				<div class="radio-header">
					<div class="radio-indicator"></div>
					<h2 class="radio-title">BAZINGA RADIO SYSTEM</h2>
				</div>

				<!-- <div class="scene-display">
					<div class="frequency">FM MOLIDOKI</div>
				</div> -->

				<div class="empty-content">
					<div class="circular-video-container mx-auto relative top-[-40px]">
						<video
							ref="welcomeVideo"
							class="circular-video"
							@click="playWelcomeVideo"
							poster="https://bazinga-1251994034.cos.ap-shanghai.myqcloud.com/default/moryn.png"
						>
							<source
								src="https://bazinga-1251994034.cos.ap-shanghai.myqcloud.com/default/moryn.mp4"
								type="video/mp4"
							/>
						</video>
						<div
							v-if="!isWelcomePlaying"
							class="video-overlay"
							@click="playWelcomeVideo"
						>
							<i class="bi bi-play play-icon"></i>
						</div>
					</div>
					<p class="vintage-text text-center">当前场景尚未创建播客～</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onUpdated, watch } from "vue";
import PodcastCustom from "@/components/card/PodcastCustom.vue";
import apiClient from "@/api";

// 创建播放器实例
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

const praticeContainerRef = ref(null);
const podcastData = ref(null);

// 欢迎语音播放状态
const welcomeVideo = ref(null);
const isWelcomePlaying = ref(false);

onMounted(() => {
	// displayedDialogues.value = props.currentPractice.dialogues;
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

// 播放欢迎语音
const playWelcomeVideo = async () => {
	const video = welcomeVideo.value;
	if (!video) return;

	if (video.paused) {
		isWelcomePlaying.value = true;
		try {
			await video.play();
			video.onended = () => {
				isWelcomePlaying.value = false;
				video.currentTime = 0;
				// 重新显示封面图片
				video.load(); // 重新加载视频会显示封面图
			};
		} catch (error) {
			console.error("视频播放失败:", error);
			isWelcomePlaying.value = false;
		}
	} else {
		video.pause();
		video.currentTime = 0;
		video.load(); // 停止播放时也重新加载以显示封面图
		isWelcomePlaying.value = false;
	}
};

// 添加一个重置播放器状态的方法
const resetPlayerState = () => {
	// 重置自定义播客组件
	if (podcastCustomRef.value) {
		podcastCustomRef.value.resetPlayer();
	}
};

// 在组件卸载时清理资源
onUnmounted(() => {
	if (welcomeVideo.value) {
		welcomeVideo.value.pause();
		welcomeVideo.value.currentTime = 0;
	}
});

// 监听 currentPage 变化
watch(
	() => props.currentPage,
	(newPage, oldPage) => {
		// 只有当页面真正变化时才重新获取数据
		if (newPage !== oldPage) {
			// 如果没有对话数据，尝试获取播客数据
			// if (!props.currentPractice || !props.currentPractice.conversation_id) {
			fetchPodcastData();
			// }

			// 如果有自定义播客组件，重置它
			if (podcastCustomRef.value) {
				podcastCustomRef.value.resetPlayer();
			}
		}
	},
	{ immediate: true } // 添加立即执行选项
);

defineExpose({
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
	position: relative;
	z-index: 3;
	height: 0;
	-webkit-overflow-scrolling: touch;
	scroll-behavior: smooth;
	overscroll-behavior-y: contain;
}
.vintage-radio-container {
	display: flex;
	gap: 0;
	overflow: hidden;
	min-height: 500px;
	height: 100%;
	position: relative;
}

.radio-sidebar {
	width: 100%;
	/* max-width: 600px; */
	margin: 0 auto;
	background: white;
	display: flex;
	flex-direction: column;
	position: relative;

	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.radio-header {
	font-family: "Courier New", monospace;
	padding: 16px;
	border-bottom: 3px solid #000;
	display: flex;
	align-items: center;
	gap: 10px;
	background: #000;
	position: relative;
	z-index: 1;
}

.radio-indicator {
	width: 12px;
	height: 12px;
	background: var(--secondary-color);
	border-radius: 50%;
	border: 2px solid #fff;
	box-shadow: 0 0 8px var(--secondary-color);
	animation: blink 2s infinite;
}

.radio-title {
	color: #fff;
	font-size: 16px;
	font-weight: bold;
	letter-spacing: 1px;
	margin: 0;
}

.scene-display {
	padding: 21px 16px;
	border-bottom: 3px solid #000;
	background: #222;
	color: #f8f8f8;
	position: relative;
	z-index: 1;
	box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.scene-number {
	font-weight: bold;
	font-size: 18px;
	font-family: "Digital-7", monospace;
	color: var(--Primary-color);
}

.frequency {
	font-size: 14px;
	color: var(--secondary-color);
	margin-top: 4px;
}

.empty-content {
	display: flex;
	flex-direction: column;
	justify-content: center;
	flex: 1;
	background: white;
	position: relative;
}

.empty-content::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.1) 2px,
		rgba(0, 0, 0, 0.03) 4px
	);
	z-index: 0;
}

.vintage-text {
	position: relative;
	z-index: 1;
	color: #333;
	font-size: 14px;
	line-height: 1.6;
}

.circular-video-container {
	position: relative;
	z-index: 1;
	width: 240px; /* 4:3 比例，宽度设为 240px */
	height: 320px; /* 高度为宽度的 3/4 */
	border-radius: 12px; /* 改用圆角矩形 */
	overflow: hidden;
	border: 3px solid #000;
	box-shadow: 2px 2px 0 #000;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	margin: 0 auto;
}

.circular-video {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.video-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.3);
	display: flex;
	justify-content: center;
	align-items: center;
}

.play-icon {
	font-size: 2rem;
	color: white;
	filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
}

@keyframes blink {
	0%,
	100% {
		opacity: 1;
		box-shadow: 0 0 8px var(--secondary-color);
	}
	50% {
		opacity: 0.3;
		box-shadow: 0 0 2px var(--secondary-color);
	}
}

@media (max-width: 768px) {
	.radio-sidebar {
		max-width: 100%;
	}
}
</style>
