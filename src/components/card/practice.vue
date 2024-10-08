<template>
	<div class="flex-grow" v-if="currentPractice.length > 0">
		<p>{{ currentPractice[0]?.question }}</p>
		<div class="mt-8" v-if="currentPractice[0]?.type === 'multiple-choice'">
			<div
				v-for="(option, index) in currentPractice[0].options"
				:key="index"
				class="form-control"
			>
				<label class="label cursor-pointer">
					<input
						type="radio"
						:value="option"
						v-model="userAnswer"
						class="radio radio-primary"
					/>
					<span class="label-text ml-2">{{ option }}</span>
				</label>
			</div>
		</div>
		<div
			class="mt-8"
			v-else-if="currentPractice[0]?.type === 'fill-in-the-blank'"
		>
			<input
				type="text"
				v-model="userAnswer"
				placeholder="Your answer"
				class="input input-bordered w-full mb-4"
			/>
		</div>

		<div v-if="answerFeedback" class="mt-4">
			<p>{{ answerFeedback }}</p>
		</div>
	</div>
	<button class="btn btn-primary mt-auto" @click="checkAnswer">Submit</button>
</template>

<script setup>
import { ref } from "vue";

// 使用 defineProps 解构 props
const props = defineProps({
	currentPractice: Array, // 确保它是一个数组
	showHints: Boolean,
	currentKnowledgePoints: Array, // 根据实际数据结构设置
});

// 存储用户答案和反馈
const userAnswer = ref("");
const answerFeedback = ref("");

// 检查答案
const checkAnswer = () => {
	// 直接访问 props，而不是 ref
	const practice = props.currentPractice[0];
	if (practice.type === "multiple-choice") {
		if (userAnswer.value === practice.answer) {
			answerFeedback.value = "Bazinga!!! 🎉";
		} else {
			answerFeedback.value = "Try again! ✨";
		}
	} else if (practice.type === "fill-in-the-blank") {
		if (userAnswer.value.toLowerCase() === practice.answer.toLowerCase()) {
			answerFeedback.value = "Bazinga!!! 🎉";
		} else {
			answerFeedback.value = "Try again! ✨";
		}
	}
};
</script>
