<template>
	<div class="status-bar">
		<div class="status-item" v-for="(item, index) in statusItems" :key="index">
			<div class="status-ring" :class="getStateClass(getStatusValue(item.key))">
				<div class="status-icon">
					{{ getStatusValue(item.key).toFixed(0) }}%
				</div>
				<svg viewBox="0 0 36 36" class="circular-chart">
					<path
						class="circle-bg"
						d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
					/>
					<path
						class="circle"
						:stroke-dasharray="`${getStatusValue(item.key)}, 100`"
						d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
					/>
				</svg>
			</div>
			<div class="status-label">{{ item.label }}</div>
		</div>
	</div>
</template>

<script setup>
import { useCatStore } from "../store/catStore";
import { reactive } from "vue";

const catStore = useCatStore();

const statusItems = reactive([
	{ key: "food", label: "FOOD", icon: "🍖" },
	{ key: "happiness", label: "HAPPY", icon: "😊" },
	{ key: "cleanliness", label: "CLEAN", icon: "🧼" },
	{ key: "energy", label: "ENERGY", icon: "⚡" },
	{ key: "health", label: "HEALTH", icon: "❤️" },
]);

const getStatusValue = (key) => {
	return catStore.catState?.shortTermStates?.[key] || 0;
};

const getStateClass = (value) => {
	if (value >= 60) return "state-good";
	if (value >= 40) return "state-medium";
	return "state-bad";
};
</script>

<style scoped>
.status-bar {
	display: flex;
	justify-content: space-between;
	width: 100%;
	padding: 8px 10px;
	/* background-color: rgba(30, 30, 30, 0.85); */
	/* border-radius: 8px; */
	margin-bottom: 10px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	/* border: 1px solid #444; */
}

.status-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 18%;
}

.status-ring {
	position: relative;
	width: 40px;
	height: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.status-icon {
	position: absolute;
	font-size: 10px;
	z-index: 2;
	color: #aaa;
	font-family: monospace;
	font-weight: bold;
}

.status-label {
	font-size: 8px;
	margin-top: 2px;
	color: #aaa;
	font-family: monospace;
	letter-spacing: 0.5px;
}

.circular-chart {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
}

.circle-bg {
	fill: none;
	stroke: rgba(50, 50, 50, 0.5);
	stroke-width: 2.8;
}

.circle {
	fill: none;
	stroke-width: 2.8;
	stroke-linecap: round;
	animation: progress 1s ease-out forwards;
}

@keyframes progress {
	0% {
		stroke-dasharray: 0 100;
	}
}

.state-good .circle {
	stroke: #7da87a;
}

.state-medium .circle {
	stroke: #a8a77a;
}

.state-bad .circle {
	stroke: #a87a7a;
}

/* 添加像素感和LCD屏幕效果 */
.status-bar::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
		linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
	background-size: 2px 2px;
	pointer-events: none;
	z-index: 1;
	opacity: 0.5;
}
</style>
