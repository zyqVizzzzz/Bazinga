<template>
	<div>
		<button
			@click="selectPrevious"
			aria-label="Previous"
			class="control-button-overlay prev-button"
		>
			&lt;
		</button>
		<button
			@click="selectNext"
			aria-label="Next"
			class="control-button-overlay next-button"
		>
			&gt;
		</button>
		<button
			@click="handleConfirm"
			aria-label="A"
			class="control-button-overlay a-button"
		>
			A
		</button>
		<button
			@click="handleBack"
			aria-label="B"
			class="control-button-overlay b-button"
		>
			B
		</button>
	</div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
	isAnswering: {
		type: Boolean,
		default: false,
	},
	questionOptions: {
		type: Array,
		default: () => [],
	},
	resetIndex: {
		type: Boolean,
		default: false,
	},
	isAnimating: {
		type: Number,
		default: -1,
	},
});

const emit = defineEmits([
	"update:activeIndex",
	"confirm",
	"back",
	"answer-select",
]);

const activeIndex = ref(-1);
const totalIcons = 4; // Food, Clean, Doctor, Play

// 监听resetIndex属性变化，当为true时重置activeIndex
watch(
	() => props.resetIndex,
	(newVal) => {
		if (newVal) {
			activeIndex.value = -1;
		}
	}
);

const selectNext = () => {
	if (props.isAnswering) {
		// 如果正在答题，则在选项中切换
		const optionsCount = props.questionOptions.length || 4;
		if (activeIndex.value === -1) {
			activeIndex.value = 0;
		} else {
			activeIndex.value = (activeIndex.value + 1) % optionsCount;
		}
		emit("answer-select", activeIndex.value);
	} else {
		// 正常菜单切换
		if (activeIndex.value === -1) {
			activeIndex.value = 0;
			// 如果第一个按钮正在动画，则选择下一个
			if (props.isAnimating === activeIndex.value) {
				activeIndex.value = (activeIndex.value + 1) % totalIcons;
			}
		} else {
			let nextIndex = (activeIndex.value + 1) % totalIcons;
			// 如果下一个索引正在动画，则再跳过一个
			if (props.isAnimating === nextIndex) {
				nextIndex = (nextIndex + 1) % totalIcons;
			}
			activeIndex.value = nextIndex;
		}
		emit("update:activeIndex", activeIndex.value);
	}
};

const selectPrevious = () => {
	if (props.isAnswering) {
		// 如果正在答题，则在选项中切换
		const optionsCount = props.questionOptions.length || 4;
		if (activeIndex.value === -1) {
			activeIndex.value = optionsCount - 1;
		} else {
			activeIndex.value = (activeIndex.value - 1 + optionsCount) % optionsCount;
		}
		emit("answer-select", activeIndex.value);
	} else {
		// 正常菜单切换
		if (activeIndex.value === -1) {
			activeIndex.value = totalIcons - 1;
			// 如果最后一个按钮正在动画，则选择前一个
			if (props.isAnimating === activeIndex.value) {
				activeIndex.value = (activeIndex.value - 1 + totalIcons) % totalIcons;
			}
		} else {
			// 计算前一个索引
			let prevIndex = (activeIndex.value - 1 + totalIcons) % totalIcons;
			// 如果前一个索引正在动画，则再跳过一个
			if (props.isAnimating === prevIndex) {
				prevIndex = (prevIndex - 1 + totalIcons) % totalIcons;
			}
			activeIndex.value = prevIndex;
		}
		emit("update:activeIndex", activeIndex.value);
	}
};

const handleConfirm = () => {
	if (activeIndex.value !== -1 || props.isAnswering) {
		emit("confirm", activeIndex.value);
		if (!props.isAnswering) {
			activeIndex.value = -1; // 重置状态（仅在非答题模式下）
		}
	}
};

const handleBack = () => {
	emit("back");
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
	color: #1b5e20;
	background-color: rgba(129, 199, 132, 0.5);
	border: 2px solid #388e3c;
	box-shadow: 2px 2px 0px #2e7d32;
}
.control-button-overlay:active {
	transform: translate(1px, 1px);
	box-shadow: 1px 1px 0px #2e7d32;
}

.prev-button {
	top: 461px;
	left: 86px;
}
.next-button {
	top: 461px;
	left: 172px;
}
.a-button {
	top: 476px;
	left: 265px;
	background-color: rgba(239, 83, 80, 0.6);
	color: white;
}
.b-button {
	top: 460px;
	left: 354px;
	background-color: rgba(239, 83, 80, 0.6);
	color: white;
}
</style>
