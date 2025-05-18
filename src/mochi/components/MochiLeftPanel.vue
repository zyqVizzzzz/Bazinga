<template>
	<aside class="left-panel">
		<div class="monitor-container">
			<div class="monitor-frame">
				<div class="monitor-top">
					<div class="power-button"></div>
					<div class="indicator-lights">
						<div class="light light-red"></div>
						<div class="light light-green"></div>
						<div class="light light-blue"></div>
					</div>
				</div>
				<div class="monitor-screen">
					<div class="screen-glare"></div>
					<div class="status-report">
						<h4>STATE</h4>
						<div class="status-item">
							<span class="w-[75px] text-left">FOOD:</span>
							<progress
								:value="
									catStore.catState?.shortTermStates?.food.toFixed(2) || 0
								"
								max="100"
								:class="
									getStateClass(catStore.catState?.shortTermStates?.food || 0)
								"
							></progress>
							<span class="w-[60px] text-right"
								>{{
									catStore.catState?.shortTermStates?.food.toFixed(2) || 0
								}}%</span
							>
						</div>
						<div class="status-item">
							<span class="w-[75px] text-left">HAPPY:</span>
							<progress
								:value="
									catStore.catState?.shortTermStates?.happiness.toFixed(2) || 0
								"
								max="100"
								:class="
									getStateClass(
										catStore.catState?.shortTermStates?.happiness || 0
									)
								"
							></progress>
							<span class="w-[60px] text-right"
								>{{
									catStore.catState?.shortTermStates?.happiness.toFixed(2) || 0
								}}%</span
							>
						</div>
						<div class="status-item">
							<span class="w-[75px] text-left">CLEAN:</span>
							<progress
								:value="
									catStore.catState?.shortTermStates?.cleanliness.toFixed(2) ||
									0
								"
								max="100"
								:class="
									getStateClass(
										catStore.catState?.shortTermStates?.cleanliness || 0
									)
								"
							></progress>
							<span class="w-[60px] text-right"
								>{{
									catStore.catState?.shortTermStates?.cleanliness.toFixed(2) ||
									0
								}}%</span
							>
						</div>
						<div class="status-item">
							<span class="w-[75px] text-left">ENERGY:</span>
							<progress
								:value="
									catStore.catState?.shortTermStates?.energy.toFixed(2) || 0
								"
								max="100"
								:class="
									getStateClass(catStore.catState?.shortTermStates?.energy || 0)
								"
							></progress>
							<span class="w-[60px] text-right"
								>{{
									catStore.catState?.shortTermStates?.energy.toFixed(2) || 0
								}}%</span
							>
						</div>
						<div class="status-item">
							<span class="w-[75px] text-left">HEALTH:</span>
							<progress
								:value="
									catStore.catState?.shortTermStates?.health.toFixed(2) || 0
								"
								max="100"
								:class="
									getStateClass(catStore.catState?.shortTermStates?.health || 0)
								"
							></progress>
							<span class="w-[60px] text-right"
								>{{
									catStore.catState?.shortTermStates?.health.toFixed(2) || 0
								}}%</span
							>
						</div>
						<p
							class="pet-status"
							v-if="catStore.catState?.aiContext?.moodKeywords?.length > 0"
						>
							{{
								catStore.catState.aiContext.moodKeywords.slice(0, 2).join(";")
							}}
						</p>
					</div>
				</div>
				<div class="monitor-controls">
					<div class="control-button"></div>
					<div class="control-button"></div>
					<div class="control-button"></div>
				</div>
				<div class="monitor-brand">
					<span>MOCHI-6900</span>
				</div>
			</div>
		</div>
	</aside>
</template>

<script setup>
import { useCatStore } from "../store/catStore";
import { computed } from "vue";

const catStore = useCatStore();

// 根据健康度获取宠物状态描述
const getPetStatus = (healthiness) => {
	if (healthiness >= 90) return "极佳";
	if (healthiness >= 70) return "良好";
	if (healthiness >= 50) return "一般";
	if (healthiness >= 30) return "不佳";
	return "糟糕";
};

// 根据健康值获取对应的CSS类
const getStateClass = (value) => {
	if (value >= 60) return "state-good";
	if (value >= 40) return "state-medium";
	return "state-bad";
};
</script>

<style scoped>
.left-panel {
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 10px;
}

.monitor-container {
	position: relative;
	width: 100%;
}

.monitor-frame {
	background: linear-gradient(145deg, rgb(235, 239, 244), rgb(215, 219, 224));
	border-radius: 10px;
	padding: 15px;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
	position: relative;
}

.monitor-top {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
}

.power-button {
	width: 15px;
	height: 15px;
	background-color: #444;
	border-radius: 50%;
	border: 2px solid #555;
	box-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
	cursor: pointer;
	transition: all 0.2s;
}

.power-button:hover {
	background-color: #666;
	box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.indicator-lights {
	display: flex;
	gap: 8px;
}

.light {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	box-shadow: 0 0 3px currentColor;
}

.light-red {
	background-color: rgb(111, 0, 0);
	box-shadow: 0 0 5px rgb(111, 0, 0);
}

.light-green {
	background-color: rgb(48, 71, 0);
	box-shadow: 0 0 5px rgb(48, 71, 0);
}

.light-blue {
	background-color: rgb(0, 48, 71);
	box-shadow: 0 0 5px rgb(0, 48, 71);
}

.monitor-screen {
	background-color: #eff8cb;
	overflow: hidden;
	z-index: 5;
	padding: 8px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	box-shadow: inset 2px 2px 0px rgba(0, 0, 0, 0.1);
	border: 3px solid #444;
	border-radius: 5px;
	padding: 15px;
	position: relative;
	overflow: hidden;
	box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
}

.monitor-screen::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		0deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.1) 2px,
		rgba(0, 0, 0, 0.03) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}

.screen-glare {
	position: absolute;
	top: -50px;
	left: -50px;
	width: 100px;
	height: 100px;
	background: linear-gradient(
		135deg,
		rgba(255, 255, 255, 0.1) 0%,
		transparent 70%
	);
	border-radius: 50%;
	pointer-events: none;
}

.status-report {
	background-color: rgba(239, 248, 203, 0.5);
	overflow: hidden;
	z-index: 5;
	padding: 8px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	color: rgb(48, 71, 0);
	/* font-family: "Courier New", monospace; */
	padding: 15px;
	border-radius: 3px;
	text-shadow: 0 0 5px rgba(48, 71, 0, 0.5);
	position: relative;
}

.status-report h4 {
	font-weight: bold;
	margin-bottom: 15px;
	text-align: center;
	text-transform: uppercase;
	letter-spacing: 2px;
	border-bottom: 1px solid #00aa00;
	padding-bottom: 5px;
}

.status-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;
	font-size: 0.9em;
}

.status-item progress {
	width: 60%;
	height: 12px;
	-webkit-appearance: none;
	appearance: none;
	border: 1px solid #00aa00;
	background-color: #001800;
}

.status-item progress::-webkit-progress-bar {
	background-color: #001800;
}

.status-item progress::-webkit-progress-value {
	background-color: rgb(235, 255, 183);
	box-shadow: 0 0 5px rgb(48, 71, 0);
}

/* Firefox specific */
.status-item progress::-moz-progress-bar {
	background-color: rgb(235, 255, 183);
	box-shadow: 0 0 5px rgb(48, 71, 0);
}

/* 健康状态颜色 */
.state-good::-webkit-progress-value {
	background-color: rgb(235, 255, 183) !important;
}

.state-medium::-webkit-progress-value {
	background-color: rgb(255, 238, 183) !important;
}

.state-bad::-webkit-progress-value {
	background-color: rgb(255, 183, 183) !important;
}

.state-good::-moz-progress-bar {
	background-color: rgb(235, 255, 183) !important;
}

.state-medium::-moz-progress-bar {
	background-color: rgb(255, 238, 183) !important;
}

.state-bad::-moz-progress-bar {
	background-color: rgb(255, 183, 183) !important;
}

.pet-status {
	margin-top: 15px;
	font-weight: bold;
	text-align: center;
	background-color: rgb(235, 255, 183);
	padding: 8px;
	border: 1px solid #00aa00;
	border-radius: 3px;
	animation: blink 4s infinite;
}

@keyframes blink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.8;
	}
}

.monitor-controls {
	display: flex;
	justify-content: center;
	gap: 15px;
	margin-top: 10px;
}

.control-button {
	width: 25px;
	height: 25px;
	background-color: #444;
	border-radius: 5px;
	border: 2px solid #555;
	cursor: pointer;
	transition: all 0.2s;
}

.control-button:hover {
	background-color: #666;
	transform: scale(1.05);
}

.monitor-brand {
	text-align: center;
	margin-top: 10px;
	font-size: 0.8em;
	color: #888;
	font-family: "Arial", sans-serif;
	letter-spacing: 1px;
}
</style>
