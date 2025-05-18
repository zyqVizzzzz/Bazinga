<template>
	<div class="mochi-page font-pixel">
		<div class="mochi-main-content">
			<div class="wire wire-left"></div>
			<div class="left-panel-container">
				<MochiLeftPanel />
			</div>
			<MochiCenterPanel ref="centerPanelRef" />
			<div class="right-panel-container">
				<MochiRightPanel />
			</div>
			<div class="wire wire-right"></div>
		</div>
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

onMounted(async () => {
	if (loginStore.userInfo?._id) {
		await catStore.initCat(loginStore.userInfo._id);
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
	justify-content: center; /* 确保内容居中 */
	flex-grow: 1;
	padding: 20px;
	gap: 40px;
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
</style>
