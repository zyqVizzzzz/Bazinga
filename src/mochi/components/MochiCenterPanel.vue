<template>
	<main class="center-panel">
		<div class="gochi-device relative">
			<!-- Gamepad Device Image -->
			<img
				src="../assets/b.png"
				alt="Gochi Device Background"
				class="device-background"
			/>

			<!-- Screen, positioned over the device image -->
			<div class="gochi-screen-overlay rounded-lg z-[-1]">
				<ScreenTopBar v-if="!isAnswering" />
				<PetDisplay
					ref="petDisplayRef"
					@animation-state-change="handleAnimationStateChange"
				/>
				<ScreenBottomBar
					v-if="!isAnswering"
					:activeIndex="currentActiveIconIndex"
					:isSubMenu="isSubMenu"
					:parentType="currentParentType"
					:isAnimating="isAnimating"
				/>
			</div>

			<!-- Controls, positioned over the device image -->
			<ControlButtons
				@update:activeIndex="handleActiveIndexUpdate"
				@confirm="handleConfirm"
				@back="handleBack"
				@answer-select="handleAnswerSelect"
				:isAnswering="isAnswering"
				:questionOptions="currentQuestion?.options || []"
				:resetIndex="shouldResetIndex"
				:isAnimating="isAnimating"
			/>
		</div>
	</main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import ScreenTopBar from "./CenterPanel/ScreenTopBar.vue";
import PetDisplay from "./CenterPanel/PetDisplay.vue";
import ScreenBottomBar from "./CenterPanel/ScreenBottomBar.vue";
import ControlButtons from "./CenterPanel/ControlButtons.vue";
import { catService } from "../services/catService";
import { useLoginStore } from "@/store";
import { showToast } from "@/components/common/toast.js";
import { questionService } from "../services/questionService";

const emit = defineEmits(["cat-updated"]);

const loginStore = useLoginStore();
const userId = computed(() => loginStore.userInfo._id);
const catId = ref(null);
const catState = ref({
	shortTermStates: {
		food: 50,
		happiness: 50,
		cleanliness: 50,
		energy: 50,
		health: 50,
	},
	currentHealthPoints: 100,
	maxHealthPoints: 100,
	currentHealthiness: 100,
	aiContext: {
		lastSaid: "喵～",
		moodKeywords: [],
	},
});

const currentActiveIconIndex = ref(-1);
const isSubMenu = ref(false);
const currentParentType = ref("");
const currentSubType = ref("");
const petDisplayRef = ref(null);
// 问题相关状态
const currentQuestion = ref(null);
const isAnswering = ref(false);
const selectedAnswer = ref(-1);
const shouldResetIndex = ref(false);
// 动画状态
const isAnimating = ref(-1);

onMounted(async () => {
	if (userId.value) {
		try {
			const cat = await catService.getUserCat(userId.value);
			if (cat) {
				catId.value = cat._id;
				catState.value = cat;
				emit("cat-updated", cat);
			}
		} catch (error) {
			showToast({
				message: "获取猫猫信息失败",
				type: "error",
				duration: 3000,
			});
		}
	}
});

// 监听isAnswering的变化，当从答题模式切换回普通模式时触发重置
watch(
	() => isAnswering.value,
	(newVal, oldVal) => {
		if (oldVal && !newVal) {
			// 从答题模式切换到非答题模式时触发重置
			shouldResetIndex.value = true;
			// 重置触发器状态
			setTimeout(() => {
				shouldResetIndex.value = false;
			}, 100);
		}
	}
);

const handleActiveIndexUpdate = (newIndex) => {
	// 如果正在播放动画，则不更新索引
	if (isAnimating.value === newIndex) return;
	currentActiveIconIndex.value = newIndex;
};

const handleConfirm = async (index) => {
	// 如果正在播放动画，则不处理确认操作
	if (isAnimating.value === index) return;

	// 1：点击大类交互，进入小交互
	if (!isSubMenu.value) {
		isSubMenu.value = true;
		currentParentType.value = ["Food", "Clean", "Doctor", "Play"][index];
		currentActiveIconIndex.value = -1;
		return;
	}

	// 2：点击小类交互，进入答题
	if (!isAnswering.value) {
		// 获取子菜单选择的项目
		const subMenuItems = {
			Food: ["CatFood", "Donat", "Fish", "Meat"],
			Clean: ["Bath", "Brush", "Soap", "Towel"],
			Doctor: ["Check", "Bandage", "Medicine", "Vaccine"],
			Play: ["Feather", "Laser", "Ball", "Puzzle"],
		};

		currentSubType.value =
			subMenuItems[currentParentType.value][currentActiveIconIndex.value];

		try {
			// 获取随机题目
			const question = await questionService.getRandomQuestion(1);
			currentQuestion.value = question;
			isAnswering.value = true;
			// 重置选择的答案
			selectedAnswer.value = -1;
			// 显示题目
			petDisplayRef.value?.showQuestion(currentQuestion.value);
			return; // 重要：添加return确保只执行第二步
		} catch (error) {
			showToast({
				message: "获取题目失败",
				type: "error",
				duration: 3000,
			});
			// 如果获取题目失败，重置状态
			isSubMenu.value = false;
			currentParentType.value = "";
			currentSubType.value = "";
			isAnswering.value = false;
			return;
		}
	}

	// 3：点击题目选项，完成答题
	if (isAnswering.value && selectedAnswer.value !== -1) {
		console.log(selectedAnswer.value, currentQuestion.value);
		// 检查答案是否正确
		if (currentQuestion.value.options[selectedAnswer.value].isCorrect) {
			showToast({
				message: "回答正确！",
				type: "success",
				duration: 2000,
			});

			// 答题正确，播放动画并调用API
			petDisplayRef.value?.playAnimation(currentParentType.value);

			if (catId.value) {
				try {
					const updatedCat = await catService.interactWithCat(
						catId.value,
						currentParentType.value === "Food"
							? "FEED"
							: currentParentType.value === "Clean"
							? "CLEAN"
							: currentParentType.value === "Doctor"
							? "DOCTOR"
							: currentParentType.value === "Play"
							? "PLAY"
							: "",
						currentSubType.value
					);

					// 更新猫猫状态
					catState.value = updatedCat;
					currentActiveIconIndex.value = -1;

					emit("cat-updated", updatedCat);

					// 显示猫猫的回应
					if (updatedCat.aiContext && updatedCat.aiContext.lastSaid) {
						showToast({
							message: updatedCat.aiContext.lastSaid,
							type: "success",
							duration: 3000,
						});
					}
				} catch (error) {
					showToast({
						message: "与猫猫互动失败",
						type: "error",
						duration: 3000,
					});
				}
			}

			isAnswering.value = false;
			isSubMenu.value = false;
			currentActiveIconIndex.value = -1;
			currentParentType.value = "";
			currentSubType.value = "";
			currentQuestion.value = null;
			selectedAnswer.value = -1;
			// 触发索引重置
			shouldResetIndex.value = true;
			// 重置触发器状态
			setTimeout(() => {
				shouldResetIndex.value = false;
			}, 0);
		} else {
			showToast({
				message: "回答错误，请重试！",
				type: "error",
				duration: 2000,
			});
			// 答题错误，重置答题状态但保持子菜单状态
			selectedAnswer.value = -1;
		}
	} else if (isAnswering.value) {
		// 如果正在答题但没有选择答案，提示用户
		showToast({
			message: "请先选择一个答案",
			type: "warning",
			duration: 2000,
		});
	}
};

const handleAnimationStateChange = (state, index) => {
	console.log("动画状态变化:", state, "索引:", index);
	isAnimating.value = state ? index : -1;
};

const handleBack = () => {
	if (isAnswering.value) {
		// 如果正在答题，取消答题
		isSubMenu.value = false;
		currentParentType.value = "";
		currentSubType.value = "";
		currentActiveIconIndex.value = -1;
		isAnswering.value = false;
		currentQuestion.value = null;
		selectedAnswer.value = -1;
		petDisplayRef.value?.hideQuestion();
	} else if (isSubMenu.value) {
		isSubMenu.value = false;
		currentParentType.value = "";
		currentSubType.value = "";
		currentActiveIconIndex.value = -1;
	}
};

// 处理答案选择
const handleAnswerSelect = (index) => {
	if (isAnswering.value) {
		selectedAnswer.value = index;
		// 更新 PetDisplay 组件的选中状态
		petDisplayRef.value?.setSelectedOption(index);
	}
};
</script>

<style scoped>
.center-panel {
	width: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
}

.gochi-device {
	width: 498px;
	height: 664px;
}

.device-background {
	position: absolute;
	left: 0;
	width: 498;
	height: 100%;
	object-fit: contain;
	z-index: 99;
}

.gochi-screen-overlay {
	position: absolute;
	top: 154px;
	left: 96px;
	width: 304px;
	height: 277px;
	background-color: #eff8cb;
	overflow: hidden;
	z-index: 5;
	padding: 8px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	box-shadow: inset 2px 2px 0px rgba(0, 0, 0, 0.1);
}

.gochi-screen-overlay::before {
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
</style>
