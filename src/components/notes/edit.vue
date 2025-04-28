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

		<dialog id="podcast_modal" class="modal">
			<div
				class="modal-box max-w-2xl border-2 border-gray-800"
				style="background-color: var(--milk-color)"
			>
				<!-- 音频播放器 -->
				<div class="flex justify-between items-center mb-4">
					<audio
						v-if="podcastData?.audioPath"
						controls
						class="w-full"
						:src="podcastData.audioPath"
					></audio>
					<button
						class="translation-toggle-btn text-sm ml-4"
						@click="showChinese = !showChinese"
						title="显示/隐藏中文翻译"
					>
						<TranslationIcon size="4" />
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
import TranslationIcon from "@/components/icons/Translation.vue";

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
	color: var(--secondary-color);
	font-size: 1.2rem;
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

/* 翻译切换按钮样式 */
.translation-toggle-btn {
	padding: 8px;
	border-radius: 6px;
	background-color: transparent;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease-in-out;
}

.translation-toggle-btn:hover {
	background-color: rgba(200, 200, 200, 0.2);
	transform: translateY(-1px);
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}
</style>
