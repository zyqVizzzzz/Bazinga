<template>
	<div class="podcast-custom-container">
		<div
			class="vintage-radio-container"
			v-if="podcastData && podcastData.length > 0"
		>
			<!-- 左侧播客列表 -->
			<div class="radio-sidebar">
				<div class="radio-header">
					<div class="radio-indicator"></div>
					<h2 class="radio-title">BAZINGA RADIO</h2>
				</div>

				<div class="scene-display">
					<div class="scene-number">Scene {{ props.currentPage }}</div>
					<div class="frequency">FM MOLIDOKI</div>
				</div>

				<div class="channel-list">
					<!-- <div class="channel-header">播客列表</div> -->
					<div
						v-for="(podcast, index) in podcastData"
						:key="index"
						class="channel-item"
						:class="{ active: currentPlayingIndex === index }"
						@click="selectPodcast(podcast, index)"
					>
						<span class="channel-number">{{ index + 1 }}</span>
						<span class="channel-name">{{
							podcast.knowledge || "暂无标题"
						}}</span>
						<span
							class="channel-status"
							v-if="currentPlayingIndex === index && isPlaying"
						>
							<i class="bi bi-soundwave"></i>
						</span>
					</div>
				</div>
			</div>

			<!-- 右侧内容区 -->
			<div class="radio-content">
				<div class="empty-state" v-if="currentPlayingIndex === null">
					<i class="bi bi-broadcast"></i>
					<p>请从左侧选择一个播客</p>
				</div>

				<div v-else-if="selectedPodcast" class="podcast-player-container">
					<div class="podcast-header">
						<h2 class="podcast-title">{{ selectedPodcast.knowledge }}</h2>
						<!-- <p class="podcast-subtitle">一系列</p> -->
					</div>

					<div class="player-section">
						<audio
							ref="audioPlayer"
							:src="selectedPodcast.audioPath"
							@play="onPlay"
							@pause="onPause"
							@timeupdate="onTimeUpdate"
							@loadedmetadata="onLoadedMetadata"
							controls
							class="audio-player"
						></audio>

						<!-- 生成播客按钮 -->
						<button
							class="generate-podcast-btn"
							@click="generatePodcast(selectedPodcast, currentPlayingIndex)"
						>
							<i class="bi bi-broadcast-pin"></i>
							<span>生成播客</span>
						</button>

						<div class="language-switch">
							<button
								class="lang-btn"
								:class="{ active: showOriginal }"
								@click="
									showOriginal = true;
									showTranslated = false;
								"
							>
								英
							</button>
							<button
								class="lang-btn"
								:class="{ active: showTranslated }"
								@click="
									showOriginal = false;
									showTranslated = true;
								"
							>
								中
							</button>
						</div>
					</div>

					<div class="transcript-section">
						<div v-if="selectedPodcast.script" class="transcript-content">
							<div
								v-for="(paragraph, idx) in selectedPodcast.script"
								:key="idx"
								class="transcript-paragraph"
							>
								<p v-if="showOriginal" class="english-text">{{ paragraph }}</p>
								<p
									v-if="
										showTranslated &&
										selectedPodcast.chineseScript &&
										selectedPodcast.chineseScript[idx]
									"
									class="chinese-text"
								>
									{{ selectedPodcast.chineseScript[idx] }}
								</p>
							</div>
						</div>
						<div v-else class="no-transcript">暂无脚本内容</div>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="no-data">
			<i class="bi bi-broadcast"></i>
			<p>暂无播客数据</p>
		</div>
	</div>
</template>
<script setup>
import { ref, onMounted, watch, computed } from "vue";
import apiClient from "@/api";
import { useRoute } from "vue-router";

const route = useRoute();

// 定义组件接收的props
const props = defineProps({
	podcastData: {
		type: Array,
		default: () => [],
	},
	showTranslation: {
		type: Boolean,
		default: false,
	},
	isGlobalPlaying: {
		type: Boolean,
		default: false,
	},
	currentPage: {
		type: Number,
		required: true,
	},
});

// 当前播放状态
const isPlaying = ref(false);
const currentPlayingIndex = ref(null);
const selectedPodcast = ref(null);
const audioPlayer = ref(null);
const currentTime = ref(0);
const duration = ref(0);
const audioProgress = ref(0);
const isGenerating = ref({});

// 脚本显示控制
const showOriginal = ref(true);
const showTranslated = ref(false);

// 选择播客
const selectPodcast = (podcast, index) => {
	currentPlayingIndex.value = index;
	selectedPodcast.value = podcast;

	// 重置音频状态
	currentTime.value = 0;
	duration.value = 0;
	audioProgress.value = 0;

	// 如果有音频元素，需要重新加载
	if (audioPlayer.value) {
		// 延迟执行以确保DOM已更新
		setTimeout(() => {
			audioPlayer.value.load();
		}, 0);
	}
};

const generatePodcast = async (podcast, index, isRegenerate = false) => {
	// 设置生成状态
	isGenerating.value[index] = true;
	console.log(podcast, index, isRegenerate);

	const audioResponse = await apiClient.post(
		"/podcasts/generate-audio-hailuo",
		{
			knowledge: podcast.knowledge,
			script: podcast.script.join("\n"),
			resourceId: route.query.sign || "",
			sceneId: podcast.sceneId?.toString() || "0",
		}
	);

	if (audioResponse.data.code === 200) {
		podcast.audioPath = audioResponse.data.data.result.audioUrl;
		// 如果当前选中的是这个播客，更新音频播放器
		if (audioPlayer.value && currentPlayingIndex.value === index) {
			setTimeout(() => {
				audioPlayer.value.load();
			}, 0);
		}
	}
};

// 添加一个重置播放器的方法
const resetPlayer = () => {
	isPlaying.value = false;
	currentPlayingIndex.value = null;
	selectedPodcast.value = null;
	currentTime.value = 0;
	duration.value = 0;
	audioProgress.value = 0;

	if (audioPlayer.value) {
		audioPlayer.value.pause();
		audioPlayer.value.currentTime = 0;
	}
};

// 音频事件处理
const onPlay = () => {
	isPlaying.value = true;
};

const onPause = () => {
	isPlaying.value = false;
};

const onTimeUpdate = () => {
	if (audioPlayer.value) {
		currentTime.value = audioPlayer.value.currentTime;
		audioProgress.value = (currentTime.value / duration.value) * 100 || 0;
	}
};

const onLoadedMetadata = () => {
	if (audioPlayer.value) {
		duration.value = audioPlayer.value.duration;
	}
};

// 格式化时间显示
const formatTime = (seconds) => {
	if (!seconds || isNaN(seconds)) return "00:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, "0")}:${secs
		.toString()
		.padStart(2, "0")}`;
};

onMounted(() => {
	// 如果有数据，自动选择第一个
	if (props.podcastData && props.podcastData.length > 0) {
		selectPodcast(props.podcastData[0], 0);
	}
});

// 监听 podcastData 变化
watch(
	() => props.podcastData,
	(newData, oldData) => {
		// 重置播放器状态
		resetPlayer();
		// 如果有新数据，自动选择第一个
		if (newData && newData.length > 0) {
			selectPodcast(newData[0], 0);
		}
	},
	{ deep: true, immediate: true }
);

// 监听 currentPage 变化
watch(
	() => props.currentPage,
	(newPage) => {
		console.log("当前页面变更为:", newPage);
		// 页面变化时重置播放器状态
		resetPlayer();

		// 如果有数据，自动选择第一个
		if (props.podcastData && props.podcastData.length > 0) {
			selectPodcast(props.podcastData[0], 0);
		}
	}
);

watch(
	() => props.showTranslation,
	(newValue) => {
		showTranslated.value = newValue;
	}
);

// 设置播放状态的方法，供父组件调用
const setPlayingState = (playing, index) => {
	isPlaying.value = playing;
	currentPlayingIndex.value = index;
	if (index !== null && props.podcastData && props.podcastData[index]) {
		selectedPodcast.value = props.podcastData[index];
	}
};

// 暴露方法给父组件
defineExpose({
	setPlayingState,
	selectPodcast,
	resetPlayer,
});
</script>

<style scoped>
.podcast-custom-container {
	width: 100%;
	height: 100%;
	flex: 1;
}

.vintage-radio-container {
	display: flex;
	gap: 0;
	/* background: white; */
	overflow: hidden;
	min-height: 500px;
	height: 100%;
	position: relative;
}

/* 左侧边栏 - 收音机控制面板 */
.radio-sidebar {
	width: 280px;
	border-right: 3px solid #000;
	background: white;
	display: flex;
	flex-direction: column;
	position: relative;
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

/* 频率显示屏 - 收音机显示面板 */
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
	/* text-shadow: 0 0 5px var(--accent-color); */
}

.frequency {
	font-size: 14px;
	color: var(--secondary-color);
	/* font-family: "Digital-7", monospace; */
	/* text-shadow: 0 0 5px rgba(255, 107, 107, 0.7); */
	margin-top: 4px;
}

/* 频道列表 - 收音机旋钮区域 */
.channel-list {
	flex: 1;
	overflow-y: auto;
	position: relative;
	z-index: 1;
	padding-bottom: 16px;
}

.channel-header {
	padding: 10px 16px;
	/* background: #000; */
	color: #000;
	font-size: 14px;
	font-weight: bold;
	text-align: center;
	border-bottom: 2px solid #444;
}

.channel-item {
	padding: 12px 16px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.2);
	display: flex;
	align-items: center;
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
}

.channel-item:hover {
	background: rgba(0, 0, 0, 0.1);
}

.channel-item.active::after {
	content: "";
	position: absolute;
	right: 16px;
	width: 8px;
	height: 8px;
	background: var(--secondary-color);
	border-radius: 50%;
	box-shadow: 0 0 5px var(--secondary-color);
}

.channel-number {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #000;
	color: #fff;
	border-radius: 50%;
	font-size: 12px;
	margin-right: 12px;
	border: 2px solid #666;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.channel-name {
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-weight: 500;
}

.channel-status {
	margin-left: 8px;
	color: var(--secondary-color);
	animation: pulse 1.5s infinite;
}

/* 右侧内容区 - 收音机主体 */
.radio-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	background: white;
	position: relative;
}

.radio-content::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 10px,
		rgba(0, 0, 0, 0.02) 10px,
		rgba(0, 0, 0, 0.02) 20px
	);
	z-index: 0;
}

.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #666;
	background: repeating-linear-gradient(
		45deg,
		white,
		white 10px,
		#ebe7df 10px,
		#ebe7df 20px
	);
	position: relative;
	z-index: 1;
}

.empty-state i {
	font-size: 48px;
	margin-bottom: 16px;
	opacity: 0.5;
	color: #333;
}

.empty-state p {
	font-size: 16px;
	font-weight: 500;
}

.podcast-player-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	position: relative;
	z-index: 1;
}

/* 播客标题区 - 收音机显示屏 */
.podcast-header {
	padding: 20px;
	border-bottom: 3px solid #000;
	text-align: center;
	background: #fff;
	color: #f8f8f8;
	box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
}

.podcast-title {
	font-size: 20px;
	font-weight: bold;
	margin: 0 0 4px 0;
	color: var(--secondary-color);
	/* text-shadow: 0 0 5px var(--secondary-color); */
	font-family: monospace;
}

.podcast-subtitle {
	font-size: 14px;
	color: var(--secondary-color);
	margin: 0;
	text-shadow: 0 0 5px rgba(255, 107, 107, 0.7);
	font-family: "Digital-7", monospace;
}

/* 播放器区域 - 收音机控制面板 */
.player-section {
	padding: 20px;
	border-bottom: 3px solid #000;
	display: flex;
	align-items: center;
	gap: 16px;
	background: var(--milk-color);
	position: relative;
}

.audio-player {
	flex: 1;
	height: 36px;
	border-radius: 4px;
}

.language-switch {
	display: flex;
	border: 2px solid #000;
	border-radius: 20px;
	overflow: hidden;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.lang-btn {
	padding: 4px 12px;
	/* background: white; */
	border: none;
	cursor: pointer;
	font-weight: bold;
	transition: all 0.2s ease;
}

.lang-btn:hover {
	background: #d3cfc7;
}

.lang-btn.active {
	background: #000;
	color: #fff;
}

/* 脚本区域 - 收音机扬声器区 */
.transcript-section {
	flex: 1;
	padding: 20px;
	overflow-y: auto;
	position: relative;
	background: white;
}

.transcript-section::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: radial-gradient(
			circle at 20% 30%,
			#d3cfc7 0,
			#d3cfc7 2%,
			transparent 2.5%
		),
		radial-gradient(circle at 40% 70%, #d3cfc7 0, #d3cfc7 2%, transparent 2.5%),
		radial-gradient(circle at 60% 20%, #d3cfc7 0, #d3cfc7 2%, transparent 2.5%),
		radial-gradient(circle at 80% 50%, #d3cfc7 0, #d3cfc7 2%, transparent 2.5%);
	background-size: 50px 50px;
	z-index: -1;
}

.transcript-content {
	/* border: 3px solid #000; */
	border-radius: 8px;
	padding: 10px;
	background: white;
	/* box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2); */
	position: relative;
}

.transcript-paragraph {
	margin-bottom: 20px;
	padding-bottom: 16px;
	border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
	position: relative;
}

.transcript-paragraph:last-child {
	margin-bottom: 0;
	padding-bottom: 0;
	border-bottom: none;
}

.english-text {
	margin: 0 0 8px 0;
	line-height: 1.5;
	font-size: 15px;
}

.chinese-text {
	margin: 0;
	color: #666;
	font-style: italic;
	line-height: 1.5;
	font-size: 14px;
}

.no-transcript {
	text-align: center;
	padding: 30px;
	color: #666;
	font-style: italic;
	background: white;
	border: 3px solid #000;
	border-radius: 8px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
}

.no-data {
	min-height: 300px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #666;
	border: 3px solid #000;
	border-radius: 16px;
	background: white;
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
	position: relative;
}

.no-data::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 10px,
		rgba(0, 0, 0, 0.03) 10px,
		rgba(0, 0, 0, 0.03) 20px
	);
	border-radius: 13px;
}

.no-data i {
	font-size: 48px;
	margin-bottom: 16px;
	opacity: 0.5;
	position: relative;
}

.no-data p {
	position: relative;
	font-weight: 500;
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

@keyframes pulse {
	0%,
	100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.2);
	}
}

@media (max-width: 768px) {
	.vintage-radio-container {
		flex-direction: column;
	}

	.radio-sidebar {
		width: 100%;
		border-right: none;
		border-bottom: 3px solid #000;
	}
}

/* 播放器区域 - 收音机控制面板 */
.player-section {
	padding: 20px;
	border-bottom: 3px solid #000;
	display: flex;
	align-items: center;
	gap: 16px;
	background: var(--milk-color);
	position: relative;
}

.audio-player {
	flex: 1;
	height: 36px;
	border-radius: 4px;
}

.generate-podcast-btn,
.regenerate-podcast-btn,
.generating-podcast {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	border: 2px solid #000;
	border-radius: 20px;
	background: white;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.2s ease;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.generate-podcast-btn:hover {
	background: var(--secondary-color);
	color: white;
}

.regenerate-podcast-btn:hover {
	background: #e0e0e0;
}

.generating-podcast {
	background: #f0f0f0;
	color: #888;
	cursor: default;
}

.generating-podcast i {
	animation: spin 1.5s infinite linear;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
