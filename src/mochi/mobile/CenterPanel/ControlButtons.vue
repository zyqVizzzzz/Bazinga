<template>
	<div>
		<button
			@click="selectPrevious"
			@touchstart="handleTouchStart"
			@touchend="handleTouchEnd"
			aria-label="Previous"
			class="control-button-overlay prev-button absolute inset-0 bg-black/0 active:bg-[#e6e6e6e0] active:shadow-[inset_8px_8px_3px_rgba(0,0,0,0.25),inset_4px_4px_3px_rgba(0,0,0,0.25),inset_0px_0px_15px_rgba(0,0,0,0.4),-1px_-3px_0px_rgba(0,0,0,0.55)] rounded-full transition-all"
			:class="{ 'button-pressed': touchedButton === 'prev' }"
		></button>
		<button
			@click="selectNext"
			@touchstart="() => handleTouchStart('next')"
			@touchend="handleTouchEnd"
			aria-label="Next"
			class="control-button-overlay next-button absolute inset-0 bg-black/0 active:bg-[#e6e6e6e0] active:shadow-[inset_8px_8px_3px_rgba(0,0,0,0.25),inset_4px_4px_3px_rgba(0,0,0,0.25),inset_0px_0px_15px_rgba(0,0,0,0.4),-1px_-3px_0px_rgba(0,0,0,0.55)] rounded-full transition-all"
			:class="{ 'button-pressed': touchedButton === 'next' }"
		></button>
		<button
			@click="handleConfirm"
			@touchstart="() => handleTouchStart('confirm')"
			@touchend="handleTouchEnd"
			aria-label="A"
			class="control-button-overlay a-button absolute inset-0 bg-black/0 active:bg-[#e6e6e6e0] active:shadow-[inset_8px_8px_3px_rgba(0,0,0,0.25),inset_4px_4px_3px_rgba(0,0,0,0.25),inset_0px_0px_15px_rgba(0,0,0,0.4),-1px_-3px_0px_rgba(0,0,0,0.55)] rounded-full transition-all"
			:class="{ 'button-pressed': touchedButton === 'confirm' }"
		></button>
		<button
			@click="handleBack"
			@touchstart="() => handleTouchStart('back')"
			@touchend="handleTouchEnd"
			aria-label="B"
			class="control-button-overlay b-button absolute inset-0 bg-black/0 active:bg-[#e6e6e6e0] active:shadow-[inset_8px_8px_3px_rgba(0,0,0,0.25),inset_4px_4px_3px_rgba(0,0,0,0.25),inset_0px_0px_15px_rgba(0,0,0,0.4),-1px_-3px_0px_rgba(0,0,0,0.55)] rounded-full transition-all"
			:class="{ 'button-pressed': touchedButton === 'back' }"
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
	"dialog-button-select",
	"dialog-confirm",
]);

const catStore = useCatStore();
const activeIndex = ref(-1);
const totalIcons = 4; // Food, Clean, Doctor, Play

const touchedButton = ref(null);

const handleTouchStart = (button = "prev") => {
	touchedButton.value = button;
};

const handleTouchEnd = () => {
	// 延迟一点点重置状态，让用户能看到按压效果
	setTimeout(() => {
		touchedButton.value = null;
	}, 150);
};

const selectNext = () => {
	if (catStore.showCreateCatDialog) {
		emit("dialog-button-select", "next");
		return;
	}

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
	if (catStore.showCreateCatDialog) {
		emit("dialog-button-select", "prev");
		return;
	}

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
	if (catStore.showCreateCatDialog) {
		emit("dialog-confirm");
		return;
	}

	// 检查是否为死亡状态，如果是则执行复活操作
	if (catStore.lifeStatus === "dead") {
		await catStore.reviveCat();
		return;
	}

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
	if (catStore.showCreateCatDialog) {
		catStore.cancelCreateCat();
		return;
	}

	catStore.resetState();
	activeIndex.value = -1; // 重置状态
};
</script>

<style scoped>
.control-button-overlay {
	position: absolute;
	width: 12.1%;
	height: auto;
	/* background: rgba(27, 153, 178, 0.1); */
	border-radius: 50%;
	overflow: hidden;
	z-index: 999;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 1.5rem;
	aspect-ratio: 1;
}

.prev-button {
	top: 64.5%;
	left: 18.1%;
}

.next-button {
	top: 64.4%;
	left: 34.9%;
}

.a-button {
	top: 64.4%;
	left: 52.8%;
}

.b-button {
	top: 64.4%;
	left: 69.9%;
}

.age-display {
	position: absolute;
	width: 18.2%;
	top: 73.1%;
	right: 30%;
	padding: 3px;
	background: rgb(208, 213, 214);
	border-radius: 4px;
	box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.8),
		inset -1px -1px 2px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.2);
	z-index: 999;
}

.age-screen {
	background: rgb(208, 213, 214);
	padding: 0px 8px;
	border: 2px inset #b2b3b8;
	position: relative;
	overflow: hidden;
}

.age-text {
	color: #556336;
	/* 使用相对单位确保文字大小适应 */
	font-size: min(18px, 4vw);
	font-family: "PixelFont", sans-serif;
	text-align: center;
	letter-spacing: 0.5px;
	text-shadow: 0 0 1px rgba(85, 99, 54, 0.3);
}

/* 添加触摸反馈样式 */
.button-pressed {
	background-color: rgba(230, 230, 230, 0.88) !important;
	box-shadow: inset 8px 8px 3px rgba(0, 0, 0, 0.25),
		inset 4px 4px 3px rgba(0, 0, 0, 0.25), inset 0px 0px 15px rgba(0, 0, 0, 0.4),
		-1px -3px 0px rgba(0, 0, 0, 0.55) !important;
	transform: scale(0.95);
}

/* 禁用移动设备上的长按选择菜单 */
.control-button-overlay {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
}
</style>
