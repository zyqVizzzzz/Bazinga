<template>
	<h2
		class="pl-6 pr-2 pb-3 card-title text-accent relative mb-5 w-full flex justify-between items-center border-b"
	>
		<span>{{ title }}</span>
	</h2>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
	isFlipped: Boolean,
	title: String,
	id: String,
	showPractice: Boolean,
	currentPractice: Array,
});

const isHoveredJ = ref(false);

// 定义事件
const emit = defineEmits(["on-toggle-practice"]);

const onTogglePractice = () => {
	emit("on-toggle-practice");
};
</script>

<style scoped>
.title-jam {
	position: relative;
	cursor: pointer;
	box-shadow: 0 1px 8px rgba(128, 128, 128, 0.3); /* 默认灰色阴影 */
	box-sizing: border-box;
	padding: 2px 16px;
	border-radius: 30px;
	transition: opacity 0.3s ease, border-radius 0.3s ease, color 0.3s ease,
		box-shadow 0.3s ease, width 0.3s ease;
	background-color: white; /* 背景保持白色 */
	color: gray; /* 默认文字颜色为灰色 */
	width: 100px; /* 默认宽度适应内容 */
}

.title-jam.expanded {
	width: 170px; /* Hover 时宽度自动扩展 */
}

.title-jam:hover {
	color: var(--accent-color); /* Hover后的文字颜色 */
	box-shadow: 0 1px 8px rgba(var(--accent-color-rgb), 0.5); /* Hover后的蓝色阴影 */
}

/* 保证容器高度和宽度 */
.jam-text-wrapper {
	position: relative;
	display: inline-block;
	height: 1.5em; /* 设置文字高度一致 */
	overflow: hidden;
}

/* 文字滑动效果 */
.text-slide {
	display: inline-block;
	transition: all 0.6s ease;
	white-space: nowrap;
}

/* 文字被抹去的效果 */
.text-out {
	opacity: 0;
	transform: translateX(-100%);
}

/* 文字被抹出的效果 */
.text-in {
	opacity: 1;
	transform: translateX(0);
}
</style>
