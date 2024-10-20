<template>
	<dialog id="note_blink_modal" class="modal modal-blink modal-white">
		<div class="modal-box flex justify-center items-center relative">
			<form method="dialog"></form>
			<!-- 关闭按钮 -->
			<button
				@click="closeBlinkBox"
				class="btn btn-lg text-secondary btn-circle btn-ghost absolute right-0 top-0"
			>
				<svg
					class="size-6"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
			<!-- 上层黑色背景部分（百叶窗效果） -->
			<div
				v-if="!isBackgroundOpened"
				class="black-cover top-part absolute top-0 left-0 w-full h-1/2 bg-black"
			></div>
			<div
				v-if="!isBackgroundOpened"
				class="black-cover bottom-part absolute bottom-0 left-0 w-full h-1/2 bg-black"
			></div>

			<!-- 动画容器 -->
			<div
				v-if="!isBackgroundOpened"
				class="text-lg text-secondary cursor-pointer font-bold flex flex-col items-center justify-center"
			>
				<!-- 闪电图标带抖动动画 -->
				<FlashIcon
					:size="'20'"
					:fill="true"
					class="animate-flash-icon"
					@click="triggerFlashEffect"
					:class="{ 'animate-fly-out': isAnimating }"
				/>
			</div>

			<!-- 背景展开后显示的内容 -->
			<div
				v-if="isBackgroundOpened"
				class="content-container w-full h-full flex flex-col items-center justify-center"
			>
				<!-- 上半部分：例句区域，带上下移动渐显动画 -->
				<div
					class="content text-black p-6 rounded-lg shadow-lg w-4/5 mb-20 animate-example-fade-in bg-screen border-screen-border"
				>
					<p>They were rushing to catch the train.</p>
					<p class="text-sm mt-2">它们迅速赶火车.</p>
				</div>

				<!-- 下半部分：孤立的按钮，带有屏幕风格效果 -->
				<button
					class="btn-screen-effect bg-pink-500 text-white rounded-lg shadow-lg animate-button-fade-up flex justify-center items-center"
				>
					<FlashIcon />
				</button>
			</div>
		</div>
	</dialog>
</template>

<script setup>
import FlashIcon from "../icons/Flash.vue";
import { ref } from "vue";
import { useNotebookStore } from "@/store/index";

const notebookStore = useNotebookStore();
const { toggleBlinkBox } = notebookStore;

// 控制图标动画状态和背景打开状态
const isAnimating = ref(false);
const isBackgroundOpened = ref(false);

// 关闭盲盒
const closeBlinkBox = () => {
	toggleBlinkBox();
};

// 触发图标抖动，接着放大消失并同时开始背景展开的动画
const triggerFlashEffect = () => {
	// 开始抖动动画
	isAnimating.value = true;

	// 在抖动结束后，开始放大消失动画
	setTimeout(() => {
		isAnimating.value = true;

		// 模拟放大消失后，背景展开
		setTimeout(() => {
			isAnimating.value = false;
			isBackgroundOpened.value = true; // 打开背景
		}, 1000); // 图标放大消失动画持续 1 秒后触发背景动画
	}, 500); // 抖动动画持续 0.5 秒
};
</script>

<style scoped>
.modal-blink .modal-box {
	width: 500px;
	height: 500px;
	background-color: var(--secondary-color);
	border: 5px solid #000;
	background-color: #000;
	box-shadow: 8px 10px 10px rgba(var(--secondary-color-rgb), 0.3);
	position: relative;
	overflow: hidden;
}

/* 上下背景部分的动画 */
.black-cover.top-part {
	animation: slide-up 1s ease forwards;
}

.black-cover.bottom-part {
	animation: slide-down 1s ease forwards;
}

/* 百叶窗上半部分往上移开 */
@keyframes slide-up {
	0% {
		transform: translateY(0);
	}
	100% {
		transform: translateY(-100%);
	}
}

/* 百叶窗下半部分往下移开 */
@keyframes slide-down {
	0% {
		transform: translateY(0);
	}
	100% {
		transform: translateY(100%);
	}
}

/* 图标抖动动画 */
@keyframes flash {
	0% {
		transform: rotate(0deg);
	}
	25% {
		transform: rotate(5deg);
	}
	50% {
		transform: rotate(-5deg);
	}
	75% {
		transform: rotate(3deg);
	}
	100% {
		transform: rotate(0deg);
	}
}

.animate-flash-icon {
	animation: flash 0.5s ease-in-out infinite; /* 抖动动画持续 0.5 秒 */
}

/* 图标旋转并消失的动画 */
@keyframes fly-out {
	0% {
		transform: scale(1) rotate(0deg);
		opacity: 1;
	}
	50% {
		transform: scale(1.5) rotate(180deg);
		opacity: 0.7;
	}
	100% {
		transform: scale(2) rotate(360deg);
		opacity: 0;
	}
}

.animate-fly-out {
	animation: fly-out 1s ease forwards; /* 动画持续 1 秒，保持最后状态 */
}

/* 例句从上到下移动并渐显 */
@keyframes example-fade-in {
	0% {
		transform: translateY(-20px);
		opacity: 0;
	}
	100% {
		transform: translateY(0);
		opacity: 1;
	}
}

.animate-example-fade-in {
	animation: example-fade-in 0.7s ease forwards;
}

/* 按钮从下到上移动并渐显 */
@keyframes button-fade-up {
	0% {
		transform: translateY(20px);
		opacity: 0;
	}
	100% {
		transform: translateY(0);
		opacity: 1;
	}
}

.animate-button-fade-up {
	animation: button-fade-up 0.8s ease forwards;
}

/* 背景渐变、边框及样式，模仿显示器外观 */
.bg-screen {
	background: linear-gradient(145deg, #f0f0f0, #e0e0e0); /* 模拟屏幕的玻璃感 */
	border: 2px solid #2c2c2c; /* 深色边框，类似显示器的框架 */
	box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3); /* 内阴影和外阴影，表现显示屏效果 */
	border-radius: 8px; /* 圆角设计，增加柔和的显示屏外观 */
}

/* 边框效果 */
.border-screen-border {
	border-width: 5px;
	border-color: #2c2c2c;
}

/* 屏幕效果的背景和边框，给按钮增加类似显示屏的视觉效果 */
.btn-screen-effect {
	width: 90px;
	height: 90px;
	background: var(--secondary-color); /* 屏幕般的光泽感背景 */
	/* border: 4px solid #2c2c2c;  */
	box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3); /* 内外阴影 */
	border-radius: 45px; /* 圆角设计 */
	transition: transform 0.2s ease, box-shadow 0.2s ease; /* 添加按钮的交互反馈 */
}

/* 按钮点击时的缩放效果 */
.btn-screen-effect:active {
	transform: scale(0.5); /* 点击时的缩小效果 */
	box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.8), 0 6px 12px rgba(0, 0, 0, 0.6); /* 点击时的阴影变化 */
}
</style>
