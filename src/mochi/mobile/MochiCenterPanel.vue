<template>
	<main class="center-panel-mobile" v-if="catStore.catState">
		<div
			class="gochi-device-mobile relative"
			ref="deviceRef"
			:class="{
				'is-answering': catStore.isAnswering,
			}"
		>
			<img
				src="../assets/b.png"
				alt="Gochi Device Background"
				class="device-background-mobile"
			/>

			<div class="gochi-screen-overlay-mobile rounded-lg">
				<ScreenTopBar
					v-if="
						!catStore.isAnswering &&
						catStore.hasCat &&
						catStore.lifeStatus !== 'dead'
					"
				/>
				<PetDisplay
					ref="petDisplayRef"
					@animation-state-change="handleAnimationStateChange"
				/>
				<ScreenBottomBar
					v-if="
						!catStore.isAnswering &&
						catStore.hasCat &&
						catStore.lifeStatus !== 'dead'
					"
				/>
			</div>

			<!-- 设备控制按钮 -->
			<ControlButtons
				@update:activeIndex="handleActiveIndexUpdate"
				@confirm="handleConfirm"
				@back="handleBack"
				@answer-select="handleAnswerSelect"
				@play-animation="handlePlayAnimation"
				@dialog-button-select="handleDialogButtonSelect"
				@dialog-confirm="handleDialogConfirm"
				:isAnswering="catStore.isAnswering"
				:questionOptions="catStore.currentQuestion?.options || []"
				:resetIndex="shouldResetIndex"
				:isAnimating="catStore.isAnimating"
				:isSubMenu="catStore.isSubMenu"
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
import { useCatStore } from "../store/catStore";

const emit = defineEmits(["cat-updated"]);

const loginStore = useLoginStore();
const catStore = useCatStore();
const userId = computed(() => loginStore.userInfo._id);
const petDisplayRef = ref(null);
const shouldResetIndex = ref(false);
const deviceRef = ref(null);

// 监听isAnswering的变化
watch(
	() => catStore.isAnswering,
	(newVal, oldVal) => {
		if (oldVal && !newVal) {
			shouldResetIndex.value = true;
			setTimeout(() => {
				shouldResetIndex.value = false;
			}, 100);
		}
	}
);

onMounted(async () => {
	if (userId.value) {
		await catStore.initCat(userId.value);
		if (catStore.catState) {
			emit("cat-updated", catStore.catState);
		}
	}
});

const handleActiveIndexUpdate = (newIndex) => {
	catStore.setActiveIndex(newIndex);
};

const handleConfirm = async (index) => {
	// 如果正在播放动画，则不处理确认操作
	if (catStore.isAnimating === index) return;

	// 1：点击大类交互，进入小交互
	if (!catStore.isSubMenu) {
		const parentTypes = ["Food", "Clean", "Doctor", "Play"];
		catStore.enterSubMenu(parentTypes[index]);
		return;
	}

	// 2：点击小类交互，进入答题
	if (!catStore.isAnswering) {
		// 获取子菜单选择的项目
		const subMenuItems = {
			Food: ["CatFood", "Donat", "Fish", "Meat"],
			Clean: ["Bath", "Brush", "Soap", "Towel"],
			Doctor: ["Check", "Bandage", "Medicine", "Vaccine"],
			Play: ["Feather", "Laser", "Ball", "Puzzle"],
		};

		catStore.currentSubType =
			subMenuItems[catStore.currentParentType][catStore.currentActiveIconIndex];

		try {
			// 获取随机题目
			const question = await questionService.getRandomQuestion(1);
			catStore.setQuestion(question);
			// 显示题目
			petDisplayRef.value?.showQuestion(question);
			return; // 重要：添加return确保只执行第二步
		} catch (error) {
			console.log(error);
			showToast({
				message: "获取题目失败",
				type: "error",
				duration: 3000,
			});
			// 如果获取题目失败，重置状态
			catStore.resetState();
			return;
		}
	}

	// 3：点击题目选项，完成答题
	if (catStore.isAnswering && catStore.selectedAnswer !== -1) {
		// 检查答案是否正确
		if (catStore.currentQuestion.options[catStore.selectedAnswer].isCorrect) {
			showToast({
				message: "回答正确！",
				type: "success",
				duration: 2000,
			});

			// 答题正确，播放动画并调用API
			petDisplayRef.value?.playAnimation(catStore.currentParentType);

			try {
				const updatedCat = await catStore.interactWithCat();
				if (updatedCat) {
					emit("cat-updated", updatedCat);
				}
			} catch (error) {
				showToast({
					message: "与猫猫互动失败",
					type: "error",
					duration: 3000,
				});
			}

			catStore.resetState();
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
			catStore.selectedAnswer = -1;
		}
	} else if (catStore.isAnswering) {
		// 如果正在答题但没有选择答案，提示用户
		showToast({
			message: "请先选择一个答案",
			type: "warning",
			duration: 2000,
		});
	}
};

const handleAnimationStateChange = (state, index) => {
	catStore.setAnimationState(state, index);
};

const handlePlayAnimation = (actionType) => {
	petDisplayRef.value?.playAnimation(actionType);
};

const handleBack = () => {
	if (catStore.isAnswering) {
		// 如果正在答题，取消答题
		catStore.resetState();
		petDisplayRef.value?.hideQuestion();
	} else if (catStore.isSubMenu) {
		catStore.resetState();
	}
};

// 处理答案选择
const handleAnswerSelect = (index) => {
	if (catStore.isAnswering) {
		catStore.selectAnswer(index);
		// 更新 PetDisplay 组件的选中状态
		petDisplayRef.value?.setSelectedOption(index);
	}
};

// 处理对话框按钮选择
const handleDialogButtonSelect = (direction) => {
	if (petDisplayRef.value) {
		petDisplayRef.value.handleDialogButtonSelect(direction);
	}
};

// 处理对话框确认
const handleDialogConfirm = () => {
	if (petDisplayRef.value) {
		console.log("confirm");
		petDisplayRef.value.handleDialogConfirm();
	}
};
</script>

<style scoped>
.center-panel-mobile {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 10px;
	box-sizing: border-box;
}

.gochi-device-mobile {
	/* 移动端适配的设备尺寸 */
	width: 100vw;
	height: calc(100vw * 326 / 185);
	position: relative;
}

.device-background-mobile {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	object-fit: contain;
	z-index: 99;
}

.gochi-screen-overlay-mobile {
	/* 按比例调整屏幕位置和大小 */
	position: absolute;
	top: 30.8%;
	left: 19.3%; /* 96/498 ≈ 19.3% */
	width: 61%; /* 304/498 ≈ 61% */
	height: 30.7%; /* 277/664 ≈ 41.7% */
	background-color: #eff8cb;
	border-radius: 40px;
	z-index: 5;
	padding: 8px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	box-shadow: inset 0px 0px 20px rgba(0, 0, 0, 0.8);
}

.gochi-screen-overlay-mobile::before {
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
		rgba(0, 0, 0, 0.05) 2px,
		rgba(0, 0, 0, 0.01) 4px
	);
	border-radius: 40px;
	pointer-events: none;
}

/* 夜猫子模式样式（如果需要的话） */
.night-owl-screen {
	background-color: #3c5942 !important;
	box-shadow: inset 0px 0px 20px rgba(78, 115, 223, 0.2) !important;
}
</style>
