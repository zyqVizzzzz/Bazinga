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
						/>
					</div>

					<!-- 联想框 -->
					<div
						v-if="suggestions.length"
						class="suggestions-box"
						style="margin-left: 0; margin-top: 8px"
					>
						<div class="suggestions-shadow">
							<div class="suggestions-edge">
								<div class="suggestions-face">
									<ul>
										<li
											v-for="(suggestion, index) in suggestions"
											:key="index"
											@click="selectSuggestion(suggestion)"
											class="suggestion-item text-left"
										>
											{{ suggestion }}
										</li>
									</ul>
								</div>
							</div>
						</div>
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
			<ul class="word-list">
				<li
					v-for="(note, index) in vocabularyNotes"
					:key="index"
					class="word-item"
				>
					<div
						class="word-content"
						@click="selectNote(note)"
						:class="{ active: activeNote.word === note.word }"
						:style="getRandomStyle(index)"
					>
						<div class="word-section">
							<span
								:class="[
									activeNote.word === note.word
										? 'selected-word'
										: 'normal-word',
								]"
							>
								{{ note.word }}
							</span>
						</div>

						<div class="translation-section">
							<span v-if="note.pos" class="pos-tag">{{ note.pos }}</span>
							<span class="chinese-meaning">{{ note.word_zh }}</span>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import apiClient from "@/api";
import { useNotebookStore } from "@/store/index";
import { showToast } from "@/components/common/toast.js";
import { useI18n } from "vue-i18n";
import { useLoginStore } from "@/store/index";

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);

const { t } = useI18n();

const emit = defineEmits(["on-select-note"]);
const props = defineProps({
	searchWord: Object,
	searchIndex: Number,
	isImportantMode: Boolean,
	minusPoint: Number,
});

const notebookRef = ref(null);
const vocabularyNotes = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(14);
const totalCounts = ref(0);
const activeNote = ref({});
const isImportantMode = ref(false);

const notebookStore = useNotebookStore();
const { setCurrentActiveNote } = notebookStore;

// 搜索相关的状态
const searchQuery = ref("");
const suggestions = ref([]);

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

const getNotebook = async (page = 1, limit = 14) => {
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
		selectNote(vocabularyNotes.value[0]);
	} else {
		showToast({ message: "未查到单词", type: "error" });
	}
};

// 预定义一些柔和的颜色
const pastelColors = [
	// 主色系列
	{ bg: "rgba(63, 81, 181, 0.05)", border: "rgb(63, 81, 181)" }, // primary
	{ bg: "rgba(232, 68, 122, 0.05)", border: "rgb(232, 68, 122)" }, // secondary
	{ bg: "rgba(92, 198, 187, 0.05)", border: "rgb(92, 198, 187)" }, // accent

	// 延伸色系列
	{ bg: "rgba(81, 99, 199, 0.05)", border: "rgb(81, 99, 199)" }, // primary 延伸
	{ bg: "rgba(232, 88, 142, 0.05)", border: "rgb(232, 88, 142)" }, // secondary 延伸
	{ bg: "rgba(112, 218, 207, 0.05)", border: "rgb(112, 218, 207)" }, // accent 延伸
];

// 根据索引返回随机样式
const getRandomStyle = (index) => {
	const colorIndex = index % pastelColors.length;
	const color = pastelColors[colorIndex];
	return {
		backgroundColor: color.bg,
		"--note-border-color": color.border,
	};
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

const selectSuggestion = (suggestion) => {
	searchQuery.value = suggestion;
	suggestions.value = [];
	searchWord();
};

const onInputWord = debounce(async () => {
	if (!isLogin.value) return;
	if (searchQuery.value.trim()) {
		try {
			const response = await apiClient.get(
				`/lesson-notes/user/suggest?term=${searchQuery.value.trim()}`
			);
			if (response.data.code === 200) {
				suggestions.value = response.data.data;
			} else {
				showToast({ message: response.data.message, type: "error" });
			}
		} catch (error) {
			showToast({ message: error, type: "error" });
			console.error("Error fetching suggestions:", error);
		}
	} else {
		suggestions.value = [];
	}
}, 300);

watch(
	() => [props.searchWord, props.searchIndex],
	([newSearchWord, newSearchIndex], [oldSearchWord, oldSearchIndex]) => {
		if (newSearchIndex !== oldSearchIndex || newSearchWord !== oldSearchWord) {
			const page = Math.ceil((newSearchIndex + 1) / itemsPerPage.value); // 根据索引确定页码
			currentPage.value = page;
			// 调用 getNotebook，确保在正确页码加载后设置 activeNote
			getNotebook(page).then(() => {
				// 将 activeNote 设置为搜索的单词
				const foundNote = vocabularyNotes.value.find(
					(note) => note.word === newSearchWord.word
				);
				if (foundNote) {
					selectNote(foundNote); // 设置选中单词
				}
			});
		}
	},
	{ deep: true }
);

watch(
	() => props.isImportantMode,
	(newValue) => {
		console.log(newValue);
		if (newValue) {
			isImportantMode.value = props.isImportantMode;
			getNotebook();
		} else {
			isImportantMode.value = false;
			getNotebook();
		}
	}
);

watch(
	() => props.minusPoint,
	(newValue, oldValue) => {
		console.log(newValue, oldValue);
		if (newValue > oldValue) {
			getNotebook();
		}
	}
);
</script>

<style scoped>
.retro-notebook {
	position: relative;
	height: 100%;
	background-size: 100% 24px;
	padding: 0.5rem 0;
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

/* 页面装订效果 */
.notebook-content {
	position: relative;
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
</style>
