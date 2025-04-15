<template>
	<div class="stats-column space-y-4 mt-2">
		<div class="stat-card border-4 border-black bg-white p-2">
			<div class="stat-title text-sm text-gray-600 mb-1">已创建合集</div>
			<div class="flex items-center justify-between">
				<div class="stat-value text-2xl font-bold">
					{{ statistics.catalogsCount || 0 }}
				</div>
				<!-- 环形进度图：每10个合集为一圈 -->
				<div class="circular-progress-container">
					<div class="circular-progress">
						<svg width="50" height="50" viewBox="0 0 50 50">
							<!-- 背景圆环 -->
							<circle
								cx="25"
								cy="25"
								r="20"
								fill="transparent"
								stroke="#e5e7eb"
								stroke-width="5"
							/>
							<!-- 进度圆环 -->
							<circle
								cx="25"
								cy="25"
								r="20"
								fill="transparent"
								stroke="var(--primary-color)"
								stroke-width="5"
								stroke-dasharray="125.6"
								:stroke-dashoffset="
									getCircleOffset(statistics.catalogsCount || 0)
								"
								transform="rotate(-90 25 25)"
							/>
							<!-- 中心点 -->
							<circle
								cx="25"
								cy="25"
								r="3"
								:fill="getCenterColor(statistics.catalogsCount || 0)"
							/>
						</svg>
						<!-- 圈数指示器 -->
						<div
							class="circle-count"
							v-if="(statistics.catalogsCount || 0) >= 10"
						>
							{{ Math.floor((statistics.catalogsCount || 0) / 10) }}
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="stat-card border-4 border-black bg-white p-2">
			<div class="stat-title text-sm text-gray-600 mb-1">已收藏笔记</div>
			<div class="flex items-center justify-between">
				<div class="stat-value text-2xl font-bold">
					{{ statistics.wordsCount || 0 }}
				</div>
				<!-- 六边形蜂巢图：展示知识点 -->
				<div class="hexagon-chart">
					<div class="hexagon-grid">
						<div
							v-for="index in 50"
							:key="index"
							class="hexagon"
							:class="{
								filled: isHexagonFilled(index, statistics.wordsCount || 0),
							}"
							:style="{
								backgroundColor: isHexagonFilled(
									index,
									statistics.wordsCount || 0
								)
									? getHexagonColor(index)
									: 'transparent',
							}"
						></div>
					</div>
				</div>
			</div>
		</div>

		<div class="stat-card border-4 border-black bg-white p-2">
			<div class="stat-title text-sm text-gray-600 mb-1">已生成播客</div>
			<div class="flex items-center justify-between">
				<div class="stat-value text-2xl font-bold">
					{{ statistics.podcastCount || 0 }}
				</div>
				<!-- 方块网格图：展示播客 -->
				<div class="mini-grid-chart">
					<div class="mondrian-grid-container">
						<div
							v-for="index in 9"
							:key="index"
							class="mondrian-grid-item"
							:class="{
								filled: index <= (statistics.podcastCount || 0),
							}"
							:style="{
								backgroundColor:
									index <= (statistics.podcastCount || 0)
										? getGridColor(index - 1)
										: 'transparent',
							}"
							:title="`播客 ${index}`"
						></div>
					</div>
				</div>
			</div>
		</div>

		<div class="stat-card border-4 border-black bg-white p-2">
			<div class="stat-title text-sm text-gray-600 mb-1">已生成知识点</div>
			<div class="flex items-center justify-between">
				<div class="stat-value text-2xl font-bold">
					{{ statistics.knowledgeCount || 0 }}
				</div>
				<!-- 迷你条形图：最近7天笔记创建趋势 -->
				<div class="mini-chart">
					<div class="mondrian-bars">
						<div
							v-for="(value, index) in getNotesChartData()"
							:key="index"
							class="mondrian-bar"
							:style="{
								height: `${Math.max(
									5,
									(value * 35) / getMaxValue(getNotesChartData())
								)}px`,
								backgroundColor: getBarColor(index),
							}"
							:title="`${getDayLabel(index)}: ${value}篇笔记`"
						></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
	statistics: {
		type: Object,
		default: () => ({}),
	},
});

// 获取笔记图表数据
const getNotesChartData = () => {
	if (props.statistics && props.statistics.dailyNotesCount) {
		return props.statistics.dailyNotesCount;
	}
	// 没有数据时返回空数组
	return [0, 0, 0, 0, 0, 0, 0];
};

// 获取最大值，用于计算条形高度
const getMaxValue = (array) => {
	return Math.max(...array, 1); // 至少为1，避免除以0
};

// 获取条形颜色
const getBarColor = (index) => {
	const colors = [
		"var(--primary-color)",
		"var(--secondary-color)",
		"var(--accent-color)",
		"#6366f1",
		"var(--primary-color)",
		"var(--secondary-color)",
		"var(--accent-color)",
	];
	return colors[index % colors.length];
};

// 获取日期标签
const getDayLabel = (index) => {
	const today = new Date();
	const date = new Date(today);
	date.setDate(today.getDate() - (6 - index));
	return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 获取网格颜色
const getGridColor = (index) => {
	const colors = [
		"var(--primary-color)",
		"var(--secondary-color)",
		"var(--accent-color)",
		"#6366f1",
		"var(--primary-color)",
		"var(--secondary-color)",
		"var(--accent-color)",
		"#6366f1",
		"var(--primary-color)",
	];
	return colors[index % colors.length];
};

// 计算环形进度的偏移量
const getCircleOffset = (count) => {
	// 圆的周长 = 2 * π * r = 2 * 3.14 * 20 ≈ 125.6
	const circumference = 125.6;
	// 计算当前进度（取模10，得到当前圈内的进度）
	const progress = (count % 10) / 10;
	// 计算偏移量
	return circumference * (1 - progress);
};

// 获取中心点颜色
const getCenterColor = (count) => {
	// 根据完成的圈数改变中心点颜色
	const circleCount = Math.floor(count / 10);
	const colors = [
		"var(--primary-color)", // 0-9个合集
		"var(--secondary-color)", // 10-19个合集
		"var(--accent-color)", // 20-29个合集
		"#6366f1", // 30-39个合集
		"#10b981", // 40+个合集
	];
	return colors[Math.min(circleCount, colors.length - 1)];
};

// 判断六边形是否应该填充
const isHexagonFilled = (index, count) => {
	// 每个六边形代表50个知识点
	const threshold = 50;
	return count >= index * threshold;
};

// 获取六边形颜色
const getHexagonColor = (index) => {
	const colors = [
		"var(--primary-color)",
		"var(--secondary-color)",
		"var(--accent-color)",
		"#6366f1",
		"var(--primary-color)",
		"var(--secondary-color)",
		"var(--accent-color)",
	];
	return colors[index % colors.length];
};
</script>

<style scoped>
/* 统计卡片样式 */
.stat-card {
	transition: all 0.3s;
	position: relative;
	overflow: hidden;
}

.stat-card:hover {
	transform: translateY(-2px);
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
}

.stat-card:nth-child(1) {
	border-left-color: var(--primary-color);
	border-left-width: 8px;
}

.stat-card:nth-child(2) {
	border-left-color: var(--secondary-color);
	border-left-width: 8px;
}

.stat-card:nth-child(3) {
	border-left-color: var(--accent-color);
	border-left-width: 8px;
}

.stat-card:nth-child(4) {
	border-left-color: #6366f1;
	border-left-width: 8px;
}

.stat-value {
	font-family: "Courier New", monospace;
}

/* 迷你图表样式 */
.mini-chart {
	width: 70px;
	height: 40px;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding: 0 2px;
}

.mondrian-bars {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	width: 100%;
	height: 100%;
}

.mondrian-bar {
	width: 6px;
	border: 1px solid #000;
	box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
	transition: all 0.3s;
}

.mondrian-bar:hover {
	transform: scaleY(1.1);
}

/* 方块网格图样式 */
.mini-grid-chart {
	width: 70px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.mondrian-grid-container {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(3, 1fr);
	gap: 2px;
	width: 100%;
	height: 100%;
}

.mondrian-grid-item {
	border: 1px solid #000;
	transition: all 0.3s;
	position: relative;
}

.mondrian-grid-item.filled {
	box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.mondrian-grid-item:hover {
	transform: scale(1.1);
	z-index: 1;
}

/* 环形进度图样式 */
.circular-progress-container {
	width: 50px;
	height: 50px;
	position: relative;
}

.circular-progress {
	position: relative;
	width: 100%;
	height: 100%;
}

.circular-progress svg {
	transform: rotate(-90deg);
}

.circle-count {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 0.8rem;
	font-weight: bold;
	color: #333;
}

/* 六边形蜂巢图样式 */
.hexagon-chart {
	width: 70px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.hexagon-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-template-rows: repeat(2, 1fr);
	gap: 2px;
	transform: rotate(30deg);
}

.hexagon {
	width: 15px;
	height: 15px;
	clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
	border: 1px solid #000;
	transition: all 0.3s;
}

.hexagon.filled {
	box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.hexagon:hover {
	transform: scale(1.2);
	z-index: 1;
}
</style>
