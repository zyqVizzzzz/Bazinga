<template>
	<div>
		<!-- 答案反馈 -->
		<div
			v-if="
				answerFeedback &&
				currentPractice[currentIndex]?.type === 'fill-in-the-blank'
			"
			class="log-item mt-4 absolute top-0 right-[2rem]"
			style="min-width: 200px"
			:class="{
				'border-l-green-500': feedbackClass === 'input-success',
				'border-l-red-500 bg-red-500/10': feedbackClass === 'input-error',
			}"
		>
			<span class="text-gray-400 mr-2">> </span>
			<span
				:class="{
					'text-green-500': feedbackClass === 'input-success',
					'text-red-500': feedbackClass === 'input-error',
				}"
				>{{ answerFeedback }}</span
			>
		</div>

		<!-- 选择题反馈 -->
		<div
			v-if="
				answerFeedback &&
				currentPractice[currentIndex]?.type === 'multiple-choice'
			"
			class="log-item mt-4 absolute top-0 right-[2rem]"
			style="min-width: 200px; max-width: 400px"
			:class="{
				'border-l-green-500': feedbackClass === 'input-success',
				'border-l-red-500 bg-red-500/10': feedbackClass === 'input-error',
			}"
		>
			<span class="text-gray-400">> </span>
			<span
				:class="{
					'text-green-500': feedbackClass === 'input-success',
					'text-red-500': feedbackClass === 'input-error',
				}"
			>
				{{ answerFeedback }}
				<span
					v-if="
						feedbackClass === 'input-success' &&
						currentPractice[currentIndex].explanation
					"
					class="ml-2 text-gray-400 text-sm"
				>
					{{ currentPractice[currentIndex].explanation_zh }}</span
				>
			</span>
		</div>

		<!-- 练习内容区 -->
		<div v-if="currentPractice.length > 0" class="space-y-6">
			<!-- 问题显示 -->
			<div class="log-item">
				<div class="flex items-center justify-center gap-3 mb-2">
					<div class="w-[50px]">$ ???</div>
					<div class="text-gray-100">
						{{ currentPractice[currentIndex]?.question }}
					</div>
				</div>
				<!-- 中文提示 -->
				<div class="text-gray-400 text-sm mt-2 text-center">
					{{ currentPractice[currentIndex]?.question_zh }}
				</div>
			</div>

			<!-- 答题区域 -->
			<div
				v-if="currentPractice[currentIndex]?.type === 'fill-in-the-blank'"
				class="mt-8"
			>
				<div class="terminal-prompt mb-2 text-center">
					<span class="text-accent">$</span>
					<span class="text-accent ml-2">input answer:</span>
				</div>
				<div class="relative">
					<input
						ref="inputRef"
						type="text"
						v-model="userAnswer"
						@keydown.enter="checkAnswer"
						class="w-full bg-transparent border-2 border-accent/30 px-4 py-2 text-gray-100 text-center focus:border-accent/50 outline-none"
						:class="{
							'border-green-500/50 bg-green-500/10 ':
								feedbackClass === 'input-success',
							'border-red-500/50 bg-red-500/10':
								feedbackClass === 'input-error',
						}"
						placeholder=""
					/>
				</div>
			</div>
			<!-- 选择题答题区域 -->
			<div
				v-if="currentPractice[currentIndex]?.type === 'multiple-choice'"
				class="mt-8"
			>
				<div class="terminal-prompt mb-2 text-center">
					<span class="text-accent">$</span>
					<span class="text-accent ml-2"
						>select option [1-{{
							currentPractice[currentIndex].options.length
						}}]:</span
					>
				</div>

				<!-- 选项列表 -->
				<div class="grid grid-cols-2 gap-3">
					<button
						v-for="(option, index) in currentPractice[currentIndex].options"
						:key="index"
						@click="selectOption(index)"
						:class="[
							'text-left px-4 py-2 transition-colors duration-200',
							'border-2 border-accent/30 hover:border-accent/50',
							{
								'border-green-500/50 bg-green-500/10':
									selectedOption === index && feedbackClass === 'input-success',
								'border-red-500/50 bg-red-500/10':
									selectedOption === index && feedbackClass === 'input-error',
							},
						]"
					>
						<div class="flex items-start gap-2 py-2">
							<span class="text-accent w-4 text-sm">{{ index + 1 }})</span>
							<div class="flex-1 min-w-0">
								<div class="text-gray-100 truncate text-sm">
									{{ option.text }}
								</div>
								<div
									class="text-gray-400 text-sm mt-1 truncate"
									v-if="feedbackClass === 'input-success'"
								>
									{{ option.text_zh }}
								</div>
							</div>
						</div>
					</button>
				</div>
			</div>
		</div>

		<!-- 控制按钮区 -->
		<div class="mt-8 flex justify-center items-center space-x-12">
			<button
				v-if="showPrevNext"
				@click="goToPreviousQuestion"
				:disabled="currentIndex === 0"
				class="status-badge hover:bg-primary/20 transition-all transform animate-prev"
			>
				&lt;&lt; PREV
			</button>

			<button
				@click="checkAnswer"
				class="status-badge px-6 py-2 hover:bg-primary/20"
				:class="{ 'animate-pulse': submitClicked }"
			>
				SUBMIT
			</button>

			<button
				v-if="showPrevNext && currentIndex !== currentPractice.length - 1"
				@click="goToNextQuestion"
				:disabled="currentIndex === currentPractice.length - 1"
				class="status-badge hover:bg-primary/20 transition-all transform animate-next"
			>
				NEXT &gt;&gt;
			</button>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import FlashIcon from "../icons/Flash.vue";

const inputRef = ref(null);
onMounted(() => {
	inputRef.value?.focus();
});

// 使用 defineProps 解构 props
const props = defineProps({
	currentPractice: Array, // 确保它是一个数组
	showHints: Boolean,
	currentKnowledgePoints: Array, // 根据实际数据结构设置
});

// 控制按钮显示的状态
const showPrevNext = ref(false);
const submitClicked = ref(false);

// 存储用户答案和反馈
const userAnswer = ref("");
const answerFeedback = ref("");
const feedbackClass = ref("");
const currentIndex = ref(0); // 当前问题的索引

// 添加选择题相关的状态
const selectedOption = ref(null);

// 切换到上一题的函数
const goToPreviousQuestion = () => {
	if (currentIndex.value > 0) {
		currentIndex.value--; // 切换到上一题
		resetInputs();
	}
};

// 切换到下一题的函数
const goToNextQuestion = () => {
	if (currentIndex.value < props.currentPractice.length - 1) {
		currentIndex.value++; // 切换到下一题
		resetInputs();
	}
};

// 重置输入框和反馈
const resetInputs = () => {
	userAnswer.value = "";
	answerFeedback.value = "";
	feedbackClass.value = "";
	showPrevNext.value = false;
	selectedOption.value = null; // 重置选中的选项
};

// 检查答案
const checkAnswer = () => {
	const practice = props.currentPractice[currentIndex.value];

	if (practice.type === "fill-in-the-blank") {
		// 保持原有的填空题逻辑
		const possibleAnswers = practice.answer
			.split("/")
			.map((ans) => ans.trim().toLowerCase());
		if (possibleAnswers.includes(userAnswer.value.trim().toLowerCase())) {
			feedbackClass.value = "input-success";
			answerFeedback.value = "Bazinga!";
			submitClicked.value = true;
			setTimeout(() => {
				showPrevNext.value = true;
				submitClicked.value = false;
			}, 1000);
		} else {
			answerFeedback.value = "Try again! ✨";
			feedbackClass.value = "input-error";
		}
	} else if (practice.type === "multiple-choice") {
		if (selectedOption.value !== null) {
			const isCorrect = practice.options[selectedOption.value].isCorrect;
			if (isCorrect) {
				feedbackClass.value = "input-success";
				answerFeedback.value = "Bazinga!";
				submitClicked.value = true;
				setTimeout(() => {
					showPrevNext.value = true;
					submitClicked.value = false;
				}, 1000);
			} else {
				answerFeedback.value = "Try again! ✨";
				feedbackClass.value = "input-error";
			}
		}
	}
};

const selectOption = (index) => {
	selectedOption.value = index;
	checkAnswer();
};
</script>
<style scoped>
.log-item {
	padding: 1rem;
	border-radius: 4px;
	background: rgba(var(--accent-color-rgb), 0.03);
	border-left: 3px solid var(--accent-color);
	text-shadow: 0 0 8px rgba(var(--accent-color-rgb), 0.4);
}

.border-l-red-500 {
	border-left-color: rgb(239 68 68 / var(--tw-border-opacity));
}
.border-l-green-500 {
	border-left-color: rgb(var(--accent-color-rgb) / var(--tw-border-opacity));
}

.status-badge {
	background: rgba(51, 255, 51, 0.1);
	border: 1px solid var(--accent-color);
	color: var(--accent-color);
	text-shadow: 0 0 8px rgba(var(--accent-color-rgb), 0.4);
	padding: 0.25rem 0.75rem;
	border-radius: 4px;
}

/* Prev按钮和Next按钮从中间弹射出来的动画 */
.animate-prev {
	animation: slideOutLeft 0.8s ease forwards;
}

.animate-next {
	animation: slideOutRight 0.8s ease forwards;
}

@keyframes slideOutLeft {
	0% {
		transform: translateX(50%);
		opacity: 0;
	}
	100% {
		transform: translateX(0);
		opacity: 1;
	}
}

@keyframes slideOutRight {
	0% {
		transform: translateX(-50%);
		opacity: 0;
	}
	100% {
		transform: translateX(0);
		opacity: 1;
	}
}

@keyframes terminal-pulse {
	0%,
	100% {
		opacity: 1;
		text-shadow: 0 0 8px rgba(51, 255, 51, 0.1);
	}
	50% {
		opacity: 0.7;
		text-shadow: 0 0 12px rgba(51, 255, 51, 0.6);
	}
}

.animate-pulse {
	animation: terminal-pulse 1s ease-in-out infinite;
}
</style>
