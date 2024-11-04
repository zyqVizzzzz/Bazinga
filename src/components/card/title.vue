<template>
	<h2
		class="pl-6 pr-2 pb-3 card-title text-accent relative mb-5 w-full flex justify-between items-center border-b"
	>
		<span>{{ title }}</span>
	</h2>
</template>

<script setup>
const props = defineProps({
	isFlipped: Boolean,
	title: String,
});
</script>
