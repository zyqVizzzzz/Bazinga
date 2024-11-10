<template>
	<!-- 笔记容器，带有分页 -->
	<div
		ref="notebookRef"
		class="relative notebook bg-white shadow-md rounded-lg px-6 py-5 w-full bg-grid-paper"
	>
		<h2 class="text-2xl font-medium text-gray-800 text-left mb-4 pl-2">
			{{ isImportantMode ? "Star-List" : "Vocabulary" }}
		</h2>
		<ul
			class="list-disc list-inside text-gray-700 text-left mb-6 flex flex-wrap"
		>
			<li
				class="mt-2 w-1/2"
				v-for="(note, index) in vocabularyNotes"
				:key="index"
			>
				<div
					class="pl-2 transition-shadow duration-300 ease-in-out cursor-pointer flex"
					style="padding-top: 2px; padding-bottom: 2px"
					@click="selectNote(note)"
				>
					<mark class="pink" v-if="activeNote.word === note.word"
						>{{ note.word }}
					</mark>
					<div v-else>
						<span class="text-base">{{ note.word }}</span>
					</div>
				</div>
				<div class="pl-2 text-sm">
					<span class="text-gray-500 mr-2" v-if="note.pos">{{ note.pos }}</span>
					<span class="text-gray-800">
						<strong>{{ note.word_zh }}</strong>
					</span>
				</div>
			</li>
		</ul>
		<!-- 分页器 -->
		<div
			class="absolute right-50 bottom-4 transform -translate-x-1/2 inline-flex items-center space-x-4"
		>
			<button
				class="btn btn-sm px-4 text-white"
				@click="prevPage"
				:disabled="currentPage === 1"
			>
				<
			</button>
			<span class="text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
			<button
				class="btn btn-sm px-4 text-white"
				@click="nextPage"
				:disabled="currentPage === totalPages"
			>
				>
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import apiClient from "@/api";
import { useNotebookStore } from "@/store/index";
import { showToast } from "@/components/common/toast.js";

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
const itemsPerPage = ref(20);
const totalCounts = ref(0);
const activeNote = ref({});
const isImportantMode = ref(false);

const notebookStore = useNotebookStore();
const { setCurrentActiveNote } = notebookStore;

onMounted(() => {
	getNotebook();
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

const getNotebook = async (page = 1, limit = 20) => {
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
.hover\:shadow-red:hover {
	box-shadow: 0px 2px 2px rgba(255, 0, 211, 0.4);
}
.shadow-red {
	box-shadow: 0px 2px 2px rgba(255, 0, 211, 0.4);
}

.transition-shadow {
	transition: box-shadow 0.3s ease-in-out;
}

.bg-line-paper {
	background-image: linear-gradient(
		transparent 28px,
		rgba(229, 229, 229, 0.2) 12px
	);
	background-size: 100% 29px;
}

.bg-grid-paper {
	background-color: transparent;
	background-image: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0.03) 1px,
			transparent 1px
		),
		linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
	background-size: 15px 15px; /* 网格间距 */
}

.notebook {
	position: relative;
	height: 100%;
}

.pagination-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.btn-secondary:disabled {
	background-color: rgb(255, 230, 240);
	cursor: not-allowed;
}
li {
	list-style-type: none;
}
</style>
