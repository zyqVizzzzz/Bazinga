<template>
	<p
		:class="
			showHints && currentKnowledgePoints.length > 0 ? 'w-0' : 'mx-8 my-4 w-2/5'
		"
	>
		<img
			:src="currentDialogue.img"
			alt="Dialogue Image"
			class="mx-auto text-center"
			:class="showHints && currentKnowledgePoints.length > 0 ? 'w-0' : 'w-full'"
		/>
	</p>
</template>
<script setup>
defineProps({
	currentDialogue: Object,
	showHints: Boolean,
	currentKnowledgePoints: Object,
});
</script>
