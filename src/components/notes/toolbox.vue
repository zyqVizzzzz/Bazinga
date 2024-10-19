<template>
	<div
		class="toolbox w-full flex items-center justify-between p-2 bg-black rounded-lg"
	>
		<div>
			<!-- 复习模式按钮 -->
			<button
				class="btn btn-secondary btn-sm h-8 text-xs px-4 border-none text-white relative"
				@click="startReviewMode"
			>
				重点词汇
				<div v-if="showLightning" class="lightning-animation absolute flex">
					<FlashIcon :size="'4'" class="mr-2" />+1
				</div>
				<!--  -->
			</button>
			<!-- 闪电图标 -->
		</div>
		<!-- 左侧查询功能 -->
		<div class="search-box flex items-center space-x-2">
			<input
				v-model="searchQuery"
				type="text"
				class="input input-bordered w-full max-w-xs h-8 text-xs"
				placeholder="输入单词"
			/>
			<button
				class="btn btn-sm h-8 text-xs px-4 border-2 border-none text-secondary bg-white hover:border-secondary hover:bg-secondary hover:text-white"
				@click="searchWord"
			>
				搜索
			</button>
		</div>

		<!-- 右侧功能按钮 -->
		<div class="action-buttons flex items-center space-x-2">
			<!-- 单词盲盒按钮 -->
			<button
				class="btn btn-secondary btn-sm h-8 text-xs px-4 border-none text-white"
				@click="openBlinkBox"
			>
				单词盲盒
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, toRefs } from "vue";
import FlashIcon from "../icons/Flash.vue";

const searchQuery = ref("");

const props = defineProps({ pointStateA: Number });
const emit = defineEmits(["on-search-word", "on-blink-box"]);

const { pointStateA } = toRefs(props);

const showLightning = ref(false);

// 监听stateA的变化，数值增加时触发闪电图标显示
watch(pointStateA, (newVal, oldVal) => {
	if (newVal > oldVal) {
		showLightning.value = true;
		setTimeout(() => {
			showLightning.value = false; // 1秒后隐藏图标
		}, 3000); // 闪电图标停留2秒
	}
});

// 查询功能
const searchWord = () => {
	if (searchQuery.value.trim()) {
		emit("on-search-word", searchQuery.value.trim());
	} else {
		alert("Please enter a word to search");
	}
};

// 复习模式功能
const startReviewMode = () => {
	console.log("Starting review mode...");
	// 实现复习模式的逻辑
};

// 单词盲盒功能
const openBlinkBox = () => {
	emit("on-blink-box");
};
</script>

<style scoped>
.toolbox {
	height: 50px; /* 调整工具箱栏的高度 */
}
/* 闪电图标的动画效果 */
@keyframes lightningMove {
	0% {
		transform: translateY(30px) scale(0.5);
		opacity: 0;
	}
	30% {
		transform: translateY(0) scale(1.2);
		opacity: 1;
	}
	70% {
		transform: translateY(-10px) scale(1);
		opacity: 1;
	}
	100% {
		transform: translateY(-30px) scale(0.5);
		opacity: 0;
	}
}

/* 定义闪电图标的动画 */
.lightning-animation {
	color: var(--secondary-color);
	font-size: 14px;
	animation: lightningMove 3s ease-in-out forwards;
	position: absolute;
	right: -60px; /* 控制闪电图标在按钮右侧 */
}
</style>
