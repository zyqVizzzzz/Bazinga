<template>
	<div class="fragment-module absolute">
		<div class="arrow-base arrow-3"></div>
		<div class="text-left text-sm text-gray-800 glitch" style="width: 250px">
			<p class="mb-1">
				1. 检测到...
				<span class="text-accent">300</span> 个数据碎片...
			</p>
			<p class="mb-4">2. 系统缓存溢出... 请及时收集... 修复进度 75%</p>

			<div
				class="flex flex-col bg-accent border-2 border-black text-white p-2 rounded"
			>
				<p class="text-xs mb-1 glitch">
					数据碎片... 模块失稳... 额外奖励获取...
				</p>
				<p class="text-xs mb-1 glitch">请继续学习... /* 数据更新中 */...</p>
			</div>
		</div>
	</div>
</template>
<script></script>
<style scoped>
.arrow-base {
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
}

.fragment-module {
	top: 100px;
	left: 200px;
}
.arrow-3 {
	width: 100px;
	height: 100px;
	background-image: url("@/assets/9.png");
	transform: scaleY(1) scaleX(-1) rotate(-10deg);
	background-size: 100%;
	position: absolute;
	top: -50px;
	left: -100px;
}
</style>
