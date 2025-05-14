<template>
	<aside class="right-panel">
		<div class="points-earned">
			<h4>Points Earned</h4>
			<div class="point-item">
				<span>Current Points:</span>
				<span>157</span>
			</div>
			<div class="point-item">
				<span>Multiplier:</span>
				<span>1x</span>
			</div>
			<div class="point-item">
				<span>Next points in:</span>
				<span>4.1s</span>
			</div>
			<div class="points-info">+2 points every 10s</div>
		</div>
		<div class="recent-activity">
			<div class="activity-header">
				<h4>Recent</h4>
				<button class="refresh-button">Refresh</button>
			</div>
			<ul>
				<li>Ash <span>+15</span> <small>1m ago</small></li>
				<li>Brush <span>+10</span> <small>3m ago</small></li>
				<li>Feather <span>+15</span> <small>6m ago</small></li>
				<li>Loser <span>+20</span> <small>7m ago</small></li>
			</ul>
		</div>
		<button class="rewards-guide-button">Rewards Points Guide</button>
	</aside>
</template>

<script setup>
// Right panel logic
</script>

<style scoped>
.right-panel {
	width: 25%; /* Adjust as needed */
	display: flex;
	flex-direction: column;
	gap: 15px;
}

.points-earned,
.recent-activity {
	background-color: #f9f9f9; /* Placeholder color */
	border: 2px solid #000; /* Pixel border */
	padding: 15px;
	box-shadow: 3px 3px 0px #000; /* Pixel shadow */
}

.points-earned h4,
.recent-activity h4 {
	font-weight: bold;
	margin-bottom: 10px;
}

.point-item {
	display: flex;
	justify-content: space-between;
	margin-bottom: 5px;
	font-size: 0.9em;
}

.points-info {
	text-align: center;
	font-size: 0.8em;
	color: #555;
	margin-top: 10px;
	padding: 5px;
	background-color: #e0e0e0;
	border: 1px dashed #000;
}

.activity-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
}

.refresh-button {
	background-color: #e0e0e0;
	border: 1px solid #000;
	padding: 3px 8px;
	font-size: 0.8em;
	cursor: pointer;
}

.recent-activity ul {
	list-style: none;
	padding: 0;
}

.recent-activity li {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 5px 0;
	border-bottom: 1px dashed #ccc;
	font-size: 0.9em;
}

.recent-activity li:last-child {
	border-bottom: none;
}

.recent-activity li span {
	color: green;
	font-weight: bold;
}

.recent-activity li small {
	color: #777;
}

.rewards-guide-button {
	background-color: #555;
	color: white;
	border: 2px solid #000;
	padding: 10px;
	text-align: center;
	font-weight: bold;
	cursor: pointer;
	box-shadow: 2px 2px 0px #000;
}
.rewards-guide-button:hover {
	background-color: #333;
}
</style>
