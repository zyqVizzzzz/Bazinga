<template>
	<div class="pet-area" :class="{ 'night-owl-pet-area': hasNightOwlQuirk }">
		<div class="w-full">
			<div class="relative flex justify-center items-center">
				<div
					v-if="!catStore.isAnswering && catStore.catState?.quirks?.length > 0"
					class="quirk-tags"
				>
					<span
						v-for="(quirk, index) in catStore.catState.quirks"
						:key="index"
						class="quirk-tag"
						:class="{ 'night-owl-quirk': hasNightOwlQuirk }"
					>
						{{ formatQuirkName(quirk.quirkId) }}
					</span>
				</div>
				<transition name="fade-bubble">
					<div
						v-if="
							!catStore.isAnswering &&
							catStore.catState?.aiContext?.lastSaid &&
							catStore.isAnimating > -1
						"
						class="cat-speech-bubble mb-2"
					>
						{{ catStore.catState.aiContext.lastSaid }}
					</div>
				</transition>
				<img
					v-if="!catStore.isAnswering"
					alt="Shadow"
					loading="lazy"
					width="97"
					height="26"
					decoding="async"
					data-nimg="1"
					class="absolute top-[96px] object-contain opacity-50"
					:class="{ 'night-owl-pet': hasNightOwlQuirk }"
					:src="shadowImage"
					style="color: transparent; image-rendering: pixelated"
				/>
				<transition name="fade" mode="out-in">
					<img
						:key="currentImage"
						v-if="!catStore.isAnswering"
						alt="Pet character"
						loading="lazy"
						decoding="async"
						data-nimg="1"
						class="pet-image object-contain relative"
						:src="currentImage"
						style="color: transparent; image-rendering: pixelated"
					/>
				</transition>
				<!-- 问题显示区域 -->
				<div v-if="catStore.isAnswering" class="question-container">
					<div class="question-text">
						{{ catStore.currentQuestion.question }}
					</div>
					<div class="options-container">
						<div
							v-for="(option, index) in catStore.currentQuestion.options"
							:key="index"
							class="option-item"
							:class="{ selected: catStore.selectedAnswer === index }"
						>
							{{ option.text || option.content }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import idleImage from "../../assets/idle.webp";
import eatingImage from "../../assets/food.webp";
import cleaningImage from "../../assets/bath.webp";
import healingImage from "../../assets/idle.webp";
import playingImage from "../../assets/play.webp";
import shadowImage from "../../assets/shadow.png";
import { useCatStore } from "../../store/catStore";

const emit = defineEmits(["animation-state-change"]);
const catStore = useCatStore();

const currentImage = ref(idleImage);
let animationTimer = null;

const playAnimation = (actionType) => {
	catStore.isAnswering = false;
	// 获取动作类型对应的索引
	const actionIndex = ["Food", "Clean", "Doctor", "Play"].indexOf(actionType);

	emit("animation-state-change", true, actionIndex);

	// 清除之前可能存在的计时器
	if (animationTimer) {
		clearTimeout(animationTimer);
		animationTimer = null;
	}

	switch (actionType) {
		case "Food":
			currentImage.value = eatingImage;
			break;
		case "Clean":
			currentImage.value = cleaningImage;
			break;
		case "Doctor":
			currentImage.value = healingImage;
			break;
		case "Play":
			currentImage.value = playingImage;
			break;
	}

	animationTimer = setTimeout(() => {
		currentImage.value = idleImage;
		animationTimer = null;

		// 向父组件发送动画状态变化事件
		emit("animation-state-change", false, -1);
	}, 8000);
};

// 显示问题
const showQuestion = (question) => {
	catStore.setQuestion(question);
};

// 隐藏问题
const hideQuestion = () => {
	catStore.resetState();
};

// 设置选中的选项
const setSelectedOption = (index) => {
	catStore.selectAnswer(index);
};

defineExpose({
	playAnimation,
	showQuestion,
	hideQuestion,
	setSelectedOption,
});

// 格式化怪癖名称
const formatQuirkName = (quirkId) => {
	if (!quirkId) return "";

	// 处理特殊情况
	if (quirkId === "nightOwl") return "Night Owl";

	// 通用处理：将驼峰命名转换为空格分隔的单词，并首字母大写
	return quirkId
		.replace(/([A-Z])/g, " $1") // 在大写字母前添加空格
		.replace(/^./, (str) => str.toUpperCase()) // 首字母大写
		.trim(); // 移除多余空格
};

// 检查是否有夜猫子怪癖
const hasNightOwlQuirk = computed(() => catStore.hasNightOwlQuirk);
</script>

<style scoped>
.pet-area {
	flex-grow: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 8px 0;
}

.pet-image {
	width: 144px;
	height: 114px;
	object-fit: contain;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.question-container {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 100%;
	max-width: 280px;
	border-radius: 8px;
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.question-text {
	font-size: 18px;
	color: #304700;
	text-align: center;
	margin-bottom: 8px;
	line-height: 1;
}

.options-container {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.option-item {
	padding: 6px 8px;
	border: 1px solid #cada9b;
	border-radius: 4px;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.2s;
	line-height: 1;
}

.option-item:hover {
	background-color: #eeffc9;
}

.option-item.selected {
	background-color: #cada9b;
	color: #304700;
	font-weight: bold;
}

.cat-speech-bubble {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	padding: 8px 16px;
	max-width: 260px;
	width: 260px;
	font-size: 18px;
	color: #304700;
	text-align: center;
	z-index: 10;
	animation: fadeInOut 4s ease-in-out forwards;
	background-color: rgba(255, 255, 255, 0.9);
	border-radius: 8px;
}

@keyframes fadeInOut {
	0% {
		opacity: 0;
	}
	15% {
		opacity: 1;
	}
	85% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}

.fade-bubble-enter-active,
.fade-bubble-leave-active {
	transition: opacity 0.3s ease;
}

.fade-bubble-enter-from,
.fade-bubble-leave-to {
	opacity: 0;
}

/* 夜猫子模式下的宠物区域 */
.night-owl-pet-area {
	background: radial-gradient(
		circle at center,
		rgba(78, 115, 223, 0.1) 0%,
		transparent 70%
	);
}

/* 夜猫子模式下的宠物区域 */
.night-owl-pet-area {
	background: radial-gradient(
		circle at center,
		rgba(60, 89, 66, 0.1) 0%,
		transparent 70%
	);
}

/* 夜猫子模式下的宠物图像 */
.night-owl-pet {
	filter: drop-shadow(0 0 5px rgba(60, 89, 66, 0.5));
}

/* 夜猫子模式下的问题容器 */
.night-owl-pet-area .question-container {
	background-color: rgba(26, 52, 34, 0.7);
	border: 1px solid rgba(60, 89, 66, 0.3);
}

.night-owl-pet-area .question-text {
	color: #a0c78a;
}

.night-owl-pet-area .option-item {
	background-color: rgba(26, 52, 34, 0.8);
	border: 1px solid rgba(60, 89, 66, 0.5);
	color: #a0c78a;
}

.night-owl-pet-area .option-item:hover {
	background-color: rgba(60, 89, 66, 0.3);
}

.night-owl-pet-area .option-item.selected {
	background-color: rgba(60, 89, 66, 0.5);
	color: #ffffff;
}

.quirk-tags {
	position: absolute;
	top: -20px;
	right: 3%;
	transform: rotate(5deg);
	display: flex;
	gap: 6px;
	z-index: 10;
}

.quirk-tag {
	background-color: #cada9b;
	color: #304700;
	padding: 2px 8px;
	border-radius: 12px;
	font-size: 14px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	border: 1px solid #97ae62;
	transform: rotate(-2deg); /* 每个标签有轻微的反向倾斜，增加活泼感 */
	transition: transform 0.3s ease; /* 添加过渡效果 */
}

/* 夜猫子模式下的标签样式 */
.night-owl-quirk {
	background-color: rgba(60, 89, 66, 0.8);
	color: #a0c78a;
	border-color: rgba(60, 89, 66, 0.5);
}
</style>
