<template>
	<svg
		t="1744512161772"
		:width="sizeInPx"
		:height="sizeInPx"
		viewBox="0 0 1024 1024"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		p-id="43734"
		xmlns:xlink="http://www.w3.org/1999/xlink"
	>
		<path
			d="M862 228.8c0-64.5-52.3-116.8-116.7-116.8H278.8C214.3 112 162 164.3 162 228.8v566.5c0 64.5 52.3 116.8 116.8 116.8h334.9c2.2 0 4.5-0.1 6.7-0.2h29.5c7.7 0 15.1-3.1 20.6-8.5l20.8-20.8c1.7-1.5 3.4-3.1 5-4.7l131.6-131.6c1.6-1.6 3.2-3.3 4.7-5l20.8-20.8c5.5-5.5 8.5-12.9 8.5-20.6v-29.5c0.1-2.2 0.2-4.5 0.2-6.7V228.8zM242 795.2V228.8c0-20.3 16.5-36.8 36.8-36.8h466.5c20.3 0 36.8 16.5 36.8 36.8V632h-71C639.8 632 582 689.8 582 761v71H278.8c-20.3 0-36.8-16.5-36.8-36.8z m420 3.6v-37.6c0-27.1 22-49.1 49.1-49.1h37.7l-43.3 43.3-43.5 43.4z"
			fill="#373737"
			p-id="43735"
		></path>
		<path
			d="M672 325H352c-22.1 0-40 17.9-40 40s17.9 40 40 40h320c22.1 0 40-17.9 40-40s-17.9-40-40-40z m0 135H352c-22.1 0-40 17.9-40 40s17.9 40 40 40h320c22.1 0 40-17.9 40-40s-17.9-40-40-40zM472 595H352c-22.1 0-40 17.9-40 40s17.9 40 40 40h120c22.1 0 40-17.9 40-40s-17.9-40-40-40z"
			fill="#d4237a"
			p-id="43736"
			data-spm-anchor-id="a313x.search_index.0.i19.43703a81yF1gJv"
			class=""
		></path>
	</svg>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps({
	size: {
		type: [String, Number],
		default: "5",
	},
	fill: {
		type: Boolean,
		default: false,
	},
});

// 计算尺寸，将Tailwind的尺寸单位转换为像素
const sizeInPx = computed(() => {
	const sizeNum =
		typeof props.size === "number"
			? props.size
			: parseInt(props.size || "5", 10);
	return `${sizeNum * 4}px`; // Tailwind的尺寸单位通常是4px的倍数
});
</script>
