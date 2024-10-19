<template>
	<div
		class="capsule primary-capsule mb-10"
		style=""
		:style="{
			backgroundImage: `url(${thumbnail})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		}"
	></div>
	<div class="flex justify-around capsule-tooltips">
		<div
			class="capsule primary-capsule mb-4 capsule-tooltips_items"
			@mouseenter="isHoveredP = true"
			@mouseleave="isHoveredP = false"
			:style="{ opacity: isHoveredP ? 1 : 0.5 }"
		>
			<PlayIcon />
		</div>
		<div
			class="capsule primary-capsule capsule-tooltips_items"
			@mouseenter="isHoveredR = true"
			@mouseleave="isHoveredR = false"
			:style="{ opacity: isHoveredR ? 1 : 0.5 }"
		>
			<RecordIcon />
		</div>
	</div>
</template>
<script setup>
import { ref } from "vue";
import PlayIcon from "../icons/Play.vue";
import PauseIcon from "../icons/Pause.vue";
import RecordIcon from "../icons/Record.vue";

defineProps({
	thumbnail: String,
});

const isHoveredP = ref(false);
const isHoveredR = ref(false);
</script>
<style scoped>
.capsule {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	padding: 8px 0;
	position: relative;
	transition: opacity 0.3s ease, border-radius 0.3s ease; /* 添加过渡效果 */
	cursor: pointer;
	border-color: transparent; /* 初始状态下隐藏边框 */
}
.primary-capsule {
	height: 100px;
	width: 150px;
	border-radius: 10px;
	/* border: 2px solid var(--primary-color); */
	box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.4); /* 蓝色阴影 */
}
.capsule-tooltips {
	height: 100px;
	width: 150px;
	border-radius: 10px;
}
.capsule-tooltips_items {
	height: 50px;
	width: 50px;
	border-radius: 25px;
}
</style>
