<template>
	<div class="mondrian-grid">
		<!-- 排行榜容器 -->
		<div class="hustle-container">
			<div class="hustle-grid p-2">
				<!-- 英语表达 -->
				<div class="expression mb-4">
					<h3 class="text-lg font-bold text-primary mb-1">
						{{ dailyPhrase.word }}
					</h3>
					<p class="text-sm text-gray-600">{{ dailyPhrase.word_zh }}</p>
				</div>

				<!-- 音频控制和语言切换 -->
				<div class="controls-section mt-8 mb-4">
					<div class="flex justify-between items-center">
						<!-- 左侧音频播放器 -->
						<div class="audio-player flex-1 mr-4">
							<audio
								ref="audioPlayer"
								class="w-full h-8"
								controls
								src=""
							></audio>
						</div>

						<!-- 右侧语言切换按钮 -->
						<button
							class="lang-switch-btn px-4 py-1 border border-gray-300 rounded text-sm"
							:class="{ active: showChinese }"
							@click="toggleLanguage"
							:title="showChinese ? '显示英文' : '显示中文'"
						>
							<i class="bi bi-translate text-lg"></i>
						</button>
					</div>
				</div>

				<!-- 详细解释 -->
				<div class="explanation mb-4 fade-in-delay">
					<div
						v-if="!showChinese"
						class="en-explanation text-gray-700 text-sm leading-relaxed"
					>
						{{ dailyPhrase.example }}
					</div>
					<div
						v-else
						class="zh-explanation text-gray-600 text-sm leading-relaxed"
					>
						{{ dailyPhrase.example_zh }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "@/api";
defineProps({
	rankingList: {
		type: Array,
		default: () => [],
	},
});

const dailyPhrase = ref({
	word: "",
	word_zh: "",
	type: "",
	example: "",
	example_zh: "",
	audioPath: "", // 添加音频路径
});

const showChinese = ref(false);
const audioPlayer = ref(null);

// 获取每日知识点
const fetchDailyPhrase = async () => {
	try {
		const res = await apiClient.get("/daily-phrase/today");
		if (res.data.code === 200) {
			dailyPhrase.value = res.data.data.result;
			// 如果有音频路径，设置到音频播放器
			if (res.data.data.result.audioPath && audioPlayer.value) {
				audioPlayer.value.src = res.data.data.result.audioPath;
			}
		}
	} catch (error) {
		console.error("获取每日知识点失败:", error);
	}
};

onMounted(() => {
	fetchDailyPhrase();
});

const toggleLanguage = () => {
	showChinese.value = !showChinese.value;
};
</script>

<style scoped>
/* 蒙德里安风格网格 */
.mondrian-grid {
	position: relative;
}

.hustle-container {
	position: relative;
	min-height: 400px;
	max-height: 600px;
	overflow: hidden;
	background: rgba(var(--milk-color-rgb), 0.5);
	border-radius: 16px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	padding: 15px;
	margin-top: 16px;
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

.hustle-item {
	transition: all 0.2s;
}

.hustle-item:hover {
	background-color: rgba(var(--primary-color-rgb), 0.05);
	transform: translateX(2px);
}

/* 渐变过渡效果 */
.expression {
	position: relative;
}

.expression::after {
	content: "";
	position: absolute;
	bottom: -15px;
	left: 0;
	right: 0;
	height: 2px;
	background: linear-gradient(
		to right,
		transparent,
		var(--primary-color),
		transparent
	);
}

/* 按钮悬浮效果 */
.btn-primary,
.btn-outline {
	transition: all 0.2s ease;
}

.btn-primary:hover {
	transform: translateY(-1px);
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-outline:hover {
	transform: translateY(-1px);
}

/* 添加新样式 */
.controls-section {
	position: relative;
}

.lang-switch-btn {
	transition: all 0.3s ease;
	min-width: 60px;
	border-radius: 8px;
	font-weight: 500;
	background: #f3f4f6;
	border: none;
}

.lang-switch-btn:hover {
	/* background-color: var(--primary-color);
	color: white; */
	color: var(--primary-color);
	transform: translateY(-2px);
}

.lang-switch-btn.active {
	color: var(--primary-color);
}

/* 自定义音频播放器样式 */
audio {
	height: 32px;
	border-radius: 16px;
}

.fade-in {
	animation: fadeIn 0.6s ease-in;
}

.fade-in-delay {
	animation: fadeIn 0.6s ease-in 0.2s both;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
