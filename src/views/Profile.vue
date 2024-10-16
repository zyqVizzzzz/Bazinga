<template>
	<div class="profile-page max-w-7xl mx-auto py-8">
		<!-- 顶部个人信息卡片 -->
		<div class="card bg-white shadow-md rounded-lg p-6 mb-8">
			<div class="flex items-center">
				<!-- 用户头像 -->
				<img
					class="w-24 h-24 rounded-full mr-6"
					src="./avatar.jpg"
					alt="Profile Avatar"
				/>
				<!-- 用户信息 -->
				<div class="flex-1">
					<h1 class="text-3xl font-semibold text-gray-800">Muztagh(d/acc)</h1>
					<p class="mt-2 text-gray-600">美剧学习者 | 单词复习达人</p>
					<p class="mt-2 text-gray-500">剧集进度: 10 集 | 复习单词: 300</p>
				</div>
				<!-- 操作按钮 -->
				<div class="flex space-x-4">
					<button class="btn btn-outline btn-primary">Edit Profile</button>
					<button class="btn btn-outline">Share Progress</button>
				</div>
			</div>
		</div>

		<!-- 左右布局容器 -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- 剧情卡片进度展示 -->
			<div class="card bg-white shadow-md rounded-lg p-6">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">剧情进度</h2>
				<div class="grid grid-cols-1 gap-6">
					<!-- 剧集卡片1 -->
					<div class="bg-gray-100 p-4 rounded-lg shadow-sm">
						<h3 class="text-lg font-semibold text-gray-800 mb-2">
							《辛普森一家》S01E01
						</h3>
						<p class="text-gray-600">课程进度: 3 / 5</p>
						<progress
							class="progress progress-primary w-full mb-4"
							value="60"
							max="100"
						></progress>
						<button class="btn btn-outline btn-primary btn-sm w-full">
							继续学习
						</button>
					</div>
					<!-- 剧集卡片2 -->
					<div class="bg-gray-100 p-4 rounded-lg shadow-sm">
						<h3 class="text-lg font-semibold text-gray-800 mb-2">
							《瑞克和莫蒂》S02E03
						</h3>
						<p class="text-gray-600">课程进度: 1 / 4</p>
						<progress
							class="progress progress-primary w-full mb-4"
							value="25"
							max="100"
						></progress>
						<button class="btn btn-outline btn-primary btn-sm w-full">
							继续学习
						</button>
					</div>
				</div>
			</div>
			<!-- 笔记本卡片（单词复习本） -->
			<div class="card bg-white shadow-md rounded-lg p-6">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">单词本</h2>
				<p class="text-gray-600 mb-4">总单词: 500 | 已复习: 300</p>
				<progress
					class="progress progress-secondary w-full mb-4"
					value="60"
					max="100"
				></progress>
				<button class="btn btn-secondary btn-outline w-full">查看单词本</button>
			</div>
		</div>
	</div>

	<div class="character"></div>
</template>

<script setup>
import CharacterMale from "../components/character/male.vue";
const user = {
	name: "John Doe",
	avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
	totalSeries: 10,
	totalWords: 500,
	reviewedWords: 300,
	// 剧集数据可以是从服务器获取的
	series: [
		{
			title: "《老友记》S01E01",
			totalLessons: 5,
			completedLessons: 3,
		},
		{
			title: "《生活大爆炸》S02E03",
			totalLessons: 4,
			completedLessons: 1,
		},
	],
};
</script>

<style scoped>
/* 页面布局的基本样式 */
.profile-page {
	padding: 2rem;
}
</style>
