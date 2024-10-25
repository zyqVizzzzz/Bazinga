<template>
	<div class="flex flex-col w-full p-6 relative">
		<!-- 工具箱栏 -->
		<div class="w-full toolbox mb-6">
			<Toolbox @on-search-word="onSearchWord" :flashState="flashState" />
		</div>

		<div class="w-full flex">
			<!-- 单词列表 -->
			<div
				class="w-1/2 notebook-container border-2 border-gray-500 bg-paper mr-4 flex flex-col"
			>
				<BookCard @on-select-note="selectNote" />
			</div>
			<!-- 详细释义 -->
			<div
				class="w-1/2 bg-paper border-2 border-gray-500 edit-content"
				v-if="selectedNote"
			>
				<EditCard :selectedNote="selectedNote" @on-add-point="onAddPoint" />
			</div>
		</div>
		<!-- 单词盲盒 -->
		<BlinkBoxCard />
	</div>
</template>

<script setup>
import { ref, watch, toRefs, computed, onMounted } from "vue";
import { getDefinitions } from "@/utils/decompose.js";
import BlinkBoxCard from "@/components/notes/blinkbox.vue";
import Toolbox from "@/components/notes/toolbox.vue";
import BookCard from "@/components/notes/book.vue";
import EditCard from "@/components/notes/edit.vue";
import apiClient from "@/api";

import { useNotebookStore } from "@/store/index";
const notebookStore = useNotebookStore();
const showBlinkbox = computed(() => notebookStore.showBlinkbox);

const vocabularyNotes = ref([]);
const selectedNote = ref(null);
const flashState = ref(0);

const onSearchWord = async (word) => {
	// const result = vocabularyNotes.value.find(
	// 	(note) => note.word.toLowerCase() === word.toLowerCase()
	// );
	// if (result) {
	// 	selectNote(result);
	// } else {
	// 	console.log("未查到单词");
	// }
};

// 选中笔记并展示在 edit-content 区域
const selectNote = (note) => {
	selectedNote.value = note;
};

const onAddPoint = () => {
	flashState.value++;
};

// 控制单词盲盒的显示和隐藏
watch(showBlinkbox, (newValue) => {
	if (newValue) {
		document.getElementById("note_blink_modal").showModal();
	} else {
		document.getElementById("note_blink_modal").close();
	}
});

onMounted(async () => {});
</script>

<style scoped>
.notebook-container {
	overflow-y: auto;
	height: calc(100vh - 280px);
	min-height: 730px;
}
.edit-content {
	height: calc(100vh - 280px);
	min-height: 730px;
}
</style>
