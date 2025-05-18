<template>
	<main class="center-panel">
		<div
			class="gochi-device relative device-3d"
			ref="deviceRef"
			@mousemove="handleMouseMove"
			@mouseleave="resetTilt"
		>
			<!-- Gamepad Device Image -->
			<img
				src="../assets/b.png"
				alt="Gochi Device Background"
				class="device-background"
			/>

			<!-- Screen, positioned over the device image -->
			<div class="gochi-screen-overlay rounded-lg z-[-1]">
				<ScreenTopBar v-if="!catStore.isAnswering" />
				<PetDisplay
					ref="petDisplayRef"
					@animation-state-change="handleAnimationStateChange"
				/>
				<ScreenBottomBar v-if="!catStore.isAnswering" />
			</div>
			<!-- Controls, positioned over the device image -->
			<ControlButtons
				@update:activeIndex="handleActiveIndexUpdate"
				@confirm="handleConfirm"
				@back="handleBack"
				@answer-select="handleAnswerSelect"
				@play-animation="handlePlayAnimation"
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
const maxTilt = 5; // 最大倾斜角度

// 监听isAnswering的变化，当从答题模式切换回普通模式时触发重置
watch(
	() => catStore.isAnswering,
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

// 处理鼠标移动事件
const handleMouseMove = (e) => {
	if (!deviceRef.value) return;

	const rect = deviceRef.value.getBoundingClientRect();
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;

	// 计算鼠标位置相对于中心点的偏移百分比
	const xPercentage = (e.clientX - centerX) / (rect.width / 2);
	const yPercentage = (e.clientY - centerY) / (rect.height / 2);

	// 计算倾斜角度 (鼠标在上方时设备向后倾斜，在下方时向前倾斜)
	// 鼠标在左侧时设备向左倾斜，在右侧时向右倾斜
	const tiltY = -yPercentage * maxTilt;
	const tiltX = xPercentage * maxTilt;

	// 应用变换 - 注意这里使用rotateY来实现左右倾斜
	deviceRef.value.style.transform = `perspective(1000px) rotateX(${tiltY}deg) rotateY(${tiltX}deg)`;
	deviceRef.value.style.transition = "transform 0.1s ease-out";
};

// 重置倾斜状态
const resetTilt = () => {
	if (!deviceRef.value) return;
	deviceRef.value.style.transform =
		"perspective(1000px) rotateX(0deg) rotateY(0deg)";
	deviceRef.value.style.transition = "transform 0.5s ease-out";
};

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
	/* overflow: hidden; */
	border-radius: 40px;
	z-index: 5;
	padding: 8px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	box-shadow: inset 0px 0px 20px rgba(0, 0, 0, 0.8);
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
	border-radius: 40px;
	pointer-events: none;
}

.device-3d {
	transform-style: preserve-3d;
	transform: perspective(1000px) rotateX(0deg);
	transition: transform 0.5s ease-out;
	will-change: transform;
}

.gochi-device:hover {
	cursor: default;
}
</style>
