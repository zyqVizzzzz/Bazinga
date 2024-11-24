<template>
	<div class="scroll-container" ref="praticeContainerRef">
		<div class="space-y-6">
			<div class="terminal-prompt my-4 text-left">
				<span class="text-accent"
					>{{ currentPractice.conversation_id }}@PRATICE</span
				>
				<span class="text-accent mr-2">:</span>
				<span class="text-gray-400">~/episode/{{ props.currentPage }}</span>
				<span class="text-gray-400">$</span>
				<span class="text-gray-200 ml-2"
					>run {{ currentPractice.theme }}.sh</span
				>
			</div>
			<!-- Setting Description -->
			<div v-if="currentPractice" class="log-item log-item-gray text-left mb-4">
				<div class="text-gray-400 mb-2">
					{{ currentPractice.setting }}
					<span
						class="ml-4 cursor-pointer"
						@click="() => (showSetting_zh = !showSetting_zh)"
						><i class="bi bi-translate"></i
					></span>
				</div>
				<div v-if="showSetting_zh" class="text-gray-400 text-sm">
					{{ currentPractice.setting_zh }}
				</div>
			</div>

			<!-- Dialogue History -->
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
							<!-- <img
								src="./zfh8.png"
								alt=""
								style="width: 50px; opacity: 0.5; border-radius: 25px"
							/> -->
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
										{{ dialogue.english_blank }}
									</template>
									<template v-else>
										<span
											v-html="
												processedDialogues[index]?.processedText ||
												dialogue.english
											"
										></span>
									</template>
								</template>
								<template v-else>
									<span
										v-html="
											processedDialogues[index]?.processedText ||
											dialogue.english
										"
									></span>
								</template>
							</div>
							<div class="text-gray-400 text-sm mt-1">
								{{ dialogue.chinese }}
							</div>
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
						<div class="text-center mb-6">
							<div class="text-gray-100 mb-2">
								{{ dialogue.exercise.question }}
							</div>
							<div
								class="flex items-center justify-center gap-2 text-sm text-gray-400"
							>
								<span class="cursor-pointer" @click="showQuestionTranslate"
									><i class="bi bi-translate"></i
								></span>
								<span
									class="cursor-pointer"
									@click="showExerciseHint = !showExerciseHint"
									><i class="bi bi-lightbulb"></i
								></span>
								<span v-if="showExerciseHint">{{
									dialogue.exercise.hint_cn
								}}</span>
							</div>
						</div>

						<!-- Options Grid -->
						<div class="grid grid-cols-2 gap-3">
							<button
								v-for="(option, optIndex) in dialogue.exercise.options"
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
										<div class="text-gray-100 text-sm">{{ option.text }}</div>
										<div
											v-if="showQuestion_zh"
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
								v-if="feedbackClass === 'input-error'"
								class="text-gray-400 text-sm mt-2"
							>
								{{ currentExercise?.options[selectedOption]?.explanation_zh }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Continue Button -->
			<div class="mt-8 flex justify-center">
				<button
					v-if="showContinueButton"
					@click="handleContinue"
					class="status-badge px-6 py-2 hover:bg-primary/20"
					:class="{ 'animate-pulse': submitClicked }"
				>
					{{ continueButtonText }}
				</button>
				<button
					@click="handleRetry"
					class="ml-2 status-badge px-6 py-2 hover:bg-primary/20"
				>
					<i class="bi bi-arrow-counterclockwise"></i> RETRY
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

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

// State Management
const currentDialogueIndex = ref(0);
const displayedDialogues = ref([]);
const selectedOption = ref(null);
const answerFeedback = ref("");
const feedbackClass = ref("");
const submitClicked = ref(false);
const exerciseCompleted = ref(false);

const showSetting_zh = ref(false);
const showExerciseHint = ref(false);
const showQuestion_zh = ref(false);

const showQuestionTranslate = () => {
	showQuestion_zh.value = !showQuestion_zh.value;
	scrollToBottom();
};

const praticeContainerRef = ref(null);

// Computed Properties
const currentExercise = computed(() => {
	const currentDialogue =
		props.currentPractice.dialogues[currentDialogueIndex.value];
	return currentDialogue?.exercise;
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

const isFinished = computed(() => {
	return (
		currentDialogueIndex.value >= props.currentPractice.dialogues.length - 1
	);
});

// 计算是否显示按钮
const showContinueButton = computed(() => {
	const currentDialogue =
		props.currentPractice.dialogues[currentDialogueIndex.value];
	// 如果当前对话有练习且未完成，则不显示按钮
	if (currentDialogue?.has_exercise && !exerciseCompleted.value) {
		return false;
	}
	return true;
});

// 保存处理后的对话
const processedDialogues = ref([]);
const getProcessedText = (english, englishBlank) => {
	// 如果没有空白，直接返回原文
	if (!englishBlank.includes("_____")) {
		return english;
	}

	let displayText = english;
	const blankParts = englishBlank.split("_____");

	// 对于每个空白部分
	for (let i = 0; i < blankParts.length - 1; i++) {
		let startText = blankParts[i];
		let endText = blankParts[i + 1];

		// 处理开始文本
		startText = startText.trim();
		// 处理结束文本
		endText = endText.trim();

		// 在原文中找到对应位置
		let startIndex = 0;
		let endIndex = displayText.length;

		if (startText) {
			startIndex = displayText.indexOf(startText) + startText.length;
		}

		if (endText) {
			endIndex = displayText.indexOf(endText, startIndex);
			if (endIndex === -1) endIndex = displayText.length;
		}

		// 获取需要加下划线的文本
		let textToUnderline = displayText.substring(startIndex, endIndex).trim();

		// 创建带下划线的文本
		const underlinedText = `<span class="border-b-2 border-accent/10 inline-block hover:bg-accent/10 transition-all relative after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-accent/50 after:blur-[1px]">${textToUnderline}</span>`;

		// 替换原文中的对应部分
		displayText = displayText.replace(textToUnderline, underlinedText);
	}

	return displayText;
};

// Add to existing methods
const handleRetry = () => {
	currentDialogueIndex.value = 0;
	displayedDialogues.value = [props.currentPractice.dialogues[0]];
	selectedOption.value = null;
	answerFeedback.value = "";
	feedbackClass.value = "";
	exerciseCompleted.value = false;
	submitClicked.value = false;
	processedDialogues.value = []; // 重置处理后的对话
};

onMounted(() => {
	// Initialize first dialogue
	displayedDialogues.value = [props.currentPractice.dialogues[0]];
});

// Methods
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
		}, 100); // Small delay to ensure content is rendered
	}
};

const showExplanation = ref(false);
const checkAnswer = () => {
	const currentDialogue =
		props.currentPractice.dialogues[currentDialogueIndex.value];
	const selectedAnswer = currentDialogue.exercise.options[selectedOption.value];

	if (selectedAnswer.is_correct) {
		feedbackClass.value = "input-success";
		answerFeedback.value = "Excellent! 🌟";
		exerciseCompleted.value = true;
		showExplanation.value = true; // 显示解释
		submitClicked.value = true;

		if (currentDialogue.has_exercise) {
			const processedText = getProcessedText(
				currentDialogue.english,
				currentDialogue.english_blank
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

const handleContinue = () => {
	if (
		currentDialogueIndex.value >=
		props.currentPractice.dialogues.length - 1
	) {
		// Handle completion
		return;
	}

	const currentDialogue =
		props.currentPractice.dialogues[currentDialogueIndex.value];

	if (currentDialogue.has_exercise && !exerciseCompleted.value) {
		checkAnswer();
		scrollToBottom();
		return;
	}

	// Move to next dialogue
	currentDialogueIndex.value++;
	displayedDialogues.value = props.currentPractice.dialogues.slice(
		0,
		currentDialogueIndex.value + 1
	);

	// Reset exercise state
	selectedOption.value = null;
	answerFeedback.value = "";
	feedbackClass.value = "";
	exerciseCompleted.value = false;
	scrollToBottom();

	console.log(processedDialogues.value);
};
</script>

<style scoped>
.scroll-container {
	position: relative;
	height: 100%; /* 确保有高度 */
	display: flex;
	flex-direction: column;
	overflow: hidden;
	flex: 1;
	min-height: 0; /* 关键：允许flex子项收缩 */
	overflow-y: auto;
	padding: 0 20px 40px 20px;
	position: relative;
	z-index: 3;
	height: 0; /* 强制使用flex-grow */
	-webkit-overflow-scrolling: touch;
	scroll-behavior: smooth;
}
.practice-container {
	height: 100%;
	overflow-y: auto;
	padding: 1rem;
}

.practice-content {
	min-height: min-content;
}
.log-item {
	padding: 1rem;
	border-radius: 4px;
	background: rgba(var(--accent-color-rgb), 0.03);
	border-left: 3px solid var(--accent-color);
	text-shadow: 0 0 8px rgba(var(--accent-color-rgb), 0.4);
}
.log-item-gray {
	padding: 1rem;
	border-radius: 4px;
	background: rgba(var(--accent-color-rgb), 0.03);
	border-left: 3px solid rgba(172, 171, 171, 0.8);
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

@keyframes neonPulse {
	0%,
	100% {
		border-color: rgb(var(--color-accent));
		box-shadow: 0 0 5px rgba(var(--color-accent), 0.3),
			0 0 10px rgba(var(--color-accent), 0.1);
	}
	50% {
		border-color: rgb(var(--color-accent) / 0.3);
		box-shadow: 0 0 10px rgba(var(--color-accent), 0.2),
			0 0 20px rgba(var(--color-accent), 0.3),
			0 0 30px rgba(var(--color-accent), 0.1);
	}
}

.neon-underline {
	border-bottom: 2px solid rgb(var(--color-accent));
	/* animation: neonPulse 5s infinite; */
	position: relative;
}

.neon-underline::after {
	content: "";
	position: absolute;
	bottom: -2px;
	left: 0;
	width: 100%;
	height: 2px;
	background-color: rgb(var(--color-accent));
	filter: blur(2px);
	opacity: 0.7;
}
</style>
