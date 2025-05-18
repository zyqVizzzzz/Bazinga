<template>
	<div class="pet-area">
		<div class="w-full">
			<div class="relative flex justify-center items-center">
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
import { ref } from "vue";
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
</style>
