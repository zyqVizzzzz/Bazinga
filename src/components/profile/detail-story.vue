<template>
	<div class="story-module absolute">
		<div class="arrow-base arrow-story"></div>
		<div class="text-left text-sm text-gray-800 glitch" style="width: 250px">
			<div class="mb-3">
				<p class="mb-1">
					1. 目前已完成...
					<span class="text-primary">第 10 集</span>
					...
				</p>
				<p class="mb-1">2. 预计总集数为... ERRR... 数据丢失... 请继续前行...</p>
				<p class="mb-3">
					3. 下一个节点在<span class="text-primary"> S02E05</span>...
				</p>

				<button
					class="edit-button mb-4 w-40 h-10 bg-white shadow-lg text-center"
					style="width: 130px; height: 85px"
				>
					<div class="current-play">
						<img src="`../../assets/05.png`" alt="" width="200px" />
					</div>
				</button>

				<div
					class="flex flex-col text-left bg-primary border-2 border-black text-white p-2 rounded"
				>
					<p class="text-xs mb-1 glitch">
						你已在虚拟课堂中徘徊了... 70%的时间...
					</p>
					<p class="text-xs mb-1 glitch">记住，不要停下...</p>
				</div>
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
.story-module {
	top: -180px;
	right: -350px;
	z-index: 20;
}
.arrow-story {
	width: 100px;
	height: 100px;
	background-image: url("@/assets/5.png");
	position: absolute;
	bottom: 50px;
	left: -120px;
	transform: scaleY(-1) rotate(45deg);
}
</style>
