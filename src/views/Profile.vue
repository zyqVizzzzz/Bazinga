<template>
	<!-- 使用非 flex 布局的外部容器 -->
	<div class="profile-page relative w-full">
		<!-- 主视觉个人信息卡片，保持居中 -->
		<div
			class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/3 z-10"
			style="top: 333px; padding-bottom: 64px"
		>
			<div
				class="personal-card bg-white shadow-lg rounded-lg p-6 text-center w-72 h-auto"
			>
				<img
					class="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-neutral"
					:src="user.avatarUrl"
					alt="Profile Avatar"
				/>
				<h1 class="text-2xl font-bold text-gray-800">{{ user.name }}</h1>
				<p class="text-sm mt-2">zyqvizzz@gmail.com</p>
				<p class="text-sm mt-2 border-b pb-4">梗图收藏家</p>

				<div class="progress-info mt-4 space-y-4">
					<!-- 剧集进度 -->
					<div class="progress-bar">
						<p class="text-xs text-gray-700 mb-1">剧集</p>
						<div class="barcode-progress bg-primary primary-progress"></div>
					</div>

					<!-- 单词收集进度 -->
					<div class="progress-bar">
						<p class="text-xs text-gray-700 mb-1">单词本</p>
						<div class="barcode-progress bg-secondary secondary-progress"></div>
					</div>

					<!-- 数据碎片收集进度 -->
					<div class="progress-bar">
						<p class="text-xs text-gray-700 mb-1">数据碎片</p>
						<div class="barcode-progress bg-accent accent-progress"></div>
					</div>
				</div>
			</div>

			<!-- 随意布局的进度信息（不再使用 flex 布局） -->
			<div class="story-module absolute">
				<div class="arrow-base arrow-1"></div>
				<div
					class="text-left text-sm text-gray-800 glitch"
					style="width: 250px"
				>
					<p class="mb-1 font-bold">*剧集进度更新</p>
					<div class="mb-3">
						<p class="mb-1">
							1. 目前已完成...
							<span class="text-primary">第 {{ user.totalSeries }} 集</span> ...
						</p>
						<p class="mb-1">
							2. 预计总集数为... ERRR... 数据丢失... 请继续前行...
						</p>
						<p class="mb-3">
							3. 下一个节点在<span class="text-primary"> S02E05</span>...
						</p>

						<button
							class="edit-button mb-4 w-40 h-10 bg-white shadow-lg text-center"
							style="width: 130px; height: 85px"
						>
							<div
								style="
									overflow: hidden;
									width: 120px;
									height: 75px;
									border-radius: 10px;
									display: flex;
									justify-content: center;
									align-items: center;
									margin: 0 auto;
								"
							>
								<img src="`../assets/05.png`" alt="" width="200px" />
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

			<div class="word-module absolute">
				<div class="arrow-base arrow-5"></div>
				<div
					class="text-right text-sm text-gray-800 glitch"
					style="width: 250px"
				>
					<p class="mb-1 font-bold">*单词本进度更新</p>

					<p class="mb-1">
						共创建...
						<span class="text-secondary">2</span>
						个词汇库... 1.
					</p>
					<p class="mb-1">
						已处理...
						<span class="text-secondary">{{ user.reviewedWords }}</span>
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

			<div class="fragment-module absolute">
				<div class="arrow-base arrow-3"></div>
				<div
					class="text-left text-sm text-gray-800 glitch"
					style="width: 250px"
				>
					<p class="mb-1 font-bold">*碎片收集进度更新</p>

					<p class="mb-1">
						1. 检测到... <span class="text-accent">300</span> 个数据碎片...
					</p>
					<p class="mb-4">2. 系统缓存溢出... 请及时收集... 修复进度 75%</p>

					<div
						class="flex flex-col bg-accent border-2 border-black text-white p-2 rounded"
					>
						<p class="text-xs text-gray-800 mb-1 glitch">
							数据碎片... 模块失稳... 额外奖励获取...
						</p>
						<p class="text-xs mb-1 glitch text-gray-800">
							请继续学习... /* 数据更新中 */...
						</p>
					</div>
				</div>
			</div>

			<div class="edit-module absolute">
				<div class="arrow-base arrow-2"></div>
				<button class="edit-button w-40 h-10 bg-white shadow-lg text-center">
					编辑个人资料
				</button>
			</div>

			<div
				class="text-sm absolute left-1/2 transform -translate-x-1/2 -translate-y-1/3 z-10"
				style="top: -100px; width: 200%"
			>
				<div class="arrow-base arrow-4"></div>
				Notice: With math, 6900 simply cannot be contained by 500
			</div>
		</div>
	</div>
</template>

<script setup>
import avatar from "@/assets/avatar.jpg";
const user = {
	name: "Muztagh(d/acc)",
	avatarUrl: avatar,
	totalSeries: 10,
	reviewedWords: 300,
};
</script>

<style scoped>
.profile-page {
	height: calc(100vh - 128px);
}
/* 个人信息卡片样式保持不变 */
.personal-card {
	width: 18rem;
	z-index: 999;
}
.arrow-base {
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
}

.story-module {
	top: 30px;
	right: -330px;
	z-index: 20;
}
.arrow-1 {
	width: 100px;
	height: 100px;
	background-image: url("@/assets/5.png");
	position: absolute;
	bottom: 30px;
	left: -120px;
	transform: scaleY(-1) rotate(45deg);
}

.word-module {
	top: 240px;
	left: -330px;
	z-index: 20;
}
.arrow-5 {
	width: 100px;
	height: 70px;
	background-image: url("@/assets/6.png");
	background-size: 100% 100%;
	position: absolute;
	top: 40px;
	right: -125px;
	transform: scaleX(-1) rotate(40deg);
}

.fragment-module {
	top: 450px;
	left: 220px;
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

.arrow-4 {
	width: 50px;
	height: 50px;
	background-image: url("@/assets/5.png");
	transform: scaleY(1) scaleX(-1) rotate(80deg);
	position: absolute;
	bottom: -55px;
	left: 50px;
}

.edit-module {
	top: -30px;
	left: -200px;
}
.arrow-2 {
	width: 120px;
	height: 80px;
	background-image: url("@/assets/7.png");
	background-size: 100% 100%;
	transform: scaleX(-1) rotate(-40deg);
	position: absolute;
	top: 25px;
	right: -125px;
	/* transform: rotate(90deg); */
	/* transform: scaleY(-1); */
	/* transform: scale(-1, -1); */
}
.edit-button {
	box-shadow: 0 4px 12px rgba(0, 0, 255, 0.2); /* 蓝色阴影 */
	border: none; /* 无边框 */
	border-radius: 0px; /* 圆角 */
	font-size: 14px;
	font-weight: 500;
	width: 130px;
	transition: box-shadow 0.3s ease;
}

.edit-button:hover {
	box-shadow: 0 6px 16px rgba(0, 0, 255, 0.3); /* 更深的蓝色阴影 */
}

.glitch::before,
.glitch::after {
	content: attr(data-text);
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: transparent;
}

.glitch::before {
	left: 2px;
	text-shadow: -2px 0 blue;
	clip: rect(24px, 450px, 90px, 0);
	animation: glitch-anim 1s infinite linear alternate-reverse;
}

.glitch::after {
	left: -2px;
	text-shadow: -2px 0 red;
	clip: rect(85px, 9999px, 140px, 0);
	animation: glitch-anim 1s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
	0% {
		clip: rect(10px, 9999px, 85px, 0);
		transform: skew(0.3deg);
	}
	50% {
		clip: rect(85px, 9999px, 140px, 0);
		transform: skew(0.4deg);
	}
	100% {
		clip: rect(10px, 9999px, 85px, 0);
		transform: skew(0.2deg);
	}
}

.highlight {
	color: #00ff99;
	font-weight: bold;
}
/* 条形码样式 */
.barcode-progress {
	width: 100%;
	height: 12px;
	background: repeating-linear-gradient(
		to right,
		transparent 0px,
		transparent 2px,
		rgba(0, 0, 0, 0.2) 2px,
		rgba(0, 0, 0, 0.2) 4px
	);
	position: relative;
	overflow: hidden;
}

/* 动态进度条 */
.barcode-progress::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 50%; /* 动态调整宽度表示进度 */
	background-color: rgba(0, 0, 0, 0.1);
}

.primary-progress::before {
	background-color: rgba(0, 0, 255, 0.2);
}

.secondary-progress::before {
	background-color: rgba(255, 0, 211, 0.2);
}

.accent-progress::before {
	background-color: rgba(0, 215, 192, 0.2);
}
</style>
