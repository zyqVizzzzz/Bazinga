<template>
	<div class="mochi-page font-pixel">
		<div class="electric-background">
			<div class="scan-lines"></div>
			<div class="pixel-noise"></div>
			<div class="retro-dots"></div>
			<div class="circuit-lines"></div>
			<div class="pixel-tear">
				<div class="tear-line1"></div>
				<div class="tear-line2"></div>
			</div>
		</div>
		<div class="mochi-main-content">
			<div class="wire wire-left" v-if="catStore.hasCat"></div>
			<div class="left-panel-container" v-if="catStore.hasCat">
				<MochiLeftPanel />
			</div>
			<MochiCenterPanel ref="centerPanelRef" />
			<div class="right-panel-container" v-if="catStore.hasCat">
				<MochiRightPanel />
			</div>
			<div class="wire wire-right" v-if="catStore.hasCat"></div>
		</div>
		<!-- <div class="test-button-container">
			<button class="test-quirk-button" @click="handleTestQuirk">
				测试获取怪癖
			</button>
		</div> -->
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import MochiLeftPanel from "./components/MochiLeftPanel.vue";
import MochiCenterPanel from "./components/MochiCenterPanel.vue";
import MochiRightPanel from "./components/MochiRightPanel.vue";
import { catService } from "./services/catService";
import { useLoginStore } from "@/store";
import { useCatStore } from "./store/catStore";

const centerPanelRef = ref(null);
const loginStore = useLoginStore();
const catStore = useCatStore();
let decayInterval = null;

// 设置定时任务
const setupIntervals = () => {
	// 每分钟衰减一次状态，持续10分钟，10分钟无交互，后台判断为离线状态
	decayInterval = setInterval(async () => {
		if (catStore.catId) {
			try {
				const updatedCat = await catService.decayCatState(catStore.catId);
				catStore.updateCatState(updatedCat);
			} catch (error) {
				console.error("状态衰减失败", error);
			}
		}
	}, 60 * 1000);
};

const handleTestQuirk = async () => {
	try {
		const updatedCat = await catService.testQuirk(catStore.catId);
		if (updatedCat) {
			emit("cat-updated", updatedCat);
		}
	} catch (error) {}
};

// 设置随机撕裂位置
const setRandomTearPositions = () => {
	const root = document.documentElement;

	// 设置CSS变量用于随机位置
	const setRandomVars = () => {
		root.style.setProperty("--random1", Math.floor(Math.random() * 40));
		root.style.setProperty("--random2", Math.floor(Math.random() * 30));
		root.style.setProperty("--random3", Math.floor(Math.random() * 20));
		root.style.setProperty("--random4", Math.floor(Math.random() * 15));
	};

	// 初始设置
	setRandomVars();

	// 每隔一段时间更新随机位置
	setInterval(setRandomVars, 5000);
};

onMounted(async () => {
	// setRandomTearPositions();
	if (loginStore.userInfo?._id) {
		await catStore.initCat(loginStore.userInfo._id);
		console.log(catStore.lifeStatus);
		setupIntervals();
	}
});

onUnmounted(() => {
	if (decayInterval) clearInterval(decayInterval);
});
</script>

<style scoped>
@font-face {
	font-family: "PixelFont";
	src: url("./assets/VT.woff2") format("woff2");
	font-weight: normal;
	font-style: normal;
	font-display: swap;
}
.mochi-page {
	display: flex;
	flex-direction: column;
	position: relative;
	background: transparent;
	overflow: hidden;
	font-family: "PixelFont", sans-serif;
	padding-bottom: 5vh;
	min-width: 1260px !important;
}

.mochi-main-content {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-grow: 1;
	padding: 20px;
	gap: 40px;
	position: relative;
	z-index: 1;
}

.left-panel-container {
	width: 300px;
	flex-shrink: 0;
}

.right-panel-container {
	width: 350px;
	flex-shrink: 0;
}

.pause-button {
	position: fixed;
	bottom: 20px;
	right: 20px;
	background-color: #333;
	color: white;
	border: 2px solid #000;
	padding: 5px 10px;
	font-size: 1.5rem;
	cursor: pointer;
	box-shadow: 2px 2px 0px #000;
}

.test-buttons {
	display: flex;
	justify-content: center;
	gap: 10px;
	margin-bottom: 10px;
}

.test-button {
	background-color: #4caf50;
	border: none;
	color: white;
	padding: 10px 15px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	margin: 4px 2px;
	cursor: pointer;
	border-radius: 5px;
}

.wire {
	position: absolute;
	z-index: -10;
	pointer-events: none; /* 确保电线不会阻挡用户交互 */
}

.wire-left {
	width: 100px;
	height: 112px;
	left: 310px;
	top: 250px;
	background-image: url("./assets/1.png");
	background-size: contain;
	background-repeat: no-repeat;
}

.wire-right {
	width: 100px;
	height: 112px;
	right: 332px;
	top: 250px;
	background-image: url("./assets/2.png");
	background-size: contain;
	background-repeat: no-repeat;
}

.test-button-container {
	position: absolute;
	bottom: 20px;
	right: 20px;
	z-index: 100;
}

.test-quirk-button {
	background-color: #304700;
	color: #ebffb7;
	padding: 8px 16px;
	border-radius: 4px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;
}

.test-quirk-button:hover {
	background-color: #3f5c00;
}
</style>
<style scoped>
/* 电流背景动画相关样式 */
.electric-background {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: -20;
	background-color: #eff8cb;
	background-image: url("./assets/bg.png");
	background-position: 100%;
	background-repeat: no-repeat;
	background-size: 100%;
	opacity: 0.3;
}

/* 扫描线效果 - 模拟老式CRT显示器 */
.scan-lines {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(
		to bottom,
		transparent 50%,
		rgba(0, 0, 0, 0.15) 50% /* 增加对比度 */
	);
	background-size: 100% 4px;
	z-index: 2;
	animation: scanMove 0.5s linear infinite;
}

@keyframes scanMove {
	0% {
		background-position: 0 0;
	}
	100% {
		background-position: 0 4px;
	}
}

/* 像素噪点效果 */
.pixel-noise {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(%23noise)"/></svg>');
	opacity: 0.2;
	animation: noiseShift 0.5s steps(2) infinite;
}

@keyframes noiseShift {
	0% {
		transform: translateX(0);
	}
	25% {
		transform: translateX(-1px) translateY(1px);
	}
	50% {
		transform: translateX(1px) translateY(-1px);
	}
	75% {
		transform: translateX(-1px) translateY(-1px);
	}
	100% {
		transform: translateX(0);
	}
}

/* 复古点阵效果 - 模拟LCD点阵屏 */
.retro-dots {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image: radial-gradient(
		circle at 2px 2px,
		rgba(0, 0, 0, 0.05) 1px,
		transparent 1px
	);
	background-size: 6px 6px;
	z-index: 1;
}

/* 电路线效果 - 模拟电路板 */
.circuit-lines {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image: linear-gradient(
			90deg,
			transparent 98%,
			rgba(0, 0, 0, 0.1) 2%
		),
		/* 增加对比度 */
			linear-gradient(0deg, transparent 98%, rgba(0, 0, 0, 0.1) 2%); /* 增加对比度 */
	background-size: 30px 30px;
	background-position: center center;
	z-index: 0;
	animation: circuitPulse 4s ease-in-out infinite;
}
@keyframes circuitPulse {
	0%,
	100% {
		opacity: 0.5;
	} /* 提高透明度 */
	50% {
		opacity: 0.9;
	} /* 提高透明度 */
}

/* 数据流效果 */
.data-stream {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		90deg,
		transparent,
		transparent 40px,
		rgba(48, 71, 0, 0.3) 20px,
		/* 使用主题色并增加对比度 */ rgba(48, 71, 0, 0.3) 60px
			/* 使用主题色并增加对比度 */
	);
}

/* 全屏横向像素撕裂效果 - 随机位置版 */
.pixel-tear {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 5;
	overflow: hidden;
}

/* 创建多个撕裂线，每个都有不同的动画延迟和位置 */
.pixel-tear::before,
.pixel-tear::after {
	content: "";
	position: absolute;
	width: 100%;
	height: 0;
	background-color: #eff8cb; /* 使用与背景相同的颜色 */
	box-shadow: 0 0 8px rgba(48, 71, 0, 0.6); /* 添加发光效果 */
	opacity: 0;
}

.pixel-tear::before {
	animation: tearEffect1 12s linear infinite;
	animation-delay: 0.5s; /* 随机延迟 */
}

.pixel-tear::after {
	animation: tearEffect2 15s linear infinite;
	animation-delay: 2s; /* 不同的随机延迟 */
}

/* 添加额外的撕裂线元素 */
.pixel-tear .tear-line1,
.pixel-tear .tear-line2 {
	content: "";
	position: absolute;
	width: 100%;
	height: 0;
	background-color: #eff8cb;
	box-shadow: 0 0 8px rgba(48, 71, 0, 0.6);
	opacity: 0;
}

/* 在HTML中添加这两个元素 */
/* 第一个撕裂线动画 - 随机位置 */
@keyframes tearEffect1 {
	/* 大部分时间不显示 */
	0%,
	94%,
	100% {
		opacity: 0;
		height: 0;
	}

	/* 随机位置的撕裂 */
	15.0% {
		opacity: 0;
		height: 0;
		top: calc(10% + (var(--random1, 20) * 1%)); /* 随机位置 */
	}
	15.1% {
		opacity: 0.8;
		height: 3px;
		top: calc(10% + (var(--random1, 20) * 1%));
		transform: translateX(0);
	}
	15.2% {
		opacity: 0.8;
		height: 3px;
		transform: translateX(-10px);
	}
	15.3% {
		opacity: 0;
		height: 0;
	}

	/* 另一个随机位置的撕裂 */
	45.0% {
		opacity: 0;
		height: 0;
		top: calc(30% + (var(--random2, 30) * 1%)); /* 随机位置 */
	}
	45.1% {
		opacity: 0.9;
		height: 5px;
		top: calc(30% + (var(--random2, 30) * 1%));
		transform: translateX(0);
	}
	45.2% {
		transform: translateX(15px);
	}
	45.3% {
		transform: translateX(-20px);
	}
	45.5% {
		opacity: 0.9;
		height: 5px;
		transform: translateX(10px);
	}
	45.6% {
		opacity: 0;
		height: 0;
	}
}

/* 第二个撕裂线动画 - 不同的随机位置 */
@keyframes tearEffect2 {
	/* 大部分时间不显示 */
	0%,
	94%,
	100% {
		opacity: 0;
		height: 0;
	}

	/* 随机位置的撕裂 */
	25.0% {
		opacity: 0;
		height: 0;
		top: calc(50% + (var(--random3, 10) * 1%)); /* 随机位置 */
	}
	25.1% {
		opacity: 0.85;
		height: 4px;
		top: calc(50% + (var(--random3, 10) * 1%));
		transform: translateX(0);
	}
	25.15% {
		transform: translateX(25px);
	}
	25.2% {
		transform: translateX(-15px);
	}
	25.25% {
		transform: translateX(5px);
	}
	25.3% {
		opacity: 0;
		height: 0;
	}

	/* 另一个随机位置的严重故障 */
	75.0% {
		opacity: 0;
		height: 0;
		top: calc(70% + (var(--random4, 5) * 1%)); /* 随机位置 */
	}
	75.1% {
		opacity: 1;
		height: 2px;
		top: calc(70% + (var(--random4, 5) * 1%));
		transform: translateX(0);
	}
	75.15% {
		transform: translateX(-30px);
	}
	75.2% {
		opacity: 1;
		height: 2px;
	}
	75.25% {
		opacity: 0;
		height: 0;
	}
}

/* 添加移动端适配 */
@media (max-width: 768px) {
	.mochi-page {
		min-width: 100% !important; /* 移除固定最小宽度 */
		padding-bottom: 2vh;
	}

	.mochi-main-content {
		flex-direction: column;
		gap: 20px;
		padding: 10px;
		min-height: 100vh;
	}

	.left-panel-container,
	.right-panel-container {
		width: 100%;
		max-width: 350px;
	}
}
</style>
