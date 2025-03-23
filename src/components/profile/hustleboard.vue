<template>
	<div class="mondrian-grid">
		<!-- 排行榜容器 -->
		<div class="leaderboard-container">
			<div class="leaderboard-grid">
				<!-- 排行榜标题行 -->
				<div
					class="leaderboard-header grid grid-cols-12 mb-3 border-b-2 border-black pb-2"
				>
					<div class="col-span-2 font-bold text-sm">排名</div>
					<div class="col-span-6 font-bold text-sm">昵称</div>
					<div class="col-span-4 font-bold text-sm text-right">积分燃烧</div>
				</div>

				<!-- 排行榜内容 - 使用v-for循环生成 -->
				<div
					v-for="(item, index) in rankingList.slice(0, 9)"
					:key="index"
					class="leaderboard-item grid grid-cols-12 py-2 border-b border-gray-200"
					:class="{ 'bg-primary bg-opacity-10': item.isToday }"
				>
					<div class="col-span-2 flex items-center">
						<div
							class="rank-badge"
							:class="{
								'bg-yellow-500': index === 0,
								'bg-gray-400': index === 1,
								'bg-amber-600': index === 2,
								'bg-primary': index > 2,
							}"
						>
							{{ index + 1 }}
						</div>
					</div>
					<div class="col-span-6 flex items-center">
						<span class="nickname truncate">
							{{ item.nickname }}
							<span v-if="item.isToday" class="today-badge">今日</span>
						</span>
					</div>
					<div class="col-span-4 text-right font-mono font-bold">
						{{ item.points }}
						<i class="bi bi-fire text-red-500 ml-1" v-if="index < 3"></i>
					</div>
				</div>

				<!-- 如果没有数据显示提示 -->
				<div
					v-if="rankingList.length === 0"
					class="py-8 text-center text-gray-500"
				>
					暂无排名数据，开始学习积累积分吧！
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
defineProps({
	rankingList: {
		type: Array,
		default: () => [],
	},
});
</script>

<style scoped>
/* 蒙德里安风格网格 */
.mondrian-grid {
	position: relative;
}

.leaderboard-container {
	position: relative;
	min-height: 400px;
	max-height: 420px;
	overflow: hidden;
	background: transparent;
}

.rank-badge {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: bold;
	font-size: 0.8rem;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.nickname {
	font-weight: 500;
	position: relative;
}

.today-badge {
	display: inline-block;
	background: var(--primary-color);
	color: white;
	font-size: 0.6rem;
	padding: 1px 4px;
	border-radius: 4px;
	margin-left: 4px;
	position: relative;
	top: -1px;
}

.leaderboard-item {
	transition: all 0.2s;
}

.leaderboard-item:hover {
	background-color: rgba(var(--primary-color-rgb), 0.05);
	transform: translateX(2px);
}
</style>
