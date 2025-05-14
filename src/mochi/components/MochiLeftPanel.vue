<template>
	<aside class="left-panel">
		<div class="info-box">
			<p v-if="props.catState?.aiContext?.lastSaid">
				{{ props.catState.aiContext.lastSaid }}
			</p>
			<p
				class="personality"
				v-if="props.catState?.aiContext?.moodKeywords?.length > 0"
			>
				心情: {{ props.catState.aiContext.moodKeywords.join(", ") }}
			</p>
		</div>
		<div class="status-report">
			<h4>状态报告</h4>
			<div class="status-item">
				<span>食物:</span>
				<progress
					:value="props.catState?.shortTermStates?.food.toFixed(2) || 0"
					max="100"
				></progress>
				<span
					>{{ props.catState?.shortTermStates?.food.toFixed(2) || 0 }}%</span
				>
			</div>
			<div class="status-item">
				<span>幸福感:</span>
				<progress
					:value="props.catState?.shortTermStates?.happiness.toFixed(2) || 0"
					max="100"
				></progress>
				<span
					>{{
						props.catState?.shortTermStates?.happiness.toFixed(2) || 0
					}}%</span
				>
			</div>
			<div class="status-item">
				<span>清洁度:</span>
				<progress
					:value="props.catState?.shortTermStates?.cleanliness.toFixed(2) || 0"
					max="100"
				></progress>
				<span
					>{{
						props.catState?.shortTermStates?.cleanliness.toFixed(2) || 0
					}}%</span
				>
			</div>
			<div class="status-item">
				<span>能量:</span>
				<progress
					:value="props.catState?.shortTermStates?.energy.toFixed(2) || 0"
					max="100"
				></progress>
				<span
					>{{ props.catState?.shortTermStates?.energy.toFixed(2) || 0 }}%</span
				>
			</div>
			<div class="status-item">
				<span>健康:</span>
				<progress
					:value="props.catState?.shortTermStates?.health.toFixed(2) || 0"
					max="100"
				></progress>
				<span
					>{{ props.catState?.shortTermStates?.health.toFixed(2) || 0 }}%</span
				>
			</div>
			<p class="pet-status">
				宠物状态: {{ getPetStatus(props.catState?.currentHealthiness || 0) }}
			</p>
		</div>
	</aside>
</template>

<script setup>
const props = defineProps({
	catState: {
		type: Object,
		default: () => ({
			shortTermStates: {
				food: 50,
				happiness: 50,
				cleanliness: 50,
				energy: 50,
				health: 50,
			},
			currentHealthiness: 100,
			aiContext: {
				lastSaid: "喵～",
				moodKeywords: [],
			},
		}),
	},
});

// 根据健康度获取宠物状态描述
const getPetStatus = (healthiness) => {
	if (healthiness >= 90) return "极佳";
	if (healthiness >= 70) return "良好";
	if (healthiness >= 50) return "一般";
	if (healthiness >= 30) return "不佳";
	return "糟糕";
};
</script>

<style scoped>
.left-panel {
	width: 25%; /* Adjust as needed */
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.info-box,
.status-report {
	background-color: #f9f9f9; /* Placeholder color */
	border: 2px solid #000; /* Pixel border */
	padding: 15px;
	box-shadow: 3px 3px 0px #000; /* Pixel shadow */
}

.info-box .personality {
	margin-top: 10px;
	font-style: italic;
	font-size: 0.9em;
}

.status-report h4 {
	font-weight: bold;
	margin-bottom: 10px;
	text-align: center;
}

.status-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
	font-size: 0.9em;
}

.status-item progress {
	width: 60%; /* Adjust as needed */
	height: 15px;
	/* Basic styling for progress bar to look somewhat pixelated */
	-webkit-appearance: none;
	appearance: none;
	border: 1px solid #000;
}

.status-item progress::-webkit-progress-bar {
	background-color: #eee;
}

.status-item progress::-webkit-progress-value {
	background-color: #4caf50; /* Green color for progress */
}
/* Firefox specific */
.status-item progress::-moz-progress-bar {
	background-color: #4caf50;
}

.pet-status {
	margin-top: 15px;
	font-weight: bold;
	text-align: center;
	background-color: #d0e0d0;
	padding: 5px;
	border: 1px solid #000;
}
</style>
