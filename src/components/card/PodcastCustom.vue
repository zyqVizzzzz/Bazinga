<template>
	<div class="podcast-custom-container">
		<!-- 左右布局容器 -->
		<div class="podcast-layout" v-if="podcastData && podcastData.length > 0">
			<!-- 左侧播客列表 -->
			<div class="podcast-left-section">
				<!-- 欢迎标题区域 -->
				<div class="podcast-header">
					<div class="podcast-title">
						<div class="title-content">
							<div class="welcome-title">
								<span>Scene {{ props.currentPage }}</span>
							</div>
						</div>
						<div class="podcast-badge">BAZINGA PODCAST</div>
					</div>
				</div>
				<!-- 播放器区域 -->
				<div class="podcast-player" v-if="selectedPodcast">
					<div class="player-header">
						<div class="host-avatar">
							<img
								v-if="selectedPodcast.options && selectedPodcast.options.voice"
								:src="`https://bazinga-1251994034.cos.ap-shanghai.myqcloud.com/default/${selectedPodcast.options.voice.toLowerCase()}.png`"
								alt="主持人头像"
							/>
							<div class="default-avatar" v-else>
								{{
									selectedPodcast.options && selectedPodcast.options.voice
										? selectedPodcast.options.voice.charAt(0).toUpperCase()
										: "?"
								}}
							</div>
						</div>
						<div class="player-info">
							<h3 class="player-title">
								{{ selectedPodcast.knowledge || "未知标题" }}
							</h3>
							<p
								class="player-host"
								v-if="selectedPodcast.options && selectedPodcast.options.voice"
							>
								主持人: {{ selectedPodcast.options.voice }}
							</p>
						</div>
					</div>

					<!-- 音频播放器 -->
					<div class="audio-controls">
						<audio
							ref="audioPlayer"
							:src="selectedPodcast.audioPath"
							@play="onPlay"
							@pause="onPause"
							@timeupdate="onTimeUpdate"
							@loadedmetadata="onLoadedMetadata"
							controls
							class="audio-element"
						></audio>

						<!-- 自定义播放控件 -->
						<div class="custom-controls">
							<div class="progress-bar">
								<div class="progress-bg"></div>
								<div
									class="progress-fill"
									:style="{ width: `${audioProgress}%` }"
								></div>
								<div
									class="progress-handle"
									:style="{ left: `${audioProgress}%` }"
								></div>
							</div>
							<div class="time-display">
								<span>{{ formatTime(currentTime) }}</span>
								<span>{{ formatTime(duration) }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="podcast-list">
					<div
						v-for="(podcast, index) in podcastData"
						:key="index"
						class="podcast-list-item"
						:class="{ active: currentPlayingIndex === index }"
						@click="selectPodcast(podcast, index)"
					>
						<div class="podcast-item-content">
							<p class="podcast-title">{{ podcast.knowledge || "暂无标题" }}</p>
						</div>
						<div class="podcast-status">
							<div
								class="status-icon"
								:class="{ playing: currentPlayingIndex === index && isPlaying }"
							>
								<i class="bi bi-soundwave"></i>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 右侧脚本区域 -->
			<div class="podcast-detail">
				<div class="empty-detail" v-if="currentPlayingIndex === null">
					请从左侧选择一个播客
				</div>
				<div v-else-if="selectedPodcast" class="script-container">
					<!-- 脚本内容 -->
					<div class="script-content">
						<div class="script-text" v-if="selectedPodcast.script">
							<div
								v-for="(paragraph, idx) in selectedPodcast.script"
								:key="idx"
								class="script-block"
							>
								<!-- 英文段落 -->
								<div class="script-paragraph-wrapper">
									<p class="script-paragraph original">
										{{ paragraph }}
									</p>
									<!-- 对应的中文翻译 -->
									<p
										v-if="
											showTranslated &&
											selectedPodcast.chineseScript &&
											selectedPodcast.chineseScript[idx]
										"
										class="script-paragraph translated"
									>
										{{ selectedPodcast.chineseScript[idx] }}
									</p>
								</div>
							</div>
						</div>
						<div v-else class="no-script">暂无脚本内容</div>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="no-data">暂无播客数据</div>
	</div>
</template>
<script setup>
import { ref, onMounted, watch, computed } from "vue";

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
	padding: 16px 0;
	border-radius: 8px;
	margin-top: 0 !important;
}

/* 左右布局容器 */
.podcast-layout {
	display: flex;
	gap: 20px;
	width: 100%;
	min-height: 400px;
}

/* 左侧区域：包含播放器和列表 */
.podcast-left-section {
	width: 30%;
	max-width: 300px;
	min-width: 200px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	position: sticky;
	top: 16px;
	align-self: flex-start;
	max-height: calc(100vh - 32px); /* 减去上下间距 */
	overflow-y: auto;
}

/* 欢迎标题区域样式 */
.podcast-header {
	background-color: white;
	border: 2px solid black;
	border-radius: 12px;
	padding: 12px;
	position: relative;
	overflow: hidden;
	margin-bottom: 16px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
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

.podcast-title {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: center;
	gap: 12px;
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
	flex-shrink: 0;
}

.title-content {
	flex: 1;
	min-width: 0;
}

.welcome-title {
	font-weight: bold;
	color: black;
	font-size: 16px;
	margin: 0 0 0 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.episode-info {
	font-size: 12px;
	color: #666;
}

.podcast-badge {
	padding: 4px 8px;
	background-color: rgba(var(--secondary-color-rgb), 0.1);
	border: 1px solid rgba(var(--secondary-color-rgb), 0.3);
	border-radius: 6px;
	font-size: 10px;
	font-weight: 500;
	color: var(--secondary-color);
	transform: rotate(2deg);
	white-space: nowrap;
}

/* 播放器样式 */
.podcast-player {
	background-color: white;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	flex-shrink: 0; /* 防止播放器被压缩 */
	border: 2px solid black;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.player-header {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 8px;
}

.host-avatar {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	overflow: hidden;
	background-color: #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	font-weight: bold;
	color: #666;
	border: 2px solid black;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.host-avatar img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 50%;
}

.default-avatar {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #e0e0e0;
	color: #666;
	border-radius: 50%;
}

.player-info {
	flex: 1;
	overflow: hidden;
}

.player-title {
	font-size: 16px;
	font-weight: 600;
	margin: 0 0 4px 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.player-host {
	font-size: 12px;
	color: #666;
	margin: 0;
}

.audio-controls {
	width: 100%;
}

.audio-element {
	width: 100%;
	height: 36px;
	margin-bottom: 8px;
}

.custom-controls {
	display: none; /* 暂时隐藏自定义控件，使用浏览器原生控件 */
}

.progress-bar {
	width: 100%;
	height: 6px;
	background-color: #f0f0f0;
	border-radius: 3px;
	position: relative;
	cursor: pointer;
	margin-bottom: 8px;
}

.progress-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 3px;
	background-color: #e0e0e0;
}

.progress-fill {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	border-radius: 3px;
	background-color: #333;
}

.progress-handle {
	position: absolute;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background-color: #333;
	box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.time-display {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	color: #666;
}

/* 左侧播客列表 */

.podcast-list {
	max-width: 300px;
	min-width: 200px;
	border-radius: 12px;
	background-color: rgba(255, 255, 255, 0.7);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	overflow-y: auto;
	max-height: 600px;
}

.podcast-list-item {
	padding: 18px 16px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.podcast-list-item:hover {
	background-color: rgba(0, 0, 0, 0.03);
}

.podcast-list-item.active {
	background-color: rgba(0, 0, 0, 0.05);
	border-left: 3px solid #333;
}

.podcast-item-content {
	flex: 1;
	overflow: hidden;
}

.podcast-title {
	font-size: 14px;
	font-weight: 500;
	color: #333;
	margin: 0 0 4px 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.podcast-host {
	font-size: 12px;
	color: #666;
}

.podcast-status {
	display: flex;
	align-items: center;
}

.status-icon {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba(0, 0, 0, 0.3);
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.05);
}

.status-icon.playing {
	color: #fff;
	background-color: #333;
	animation: pulse 1.5s infinite;
}

@keyframes pulse {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
	100% {
		transform: scale(1);
	}
}

/* 右侧播客详情区域 */
.podcast-detail {
	flex: 1;
	border-radius: 12px;
	background-color: white;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 20px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	min-height: 550px; /* 确保右侧内容区域有足够的高度产生滚动效果 */
}

.empty-detail {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #888;
	font-style: italic;
}

/* 脚本容器样式 */
.script-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

/* 语言切换按钮组 */
.language-toggle {
	display: flex;
	justify-content: center;
	margin-bottom: 16px;
	border-radius: 20px;
	background-color: #f5f5f5;
	padding: 4px;
	width: fit-content;
	align-self: center;
}

.toggle-btn {
	padding: 6px 16px;
	border-radius: 16px;
	border: none;
	background: none;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;
	color: #666;
}

.toggle-btn.active {
	background-color: #333;
	color: white;
	font-weight: 500;
}

/* 脚本内容区域 */
.script-content {
	flex: 1;
	overflow-y: auto;
	padding: 12px 24px;
}

.script-text {
	font-size: 16px;
	line-height: 1.6;
}

.script-block {
	margin-bottom: 24px;
}

.script-paragraph {
	margin: 0;
	text-align: justify;
	color: #333;
}

.script-paragraph.original {
	font-weight: 500;
	margin-bottom: 16px;
}

.script-paragraph.translated {
	font-size: 14px;
	color: #666;
	line-height: 1.5;
	padding-top: 8px;
	/* margin-top: 8px; */
	border-top: 1px dashed #e0e0e0;
}

.script-text.original .script-paragraph {
	font-weight: 400;
}

.script-text.translated .script-paragraph {
	font-style: italic;
	color: #555;
}

.no-script {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100px;
	color: #888;
	font-style: italic;
	background-color: #f9f9f9;
	border-radius: 8px;
	margin-top: 20px;
}

.no-data {
	text-align: center;
	padding: 24px;
	color: #888;
	font-style: italic;
}

/* 响应式调整 */
@media (max-width: 768px) {
	.podcast-layout {
		flex-direction: column;
	}

	.podcast-left-section {
		width: 100%;
		max-width: 100%;
	}

	.podcast-list {
		width: 100%;
		max-width: 100%;
		max-height: 200px;
	}

	.podcast-detail {
		margin-top: 16px;
	}

	.language-toggle {
		width: 100%;
	}
}
</style>
