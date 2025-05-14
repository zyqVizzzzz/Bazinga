<template>
	<div class="pet-area">
		<div class="w-full">
			<div class="relative flex justify-center items-center">
				<img
					v-if="!showingQuestion"
					alt="Shadow"
					loading="lazy"
					width="97"
					height="26"
					decoding="async"
					data-nimg="1"
					class="absolute top-[96px] object-contain opacity-50"
					:src="shadowImage"
					style="color: transparent; image-rendering: pixelated"
				/>
				<img
					v-if="!showingQuestion"
					alt="Pet character"
					loading="lazy"
					decoding="async"
					data-nimg="1"
					class="pet-image object-contain relative"
					:src="currentImage"
					style="color: transparent; image-rendering: pixelated"
				/>

				<!-- 问题显示区域 -->
				<div v-if="showingQuestion" class="question-container">
					<div class="question-text">{{ currentQuestion.question }}</div>
					<div class="options-container">
						<div
							v-for="(option, index) in currentQuestion.options"
							:key="index"
							class="option-item"
							:class="{ selected: selectedOptionIndex === index }"
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
import { ref } from "vue";
import idleImage from "../../assets/idle.webp";
import eatingImage from "../../assets/food.webp";
import cleaningImage from "../../assets/bath.webp";
import healingImage from "../../assets/idle.webp";
import playingImage from "../../assets/play.webp";
import shadowImage from "../../assets/shadow.png";

const emit = defineEmits(["animation-state-change"]);

const currentImage = ref(idleImage);
const showingQuestion = ref(false);
const currentQuestion = ref(null);
const selectedOptionIndex = ref(-1);
let animationTimer = null; // 计时器引用
const isPlayingAnimation = ref(false); // 动画状态标志

const playAnimation = (actionType) => {
	showingQuestion.value = false;
	isPlayingAnimation.value = true;
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
		isPlayingAnimation.value = false;
		// 向父组件发送动画状态变化事件
		emit("animation-state-change", false, -1);
	}, 8000);
};

// 显示问题
const showQuestion = (question) => {
	currentQuestion.value = question;
	showingQuestion.value = true;
	selectedOptionIndex.value = -1;
};

// 隐藏问题
const hideQuestion = () => {
	showingQuestion.value = false;
	currentQuestion.value = null;
	selectedOptionIndex.value = -1;
};

// 设置选中的选项
const setSelectedOption = (index) => {
	selectedOptionIndex.value = index;
};

defineExpose({
	playAnimation,
	showQuestion,
	hideQuestion,
	setSelectedOption,
});
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
	width: 154px;
	height: 114px;
	object-fit: contain;
}

.question-container {
	width: 100%;
	max-width: 280px;
	border-radius: 8px;
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.question-text {
	font-size: 16px;
	color: #304700;
	text-align: center;
	margin-bottom: 8px;
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
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;
}

.option-item:hover {
	background-color: #eeffc9;
}

.option-item.selected {
	background-color: #cada9b;
	color: #304700;
	font-weight: bold;
}
</style>
