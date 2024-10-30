<template>
	<div class="flex flex-col w-full p-6 relative">
		<div class="w-full toolbox mb-6">
			<Toolbox
				@on-search-word="onSearchWord"
				@on-important-mode="onImportantMode"
				:flashState="flashState"
			/>
		</div>
		<div class="w-full flex">
			<div
				class="w-1/2 notebook-container border-2 border-gray-500 mr-4 flex flex-col"
			>
				<BookCard
					:minusPoint="minusPoint"
					:isImportantMode="isImportantMode"
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
				<EditCard
					:selectedNote="selectedNote"
					@on-add-point="onAddPoint"
					@on-minus-point="onMinusPoint"
				/>
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
import { showToast } from "@/components/common/toast.js";

const notebookStore = useNotebookStore();
const selectedNote = ref(null);
const searchNote = ref({});
const flashState = ref(0);
const searchIndex = ref(0);
const isImportantMode = ref(false);
const minusPoint = ref(0);

const onSearchWord = async (word) => {
	try {
		const res = await apiClient(`/lesson-notes/user/search?word=${word}`);
		if (res.data.code === 200) {
			searchNote.value = res.data.data.note;
			searchIndex.value = res.data.data.index;
		} else {
			showToast({ message: "未查到单词", type: "error" });
		}
	} catch (error) {
		showToast({ message: error, type: "error" });
	}
};

const onImportantMode = async () => {
	isImportantMode.value = !isImportantMode.value;
};

const selectNote = (note) => (selectedNote.value = note); // 选中笔记并展示在 edit 区域
const onAddPoint = () => flashState.value++;
const showBlinkbox = computed(() => notebookStore.showBlinkbox);

const onMinusPoint = () => {
	minusPoint.value++;
};
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
