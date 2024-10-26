<template>
	<div class="flex flex-col w-full p-6 relative">
		<div class="w-full toolbox mb-6">
			<Toolbox @on-search-word="onSearchWord" :flashState="flashState" />
		</div>
		<div class="w-full flex">
			<div
				class="w-1/2 notebook-container border-2 border-gray-500 mr-4 flex flex-col"
			>
				<BookCard
					:searchIndex="searchIndex"
					:searchWord="searchNote"
					:selectedNote="selectedNote"
					@on-select-note="selectNote"
				/>
			</div>
			<div
				class="w-1/2 border-2 border-gray-500 edit-content"
				v-if="selectedNote"
			>
				<EditCard :selectedNote="selectedNote" @on-add-point="onAddPoint" />
			</div>
		</div>
		<BlinkBoxCard />
	</div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import BlinkBoxCard from "@/components/notes/blinkbox.vue";
import Toolbox from "@/components/notes/toolbox.vue";
import BookCard from "@/components/notes/book.vue";
import EditCard from "@/components/notes/edit.vue";
import apiClient from "@/api";
import { useNotebookStore } from "@/store/index";

const notebookStore = useNotebookStore();
const selectedNote = ref(null);
const searchNote = ref({});
const flashState = ref(0);
const searchIndex = ref(0);

const onSearchWord = async (word) => {
	try {
		const res = await apiClient(`/lesson-notes/user/search?word=${word}`);
		if (res.status === 200) {
			searchNote.value = res.data.note;
			searchIndex.value = res.data.index;
		} else {
			console.log("未查到单词");
		}
	} catch (error) {
		console.error("API 请求出错", error);
	}
};

const selectNote = (note) => (selectedNote.value = note); // 选中笔记并展示在 edit 区域
const onAddPoint = () => flashState.value++;
const showBlinkbox = computed(() => notebookStore.showBlinkbox);

// 控制单词盲盒的显示和隐藏
watch(showBlinkbox, (newValue) => {
	const binkModalDom = document.getElementById("note_blink_modal");
	newValue ? binkModalDom.showModal() : binkModalDom.close();
});
</script>

<style scoped>
.notebook-container {
	overflow-y: auto;
	height: calc(100vh - 280px);
	min-height: 730px;
	border-radius: 8px;
}
.edit-content {
	height: calc(100vh - 280px);
	min-height: 730px;
	border-radius: 8px;
}
</style>
