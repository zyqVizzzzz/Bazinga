<template>
	<div class="podcast-custom-container">
		<div
			v-if="podcastData && podcastData.length > 0"
			:class="['knowledge-gallery', getGalleryClass()]"
		>
			<div
				v-for="(podcast, index) in podcastData"
				:key="index"
				class="knowledge-card"
			>
				<div class="card-content">
					<div
						class="host-info"
						v-if="podcast.options && podcast.options.voice"
					>
						host - {{ podcast.options.voice }}
					</div>
					<p class="card-text">{{ podcast.knowledge || "暂无知识点描述" }}</p>
					<div class="play-icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							width="24"
							height="24"
						>
							<path d="M8 5v14l11-7z" />
						</svg>
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
});

// 定义组件发出的事件
const emit = defineEmits(["play-dialogue"]);

// 当前播放状态
const isPlaying = ref(false);
const currentPlayingIndex = ref(null);

// 根据数据量返回不同的画廊类名
const getGalleryClass = () => {
	const count = props.podcastData.length;
	if (count === 1) return "single-item";
	if (count <= 3) return "few-items";
	if (count <= 6) return "medium-items";
	if (count <= 9) return "many-items";
	return "grid-items";
};

onMounted(() => {
	console.log("PodcastCustom 组件已挂载");
	console.log("接收到的播客数据:", props.podcastData);
	console.log("显示翻译:", props.showTranslation);
	console.log("全局播放状态:", props.isGlobalPlaying);
});

// 监听 podcastData 变化
watch(
	() => props.podcastData,
	(newData) => {
		console.log("播客数据已更新:", newData);
	},
	{ deep: true }
);

// 设置播放状态的方法，供父组件调用
const setPlayingState = (playing, index) => {
	isPlaying.value = playing;
	currentPlayingIndex.value = index;
};

// 暴露方法给父组件
defineExpose({
	setPlayingState,
});
</script>

<style scoped>
.podcast-custom-container {
	width: 100%;
	padding: 16px;
	border-radius: 8px;
}

.knowledge-gallery {
	display: grid;
	gap: 16px;
	width: 100%;
}

/* 单个项目时的样式 */
.single-item {
	grid-template-columns: 1fr;
}

.single-item .knowledge-card {
	height: 200px; /* 从300px减小到200px */
}

/* 2-3个项目时的样式 */
.few-items {
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.few-items .knowledge-card {
	height: 180px; /* 从250px减小到180px */
}

/* 4-6个项目时的样式 */
.medium-items {
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.medium-items .knowledge-card {
	height: 160px; /* 从220px减小到160px */
}

/* 7-9个项目时的样式 */
.many-items {
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.many-items .knowledge-card {
	height: 150px; /* 从200px减小到150px */
}

/* 10个以上项目时的样式 */
.grid-items {
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.grid-items .knowledge-card {
	height: 140px; /* 从180px减小到140px */
}

.knowledge-card {
	background-color: white;
	border-radius: 12px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	position: relative;
}

.knowledge-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-content {
	padding: 16px;
	flex: 1;
	display: flex;
	flex-direction: column;
}

.play-icon {
	position: absolute;
	bottom: 12px;
	right: 12px;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba(0, 0, 0, 0.2);
	background-color: rgba(0, 0, 0, 0.05);
	border-radius: 50%;
	transition: all 0.3s ease;
}

.host-info {
	position: absolute;
	bottom: 12px;
	left: 12px;
	font-size: 12px;
	color: #888;
	padding: 2px 6px;
	background-color: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
	font-weight: 500;
	max-width: calc(100% - 60px);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	z-index: 1;
}

.knowledge-card:hover .play-icon {
	color: rgba(0, 0, 0, 0.5);
	background-color: rgba(0, 0, 0, 0.1);
	transform: scale(1.1);
}

.card-text {
	font-size: 16px;
	color: #666;
	line-height: 1.5;
	flex: 1;
	overflow: auto;
	/* 支持文本过长时滚动 */
	max-height: calc(100% - 30px);
}

.no-data {
	text-align: center;
	padding: 24px;
	color: #888;
	font-style: italic;
}

/* 响应式调整 */
@media (max-width: 768px) {
	.knowledge-gallery {
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
	}

	.knowledge-card {
		height: auto !important;
		min-height: 150px;
	}
}
</style>
