<template>
	<div
		class="text-sm p-2 rounded hover:bg-gray-50 cursor-pointer text-left"
		:class="{
			'font-bold': block.isTitle,
			'translated-text': block.isTranslated,
			'knowledge-block': block.isKnowledge,
			'text-primary': block.narration,
			'bg-gray-50': selected,
		}"
		@click="$emit('click')"
	>
		<!-- 对话场景使用带说话者的布局 -->
		<div
			v-if="
				block.speaker &&
				!block.isTitle &&
				!block.isTranslated &&
				!block.isKnowledge &&
				!block.narration
			"
			class="flex flex-col gap-1"
		>
			<div
				class="speaker-badge self-start px-1.5 py-0.5 rounded text-xs text-gray-700 bg-gray-200 border border-gray-200"
			>
				{{ block.speaker }}
			</div>
			<div v-html="block.displayText || block.text"></div>
		</div>

		<!-- 普通文本使用简单布局 -->
		<div
			v-else
			v-html="block.isKnowledge ? block.text : block.displayText || block.text"
		></div>
	</div>
</template>

<script setup>
defineProps({
	block: {
		type: Object,
		required: true,
	},
	selected: {
		type: Boolean,
		default: false,
	},
});

defineEmits(["click"]);
</script>

<style scoped>
.translated-text {
	color: #666;
	font-style: italic;
}

.knowledge-block {
	background-color: #f8f9fa;
	border-left: 3px solid #4caf50;
	padding-left: 1rem;
}

.speaker-badge {
	width: fit-content;
}

:deep(mark.pink) {
	background-color: #fce7f3;
	color: #be185d;
	padding: 0.1em 0.4em;
	border-radius: 0.2em;
}
</style>
