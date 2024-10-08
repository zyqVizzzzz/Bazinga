<template>
	<div
		class="mx-8 my-2 text-left overflow-y-auto"
		:class="showHints && currentKnowledgePoints.length > 0 ? 'w-full' : 'w-3/5'"
		style="height: 350px"
		v-if="highlightedText.length"
	>
		<div v-for="(dialogue, index) in highlightedText" :key="index">
			<!-- 渲染旁白 -->
			<p
				v-if="dialogue.isNarration"
				:class="{
					'text-narration italic text-gray-500 font-extralight text-sm': true,
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
				:class="{
					'text-dialogue mb-2': true, // 每个台词默认 mb-2
				}"
			>
				<strong
					>{{ dialogue.speaker }}: <span v-html="dialogue.line"></span
				></strong>
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
</script>
