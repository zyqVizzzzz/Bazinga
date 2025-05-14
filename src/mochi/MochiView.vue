<template>
	<div class="mochi-page font-pixel">
		<div class="mochi-main-content">
			<MochiLeftPanel :catState="catState" />
			<MochiCenterPanel ref="centerPanelRef" @cat-updated="updateCatState" />
			<MochiRightPanel />
		</div>
	</div>
	<!-- 添加测试按钮 -->
	<!-- <div class="test-buttons">
		<button class="test-button" @click="testOffline(12)">测试12小时离线</button>
		<button class="test-button" @click="testOffline(24)">测试24小时离线</button>
		<button class="test-button" @click="testOffline(48)">测试48小时离线</button>
	</div> -->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import MochiLeftPanel from "./components/MochiLeftPanel.vue";
import MochiCenterPanel from "./components/MochiCenterPanel.vue";
import MochiRightPanel from "./components/MochiRightPanel.vue";
import { catService } from "./services/catService";
import { showToast } from "@/components/common/toast.js";

const centerPanelRef = ref(null);
const catState = ref(null);
const isPaused = ref(false);
let decayInterval = null;
let snapshotInterval = null;

// 更新猫猫状态
const updateCatState = (newState) => {
	catState.value = newState;
};

// 设置定时任务
const setupIntervals = () => {
	// 每分钟衰减一次状态
	decayInterval = setInterval(async () => {
		console.log("ddd", catState.value);
		if (catState.value?._id) {
			try {
				const updatedCat = await catService.decayCatState(catState.value._id);
				catState.value = updatedCat;
			} catch (error) {
				console.error("猫猫状态衰减失败", error);
			}
		}
	}, 60 * 1000);

	// 每小时创建一次状态快照
	snapshotInterval = setInterval(async () => {
		if (centerPanelRef.value?.catId) {
			try {
				await catService.createCatSnapshot(centerPanelRef.value.catId);
			} catch (error) {
				console.error("创建猫猫状态快照失败", error);
			}
		}
	}, 60 * 60 * 1000);
};

// 测试离线衰减
const testOffline = async (hours) => {
	if (catState.value?._id) {
		try {
			console.log(`测试${hours}小时离线状态衰减...`);

			// 记录当前状态
			const beforeStates = { ...catState.value.shortTermStates };

			// 调用测试接口
			const updatedCat = await catService.testOfflineDecay(
				catState.value._id,
				hours
			);

			// 更新状态
			catState.value = updatedCat;

			// 显示状态变化
			console.log("离线衰减前状态:", beforeStates);
			console.log("离线衰减后状态:", updatedCat.shortTermStates);
			console.log(
				`离线时间: ${hours}小时, 离线因子: ${
					hours >= 48 ? 0.1 : hours >= 24 ? 0.25 : 0.5
				}`
			);

			// 显示提示
			showToast({
				message: `${hours}小时离线状态衰减完成`,
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error("离线状态衰减测试失败", error);
			showToast({
				message: "离线状态衰减测试失败",
				type: "error",
				duration: 3000,
			});
		}
	} else {
		console.warn("猫猫ID未定义，无法执行测试");
		showToast({
			message: "猫猫ID未定义，无法执行测试",
			type: "warning",
			duration: 3000,
		});
	}
};

onMounted(() => {
	setupIntervals();
});

onUnmounted(() => {
	clearInterval(decayInterval);
	clearInterval(snapshotInterval);
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
	min-height: 600px;
	height: 700px;
	border: 3px solid #000; /* Black border, similar to image */
	margin-top: 100px;
	border-radius: 20px; /* Rounded corners, similar to image */
	background: #fff;
	overflow: hidden; /* To prevent scrollbars if content overflows during layout */
	font-family: "PixelFont", sans-serif;
}

.mochi-main-content {
	display: flex;
	align-items: center;
	flex-grow: 1;
	padding: 20px;
	gap: 20px;
}

.mochi-main-content::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.1) 2px,
		rgba(0, 0, 0, 0.03) 4px
	);
	border-radius: 9px;
	pointer-events: none;
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
</style>
