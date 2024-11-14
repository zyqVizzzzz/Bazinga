<template>
	<div class="retro-notebook">
		<!-- 笔记本标题 -->
		<div class="notebook-header">
			<div class="paper-clip"></div>
			<h2 class="text-2xl font-bold text-gray-800 text-left">
				{{ isImportantMode ? t("notes.starlist") : t("notes.vocabulary") }}
			</h2>
		</div>

		<!-- 笔记列表 -->
		<div class="notebook-content">
			<ul class="word-list">
				<li
					v-for="(note, index) in vocabularyNotes"
					:key="index"
					class="word-item"
				>
					<div class="word-content" @click="selectNote(note)">
						<div class="word-section">
							<template v-if="activeNote.word === note.word">
								<span class="selected-word">{{ note.word }}</span>
							</template>
							<template v-else>
								<span class="normal-word">{{ note.word }}</span>
							</template>
						</div>

						<div class="translation-section">
							<span v-if="note.pos" class="pos-tag">{{ note.pos }}</span>
							<span class="chinese-meaning">{{ note.word_zh }}</span>
						</div>
					</div>
				</li>
			</ul>
		</div>

		<!-- 复古分页器 -->
		<div class="pagination-controls">
			<button class="retro-btn" @click="prevPage" :disabled="currentPage === 1">
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
const itemsPerPage = ref(18);
const totalCounts = ref(0);
const activeNote = ref({});
const isImportantMode = ref(false);

const notebookStore = useNotebookStore();
const { setCurrentActiveNote } = notebookStore;

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

const getNotebook = async (page = 1, limit = 18) => {
	if (!isLogin.value) {
		vocabularyNotes.value = [];
		totalCounts.value = 0;
		return;
	}
	const response = await apiClient.get(
		`/lesson-notes/user/all-notes?page=${page}&limit=${limit}&isImportant=${isImportantMode.value}`
	);
	if (response.data.code === 200) {
		const { notes, total } = response.data.data;
		vocabularyNotes.value = notes;
		totalCounts.value = total;
		selectNote(vocabularyNotes.value[0]);
	} else {
		showToast({ message: "未查到单词", type: "error" });
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
	padding: 1rem 0;
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
	gap: 0.5rem;
}

.word-item {
	text-align: left;
	padding-left: 10px;
	margin-bottom: 5px;
	width: calc(50% - 0.5rem);
}

.word-content {
	cursor: pointer;
	transition: all 0.3s ease;
	border-radius: 4px;
}

.word-content:hover {
	background-color: rgba(var(--secondary-color-rgb), 0.05);
}

/* 单词显示样式 */
.word-section {
	margin-bottom: 0.25rem;
}

.selected-word {
	background: linear-gradient(
		transparent 60%,
		rgba(var(--secondary-color-rgb), 0.2) 40%
	);
	padding: 0 0.25rem;
	font-weight: bold;
	color: var(--secondary-color);
}

.normal-word {
	font-size: 1rem;
	color: #333;
}

/* 翻译区域样式 */
.translation-section {
	font-size: 0.875rem;
}

.pos-tag {
	color: #666;
	margin-right: 0.5rem;
	font-style: italic;
}

.chinese-meaning {
	color: #333;
	font-weight: 500;
}

/* 分页控制器 */
.pagination-controls {
	position: absolute;
	bottom: 0.4rem;
	left: 50%;
	transform: translateX(-50%);
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
</style>
