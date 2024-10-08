<template>
	<div
		class="mx-8 my-2 text-left overflow-y-auto"
		:class="showHints && currentKnowledgePoints.length > 0 ? 'w-full' : 'w-3/5'"
		style="height: 300px"
		v-if="highlightedText.length"
	>
		<div v-for="(dialogue, index) in highlightedText" :key="index">
			<!-- 渲染 narration -->
			<p
				v-if="dialogue.isNarration"
				class="text-narration italic text-gray-500 font-extralight text-sm mb-4"
			>
				<span v-html="dialogue.line"></span>
			</p>
			<!-- 渲染台词 -->
			<p v-else class="text-dialogue mb-2">
				<strong>{{ dialogue.speaker }}: </strong
				><span v-html="dialogue.line"></span>
			</p>
		</div>
	</div>
</template>
<script setup>
defineProps({
	highlightedText: Object,
	showHints: Boolean,
	currentKnowledgePoints: Object,
});
</script>
