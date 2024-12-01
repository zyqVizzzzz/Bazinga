<template>
	<div class="scroll-container" ref="praticeContainerRef">
		<div class="space-y-6">
			<div class="terminal-prompt my-4 text-left relative">
				<span class="text-accent">@PRATICE</span>
				<span class="text-accent mr-2">:</span>
				<span class="text-gray-400">~/episode/{{ props.currentPage }}</span>
				<span class="text-gray-400">$</span>
				<span class="text-gray-200 ml-2"
					>run {{ currentPractice.conversation_id }}.sh</span
				>
				<button
					v-if="displayedDialogues.length > 1 || showContinueButton"
					@click="handleRetry"
					class="ml-2 status-badge px-6 py-2 hover:bg-primary/20 absolute"
					style="right: 0; top: 50%; transform: translateY(-50%)"
				>
					<i class="bi bi-arrow-counterclockwise"></i>
				</button>
			</div>

			<!-- 对话历史 -->
			<div class="space-y-4">
				<div
					v-for="(dialogue, index) in displayedDialogues"
					:key="index"
					class="log-item"
					:class="{
						'animate-fade-in': index === displayedDialogues.length - 1,
					}"
				>
					<div class="flex items-start gap-3">
						<div class="w-[60px] text-accent text-center">
							{{ dialogue.character }}
						</div>
						<div class="flex-1">
							<div class="text-gray-100">
								<template
									v-if="
										dialogue.has_exercise &&
										index === displayedDialogues.length - 1
									"
								>
									<template v-if="!isCurrentDialogueCompleted">
										{{ getUncompletedText(dialogue.english) }}
									</template>
									<template v-else>
										<ProcessedText
											:text="dialogue.english"
											:answers="getAnswersForDialogue(dialogue)"
											:dialogue-index="index"
											:is-finished="isFinished"
											:has-exercise="dialogue.has_exercise"
											@toggle-explanation="toggleExplanation(index)"
										/>
									</template>
								</template>
								<template v-else>
									<ProcessedText
										:text="dialogue.english"
										:answers="getAnswersForDialogue(dialogue)"
										:dialogue-index="index"
										:is-finished="isFinished"
										:has-exercise="dialogue.has_exercise"
										@toggle-explanation="toggleExplanation(index)"
									/>
								</template>
							</div>
							<div class="text-gray-400 text-sm mt-1">
								{{ dialogue.chinese }}
							</div>
						</div>
					</div>

					<div
						v-if="shownExplanations[index]"
						class="mt-4 p-4 rounded bg-green-500/10 border-l-4 border-green-500"
					>
						<div class="text-gray-400 text-sm">
							{{ dialogue.explanation }}
						</div>
					</div>

					<!-- Exercise Section -->
					<div
						v-if="
							dialogue.has_exercise &&
							index === displayedDialogues.length - 1 &&
							!exerciseCompleted
						"
						class="mt-6 border-t border-accent/30 pt-6"
					>
						<!-- Options Grid -->
						<div class="grid grid-cols-2 gap-3">
							<button
								v-for="(option, optIndex) in dialogue.options"
								:key="optIndex"
								@click="selectOption(optIndex)"
								:class="[
									'text-left px-4 py-2 transition-colors duration-200',
									'border-2 border-accent/30 hover:border-accent/50',
									{
										'border-green-500/50 bg-green-500/10':
											selectedOption === optIndex &&
											feedbackClass === 'input-success',
										'border-red-500/50 bg-red-500/10':
											selectedOption === optIndex &&
											feedbackClass === 'input-error',
									},
								]"
							>
								<div class="flex items-start gap-2 py-2">
									<span class="text-accent w-4 text-sm"
										>{{ optIndex + 1 }})</span
									>
									<div class="flex-1 min-w-0">
										<div class="text-gray-100 text-sm">
											{{ option.text.split(" / ").join(" / ") }}
										</div>
										<div
											v-if="showTranslation"
											class="text-gray-400 text-sm mt-1"
										>
											{{ option.translation }}
										</div>
									</div>
								</div>
							</button>
						</div>

						<!-- Exercise Feedback -->
						<div
							v-if="answerFeedback"
							class="mt-4 p-4 rounded"
							:class="{
								'bg-green-500/10 border-l-4 border-green-500':
									feedbackClass === 'input-success',
								'bg-red-500/10 border-l-4 border-red-500':
									feedbackClass === 'input-error',
							}"
						>
							<span
								:class="{
									'text-green-500': feedbackClass === 'input-success',
									'text-red-500': feedbackClass === 'input-error',
								}"
							>
								{{ answerFeedback }}
							</span>
							<div
								v-if="feedbackClass === 'input-success'"
								class="text-gray-400 text-sm mt-2"
							>
								{{ currentExercise?.explanation }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Continue Button -->
			<div class="mt-8">
				<div v-if="exerciseCompleted && !isFinished">
					<div
						class="mt-4 mb-6 p-4 rounded bg-green-500/10 border-l-4 border-green-500"
					>
						<div class="text-gray-400 text-sm">
							{{ currentExercise?.explanation }}
						</div>
					</div>
				</div>

				<div class="flex justify-center">
					<button
						v-if="showContinueButton && !isFinished"
						@click="handleContinue"
						class="status-badge px-6 py-2 hover:bg-primary/20"
						:class="{ 'animate-pulse': submitClicked }"
					>
						{{ continueButtonText }}
					</button>
					<button
						v-if="answerFeedback && feedbackClass === 'input-error'"
						@click="toggleTranslation"
						class="ml-2 status-badge px-6 py-2 hover:bg-primary/20"
					>
						<i class="bi bi-translate"></i>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { showToast } from "@/components/common/toast.js";
import apiClient from "@/api";
import { useRoute } from "vue-router";
import ProcessedText from "@/components/card/processedText.vue";

const props = defineProps({
	currentPractice: {
		type: Object,
		required: true,
	},
	currentPage: {
		type: Number,
		required: true,
	},
});

const route = useRoute();

// State Management
const currentDialogueIndex = ref(0);
const displayedDialogues = ref([]);
const selectedOption = ref(null);
const answerFeedback = ref("");
const feedbackClass = ref("");
const submitClicked = ref(false);
const exerciseCompleted = ref(false);
const showTranslation = ref(false);

const praticeContainerRef = ref(null);

const toggleTranslation = () => {
	showTranslation.value = !showTranslation.value;
	scrollToBottom();
};

// Computed Properties
const currentExercise = computed(() => {
	const currentDialogue =
		props.currentPractice.dialogues[currentDialogueIndex.value];
	return currentDialogue;
});

const continueButtonText = computed(() => {
	if (
		currentDialogueIndex.value >=
		props.currentPractice.dialogues.length - 1
	) {
		return "FINISH";
	}
	return "CONTINUE";
});

const isCurrentDialogueCompleted = computed(() => {
	return exerciseCompleted.value;
});

const isFinished = ref(false);

const showContinueButton = computed(() => {
	const currentDialogue =
		props.currentPractice.dialogues[currentDialogueIndex.value];
	if (currentDialogue?.has_exercise && !exerciseCompleted.value) {
		return false;
	}
	return true;
});

// 保存处理后的对话
const processedDialogues = ref([]);
// 未完成状态的处理函数
const getUncompletedText = (english) => {
	return english.replace(/\[[\?]\]/g, "_____");
};

// 完成状态的处理函数
const getProcessedText = (english, answersText) => {
	if (!english.includes("[?]")) {
		return english;
	}

	const selectedAnswers = answersText.split(" / ");
	let result = english;
	const matches = result.match(/\[[\?]\]/g) || [];

	matches.forEach((match, index) => {
		if (index < selectedAnswers.length) {
			const answer = selectedAnswers[index];
			const underlinedText = `<span class="border-b-2 border-accent/10 inline-block hover:bg-accent/10 transition-all relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-accent/50 after:blur-[1px]" @click="
						isFinished && dialogue.has_exercise && toggleExplanation(index)
					">${answer}</span>`;
			result = result.replace("[?]", underlinedText);
		}
	});

	return result;
};

const shownExplanations = ref({});

const toggleExplanation = (index) => {
	console.log(index);
	if (!shownExplanations.value[index]) {
		shownExplanations.value[index] = true;
	} else {
		shownExplanations.value[index] = false;
	}
};

const getAnswersForDialogue = (dialogue) => {
	if (!dialogue.has_exercise) return [];
	const correctOption = dialogue.options.find((opt) => opt.is_correct);
	return correctOption ? correctOption.text.split(" / ") : [];
};

const handleRetry = () => {
	currentDialogueIndex.value = 0;
	displayedDialogues.value = [props.currentPractice.dialogues[0]];
	selectedOption.value = null;
	answerFeedback.value = "";
	feedbackClass.value = "";
	exerciseCompleted.value = false;
	submitClicked.value = false;
	processedDialogues.value = [];
	isFinished.value = false;
	showTranslation.value = false; // 也重置翻译状态
};

onMounted(async () => {
	await getPracticeStatus();
	displayedDialogues.value = [props.currentPractice.dialogues[0]];
});

const selectOption = (index) => {
	selectedOption.value = index;
	checkAnswer();
	scrollToBottom();
};

const scrollToBottom = () => {
	if (praticeContainerRef.value) {
		setTimeout(() => {
			const container = praticeContainerRef.value;
			container.scrollTop = container.scrollHeight;
		}, 100);
	}
};

const checkAnswer = () => {
	const currentDialogue =
		props.currentPractice.dialogues[currentDialogueIndex.value];
	const selectedAnswer = currentDialogue.options[selectedOption.value];

	if (selectedAnswer.is_correct) {
		feedbackClass.value = "input-success";
		answerFeedback.value = "Excellent! 🌟";
		exerciseCompleted.value = true;
		submitClicked.value = true;

		if (currentDialogue.has_exercise) {
			const processedText = getProcessedText(
				currentDialogue.english,
				selectedAnswer.text
			);
			processedDialogues.value[currentDialogueIndex.value] = {
				processedText,
				completed: true,
			};
		}

		setTimeout(() => {
			submitClicked.value = false;
		}, 1000);
	} else {
		feedbackClass.value = "input-error";
		answerFeedback.value = "Try again! ✨";
	}
};

const getPracticeStatus = async () => {
	try {
		const res = await apiClient.get("/exercises", {
			params: {
				catalogId: route.params.id,
				lessonId: route.query.sign,
				sceneId: "Scene" + props.currentPage,
			},
		});

		if (res.data.data?.completed) {
			setCompletedState();
		} else {
			displayedDialogues.value = [props.currentPractice.dialogues[0]];
		}
	} catch (error) {
		console.error("Error in getPracticeStatus:", error);
		displayedDialogues.value = [props.currentPractice.dialogues[0]];
	}
};

// 处理完成状态
const setCompletedState = () => {
	// 先确保清空当前状态
	displayedDialogues.value = [];
	processedDialogues.value = [];
	shownExplanations.value = {};

	// 使用 nextTick 确保状态清空后再设置新状态
	nextTick(() => {
		// 初始化处理后的对话数组
		processedDialogues.value = props.currentPractice.dialogues.map(
			(dialogue) => {
				if (dialogue.has_exercise) {
					const correctOption = dialogue.options.find((opt) => opt.is_correct);
					if (correctOption) {
						return {
							processedText: getProcessedText(
								dialogue.english,
								correctOption.text
							),
							completed: true,
						};
					}
				}
				return null;
			}
		);

		props.currentPractice.dialogues.forEach((_, index) => {
			shownExplanations.value[index] = false;
		});

		// 设置显示的对话
		displayedDialogues.value = props.currentPractice.dialogues;

		// 设置其他状态
		currentDialogueIndex.value = props.currentPractice.dialogues.length - 1;
		exerciseCompleted.value = true;
		isFinished.value = true;

		// 设置最后一个对话的练习状态
		const lastDialogue =
			props.currentPractice.dialogues[currentDialogueIndex.value];
		if (lastDialogue?.has_exercise) {
			const correctOptionIndex = lastDialogue.options.findIndex(
				(opt) => opt.is_correct
			);
			if (correctOptionIndex !== -1) {
				selectedOption.value = correctOptionIndex;
				feedbackClass.value = "input-success";
				answerFeedback.value = "Excellent! 🌟";
			}
		}
	});
};

const handleContinue = async () => {
	console.log(currentDialogueIndex.value);
	if (
		currentDialogueIndex.value >=
		props.currentPractice.dialogues.length - 1
	) {
		const res = await apiClient.post("/exercises", {
			catalogId: route.params.id,
			lessonId: route.query.sign,
			sceneId: "Scene" + props.currentPage,
		});
		if (res.data.code === 200) {
			showToast({
				message: "数据碎片：+5",
				disc: "请继续前行...",
				type: "success",
			});
			isFinished.value = true;
		}
		return;
	}

	const currentDialogue =
		props.currentPractice.dialogues[currentDialogueIndex.value];

	if (currentDialogue.has_exercise && !exerciseCompleted.value) {
		checkAnswer();
		scrollToBottom();
		return;
	}

	currentDialogueIndex.value++;
	displayedDialogues.value = props.currentPractice.dialogues.slice(
		0,
		currentDialogueIndex.value + 1
	);

	console.log(
		currentDialogueIndex.value,
		props.currentPractice.dialogues.length - 1
	);

	selectedOption.value = null;
	answerFeedback.value = "";
	feedbackClass.value = "";
	exerciseCompleted.value = false;
	scrollToBottom();
};
</script>

<style scoped>
.scroll-container {
	position: relative;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding: 0 20px 40px 20px;
	position: relative;
	z-index: 3;
	height: 0;
	-webkit-overflow-scrolling: touch;
	scroll-behavior: smooth;
}

.log-item {
	padding: 1rem;
	border-radius: 4px;
	background: rgba(var(--accent-color-rgb), 0.03);
	border-left: 3px solid var(--accent-color);
	text-shadow: 0 0 8px rgba(var(--accent-color-rgb), 0.4);
}

.status-badge {
	background: rgba(51, 255, 51, 0.1);
	border: 1px solid var(--accent-color);
	color: var(--accent-color);
	text-shadow: 0 0 8px rgba(var(--accent-color-rgb), 0.4);
	padding: 0.25rem 0.75rem;
	border-radius: 4px;
}

.animate-pulse {
	animation: terminal-pulse 1s ease-in-out infinite;
}

.animate-fade-in {
	animation: fadeIn 0.5s ease-out forwards;
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

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
