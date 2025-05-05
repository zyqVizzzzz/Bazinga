<template>
	<div class="retro-edit-card">
		<!-- 标题区域 -->
		<div class="manual-header">
			<div class="manual-title">
				<div class="title-content">
					<h3 class="word-title">{{ selectedNote.word }}</h3>
					<div class="word-subtitle">{{ selectedNote.word_zh }}</div>
				</div>
				<div class="title-actions">
					<button
						v-if="hasPodcast"
						class="podcast-btn"
						@click="handlePodcastModal"
						title="查看播客内容"
					>
						<PodcastIcon size="6" />
					</button>
					<button class="ghost-btn" @click="handleDelete" title="查看播客内容">
						<i class="bi bi-trash"></i>
					</button>
				</div>
			</div>
		</div>

		<div class="manual-content">
			<div class="manual-logo"></div>

			<!-- 中文释义 -->
			<div class="manual-section">
				<div class="section-title">
					<div class="title-decoration">◆</div>
					<h4 class="text-sm">中文释义</h4>
				</div>
				<p class="section-content text-left">
					{{ selectedNote.definition_zh }}
				</p>
			</div>

			<!-- 同义词 -->
			<div v-if="selectedNote.synonyms" class="manual-section">
				<div class="section-title">
					<div class="title-decoration">◆</div>
					<h4 class="text-sm">同义词</h4>
				</div>
				<ol class="section-list text-left">
					<li
						v-for="(synonym, index) in selectedNote.synonyms.split('|')"
						:key="index"
					>
						{{ synonym.trim() }}
					</li>
				</ol>
			</div>

			<!-- 例句 -->
			<div v-if="selectedNote.example" class="manual-section">
				<div class="section-title">
					<div class="title-decoration">◆</div>
					<h4 class="text-sm">例句</h4>
				</div>
				<div class="example-box text-left">
					<p>{{ selectedNote.example }}</p>
					<p class="example-translation">{{ selectedNote.example_zh }}</p>
				</div>
			</div>

			<!-- 笔记 -->
			<div v-if="selectedNote.note" class="text-left mb-0">
				<div class="section-title">
					<div class="title-decoration">◆</div>
					<h4 class="text-sm">补充说明</h4>
				</div>
				<p class="section-content">{{ selectedNote.note }}</p>
			</div>
		</div>

		<dialog id="podcast_modal" class="modal" @close="handleClose">
			<div class="modal-box vintage-radio max-w-2xl min-h-[400px] p-6">
				<!-- 收音机顶部面板  -->
				<div class="radio-top-panel flex justify-between items-center">
					<div class="radio-display p-3 flex-1 relative">
						<div class="text-base-700 font-bold">
							{{ selectedNote?.word }}
						</div>
						<div class="text-base-700 mt-1 text-sm font-bold">
							{{ selectedNote?.word_zh }}
						</div>
						<!-- 这里可以根据需要添加按钮，但 edit.vue 中没有生成逻辑，暂时留空 -->
					</div>
				</div>
				<!-- 播放器控制区 -->
				<div class="radio-control-panel p-4">
					<div class="flex items-center gap-4">
						<div class="flex-1">
							<audio
								v-if="podcastData?.audioPath"
								controls
								class="radio-player"
								ref="audioElement"
								:src="podcastData.audioPath"
							>
								<source :src="podcastData.audioPath" type="audio/mpeg" />
							</audio>
							<audio v-else controls class="radio-player">
								<source :src="undefined" type="audio/mpeg" />
							</audio>
						</div>

						<div class="language-toggle flex justify-center items-center">
							<button
								class="translation-toggle-btn text-sm"
								:class="{ active: showChinese }"
								@click="showChinese = !showChinese"
								title="显示/隐藏中文翻译"
							>
								<TranslationIcon size="4" />
							</button>
						</div>
					</div>

					<!-- 脚本显示区 -->
					<div
						v-if="podcastData?.script?.length > 0"
						class="radio-script-panel"
					>
						<div class="radio-script-content">
							<div
								v-for="(paragraph, idx) in podcastData.script"
								:key="idx"
								class="script-paragraph"
							>
								<p class="text-sm text-base-700 text-left">
									{{ paragraph }}
								</p>
								<p
									v-if="showChinese && podcastData.chineseScript?.[idx]"
									class="text-sm text-base-700/70 mt-1.5 italic text-left"
								>
									{{ podcastData.chineseScript[idx] }}
								</p>
							</div>
						</div>
					</div>
					<div v-else class="radio-script-panel empty-script-panel">
						<div class="text-center text-base-700/70">
							<p>暂无脚本内容。</p>
						</div>
					</div>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>关闭</button>
			</form>
		</dialog>
	</div>
</template>
<script setup>
import { onMounted, ref, toRefs, computed, watch } from "vue";
import { showToast } from "@/components/common/toast.js";
import apiClient from "@/api";
import { generateTextHash } from "@/utils";
import PodcastIcon from "@/components/icons/Podcast.vue";
import { useNotebookStore } from "@/store/index";
import TranslationIcon from "@/components/icons/Translation.vue";

const props = defineProps({
	selectedNote: Object,
});
const { selectedNote } = toRefs(props);

const emit = defineEmits(["on-delete-note"]);

const notebookStore = useNotebookStore();
const storeNote = computed(() => notebookStore.currentActiveNote);

const showChinese = ref(false);
const podcastData = ref(null);
const hasPodcast = ref(false);

const audioElement = ref(null);

// 去除HTML标签的辅助函数
const removeHtmlTags = (text) => {
	return text.replace(/<[^>]*>/g, "");
};

// 检查是否有关联播客
const checkPodcast = async () => {
	if (!selectedNote.value?.word) return;
	const cleanText = removeHtmlTags(selectedNote.value?.word).trim();
	try {
		const textHash = generateTextHash(cleanText);
		const res = await apiClient.get(`/podcasts/search?knowledge=${textHash}`);
		if (res.data.code === 200 && res.data.data.podcasts.length) {
			hasPodcast.value = true;
			podcastData.value = res.data.data.podcasts[0];
		} else {
			hasPodcast.value = false;
			podcastData.value = null;
		}
	} catch (error) {
		console.error("检查播客失败:", error);
		hasPodcast.value = false;
		podcastData.value = null;
	}
};

const handleClose = () => {
	if (audioElement.value) {
		audioElement.value.pause(); // 暂停音频
		audioElement.value.currentTime = 0; // 将播放进度重置到开头
		console.log("音频已停止");
	}
};

const handlePodcastModal = () => {
	const modal = document.getElementById("podcast_modal");
	modal.showModal();
};

// 添加删除方法
const handleDelete = async () => {
	try {
		const response = await apiClient.post("/lesson-notes/remove", {
			resourceId: selectedNote.value.resourceId,
			word: selectedNote.value.word,
		});

		if (response.data.code === 200) {
			emit("on-delete-note", {
				word: selectedNote.value.word,
				action: "remove",
			});
			showToast({ message: "删除成功", type: "success" });
		} else {
			showToast({
				message: response.data.message || "删除失败",
				type: "error",
			});
		}
	} catch (error) {
		showToast({ message: "删除失败", type: "error" });
		console.error("Error deleting note:", error);
	}
};

watch(
	() => notebookStore.noteChangeCounter,
	(newVal, oldVal) => {
		if (newVal !== oldVal && storeNote.value?.word) {
			checkPodcast();
		}
	},
	{ immediate: true } // 添加 immediate 选项确保首次加载时也执行
);

watch(
	() => selectedNote.value?.word,
	(newWord) => {
		if (newWord) {
			checkPodcast();
		}
	}
);
</script>
<style scoped>
.retro-edit-card {
	padding: 0.5rem 1rem;
	height: 100%;
	overflow-y: auto;
}

/* 单词标题区 */
.word-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.word-text {
	font-size: 1.2rem;
	font-weight: bold;
	color: #333;
}

/* 例句样式 */
.example-box {
	background: rgba(var(--primary-color-rgb), 0.05);
	padding: 0.5rem 1rem 1rem;
	border-radius: 8px;
}

/* 装饰效果 */
.retro-edit-card::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 9px;
	pointer-events: none;
}

/* 装饰效果 */
.retro-edit-card::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 9px;
	pointer-events: none;
}

.retro-edit-card {
	/* padding: 0.5rem 1rem; */
	height: 100%;
	overflow-y: auto;
	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
}

.retro-edit-card::-webkit-scrollbar {
	display: none; /* Chrome, Safari and Opera */
}

.podcast-btn {
	background: none;
	border: none;
	cursor: pointer;
	transition: all 0.2s;
	padding: 4px;
	border-radius: 50%;
}

.podcast-btn:hover {
	transform: scale(1.1);
	background-color: rgba(var(--secondary-color-rgb), 0.1);
}

.modal-box {
	max-height: 80vh;
	overflow-y: auto;
}

.modal-box::-webkit-scrollbar {
	width: 8px;
}

.modal-box::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}

.modal-box::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
}

.modal-box::-webkit-scrollbar-thumb:hover {
	background: rgba(0, 0, 0, 0.3);
}

.ghost-btn {
	width: 36px;
	height: 36px;
	transition: transform 0.3s;
}
.manual-header {
	border-bottom: 2px solid #000;
	margin-bottom: 0.1rem;
	padding-bottom: 1rem;
}

.manual-logo {
	font-family: "Courier New", monospace;
	font-size: 0.75rem;
	font-weight: bold;
	letter-spacing: 1px;
	margin-bottom: 1.5rem;
	color: #666;
}

.word-title {
	color: #222;
	font-size: 1.1rem;
	font-weight: 800;
	letter-spacing: 1px;
	margin-bottom: 0.2rem;
}

.word-subtitle {
	font-size: 0.875rem;
	color: #666;
}
.manual-title {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	width: 100%;
}

.title-content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.5rem;
}

.title-actions {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.word-subtitle {
	font-size: 0.875rem;
	color: #666;
}

.manual-section {
	margin-bottom: 1.5rem;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 1rem;
	border-bottom: 1px dashed #000;
	padding-bottom: 0.5rem;
}

.title-decoration {
	font-size: 0.875rem;
	color: #666;
}

.section-content {
	font-size: 0.875rem;
	line-height: 1.6;
	color: #333;
}

.section-list {
	list-style-type: decimal;
	padding-left: 1.5rem;
	font-size: 0.875rem;
	line-height: 1.6;
	color: #333;
}

.example-box {
	background: #fff;
	border: 1px solid #000;
	padding: 1rem;
	font-size: 0.875rem;
	line-height: 1.6;
	border-radius: 12px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.example-translation {
	margin-top: 0.5rem;
	color: #666;
	font-style: italic;
}

.modal-box.vintage-radio {
	background: var(--milk-color, #f5f2eb); /* 使用 milk-color 作为背景 */
	border: 3px solid #000; /* 加粗黑色边框 */
	box-shadow: 2px 2px 0 #222; /* 增加黑色阴影 */
	border-radius: 12px; /* 轻微圆角 */
	overflow: hidden; /* 隐藏溢出内容 */
	color: #000; /* 默认文字颜色为黑色 */
}

.radio-top-panel {
	margin-bottom: 1rem; /* 增加下边距 */
}

/* 新增样式：品牌文字 */
.radio-brand {
	font-weight: bold;
	letter-spacing: 1px;
	color: #000; /* 黑色文字 */
	font-family: "Courier New", monospace; /* 使用等宽字体 */
}

/* 新增样式：显示区域 */
.radio-display {
	background: #ffffff;
	border: 2px solid #000; /* 黑色边框 */
	border-radius: 4px; /* 圆角 */
	min-height: 60px; /* 最小高度 */
	box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.1); /* 内阴影 */
	position: relative; /* 相对定位，用于内部元素定位 */
	color: #000; /* 确保文字是黑色 */
}

/* 播放器控制区 */
.radio-control-panel {
	background: #f1f1f1; /* 浅灰色背景 */
	padding: 1rem;
	border-radius: 6px;
	border: 2px solid #000;
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.2); /* 内阴影 */
	margin-top: 1rem; /* 增加上边距 */
}

/* 音频播放器 */
.radio-player {
	width: 100%;
	height: 40px; /* 调整高度 */
	border-radius: 4px;
	filter: grayscale(1) contrast(1.2); /* 黑白滤镜并增加对比度 */
}

/* 翻译切换按钮样式 */
.translation-toggle-btn {
	padding: 8px;
	border-radius: 6px;
	background-color: transparent;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease-in-out;
	border: none; /* 确保没有默认边框 */
	cursor: pointer;
}

.translation-toggle-btn:hover {
	background-color: rgba(200, 200, 200, 0.2);
	transform: translateY(-1px);
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.translation-toggle-btn.active {
	/* 可以为激活状态添加样式，例如背景色或边框 */
	background-color: rgba(0, 0, 0, 0.1);
}

/* 播放器控制区 */
.radio-control-panel {
	background: #f1f1f1; /* 浅灰色背景 */
	padding: 1rem;
	border-radius: 6px;
	border: 2px solid #000;
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.2); /* 内阴影 */
	margin-top: 1rem; /* 增加上边距 */
}

/* 音频播放器 */
.radio-player {
	width: 100%;
	height: 40px; /* 调整高度 */
	border-radius: 4px;
	filter: grayscale(1) contrast(1.2); /* 黑白滤镜并增加对比度 */
}

/* 翻译切换按钮样式 */
.translation-toggle-btn {
	padding: 8px;
	border-radius: 6px;
	background-color: transparent;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease-in-out;
	border: none; /* 确保没有默认边框 */
	cursor: pointer;
}

.translation-toggle-btn:hover {
	background-color: rgba(200, 200, 200, 0.2);
	transform: translateY(-1px);
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.translation-toggle-btn.active {
	/* 可以为激活状态添加样式，例如背景色或边框 */
	background-color: rgba(0, 0, 0, 0.1);
}

/* 脚本显示区 */
.radio-script-panel {
	margin-top: 1rem; /* 增加上边距 */
	min-height: 150px; /* 确保即使内容为空也有最小高度 */
	max-height: 500px; /* 限制最大高度 */
	overflow-y: auto; /* 允许滚动 */
	background: #fff; /* 白色背景 */
	border: 2px solid #000; /* 黑色边框 */
	border-radius: 6px; /* 圆角 */
	padding: 0.8rem; /* 内边距 */
	box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.1); /* 轻微内阴影 */
	position: relative; /* 添加相对定位 */
}

.empty-script-panel {
	display: flex; /* 使用 flex 布局 */
	justify-content: center; /* 水平居中 */
	align-items: center; /* 垂直居中 */
	text-align: center; /* 确保文本居中 */
}

/* 调整提示文字样式 */
.empty-script-panel div {
	color: #555; /* 设置文字颜色 */
	font-size: 0.9rem;
}

/* 滚动条样式 (可选) */
.radio-script-panel::-webkit-scrollbar {
	width: 8px;
}
.radio-script-panel::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}
.radio-script-panel::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.3);
	border-radius: 4px;
}
.radio-script-panel::-webkit-scrollbar-thumb:hover {
	background: rgba(0, 0, 0, 0.5);
}

.radio-script-content {
	/* 脚本内容容器 */
}

.script-paragraph {
	margin-bottom: 1rem; /* 段落下边距 */
	padding-bottom: 0.8rem; /* 段落底内边距 */
	border-bottom: 1px dashed rgba(0, 0, 0, 0.2); /* 虚线分隔 */
}

.script-paragraph:last-child {
	margin-bottom: 0;
	padding-bottom: 0;
	border-bottom: none; /* 最后一段无分隔线 */
}

.script-paragraph p {
	line-height: 1.6; /* 增加行高 */
	color: #000; /* 默认黑色 */
}

.script-paragraph .text-base-700\/70 {
	color: #555; /* 中文翻译用深灰色 */
	font-style: italic; /* 斜体 */
}

.text-base-700 {
	color: #000; /* 确保脚本文字是黑色 */
}
</style>
