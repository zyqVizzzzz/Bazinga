<template>
	<div class="card bg-white shadow-md rounded-lg p-6 mb-4">
		<h3 class="text-xl font-bold mb-4">{{ selectedNote.word }}</h3>
		<p class="text-gray-600 mb-4">{{ selectedNote.symbols }}</p>
		<p class="text-gray-600 flex justify-center">
			<VolumeIcon />
		</p>
	</div>

	<div
		v-if="
			selectedNote.system?.rootAnalysis.root ||
			selectedNote.system?.affixAnalysis.suffix
		"
		class="card bg-white shadow-md rounded-lg mb-4 p-6"
	>
		<!-- 词根部分 -->
		<div
			v-if="selectedNote.system.rootAnalysis.root"
			class="text-gray-600 mb-4"
		>
			<div class="mb-1 font-bold">
				{{ selectedNote.system.rootAnalysis.root }}
			</div>
			<div>
				{{ selectedNote.system.rootAnalysis.meaning_zh }}
			</div>
		</div>

		<!-- 前缀部分 -->
		<p
			v-if="selectedNote.system.affixAnalysis.prefix"
			class="text-gray-600 mb-2 font-bold"
		>
			{{ selectedNote.system.affixAnalysis.prefix }} -
			{{ selectedNote.system.affixAnalysis.prefixMeaning_zh }}
		</p>

		<!-- 后缀部分 -->
		<div
			v-if="selectedNote.system.affixAnalysis.suffix"
			class="text-gray-600 mb-2"
		>
			<div class="font-bold">
				-{{ selectedNote.system.affixAnalysis.suffix }}
			</div>
			<p class="mt-1">
				{{ selectedNote.system.affixAnalysis.suffixMeaning_zh }}
			</p>
		</div>
		<p class="text-gray-600 mt-4 mb-2 font-bold">
			{{ selectedNote.decomposedWord }}
		</p>
		<p class="text-gray-600 mb-2">{{ selectedNote.definition }}</p>
		<p class="text-gray-600 mb-4">{{ selectedNote.definition_zh }}</p>
	</div>

	<!-- Spelling Card -->
	<div class="card bg-white shadow-md rounded-lg p-6 mt-4">
		<h3 class="text-base font-bold mb-2">
			<!-- 处理例句，包含动态的输入框或正确的单词 -->
			<span v-for="(segment, index) in sentenceSegments" :key="index">
				<span v-if="segment.isWord">
					<!-- 如果拼写正确，显示正确的单词，否则显示输入框 -->
					<template v-if="spellingCorrect">
						<strong>{{ selectedNote.word }}</strong>
					</template>
					<template v-else>
						<input
							type="text"
							v-model="spellingInput"
							class="border-b-2 border-gray-300 text-center text-lg w-40 focus:outline-none"
							@input="onInputChange"
							ref="inputRef"
						/>
					</template>
				</span>
				<span v-else>{{ segment.text }}</span>
			</span>
		</h3>
		<p class="mb-2 text-gray-600">{{ selectedNote.example_zh }}</p>
	</div>
</template>
<script setup>
import { ref, computed, watch, nextTick, toRefs } from "vue";
import VolumeIcon from "../icons/Volume.vue";
const spellingInput = ref([]); // 初始化拼写输入数组为空
const spellingCorrect = ref(false); // 标记拼写是否正确
const inputRefs = ref([]); // 存储输入框引用

const props = defineProps({
	selectedNote: Object,
});

const { selectedNote } = toRefs(props);

const spellingLetters = computed(() =>
	selectedNote.value ? selectedNote.value.word.split("") : []
);

// 将句子分割成数组，替换单词为输入框
const sentenceSegments = computed(() => {
	if (selectedNote.value) {
		const parts = selectedNote.value.example.split(
			new RegExp(selectedNote.value.word, "gi")
		);
		const segments = [];

		parts.forEach((part, index) => {
			segments.push({ text: part, isWord: false });
			// 插入目标单词的位置
			if (index < parts.length - 1) {
				segments.push({ isWord: true });
			}
		});

		return segments;
	}
	return [];
});

// 监听 selectedNote 的变化，重置拼写输入框
watch(selectedNote, (newNote) => {
	if (newNote) {
		// 初始化拼写输入框
		spellingInput.value = "";
		spellingCorrect.value = false; // 重置拼写状态
		nextTick(() => {
			inputRef.value?.focus(); // 当生成输入框后，聚焦到输入框
		});
	}
});

// 拼写检查逻辑
const checkSpelling = () => {
	const userSpelling = spellingInput.value.toLowerCase();
	const correctSpelling = selectedNote.value.word.toLowerCase();

	if (userSpelling === correctSpelling) {
		spellingCorrect.value = true; // 拼写正确
	} else {
		spellingCorrect.value = false; // 拼写错误
	}
};

// 输入时自动检查拼写
const onInputChange = () => {
	checkSpelling(); // 每次输入时检查拼写是否正确
};
</script>
<style scoped>
/* 添加样式控制红色或绿色的边框 */
.border-red-300 {
	border-color: #fc8181; /* 红色，表示错误 */
}

.border-green-300 {
	border-color: #68d391; /* 绿色，表示正确 */
}
</style>
