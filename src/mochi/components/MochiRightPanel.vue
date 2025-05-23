<template>
	<aside class="right-panel">
		<div class="monitor-container">
			<div class="monitor-frame">
				<div class="monitor-top">
					<div class="power-button"></div>
					<div class="indicator-lights">
						<div class="light light-red"></div>
						<div class="light light-green"></div>
						<div class="light light-blue"></div>
					</div>
				</div>
				<div class="monitor-screen">
					<div class="screen-glare"></div>
					<div class="status-report">
						<h4>Tips</h4>
						<div v-if="!catStore.isAnswering" class="tip-container">
							<div class="tip-text">
								<!-- <div class="tip-en mb-4">{{ currentTip.en }}</div> -->
								<div class="tip-zh text-sm">{{ currentTip.zh }}</div>
							</div>
						</div>
						<div v-if="catStore.isAnswering">
							<!-- <div class="question-text text-normal" style="margin-bottom: 0">
								{{ catStore.currentQuestion.question }}
							</div> -->
							<div class="question-text">
								<span
									v-for="(char, index) in catStore.currentQuestion.question_zh"
									:key="index"
									:class="isChinese(char) ? 'text-zh' : 'text-en'"
									>{{ char }}</span
								>
							</div>
							<div
								v-if="
									catStore.showExplanation &&
									catStore.currentQuestion.explanation
								"
								class="explanation-text mt-4"
							>
								<div class="explanation-content">
									<span
										v-for="(char, index) in catStore.currentQuestion
											.explanation"
										:key="index"
										:class="isChinese(char) ? 'text-zh' : 'text-en'"
										>{{ char }}</span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="monitor-controls">
					<div class="control-button"></div>
					<div class="control-button"></div>
					<div class="control-button"></div>
				</div>
				<div class="monitor-brand">
					<span>MOCHI-6900</span>
				</div>
			</div>
		</div>
	</aside>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCatStore } from "../store/catStore";

const catStore = useCatStore();

const currentTip = ref({ en: "", zh: "" });

const tips = [
	{
		en: "Answer questions to help your cat recover! Different types of questions provide different levels of recovery.",
		zh: "回答问题来帮助猫猫恢复状态！不同类型的问题会带来不同程度的恢复效果哦～",
	},
	{
		en: "Time flies: 1 hour in game equals 1 day in real life. Watch your cat grow!",
		zh: "游戏中的1小时等于现实中的1天，一起见证猫猫的成长吧！",
	},
	{
		en: "Secret: Your cat will develop unique quirks between ages 1-2. What will they be?",
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
	{
		en: "Cat Facts: Daily interactions shape your cat's unique personality!",
		zh: "每天的互动和学习，都在塑造着猫猫独特的性格！",
	},
	{
		en: "Discovery: Watch as your cat's personality traits emerge with growth!",
		zh: "随着成长，猫猫会逐渐展现出不同的性格特征，让我们拭目以待吧！",
	},
	{
		en: "Growth Guide: Answering questions improves both stats and bonding!",
		zh: "回答问题不仅能提升猫猫的状态，还能增进你们之间的感情呢～",
	},
	{
		en: "Remember: Patience and love will help your cat become a wonderful companion!",
		zh: "保持耐心和爱心，猫猫一定会成长为一个有趣的小伙伴！",
	},
];

// 随机展示提示
const showRandomTip = () => {
	const randomIndex = Math.floor(Math.random() * tips.length);
	currentTip.value = tips[randomIndex];
};

const isChinese = (char) => {
	return /[\u4e00-\u9fa5]/.test(char);
};

onMounted(() => {
	showRandomTip();
	setInterval(showRandomTip, 20000); // 每10秒更新一次提示
});
</script>

<style scoped>
.right-panel {
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding: 10px;
}

.monitor-container {
	position: relative;
	width: 100%;
	transition: all 0.3s ease;
}

.monitor-frame {
	background: linear-gradient(145deg, rgb(208, 213, 214), rgb(208, 213, 214));
	border-radius: 10px;
	padding: 15px;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
	position: relative;
	transition: all 0.3s ease;
}

.monitor-top {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
}

.power-button {
	width: 15px;
	height: 15px;
	background-color: #444;
	border-radius: 50%;
	border: 2px solid #555;
	box-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
	cursor: pointer;
	transition: all 0.2s;
}

.indicator-lights {
	display: flex;
	gap: 8px;
}

.light {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	box-shadow: 0 0 3px currentColor;
}

.light-red {
	background-color: rgb(111, 0, 0);
	box-shadow: 0 0 5px rgb(111, 0, 0);
}

.light-green {
	background-color: rgb(48, 71, 0);
	box-shadow: 0 0 5px rgb(48, 71, 0);
}

.light-blue {
	background-color: rgb(0, 48, 71);
	box-shadow: 0 0 5px rgb(0, 48, 71);
}

.monitor-screen {
	background-color: #eff8cb;
	overflow: hidden;
	z-index: 5;
	/* padding: 8px; */
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	box-shadow: inset 2px 2px 0px rgba(0, 0, 0, 0.1);
	border: 3px solid #444;
	border-radius: 5px;
	padding: 15px;
	position: relative;
	overflow: hidden;
	box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
}

.monitor-screen::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		0deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.1) 2px,
		rgba(0, 0, 0, 0.03) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}

.monitor-container:hover .monitor-frame {
	background: linear-gradient(145deg, rgb(218, 223, 224), rgb(198, 203, 204));
	box-shadow: 0 7px 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(120, 220, 255, 0.3);
	transform: translateY(-3px);
}

.monitor-container:hover .monitor-screen {
	background-color: #f0ffcf;
	box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.7),
		0 0 8px rgba(120, 255, 120, 0.2);
}

.monitor-container:hover .light-red {
	background-color: rgb(255, 0, 0);
	box-shadow: 0 0 8px rgb(255, 0, 0), 0 0 12px rgba(255, 0, 0, 0.5);
}

.monitor-container:hover .light-green {
	background-color: rgb(0, 255, 0);
	box-shadow: 0 0 8px rgb(0, 255, 0), 0 0 12px rgba(0, 255, 0, 0.5);
}

.monitor-container:hover .light-blue {
	background-color: rgb(0, 150, 255);
	box-shadow: 0 0 8px rgb(0, 150, 255), 0 0 12px rgba(0, 150, 255, 0.5);
}

/* 屏幕闪烁效果 */
@keyframes screenFlicker {
	/* 前10%时间快速闪烁 */
	0% {
		opacity: 1;
	}
	1% {
		opacity: 0.7;
	}
	2% {
		opacity: 1;
	}
	3% {
		opacity: 0.9;
	}
	4% {
		opacity: 1;
	}
	5% {
		opacity: 0.8;
	}
	6% {
		opacity: 1;
	}
	/* 10%-80%保持稳定 */
	10%,
	80% {
		opacity: 1;
	}
	/* 80%-90%再次快速闪烁 */
	81% {
		opacity: 0.7;
	}
	82% {
		opacity: 1;
	}
	83% {
		opacity: 0.9;
	}
	84% {
		opacity: 1;
	}
	85% {
		opacity: 0.8;
	}
	86% {
		opacity: 1;
	}
	/* 剩余时间保持稳定 */
	90%,
	100% {
		opacity: 1;
	}
}

.monitor-container:hover .monitor-screen {
	animation: screenFlicker 5s infinite;
}

/* 移动光晕效果 */
.screen-glare {
	position: absolute;
	top: -50px;
	left: -50px;
	width: 100px;
	height: 100px;
	background: linear-gradient(
		135deg,
		rgba(255, 255, 255, 0.1) 0%,
		transparent 70%
	);
	border-radius: 50%;
	pointer-events: none;
	transition: all 0.5s ease;
}

.monitor-container:hover .screen-glare {
	transform: translate(30px, 30px);
	width: 120px;
	height: 120px;
	background: linear-gradient(
		135deg,
		rgba(255, 255, 255, 0.2) 0%,
		transparent 70%
	);
}

.monitor-container:hover .control-button {
	background-color: #666;
	box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

/* 品牌名称发光效果 */
.monitor-container:hover .monitor-brand span {
	color: #ffffff;
	text-shadow: 0 0 5px rgba(120, 255, 120, 0.7);
	letter-spacing: 2px;
}

.status-report {
	background-color: rgba(239, 248, 203, 0.5);
	overflow: hidden;
	z-index: 5;
	padding: 8px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	color: rgb(48, 71, 0);
	/* padding: 15px; */
	border-radius: 3px;
	text-shadow: 0 0 5px rgba(48, 71, 0, 0.5);
	position: relative;
}

.status-report h4 {
	font-weight: bold;
	margin-bottom: 15px;
	text-align: center;
	text-transform: uppercase;
	letter-spacing: 2px;
	border-bottom: 1px solid #00aa00;
	padding-bottom: 5px;
}

.monitor-controls {
	display: flex;
	justify-content: center;
	gap: 15px;
	margin-top: 10px;
}

.control-button {
	width: 25px;
	height: 25px;
	background-color: #444;
	border-radius: 5px;
	border: 2px solid #555;
	cursor: pointer;
	transition: all 0.2s;
}

.control-button:hover {
	background-color: #666;
	transform: scale(1.05);
}

.monitor-brand {
	text-align: center;
	margin-top: 10px;
	font-size: 0.8em;
	color: #888;
	font-family: "Arial", sans-serif;
	letter-spacing: 1px;
}

.tip-container {
	padding: 12px;
	margin-top: 8px;
}

.tip-text {
	color: #304700;
	text-align: justify;
}

.tip-en {
	font-size: 16px;
	line-height: 1;
}

.tip-zh {
	font-size: 15px;
	line-height: 1.5;
	color: #4a6b00;
}

.question-text {
	color: #304700;
	text-align: center;
	margin-bottom: 12px;
	display: inline-block;
}

.text-en {
	font-size: 16px;
}

.text-zh {
	font-size: 14px;
}
.explanation-text {
	margin-top: 12px;
	padding: 8px;
	background-color: rgba(48, 71, 0, 0.1);
	border-radius: 6px;
	border-left: 3px solid rgba(48, 71, 0, 0.5);
}

.explanation-title {
	font-weight: bold;
	color: #304700;
	margin-bottom: 4px;
	font-size: 12px;
}

.explanation-content {
	color: #4a6b00;
	text-align: left;
	font-size: 11px;
	line-height: 1.4;
}
</style>
