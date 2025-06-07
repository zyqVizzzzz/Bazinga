<template>
	<div class="pet-area-mobile">
		<!-- 创建猫猫对话框 -->
		<div v-if="catStore.showCreateCatDialog" class="create-cat-dialog">
			<div class="dialog-content">
				<h3 class="dialog-title">Welcome to the Molidoki</h3>
				<p class="dialog-description">你还没有属于自己的猫猫伙伴呢～<br /></p>

				<div class="dialog-buttons">
					<button
						class="btn-secondary"
						:class="{ selected: selectedDialogButton === 0 }"
						@click="handleCancelCreate"
					>
						暂时不要
					</button>
					<button
						class="btn-secondary"
						:class="{ selected: selectedDialogButton === 1 }"
						:disabled="isCreating"
						@click.prevent
					>
						{{ isCreating ? "创建中..." : "创建猫猫" }}
					</button>
				</div>
			</div>
		</div>
		<div v-else class="w-full">
			<div class="relative flex justify-center items-center">
				<div
					v-if="!catStore.isAnswering && catStore.catState?.quirks?.length > 0"
					class="quirk-tags-mobile"
				>
					<span
						v-for="(quirk, index) in catStore.catState.quirks"
						:key="index"
						class="quirk-tag-mobile"
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
						class="cat-speech-bubble-mobile mb-2"
					>
						{{ catStore.catState.aiContext.lastSaid }}
					</div>
				</transition>
				<img
					v-if="!catStore.isAnswering && catStore.lifeStatus !== 'dead'"
					alt="Shadow"
					loading="lazy"
					width="67"
					height="22"
					decoding="async"
					data-nimg="1"
					class="absolute top-[60px] object-contain opacity-50"
					:src="shadowImage"
					style="color: transparent; image-rendering: pixelated"
				/>
				<transition name="fade" mode="out-in">
					<img
						:key="currentImage"
						v-if="!catStore.isAnswering && catStore.lifeStatus !== 'dead'"
						alt="Pet character"
						loading="lazy"
						decoding="async"
						data-nimg="1"
						class="pet-image-mobile object-contain relative"
						:src="currentImage"
						style="color: transparent; image-rendering: pixelated"
					/>
				</transition>

				<!-- 死亡状态显示 -->
				<div
					v-if="catStore.lifeStatus === 'dead'"
					class="death-container flex flex-col items-center"
				>
					<!-- 死亡提示文字 -->
					<div class="death-message text-red-500 font-bold text-lg mb-4">
						Your Mochi is DEAD
					</div>

					<!-- 死亡图片 -->
					<transition name="fade" mode="out-in">
						<img
							alt="Pet character"
							loading="lazy"
							decoding="async"
							data-nimg="1"
							class="dead-image object-contain relative"
							:src="deathImage"
							style="color: transparent; image-rendering: pixelated"
						/>
					</transition>

					<!-- 复活按钮和积分提示 -->
					<div class="revive-section mt-4 flex flex-col items-center">
						<button class="btn-secondary dead selected" @click.prevent>
							Revive (A)
						</button>
						<div class="cost-notice">-100 POINTS</div>
					</div>
				</div>

				<div
					v-if="
						catStore.isAnswering &&
						catStore.lifeStatus !== 'dead' &&
						catStore.currentQuestion
					"
					class="question-container-mobile"
				>
					<div class="question-text-mobile">
						{{ catStore.currentQuestion.question }}
					</div>
					<div class="options-container-mobile">
						<div
							v-for="(option, index) in catStore.currentQuestion.options"
							:key="index"
							class="option-item-mobile"
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
const newCatName = ref("");
const isCreating = ref(false);
const selectedDialogButton = ref(0);
let animationTimer = null;

const handleCreateCat = async () => {
	isCreating.value = true;
	try {
		await catStore.createCat();
		newCatName.value = "";
	} catch (error) {
		console.error("创建猫猫失败:", error);
	} finally {
		isCreating.value = false;
	}
};

const handleCancelCreate = () => {
	catStore.cancelCreateCat();
};

// 处理控制按钮的选择
const handleDialogButtonSelect = (direction) => {
	if (catStore.showCreateCatDialog) {
		if (direction === "next") {
			selectedDialogButton.value = (selectedDialogButton.value + 1) % 2;
		} else if (direction === "prev") {
			selectedDialogButton.value = (selectedDialogButton.value - 1 + 2) % 2;
		}
	}
};

// 处理确认按钮
const handleDialogConfirm = async () => {
	if (catStore.showCreateCatDialog) {
		if (selectedDialogButton.value === 0) {
			// 暂时不要
			handleCancelCreate();
		} else if (selectedDialogButton.value === 1) {
			// 创建猫猫
			await handleCreateCat();
		}
	}
};

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
	handleDialogButtonSelect,
	handleDialogConfirm,
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
.pet-area-mobile {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin: 4px 0;
	height: 100%;
	/* min-height: 180px; */
}

.pet-image-mobile {
	width: min(120px, 25vw);
	height: min(95px, 20vw);
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

.question-container-mobile {
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

.question-text-mobile {
	font-size: 16px;
	font-weight: bold;
	color: #304700;
	text-align: center;
	line-height: 1.3;
	margin-bottom: 4px;
}

.options-container-mobile {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.option-item-mobile {
	padding: 6px 8px;
	border: 1px solid #cada9b;
	border-radius: 4px;
	background-color: #eeffc9;
	color: #304700;
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 14px;
	text-align: center;
	line-height: 1.2;
}

.option-item-mobile:hover {
	background-color: #cada9b;
	transform: translateY(-1px);
}

.option-item-mobile.selected {
	background-color: #304700;
	color: #ebffb7;
	border-color: #304700;
	font-weight: bold;
}

.cat-speech-bubble-mobile {
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

.quirk-tags-mobile {
	position: absolute;
	top: -30px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	flex-wrap: wrap;
	gap: 3px;
	justify-content: center;
	max-width: 160px;
	z-index: 4;
}

.quirk-tag-mobile {
	background-color: rgba(235, 255, 183, 0.9);
	color: #304700;
	border: 1px solid rgba(48, 71, 0, 0.3);
	border-radius: 8px;
	padding: 2px 6px;
	font-size: 10px;
	font-weight: bold;
	white-space: nowrap;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	transform: rotate(-1deg);
	transition: transform 0.3s ease;
}

.quirk-tag-mobile:nth-child(even) {
	transform: rotate(1deg);
}

.fade-bubble-enter-active,
.fade-bubble-leave-active {
	transition: opacity 0.3s ease;
}

.fade-bubble-enter-from,
.fade-bubble-leave-to {
	opacity: 0;
}

/* 夜猫子模式样式 */
.dialog-title {
	font-size: 18px;
	color: #304700;
	text-align: center;
	margin-bottom: 16px;
	font-weight: bold;
}

.dialog-description {
	font-size: 14px;
	color: #5a6b2d;
	text-align: center;
	margin-bottom: 24px;
	line-height: 1.5;
}

.dialog-buttons {
	display: flex;
	gap: 12px;
	justify-content: center;
}

.btn-secondary {
	padding: 8px 24px;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.3s ease;
	border: none;
}
.btn-secondary {
	background-color: transparent;
	color: #5a6b2d;
	border: 2px solid #cada9b;
}

.btn-secondary:hover {
	background-color: #f0f7e8;
	transform: translateY(-1px);
}

.btn-secondary.selected {
	border: 2px solid #cada9b;
	box-shadow: 0 0 10px rgba(202, 218, 155, 0.5);
	background-color: rgba(202, 218, 155, 0.5);
}

.btn-secondary {
	pointer-events: none; /* 禁用直接点击 */
	cursor: default;
}
</style>
