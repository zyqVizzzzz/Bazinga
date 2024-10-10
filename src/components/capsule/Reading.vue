<template>
	<div
		class="capsule secondary-capsule mb-5"
		:style="{
			opacity: isHoveredRe ? 1 : 0.5,
			'border-radius': isHoveredRe ? '5px' : '45px',
		}"
		@mouseenter="isHoveredRe = true"
		@mouseleave="isHoveredRe = false"
		@click="onToggleHints"
	>
		<!-- 在这里可以用缩略图图片替代 -->
		<div class="text-secondary text-lg">Notes</div>
		<button class="flex items-center justify-center">
			<LightIcon />
		</button>
	</div>
</template>

<script setup>
import { ref } from "vue";
import LightIcon from "../icons/Light.vue";

const isHoveredRe = ref(false);

const emit = defineEmits(["toggleHints"]);

const onToggleHints = () => {
	isHoveredRe.value = false;
	emit("toggleHints");
};
</script>

<style scoped>
.capsule {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	padding: 8px 0; /* 等效于 py-4 */
	width: 90px;
	height: 200px;
	position: relative;
	transition: opacity 0.3s ease, border-radius 0.3s ease; /* 添加过渡效果 */
	cursor: pointer;
	border-color: transparent; /* 初始状态下隐藏边框 */
}
.secondary-capsule {
	padding: 24px 0; /* 等效于 py-4 */
	width: 80px;
	height: 150px;
	border: 2px solid var(--secondary-color); /* 使用 Tailwind 中的 secondary 颜色 */
	box-shadow: 0 4px 12px rgba(255, 0, 255, 0.4); /* 红色阴影 */
}
</style>
