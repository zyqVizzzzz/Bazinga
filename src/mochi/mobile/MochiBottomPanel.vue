<template>
	<div class="tip-bar">
		<div class="tip-content">
			<div class="tip-icon">
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
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCatStore } from "../store/catStore";

const catStore = useCatStore();
const currentTip = ref({ en: "", zh: "" });

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
</style>
