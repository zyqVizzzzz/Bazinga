<template>
	<div class="retro-notebook">
		<!-- 搜索框区域 -->
		<div class="flex justify-between items-center mb-4 px-2">
			<div class="search-area">
				<div class="search-box flex items-center space-x-2 relative">
					<div class="retro-input-wrapper">
						<input
							v-model="searchQuery"
							type="text"
							class="retro-input"
							@input="onInputWord"
							@keydown.enter="searchWord"
							:placeholder="t('notes.searchInput')"
							:disabled="isGenerating"
						/>
					</div>
				</div>
			</div>
			<div
				class="pagination-controls static transform-none flex items-center gap-4"
			>
				<button
					class="retro-btn"
					@click="prevPage"
					:disabled="currentPage === 1"
				>
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">&lt;</div>
						</div>
					</div>
				</button>

				<div class="page-indicator">
					<div class="page-number">{{ currentPage }} / {{ totalPages }}</div>
				</div>

				<button
					class="retro-btn"
					@click="nextPage"
					:disabled="currentPage === totalPages"
				>
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">&gt;</div>
						</div>
					</div>
				</button>
			</div>
		</div>

		<!-- 笔记列表 -->
		<div class="notebook-content">
			<div class="dictionary-list">
				<template v-if="vocabularyNotes.length > 0">
					<div
						v-for="(note, index) in vocabularyNotes"
						:key="index"
						@click="selectNote(note)"
						:class="['word-entry', { active: activeNote.word === note.word }]"
					>
						<div class="flex justify-between items-center">
							<div class="word-left">
								<span class="word-text">{{ note.word }}</span>
								<span v-if="note.pos" class="pos">{{ note.pos }}</span>
							</div>
							<div class="word-right">
								<span class="definition">{{ note.word_zh }}</span>
							</div>
						</div>
					</div>
				</template>
				<div v-else class="empty-state">
					<p class="text-gray-500 mb-4">未找到相关单词</p>
					<button
						@click="generateNewCard"
						class="retro-btn generate-btn"
						:disabled="!searchQuery.trim()"
					>
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face text-sm">
									{{ isGenerating ? "生成中..." : "生成新卡片" }}
								</div>
							</div>
						</div>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import apiClient from "@/api";
import { useNotebookStore, useLoginStore } from "@/store/index";
import { showToast } from "@/components/common/toast.js";
import { useI18n } from "vue-i18n";

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);

const { t } = useI18n();

const emit = defineEmits([
	"on-select-note",
	"on-search-word",
	"on-generate-card",
]);
const props = defineProps({
	searchWord: Object,
	searchIndex: Number,
	refreshTrigger: Number,
});

const vocabularyNotes = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalCounts = ref(0);
const activeNote = ref({});

const notebookStore = useNotebookStore();
const { setCurrentActiveNote } = notebookStore;

// 搜索相关的状态
const searchQuery = ref("");
const suggestions = ref([]);

const isGenerating = ref(false);

onMounted(() => {
	isLogin.value && getNotebook();
});

// 计算总页数
const totalPages = computed(() => {
	const totalItems = totalCounts.value;
	return Math.ceil(totalItems / itemsPerPage.value);
});

// 选中笔记并展示在 edit-content 区域
const selectNote = (note) => {
	activeNote.value = note; // 设置当前选中的单词为 active
	setCurrentActiveNote(note);
	emit("on-select-note", note);
};

const getNotebook = async (page = 1, limit = 10) => {
	if (!isLogin.value) {
		vocabularyNotes.value = [];
		totalCounts.value = 0;
		return;
	}
	const res = await apiClient.get(
		`/lesson-notes/user/all-notes?page=${page}&limit=${limit}`
	);
	if (res.data.code === 200) {
		const { notes, total } = res.data.data;
		vocabularyNotes.value = notes;
		totalCounts.value = total;

		if (notes.length > 0) {
			// 使用 store 设置当前笔记
			setCurrentActiveNote(notes[0]);
			activeNote.value = notes[0];
			emit("on-select-note", notes[0]);
		}
	} else {
		showToast({ message: "未查到单词", type: "error" });
	}
};

const generateNewCard = async () => {
	if (!searchQuery.value.trim() || isGenerating.value) return;

	try {
		isGenerating.value = true;
		const res = await apiClient.post("/translation/generate", {
			word: searchQuery.value.trim(),
		});

		if (res.data.code === 200) {
			emit("on-generate-card", res.data.data);
		} else {
			showToast({ message: res.data.message || "生成失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "生成失败", type: "error" });
		console.error("Error generating card:", error);
	} finally {
		isGenerating.value = false;
	}
};

// 分页导航
const nextPage = () => {
	if (currentPage.value < totalPages.value) {
		currentPage.value++;
		getNotebook(currentPage.value);
	}
};

const prevPage = () => {
	if (currentPage.value > 1) {
		currentPage.value--;
		getNotebook(currentPage.value);
	}
};

// 搜索相关的方法
let debounceTimeout;
const debounce = (func, delay) => {
	return (...args) => {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => func(...args), delay);
	};
};

const searchWord = () => {
	if (!isLogin.value) return;
	if (searchQuery.value.trim()) {
		emit("on-search-word", searchQuery.value.trim());
	}
};

const onInputWord = debounce(async () => {
	if (!isLogin.value) return;
	const query = searchQuery.value.trim();

	if (query) {
		try {
			const suggestRes = await apiClient.get(
				`/lesson-notes/user/suggest?term=${query}`
			);
			if (suggestRes.data.code === 200) {
				suggestions.value = suggestRes.data.data;
				// 获取包含搜索词的所有笔记
				const res = await apiClient.get(
					`/lesson-notes/user/all-notes?search=${query}&page=1&limit=10`
				);
				if (res.data.code === 200) {
					const { notes, total } = res.data.data;
					vocabularyNotes.value = notes;
					totalCounts.value = total;
					if (notes.length > 0) {
						selectNote(notes[0]);
					} else {
						// 如果没有搜索结果，清空选中的笔记
						emit("on-select-note", null);
					}
				}
			}
		} catch (error) {
			showToast({ message: error, type: "error" });
		}
	} else {
		// 如果搜索框为空，恢复显示所有笔记
		suggestions.value = [];
		getNotebook();
	}
}, 300);

// 监听搜索词的变化
watch(
	() => props.searchWord,
	async (newVal) => {
		if (newVal?.word) {
			searchQuery.value = newVal.word;
			await onInputWord();
		}
	}
);

// 监听 refreshTrigger 的变化来刷新笔记列表
watch(
	() => props.refreshTrigger,
	() => {
		getNotebook(currentPage.value);
	}
);
</script>

<style scoped>
.retro-notebook {
	position: relative;
	height: 100%;
	background-size: 100% 24px;
	padding: 0.5rem 0;
	display: flex;
	flex-direction: column;
}

/* 笔记本标题区域 */
.notebook-header {
	position: relative;
	margin-bottom: 1rem;
	padding-left: 0.5rem;
	padding-bottom: 0.5rem;
	border-bottom: 2px solid #333;
}

/* 回形针装饰 */
.paper-clip {
	position: absolute;
	top: -8px;
	right: 20px;
	width: 25px;
	height: 40px;
	border: 3px solid #666;
	border-radius: 8px 8px 0 0;
	transform: rotate(-10deg);
}

.paper-clip::before {
	content: "";
	position: absolute;
	top: 5px;
	left: 3px;
	width: 13px;
	height: 25px;
	border: 3px solid #666;
	border-radius: 5px 5px 0 0;
}

/* 单词列表样式 */
.word-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	padding: 0.5rem;
}

.word-item {
	text-align: left;
	width: calc(50% - 0.375rem);
	transform: rotate(-1deg);
	transition: transform 0.3s ease;
}

.word-item:nth-child(2n) {
	transform: rotate(1deg);
}

.word-content {
	background: white;
	border: 3px solid #000;
	padding: 0.75rem;
	cursor: pointer;
	position: relative;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
	/* transition: transform 0.2s ease, box-shadow 0.2s ease; */
}

.word-content:hover {
	transform: translateY(-2px);
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
}

.word-content.active {
	border-left-width: 6px;
	border-left-color: var(--note-border-color);
	transform: translateY(-2px);
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
}

.word-section {
	margin-bottom: 0.25rem;
}

.selected-word {
	font-size: 1rem;
	font-weight: bold;
	color: #222;
	position: relative;
	display: inline-block;
}

.normal-word {
	font-size: 1rem;
	color: #333;
	font-weight: 500;
}

/* 翻译区域样式 */
.translation-section {
	font-size: 0.8rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.pos-tag {
	color: #666;
	font-style: italic;
	background-color: rgba(0, 0, 0, 0.05);
	padding: 0.1rem 0.3rem;
	border-radius: 4px;
	font-size: 0.75rem;
}
.chinese-meaning {
	color: #555;
}

/* 添加一些随机倾斜效果 */
.word-item:nth-child(4n) {
	transform: rotate(1.5deg);
}

.word-item:nth-child(4n + 1) {
	transform: rotate(-1.5deg);
}

.word-item:nth-child(4n + 2) {
	transform: rotate(0.5deg);
}

.word-item:nth-child(4n + 3) {
	transform: rotate(-0.5deg);
}

/* 分页控制器 */
.pagination-controls {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.retro-btn {
	position: relative;
	width: 36px;
	height: 36px;
	border: none;
	background: none;
	cursor: pointer;
}

.retro-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 6px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 6px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	border: 2px solid #333;
	border-radius: 6px;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 页码显示器 */
.page-indicator {
	padding: 0.5rem 1rem;
	background: white;
	border: 2px solid #333;
	border-radius: 6px;
	font-family: "Courier New", monospace;
	font-weight: bold;
	color: #333;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
}

/* 按钮交互效果 */
.retro-btn:hover:not(:disabled) .btn-face {
	background-color: white;
}

.retro-btn:active:not(:disabled) .btn-edge,
.retro-btn:active:not(:disabled) .btn-face {
	transform: translateY(0);
}

/* 搜索框样式 */
.search-area {
	padding: 0;
}

.retro-input-wrapper {
	position: relative;
	width: 100%;
}

.retro-input {
	width: 100%;
	height: 40px;
	padding: 0 1rem;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
	font-size: 0.875rem;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.retro-input:focus {
	outline: none;
	box-shadow: 4px 4px 0 rgba(var(--primary-color-rgb), 0.2);
}

/* 联想框样式 */
.suggestions-box {
	position: absolute;
	top: 100%;
	left: 0;
	width: 100%;
	z-index: 100;
}

.suggestions-shadow {
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.suggestions-edge {
	background-color: #888;
	border-radius: 8px;
	transform: translateY(-2px);
}

.suggestions-face {
	background-color: white;
	border: 2px solid #333;
	border-radius: 8px;
	transform: translateY(-2px);
	overflow: hidden;
}

.suggestion-item {
	padding: 0.75rem 1rem;
	font-size: 0.875rem;
	cursor: pointer;
	border-bottom: 1px solid #eee;
	transition: all 0.2s;
}

.suggestion-item:hover {
	background-color: rgba(var(--primary-color-rgb), 0.1);
}
.notebook-content {
	position: relative;
	background: #fff;
	padding: 1rem;
	overflow-y: auto;
	flex: 1;
}

.dictionary-list {
	height: 100%;
}

.word-entry {
	padding: 12px 16px;
	border-bottom: 1px solid #e5e5e5;
	cursor: pointer;
}

.word-entry:hover {
	background-color: #f5f5f5;
}

.word-entry.active {
	background-color: #f0f0f0;
	border-left: 3px solid #333;
}

.word-details {
	display: flex;
	align-items: center;
	gap: 8px;
}

.pos {
	font-style: italic;
	color: #666;
	font-size: 0.9rem;
}

.definition {
	color: #444;
}

.word-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.word-text {
	font-weight: 600;
	color: #333;
}

.pos {
	font-style: italic;
	color: #666;
	font-size: 0.9rem;
	padding: 2px 6px;
	background: #f5f5f5;
	border-radius: 4px;
}

.word-right {
	color: #444;
	font-size: 0.875rem;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	text-align: center;
	height: 100%; /* 添加这行 */
	min-height: 300px; /* 添加这行，确保有足够的高度 */
}

.empty-state p {
	position: relative;
	top: -40px;
	font-size: 1rem;
	color: #666;
	margin-bottom: 1.5rem;
}

.generate-btn {
	position: relative;
	top: -40px;
	width: 120px; /* 让按钮更宽一些 */
	height: 40px;
	transition: transform 0.3s;
}

.generate-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.empty-state .btn-face {
	color: #222;
}

/* 卡片悬停效果 */
.generate-btn:hover {
	transform: translateY(-3px);
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.generate-btn:active .btn-edge,
.generate-btn:active .btn-face {
	transform: translateY(-2px);
}

/* 添加通用悬停效果 */
.generate-btnhover .btn-face {
	transition: all 0.3s ease;
	transform: translateY(-4px);
}
</style>
