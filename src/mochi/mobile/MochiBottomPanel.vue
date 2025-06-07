<template>
	<div class="tip-bar">
		<div class="tip-content">
			<div
				class="tip-icon"
				v-if="catStore.isAnswering && catStore.currentQuestion?.explanation"
				@click="toggleExplanation"
			>
				<i
					class="bi bi-question-circle text-lg"
					v-if="!showExplanationPanel"
				></i>
				<i class="bi bi-question-circle-fill text-lg" v-else></i>
			</div>
			<div class="tip-icon" v-else>
				<svg viewBox="0 0 24 24" class="tip-icon-svg">
					<path
						d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
					/>
				</svg>
			</div>
			<div class="tip-text-wrapper">
				<div v-if="!catStore.isAnswering" class="tip-text">
					{{ currentTip.zh }}
				</div>
				<div v-if="catStore.isAnswering" class="question-text">
					<span
						v-for="(char, index) in catStore.currentQuestion?.question_zh"
						:key="index"
						:class="isChinese(char) ? 'text-zh' : 'text-en'"
						>{{ char }}</span
					>
				</div>
			</div>
			<div class="tip-label">TIPS</div>
		</div>

		<div
			v-if="showExplanationPanel && catStore.currentQuestion?.explanation"
			class="explanation-panel"
		>
			<div class="explanation-content">
				<div class="explanation-header">
					<div>
						<span
							v-for="(char, index) in catStore.currentQuestion.question_zh"
							:key="index"
							class="explanation-title"
							:class="isChinese(char) ? 'text-zh' : 'text-en'"
							>{{ char }}</span
						>
					</div>

					<button class="close-btn" @click="closeExplanation">
						<svg viewBox="0 0 24 24" class="close-icon">
							<path
								d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
							/>
						</svg>
					</button>
				</div>
				<div class="explanation-text text-left">
					<span
						v-for="(char, index) in catStore.currentQuestion.explanation"
						:key="index"
						:class="isChinese(char) ? 'text-zh' : 'text-en'"
						>{{ char }}</span
					>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCatStore } from "../store/catStore";

const catStore = useCatStore();
const currentTip = ref({ en: "", zh: "" });
const showExplanationPanel = ref(false);

const tips = [
	{
		en: "Answer questions to help your cat recover!",
		zh: "回答问题来帮助猫猫恢复状态！不同类型的问题会带来不同程度的恢复效果哦～",
	},
	{
		en: "Time flies: 1 hour in game equals 1 day in real life.",
		zh: "游戏中的1小时等于现实中的1天，一起见证猫猫的成长吧！",
	},
	{
		en: "Secret: Your cat will develop unique quirks between ages 1-2.",
		zh: "猫猫在1-2岁时会解锁独特的性格特征，期待它会有什么有趣的怪癖呢？",
	},
	{
		en: "Tip: Keep your cat happy for faster recovery!",
		zh: "保持猫猫心情愉悦，状态恢复会更快哦！",
	},
	{
		en: "Hint: Try different interactions for well-rounded care.",
		zh: "尝试不同类型的互动，让猫猫获得更全面的照顾～",
	},
];

const showRandomTip = () => {
	const randomIndex = Math.floor(Math.random() * tips.length);
	currentTip.value = tips[randomIndex];
};

const toggleExplanation = () => {
	showExplanationPanel.value = !showExplanationPanel.value;
};

const closeExplanation = () => {
	showExplanationPanel.value = false;
};

const isChinese = (char) => {
	return /[\u4e00-\u9fa5]/.test(char);
};

onMounted(() => {
	showRandomTip(); // 初始显示一条提示
	// 每20秒更新一次提示
	setInterval(showRandomTip, 20000);
});
</script>

<style scoped>
.tip-bar {
	display: flex;
	width: 100%;
	padding: 8px 10px;
	margin-top: 10px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	position: relative;
}

.tip-content {
	display: flex;
	align-items: center;
	width: 100%;
	position: relative;
}

.tip-icon {
	width: 24px;
	height: 24px;
	margin-right: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.tip-icon-svg {
	fill: #7da87a;
	width: 100%;
	height: 100%;
}

.tip-text-wrapper {
	flex: 1;
	overflow: hidden;
	padding: 0 5px;
}

.tip-text,
.question-text {
	color: #aaa;
	font-size: 12px;
	line-height: 1.3;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	font-family: monospace;
	animation: scrollText 15s linear infinite;
}

@keyframes scrollText {
	0% {
		transform: translateX(100%);
	}
	100% {
		transform: translateX(-100%);
	}
}

.text-en,
.text-zh {
	font-size: 12px;
}

.tip-label {
	font-size: 8px;
	color: #aaa;
	font-family: monospace;
	letter-spacing: 0.5px;
	margin-left: 10px;
	white-space: nowrap;
}

/* 添加像素感和LCD屏幕效果 */
.tip-bar::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
		linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
	background-size: 2px 2px;
	pointer-events: none;
	z-index: 1;
	opacity: 0.5;
}

/* 新增：提示图标样式 */
.explanation-icon {
	position: absolute;
	top: -12px;
	right: 10px;
	width: 24px;
	height: 24px;
	background: #2a2a2a;
	border: 1px solid #7da87a;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	z-index: 10;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.explanation-icon:hover {
	background: #3a3a3a;
	transform: scale(1.1);
}

.explanation-icon-svg {
	width: 14px;
	height: 14px;
	fill: #7da87a;
}

.explanation-panel {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: rgba(26, 26, 26, 0.8);
	border: 1px solid #7da87a;
	border-top: none;
	max-height: 200px;
	overflow-y: auto;
	z-index: 20;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
	animation: slideDown 0.3s ease;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.explanation-content {
	padding: 12px;
}

.explanation-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.explanation-title {
	font-size: 12px;
	color: #7da87a;
	font-family: monospace;
	font-weight: bold;
	letter-spacing: 1px;
}

.close-btn {
	background: none;
	border: none;
	padding: 2px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}

.close-icon {
	width: 12px;
	height: 12px;
	fill: #aaa;
	transition: fill 0.2s ease;
}

.close-btn:hover .close-icon {
	fill: #7da87a;
}

.explanation-text {
	color: #aaa;
	font-size: 12px;
	line-height: 1.4;
	font-family: monospace;
	word-wrap: break-word;
}

.explanation-text .text-en,
.explanation-text .text-zh {
	font-size: 12px;
}
</style>
