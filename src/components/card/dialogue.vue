<template>
	<div
		class="px-6 py-2 text-left overflow-y-auto"
		:class="
			showHints && currentKnowledgePoints.length > 0 ? 'w-full' : 'w-full'
		"
		style="height: 350px"
		v-if="highlightedText.length"
	>
		<div v-for="(dialogue, index) in highlightedText" :key="index">
			<!-- 渲染旁白 -->
			<p
				v-if="dialogue.isNarration"
				:class="{
					'text-narration narration-item italic text-gray-500 font-extralight text-sm': true,
					'mt-0 mb-6': index === 0 && !showTrans, // 第一个没有翻译时，mt-0, mb-6
					'mt-0 mb-2': index === 0 && showTrans, // 第一个有翻译时，mt-0, mb-2
					'mt-6 mb-6': index !== 0 && !showTrans, // 其他旁白没有翻译时，mt-4, mb-6
					'mt-6 mb-2': index !== 0 && showTrans, // 其他旁白有翻译时，mt-4, mb-2
				}"
			>
				<span v-html="dialogue.line"></span>
			</p>

			<!-- 中文旁白翻译 -->
			<p
				v-if="showTrans && dialogue.isNarration"
				class="text-narration text-gray-500 font-normal text-xs italic mt-2 mb-6"
			>
				<span v-html="highlightedTextZh[index].line"></span>
			</p>

			<!-- 渲染台词 -->
			<p
				v-if="!dialogue.isNarration"
				class="dialogue-item"
				:class="{
					'text-dialogue mb-2': true, // 每个台词默认 mb-2
				}"
			>
				<span class="text-sm mr-2 font-extralight text-gray-400"
					>[{{ dialogue.speaker }}]</span
				>
				<span v-html="dialogue.line"></span>
			</p>

			<!-- 中文台词翻译 -->
			<p
				v-if="showTrans && !dialogue.isNarration"
				class="text-dialogue text-gray-500 font-normal text-xs italic mb-2"
			>
				<span v-html="highlightedTextZh[index].line"></span>
			</p>
		</div>
	</div>
</template>
<script setup>
defineProps({
	highlightedText: Object,
	highlightedTextZh: Object,
	showHints: Boolean,
	showTrans: Boolean,
	currentKnowledgePoints: Object,
});

const scrollToWord = (currentWord) => {
	const allElements = document.querySelectorAll(
		".dialogue-item span, .narration-item span"
	);

	// 遍历所有元素，查找包含当前单词的元素并滚动
	allElements.forEach((el) => {
		if (el.textContent.includes(currentWord)) {
			el.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	});
};

defineExpose({
	scrollToWord,
});
</script>
