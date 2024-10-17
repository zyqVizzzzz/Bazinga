<template>
	<div class="layout-container w-full flex p-6">
		<aside class="w-1/5 sidebar bg-neutral-100 shadow-md rounded-lg p-6 mr-4">
			<DirectoryCard />
		</aside>
		<div class="w-2/5 notebook-container mr-4 flex flex-col">
			<BookCard :notes="vocabularyNotes" @on-select-note="selectNote" />
		</div>
		<div class="w-2/5 edit-content" v-if="selectedNote">
			<EditCard :selectedNote="selectedNote" />
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getDefinitions } from "@/utils/decompose.js";
import DirectoryCard from "@/components/notes/directory.vue";
import BookCard from "@/components/notes/book.vue";
import EditCard from "@/components/notes/edit.vue";

const notes = ref([]);
const vocabularyNotes = ref([]);
const selectedNote = ref(null);

onMounted(async () => {
	const response = await fetch(`/constants/simpsons/S01/E01Note.json`);
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
	Object.assign(selectedNote.value, getDefinitions(note.word));
};
</script>

<style scoped>
/* Layout */
.layout-container {
	display: flex;
}
/* Sidebar */
.sidebar {
	max-width: 250px;
	height: calc(100vh - 250px);
	overflow-y: auto;
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
	height: calc(100vh - 250px);
}
</style>
