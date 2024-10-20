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
				:class="[
					'block p-2 rounded-lg shadow-sm text-sm transition-colors',
					activeNote === note
						? 'bg-secondary text-white'
						: 'bg-white hover:bg-secondary hover:text-white',
				]"
			>
				{{ note || "Untitled Note" }}
			</span>
		</li>
	</ul>
</template>

<script setup>
import { ref, onMounted } from "vue";

const notesCate = ref(["N-01", "N-02"]);
const activeNote = ref(notesCate.value[0]); // 默认选中第一个笔记

// 点击笔记目录导航到指定笔记
const goToNote = (note) => {
	activeNote.value = note; // 设置当前选中的笔记为 active
	// 这里可以触发其他逻辑，加载具体笔记内容等
};

// 页面加载时默认选中第一个笔记
onMounted(() => {
	goToNote(notesCate.value[0]); // 默认选择第一个笔记
});
</script>
