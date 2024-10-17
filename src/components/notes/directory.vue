<template>
	<h2 class="text-xl font-semibold text-gray-700 mb-7">Notes Directory</h2>
	<ul class="text-gray-600">
		<li
			v-for="(note, index) in notesCate"
			:key="index"
			class="mb-3 cursor-pointer"
			@click="goToNote(note)"
		>
			<span
				class="block p-2 bg-white rounded-lg shadow-sm text-sm hover:bg-secondary hover:text-white transition-colors"
			>
				{{ note || "Untitled Note" }}
			</span>
		</li>
	</ul>
</template>
<script setup>
import { ref } from "vue";

const notesCate = ref(["N-01", "N-02"]);

// 点击笔记目录导航到指定笔记
const goToNote = (id) => {
	// 这里可以根据笔记 ID 实现不同的逻辑，或者加载不同的笔记内容
	notesId.value = id;
};
</script>
