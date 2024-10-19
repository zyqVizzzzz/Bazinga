<template>
	<div class="layout-container w-full p-6">
		<!-- 工具箱栏独立行 -->
		<div class="w-full toolbox mb-6">
			<Toolbox
				@on-search-word="onSearchWord"
				@on-blink-box="onBlinkBox"
				:pointStateA="pointStateA"
			/>
		</div>

		<!-- 下方两列布局 -->
		<div class="w-full flex">
			<!-- 左侧的单词列表 -->
			<div
				class="w-1/2 notebook-container mr-4 flex flex-col"
				v-if="vocabularyNotes.length"
			>
				<BookCard
					:notes="vocabularyNotes"
					:activeNote="selectedNote || vocabularyNotes[0]"
					@on-select-note="selectNote"
				/>
			</div>
			<!-- 右侧的详细释义 -->
			<div class="w-1/2 edit-content" v-if="selectedNote">
				<EditCard
					:selectedNote="selectedNote"
					:isBlinkModal="isBlinkModal"
					@on-close-blink="onBlinkBox"
					@on-add-point="onAddPoint"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getDefinitions } from "@/utils/decompose.js";
import Toolbox from "@/components/notes/toolbox.vue";
import BookCard from "@/components/notes/book.vue";
import EditCard from "@/components/notes/edit.vue";

const vocabularyNotes = ref([]);
const selectedNote = ref(null);
const isBlinkModal = ref(false);
const pointStateA = ref(0);

const onSearchWord = async (word) => {
	const response = await fetch(`/constants/Notebook.json`);
	if (response.ok) {
		const data = await response.json();
		const notes = data.notes.filter((note) => note.from === "knowledges");
		const result = notes.find(
			(note) => note.word.toLowerCase() === word.toLowerCase()
		);
		if (result) {
			selectNote(result);
		} else {
			console.log("未查到单词");
		}
	}
};

const onBlinkBox = () => {
	isBlinkModal.value = !isBlinkModal.value;
};

onMounted(async () => {
	const response = await fetch(`/constants/Notebook.json`);
	if (response.ok) {
		const data = await response.json();
		vocabularyNotes.value = data.notes.filter(
			(note) => note.from === "knowledges"
		);
		console.log(vocabularyNotes.value);
	}
});

// 选中笔记并展示在 edit-content 区域
const selectNote = (note) => {
	selectedNote.value = note;
	console.log("---", selectedNote.value);
	// Object.assign(selectedNote.value, getDefinitions(note.word));
};

const onAddPoint = () => {
	pointStateA.value++;
};
</script>

<style scoped>
/* Layout */
.layout-container {
	display: flex;
	display: flex;
	flex-direction: column;
}

.sidebar ul {
	list-style-type: none;
	padding: 0;
}

.sidebar li {
	cursor: pointer;
}

.sidebar li:hover {
	color: white;
}

.edit-content {
	height: calc(100vh - 280px);
	min-height: 600px;
}
</style>
