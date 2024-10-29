<template>
	<div class="word-module absolute">
		<div class="arrow-base arrow-word"></div>
		<div class="text-right text-sm text-gray-800 glitch" style="width: 250px">
			<p class="mb-1">
				共创建...
				<span class="text-secondary">2</span>
				个词汇库... 1.
			</p>
			<p class="mb-1">
				已处理...
				<span class="text-secondary">10</span>
				个词汇块... 2.
			</p>

			<p class="mb-3">词汇库更新中...预计完成度... ERRR... 3.</p>
			<div
				class="flex flex-col bg-secondary border-2 border-black text-white p-2 rounded"
			>
				<p class="text-xs mb-1 glitch">
					词汇模块... 损坏修复中... 更多数据碎片...
				</p>
				<p class="text-xs mb-1 glitch">请继续探索...</p>
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

.word-module {
	top: -82px;
	left: -350px;
	z-index: 20;
}
.arrow-word {
	width: 100px;
	height: 70px;
	background-image: url("@/assets/6.png");
	background-size: 100% 100%;
	position: absolute;
	top: 50px;
	right: -125px;
	transform: scaleX(-1) rotate(30deg);
}
</style>
