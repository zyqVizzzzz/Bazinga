<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		:class="size ? 'size-' + size : 'size-6'"
		v-if="!fill"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
		/>
	</svg>

	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		:class="size ? 'size-' + size : 'size-6'"
		v-else
	>
		<path
			fill-rule="evenodd"
			d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
			clip-rule="evenodd"
		/>
	</svg>
</template>
<script setup>
defineProps({
	size: String,
	fill: Boolean,
});
</script>
