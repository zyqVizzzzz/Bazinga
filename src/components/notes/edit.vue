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
						@click="showPodcastModal = true"
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

		<dialog id="podcast_modal" class="modal" :open="showPodcastModal">
			<div
				class="modal-box max-w-2xl border-2 border-gray-800"
				style="background-color: var(--milk-color)"
			>
				<div class="flex justify-between items-center mb-4">
					<h3 class="font-bold text-lg text-secondary">
						{{ podcastData?.knowledge }}
					</h3>
					<button
						class="btn btn-sm btn-circle"
						@click="showPodcastModal = false"
					>
						<i class="bi bi-x-lg"></i>
					</button>
				</div>

				<!-- 音频播放器 -->
				<div class="mb-4">
					<audio
						v-if="podcastData?.audioPath"
						controls
						class="w-full"
						:src="podcastData.audioPath"
					></audio>
				</div>

				<!-- 文本切换按钮 -->
				<div class="flex justify-center gap-4 mb-4">
					<button
						class="btn btn-sm"
						:class="{ 'btn-secondary': !showChinese }"
						@click="showChinese = false"
					>
						English
					</button>
					<button
						class="btn btn-sm"
						:class="{ 'btn-secondary': showChinese }"
						@click="showChinese = true"
					>
						中文
					</button>
				</div>

				<!-- 文本内容 -->
				<div class="space-y-4 text-left">
					<p
						v-for="(text, index) in showChinese
							? podcastData?.chineseScript
							: podcastData?.script"
						:key="index"
						class="text-sm text-gray-600"
					>
						{{ text }}
					</p>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	</div>
</template>
<script setup>
import { ref, toRefs, computed, watch } from "vue";
import { showToast } from "@/components/common/toast.js";
import apiClient from "@/api";
import { generateTextHash } from "@/utils";
import PodcastIcon from "@/components/icons/Podcast.vue";
import { useNotebookStore } from "@/store/index";

const props = defineProps({
	selectedNote: Object,
});
const { selectedNote } = toRefs(props);

const emit = defineEmits(["on-delete-note"]);

const notebookStore = useNotebookStore();
const storeNote = computed(() => notebookStore.currentActiveNote);
const noteChangeCounter = computed(() => notebookStore.noteChangeCounter);

const showPodcastModal = ref(false);
const showChinese = ref(false);
const podcastData = ref(null);
const hasPodcast = ref(false);

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

.pronunciation-btn,
.bookmark-btn {
	background: none;
	border: none;
	cursor: pointer;
	transition: transform 0.2s;
}

.pronunciation-btn:hover,
.bookmark-btn:hover {
	transform: scale(1.1);
}

/* 内容区域 */
.content-section {
	padding: 1rem 0;
	border-bottom: 1px solid #ddd;
	text-align: left;
}

/* 词根词缀分析 */
.word-analysis {
}

.analysis-item {
	margin-bottom: 0.5rem;
	font-size: 0.875rem;
}

.term {
	color: var(--primary-color);
	font-weight: bold;
}

/* 变形表格 */
.inflections-grid {
	display: grid;
}

.inflection-item {
	font-size: 0.875rem;
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

/* 例句样式 */
.example-box {
	background: rgba(var(--primary-color-rgb), 0.05);
	padding: 0.5rem 1rem 1rem;
	border-radius: 8px;
}

.example {
	margin: 0.5rem 0;
	color: #333;
}

.translation {
	color: #666;
	font-size: 0.875rem;
}

/* 注释编辑区 */
.retro-textarea {
	width: 100%;
	padding: 0.75rem;
	border: 2px solid #333;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.8);
	font-family: inherit;
	resize: vertical;
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.retro-textarea:focus {
	outline: none;
	box-shadow: inset 2px 2px 0 rgba(var(--primary-color-rgb), 0.2);
}

/* 按钮样式 */
.button-group {
	display: flex;
	gap: 1rem;
	margin-top: 1rem;
}

.retro-btn {
	position: relative;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

.btn-shadow {
	position: absolute;
	inset: 0;
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	inset: 0;
	border-radius: 8px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	inset: 0;
	background-color: white;
	border: 2px solid #333;
	border-radius: 8px;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.875rem;
}

.retro-btn:hover .btn-face {
	/* background-color: white; */
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face {
	transform: translateY(0);
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

.ghost-btn .btn-face {
	/* background-color: white; */
	color: #666;
	font-size: 0.875rem;
	font-weight: 500;
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

.word-title {
	/* color: var(--secondary-color); */
	font-size: 1.2rem;
	font-weight: 800;
	letter-spacing: 1px;
	line-height: 1.2;
}

.word-subtitle {
	font-size: 0.875rem;
	color: #666;
}
</style>
