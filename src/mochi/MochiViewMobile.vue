<template>
	<div class="mochi-mobile-page font-pixel">
		<div class="mobile-layout">
			<div class="mobile-bottom-section" v-if="catStore.hasCat">
				<MochiBottomPanel />
			</div>
			<div class="mobile-center-section">
				<MochiCenterPanel ref="centerPanelRef" />
			</div>
			<div class="mobile-top-section" v-if="catStore.hasCat">
				<MochiTopPanel />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import MochiCenterPanel from "./mobile/MochiCenterPanel.vue";
import MochiTopPanel from "./mobile/MochiTopPanel.vue";
import MochiBottomPanel from "./mobile/MochiBottomPanel.vue";
import { catService } from "./services/catService";
import { useLoginStore } from "@/store";
import { useCatStore } from "./store/catStore";

const centerPanelRef = ref(null);
const loginStore = useLoginStore();
const catStore = useCatStore();
let decayInterval = null;

// 设置定时任务
const setupIntervals = () => {
	// 每分钟衰减一次状态
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
	await catStore.initCat();
	setupIntervals();
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

.mochi-mobile-page {
	font-family: "PixelFont", sans-serif;
	height: 100vh;
	width: 100%;
	overflow-y: scroll;
	background: linear-gradient(135deg, #f0f8e8 0%, #e8f5e8 50%, #f0f8e8 100%);
	position: relative;
}

/* 移动端布局 */
.mobile-layout {
	display: flex;
	flex-direction: column;
	height: 100vh;
	position: relative;
}

/* 提示区域 */
.mobile-tip-section {
	padding: 10px;
	padding-bottom: 0;
}

.mobile-bottom-section {
	padding: 0 10px 10px 10px;
}

/* 中部游戏区域 */
.mobile-center-section {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	min-height: 0;
}
</style>
