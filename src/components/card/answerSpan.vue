<template>
	<span
		class="border-b-2 border-accent/10 inline-block hover:bg-accent/10 transition-all relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-accent/50 after:blur-[1px] cursor-pointer"
		@click.stop="onClick"
	>
		{{ text }}
	</span>
</template>

<script setup>
defineProps(["text", "dialogueIndex"]);
const emit = defineEmits(["toggleExplanation"]);

const onClick = () => {
	emit("toggleExplanation");
};
</script>
