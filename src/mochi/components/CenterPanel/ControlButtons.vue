<template>
	<div>
		<button
			@click="selectPrevious"
			aria-label="Previous"
			class="control-button-overlay prev-button absolute inset-0 bg-black/0 active:bg-[#e6e6e6e0] active:shadow-[inset_8px_8px_3px_rgba(0,0,0,0.25),inset_4px_4px_3px_rgba(0,0,0,0.25),inset_0px_0px_15px_rgba(0,0,0,0.4),-1px_-3px_0px_rgba(0,0,0,0.55)] rounded-full transition-all"
		></button>
		<button
			@click="selectNext"
			aria-label="Next"
			class="control-button-overlay next-button absolute inset-0 bg-black/0 active:bg-[#e6e6e6e0] active:shadow-[inset_8px_8px_3px_rgba(0,0,0,0.25),inset_4px_4px_3px_rgba(0,0,0,0.25),inset_0px_0px_15px_rgba(0,0,0,0.4),-1px_-3px_0px_rgba(0,0,0,0.55)] rounded-full transition-all"
		></button>
		<button
			@click="handleConfirm"
			aria-label="A"
			class="control-button-overlay a-button absolute inset-0 bg-black/0 active:bg-[#e6e6e6e0] active:shadow-[inset_8px_8px_3px_rgba(0,0,0,0.25),inset_4px_4px_3px_rgba(0,0,0,0.25),inset_0px_0px_15px_rgba(0,0,0,0.4),-1px_-3px_0px_rgba(0,0,0,0.55)] rounded-full transition-all"
		></button>
		<button
			@click="handleBack"
			aria-label="B"
			class="control-button-overlay b-button absolute inset-0 bg-black/0 active:bg-[#e6e6e6e0] active:shadow-[inset_8px_8px_3px_rgba(0,0,0,0.25),inset_4px_4px_3px_rgba(0,0,0,0.25),inset_0px_0px_15px_rgba(0,0,0,0.4),-1px_-3px_0px_rgba(0,0,0,0.55)] rounded-full transition-all"
		></button>
		<div class="age-display">
			<div class="age-screen">
				<div class="age-text">
					{{ formatAge(catStore.catState?.birthDate) }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useCatStore } from "../../store/catStore";

const emit = defineEmits([
	"update:activeIndex",
	"confirm",
	"back",
	"answer-select",
	"play-animation",
	"show-question",
]);

const catStore = useCatStore();
const activeIndex = ref(-1);
const totalIcons = 4; // Food, Clean, Doctor, Play

const selectNext = () => {
	if (catStore.isAnswering) {
		// 如果正在答题，则在选项中切换
		const optionsCount = catStore.currentQuestion?.options.length || 4;
		if (activeIndex.value === -1) {
			activeIndex.value = 0;
		} else {
			activeIndex.value = (activeIndex.value + 1) % optionsCount;
		}
		catStore.selectAnswer(activeIndex.value);
	} else {
		// 正常菜单切换
		if (activeIndex.value === -1) {
			activeIndex.value = 0;
			// 只有在一级菜单时才检查动画状态
			if (!catStore.isSubMenu && catStore.isAnimating === activeIndex.value) {
				activeIndex.value = (activeIndex.value + 1) % totalIcons;
			}
		} else {
			let nextIndex = (activeIndex.value + 1) % totalIcons;
			// 只有在一级菜单时才检查动画状态
			if (!catStore.isSubMenu && catStore.isAnimating === nextIndex) {
				nextIndex = (nextIndex + 1) % totalIcons;
			}
			activeIndex.value = nextIndex;
		}
		catStore.setActiveIndex(activeIndex.value);
	}
};

const selectPrevious = () => {
	if (catStore.isAnswering) {
		// 如果正在答题，则在选项中切换
		const optionsCount = catStore.currentQuestion?.options.length || 4;
		if (activeIndex.value === -1) {
			activeIndex.value = optionsCount - 1;
		} else {
			activeIndex.value = (activeIndex.value - 1 + optionsCount) % optionsCount;
		}
		catStore.selectAnswer(activeIndex.value);
	} else {
		// 正常菜单切换
		if (activeIndex.value === -1) {
			activeIndex.value = 0; // 修改这里，从0开始而不是totalIcons - 1
			// 只有在一级菜单时才检查动画状态
			if (!catStore.isSubMenu && catStore.isAnimating === activeIndex.value) {
				activeIndex.value = (activeIndex.value + 1) % totalIcons;
			}
		} else {
			// 计算前一个索引
			let prevIndex = (activeIndex.value - 1 + totalIcons) % totalIcons;
			// 只有在一级菜单时才检查动画状态
			if (!catStore.isSubMenu && catStore.isAnimating === prevIndex) {
				prevIndex = (prevIndex - 1 + totalIcons) % totalIcons;
			}
			activeIndex.value = prevIndex;
		}
		catStore.setActiveIndex(activeIndex.value);
	}
};

const handleConfirm = async () => {
	if (activeIndex.value !== -1 || catStore.isAnswering) {
		// 在非答题模式下，处理菜单选择
		if (!catStore.isAnswering) {
			if (!catStore.isSubMenu) {
				// 选择主菜单项
				const parentType = ["Food", "Clean", "Doctor", "Play"][
					activeIndex.value
				];
				catStore.enterSubMenu(parentType);
			} else {
				// 选择子菜单项并获取问题
				const question = await catStore.selectSubMenuItem(activeIndex.value);
				if (question) {
					// 触发显示问题的事件
					emit("show-question", question);
				}
			}
			activeIndex.value = -1; // 重置状态
		} else {
			// 答题模式下，提交答案
			const result = await catStore.submitAnswer();
			if (result.success) {
				if (result.isCorrect) {
					// 答题正确，触发播放动画的事件
					emit("play-animation", result.parentType);

					// 重置状态
					catStore.resetState();
					activeIndex.value = -1;
				}
			}
		}
	}
};

// 格式化年龄显示
const formatAge = (birthDate) => {
	if (!birthDate) return "D-000";

	const birth = new Date(birthDate);
	const now = new Date();

	// 计算时间差（毫秒）
	const timeDiff = now.getTime() - birth.getTime();

	// 转换为游戏天数（游戏时间是真实时间的24倍）
	// 1天 = 24小时 * 60分钟 * 60秒 * 1000毫秒
	const gameDays = Math.floor((timeDiff / (24 * 60 * 60 * 1000)) * 24);

	// 计算游戏年龄
	const gameYears = Math.floor(gameDays / 365);
	const remainingDays = gameDays % 365;

	// 根据年龄返回不同格式
	if (gameYears === 0) {
		return `D-${gameDays.toString().padStart(3, "0")}`;
	} else {
		return `Y${gameYears}-${remainingDays.toString().padStart(3, "0")}`;
	}
};

const handleBack = () => {
	catStore.resetState();
	activeIndex.value = -1; // 重置状态
};
</script>

<style scoped>
.control-button-overlay {
	position: absolute;
	width: 56px;
	height: 56px;
	border-radius: 9999px;
	overflow: hidden;
	z-index: 999;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 1.5rem;
	/* color: #1b5e20;
	background-color: rgba(129, 199, 132, 0.5); */
	/* border: 2px solid #388e3c; */
}

.prev-button {
	width: 53px;
	height: 55px;
	top: 459px;
	left: 86px;
}
.next-button {
	width: 53px;
	height: 54px;
	top: 459px;
	left: 172px;
}
.a-button {
	width: 61px;
	height: 61px;
	top: 474px;
	left: 261px;
}
.b-button {
	width: 61px;
	height: 62px;
	top: 454px;
	left: 350px;
}

.age-display {
	position: absolute;
	width: 80px;
	top: 555px;
	right: 32%;
	padding: 3px;
	background: #d1d2d7;
	border-radius: 4px;
	box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.8),
		inset -1px -1px 2px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.2);
	z-index: 999;
}

.age-screen {
	background: #c4c5c9;
	padding: 0px 8px;
	border: 2px inset #b2b3b8;
	position: relative;
	overflow: hidden;
}

.age-text {
	color: #556336;
	font-size: 18px;
	font-family: "PixelFont", sans-serif;
	text-align: center;
	letter-spacing: 0.5px;
	text-shadow: 0 0 1px rgba(85, 99, 54, 0.3);
}
</style>
