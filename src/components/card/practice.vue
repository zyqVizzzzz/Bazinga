<template>
	<div class="practice-container">
		<!-- 当前问题部分 -->
		<div class="flex-grow py-4" v-if="currentPractice.length > 0">
			<p class="text-lg font-medium text-gray-800 mb-6">
				{{ currentPractice[currentIndex]?.question }}
			</p>

			<!-- 填空题部分 -->
			<div v-if="currentPractice[currentIndex]?.type === 'fill-in-the-blank'">
				<!-- Material 风格的输入框 -->
				<div class="relative mb-4">
					<input
						type="text"
						v-model="userAnswer"
						@keydown.enter="checkAnswer"
						:class="['input w-full', feedbackClass]"
						placeholder="Enter your answer"
						class="input border-none w-full shadow-lg rounded-md px-4 py-2 focus:outline-none focus:border-transparent focus:shadow-lg"
						style="text-align: center"
					/>
					<div
						v-if="feedbackClass === 'input-success'"
						class="absolute inset-y-0 right-0 flex items-center pr-3"
					>
						<YesIcon />
					</div>
					<div
						v-if="feedbackClass === 'input-error'"
						class="absolute inset-y-0 right-0 flex items-center pr-3"
						@click="resetInputs"
					>
						<NoIcon />
					</div>
				</div>
			</div>

			<!-- 答案反馈 -->
			<div v-if="answerFeedback" class="mt-4">
				<p>{{ answerFeedback }}</p>
			</div>
		</div>

		<!-- 按钮容器 -->
		<div
			class="button-group flex justify-center items-center space-x-16 fixed bottom-4 left-0 right-0 mx-auto"
		>
			<!-- Prev 按钮 -->
			<button
				class="btn-prev shadow-lg w-16 h-8 bg-white rounded-lg bg-white transition-transform transform hover:scale-105 focus:ring-2 focus:ring-primary focus:outline-none"
				@click="goToPreviousQuestion"
				:disabled="currentIndex === 0"
			>
				Prev
			</button>

			<!-- 中心的 Submit 按钮 -->
			<button
				class="btn btn-primary shadow-lg w-20 h-20 mt-6 mb-6 py-2 px-4 rounded-full transition-transform transform hover:scale-105 focus:ring-2 focus:ring-primary focus:outline-none"
				@click="checkAnswer"
			>
				<FlashIcon />
			</button>

			<!-- Next 按钮 -->
			<button
				class="btn-next shadow-lg w-16 h-8 bg-white rounded-lg transition-transform transform hover:scale-105 focus:ring-2 focus:ring-primary focus:outline-none"
				@click="goToNextQuestion"
				:disabled="currentIndex === currentPractice.length - 1"
			>
				Next
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import FlashIcon from "../icons/Flash.vue";
import YesIcon from "../icons/Yes.vue";
import NoIcon from "../icons/No.vue";

// 使用 defineProps 解构 props
const props = defineProps({
	currentPractice: Array, // 确保它是一个数组
	showHints: Boolean,
	currentKnowledgePoints: Array, // 根据实际数据结构设置
});

// 存储用户答案和反馈
const userAnswer = ref("");
const answerFeedback = ref("");
const feedbackClass = ref("");
const currentIndex = ref(0); // 当前问题的索引

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
	userAnswer.value = ""; // 清空用户的输入
	answerFeedback.value = ""; // 清空反馈信息
	feedbackClass.value = ""; // 重置反馈样式
};

// 检查答案
const checkAnswer = () => {
	const practice = props.currentPractice[currentIndex.value]; // 获取当前问题
	if (practice.type === "fill-in-the-blank") {
		const possibleAnswers = practice.answer
			.split("/")
			.map((ans) => ans.trim().toLowerCase());
		if (possibleAnswers.includes(userAnswer.value.trim().toLowerCase())) {
			answerFeedback.value = "Correct!!! 🎉";
			feedbackClass.value = "input-success"; // 给输入框绿色反馈
			setTimeout(() => {
				goToNextQuestion(); // 1秒后跳到下一题
			}, 1000);
		} else {
			answerFeedback.value = "Try again! ✨";
			feedbackClass.value = "input-error"; // 给输入框红色反馈
		}
	}
};
</script>
<style scoped>
/* 纵向flex布局 */
.practice-container {
	display: flex;
	flex-direction: column;
	justify-content: space-around; /* 垂直居中分布 */
	align-items: center;
	height: 100%; /* 占满可用高度 */
	padding: 20px;
}

.btn-prev,
.btn-next {
	box-shadow: 0 4px 10px rgba(0, 0, 255, 0.3); /* 蓝色阴影 */
}

.btn-submit {
	box-shadow: 0 4px 10px rgba(0, 0, 255, 0.5); /* 强烈的蓝色阴影 */
}

.input-success {
	border-color: green;
	background-color: #e6ffed;
}

.input-error {
	border-color: red;
	background-color: #ffe6e6;
}

.button-group {
	position: fixed;
	bottom: 4%;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
}
</style>
