<template>
	<div class="container mx-auto my-10 p-6">
		<!-- 顶部标题 -->
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-3xl font-bold text-primary">
				{{ scene.id }}-{{ currentDialogue.id }}
			</h1>
			<button class="btn btn-neutral-content" @click="goBack">Back</button>
		</div>

		<transition
			:name="
				!isFirstLoad
					? slideDirection === 'right'
						? 'fade-slide-right'
						: 'fade-slide-left'
					: ''
			"
			mode="out-in"
		>
			<!-- key 用于触发动画，确保每次对话内容变化时都会有动画效果 -->
			<div :key="currentDialogue.id">
				<div
					class="card w-full bg-base-100 shadow-lg mb-6 h-100 overflow-y-auto flip-container"
					:class="{ flipped: isFlipped }"
					style="min-height: 500px; height: auto"
				>
					<div class="card w-full h-full">
						<div class="front">
							<div class="card-body">
								<!-- 提示灯图标 -->
								<div
									class="card-title text-accent relative mb-5 w-full flex space-between"
								>
									{{ currentDialogue.title }}
									<div class="flex">
										<div class="cursor-pointer" @click="toggleTrans">
											<TransIcon :showTrans="showTrans" />
										</div>
										<div
											class="cursor-pointer"
											@click="toggleHints"
											v-if="currentKnowledgePoints.length > 0"
										>
											<LightIcon :showHints="showHints" />
										</div>
										<div
											class="cursor-pointer"
											@click="togglePractice"
											v-if="currentPractice.length > 0"
										>
											<PracticeIcon :showPractice="showPractice" />
										</div>
									</div>
								</div>
								<!-- 卡片内容部分 -->
								<div class="card-content flex items-stretch">
									<div
										:class="
											showHints && currentKnowledgePoints.length > 0
												? 'w-3/5'
												: 'w-full'
										"
										class="card-dialogue transition-all duration-500 flex items-start"
									>
										<!-- 图片部分 -->
										<ThumbnailCard
											:currentDialogue="currentDialogue"
											:showHints="showHints"
											:currentKnowledgePoints="currentKnowledgePoints"
										/>

										<!-- 台词文本 -->
										<DialogueCard
											:showHints="showHints"
											:currentKnowledgePoints="currentKnowledgePoints"
											:highlightedText="highlightedText"
										/>

										<p
											v-if="showTrans"
											class="china-font w-4/5 mx-auto text-sm italic text-neutral-400"
										>
											{{ currentDialogue.text_zh }}
										</p>
									</div>

									<!-- 知识点展示 -->
									<KnowledgeCard
										:showHints="showHints"
										:currentKnowledgePoints="currentKnowledgePoints"
										:showTrans="showTrans"
										@on-slide-change="handleSlideChange"
									/>
								</div>

								<!-- 左右箭头按钮 -->
							</div>
						</div>
						<div class="back" style="min-height: 500px">
							<!-- 背面：练习题 -->
							<div class="card-body flex flex-col h-full">
								<h2 class="card-title text-accent relative mb-5">
									{{ scene.title }}
									<div
										class="absolute right-0 cursor-pointer"
										@click="togglePractice"
										v-if="currentKnowledgePoints.length > 0"
									>
										<PracticeIcon :showPractice="showPractice" />
									</div>
								</h2>
								<!-- Practice 部分 -->
								<div class="flex-grow" v-if="currentPractice.length > 0">
									<p>{{ currentPractice[0]?.question }}</p>
									<div
										class="mt-8"
										v-if="currentPractice[0]?.type === 'multiple-choice'"
									>
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
								<button class="btn btn-primary mt-auto" @click="checkAnswer">
									Submit
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</transition>
		<div class="card-actions justify-between mt-4 w-1/5 mx-auto">
			<button
				class="transform btn btn-primary btn-ghost px-4"
				@click="prevDialogue"
				:disabled="isFlipped || currentDialogueIndex === 0"
			>
				<LeftArrowIcon class="w-6 h-6" />
			</button>
			<button
				class="transform btn btn-primary btn-ghost px-4"
				@click="nextDialogue"
				:disabled="isFlipped || currentDialogueIndex === dialogues.length - 1"
			>
				<RightArrowIcon class="w-6 h-6" />
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import LightIcon from "../components/icons/Light.vue";
import TransIcon from "../components/icons/Language.vue";
import PracticeIcon from "../components/icons/Practice.vue";
import LeftArrowIcon from "../components/icons/LeftArrow.vue";
import RightArrowIcon from "../components/icons/RightArrow.vue";
import KnowledgeCard from "../components/card/knowledge.vue";
import DialogueCard from "../components/card/dialogue.vue";
import ThumbnailCard from "../components/card/thumbnail.vue";

const router = useRouter();
const route = useRoute();
const lesson = ref("");

// 初始化 scene 和 dialogues
const dialoguesData = ref(null);
const scene = ref({});
const dialogues = ref([]);
const currentDialogueIndex = ref(0);

// 在组件挂载时，确保数据加载正确
onMounted(async () => {
	const response = await fetch("/constants/S01/E01New.json");
	if (response.ok) {
		dialoguesData.value = await response.json();
		if (dialoguesData.value.scenes && dialoguesData.value.scenes.length > 0) {
			scene.value = dialoguesData.value.scenes[0];
			dialogues.value = scene.value.dialogues || [];
		}
	} else {
		console.error("Failed to load JSON file.");
	}
});

// 控制 Tabs 显示状态
const showHints = ref(false);
const showPractice = ref(false);
const showTrans = ref(false);

// 切换显示 Tabs 的状态
const toggleHints = () => {
	showHints.value = !showHints.value;
};

const toggleTrans = () => {
	showTrans.value = !showTrans.value;
};

// 获取当前台词
const currentDialogue = computed(() => {
	// 检查 dialogues 是否有内容
	return dialogues.value.length > 0
		? dialogues.value[currentDialogueIndex.value]
		: {};
});

const highlightedText = computed(() => {
	// 获取当前的台词内容
	let text = currentDialogue.value.text;

	try {
		// 检查 text 是否为有效的 JSON 数组
		const parsedText = Array.isArray(text) ? text : JSON.parse(text);

		// 逐条处理台词
		return parsedText.map(([speaker, line]) => {
			// 检查是否为 narration
			const isNarration = speaker.toLowerCase().includes("narration");

			// 检查是否需要高亮当前台词中的知识点
			let processedLine = line;
			const currentPoint =
				currentKnowledgePoints.value[currentKnowledgeIndex.value];

			if (
				showHints.value &&
				currentPoint &&
				currentPoint.word &&
				typeof currentPoint.word === "string"
			) {
				const regex = new RegExp(`(${currentPoint.word})`, "gi");
				processedLine = processedLine.replace(
					regex,
					'<mark class="pink">$1</mark>'
				);
			}

			// 返回每句台词，带上角色名或处理 narration
			return { speaker, line: processedLine, isNarration };
		});
	} catch (error) {
		console.error("Failed to parse dialogue array:", error);
		return [];
	}
});

// 区分动画方向
const slideDirection = ref("right");
const isFirstLoad = ref(true); // 只有在第一次点击箭头的时候才会载入动画，避免第一张图片出现动画
// 导航台词
const nextDialogue = () => {
	if (currentDialogueIndex.value < dialogues.value.length - 1) {
		slideDirection.value = "right"; // 设置方向为向右
		currentDialogueIndex.value++;
		isFirstLoad.value = false;
		resetKnowledgeIndex(); // 重置知识点索引
	}
};

const prevDialogue = () => {
	if (currentDialogueIndex.value > 0) {
		slideDirection.value = "left"; // 设置方向为向左
		currentDialogueIndex.value--;
		resetKnowledgeIndex(); // 重置知识点索引
	}
};

// 重置知识点索引方法
const resetKnowledgeIndex = () => {
	// 确保 `currentKnowledgePoints` 已更新
	currentKnowledgeIndex.value = 0;
};

// 动态获取当前台词的知识点
const currentKnowledgePoints = computed(() => {
	// 确保 currentDialogue 有效并存在 knowledge
	return currentDialogue.value.knowledge || [];
});

// 动态获取当前台词的练习题
const currentPractice = computed(() => {
	return currentDialogue.value.practice || [];
});

// 存储用户答案和反馈
const userAnswer = ref("");
const answerFeedback = ref("");

// 检查答案
const checkAnswer = () => {
	const practice = currentPractice.value[0];
	if (practice.type === "multiple-choice") {
		if (userAnswer.value === practice.answer) {
			answerFeedback.value = "Bazinga!!! 🎉";
			setTimeout(() => {
				togglePractice();
			}, 1000);
		} else {
			answerFeedback.value = "Try again! ✨";
		}
	} else if (practice.type === "fill-in-the-blank") {
		if (userAnswer.value.toLowerCase() === practice.answer.toLowerCase()) {
			answerFeedback.value = "Bazinga!!! 🎉";
			setTimeout(() => {
				togglePractice();
			}, 1000);
		} else {
			answerFeedback.value = "Try again! ✨";
		}
	}
};

// 返回上一页
const goBack = () => {
	router.push("/");
};

const emotionEmoji = computed(() => {
	if (!currentDialogue.value.meta) return "";
	const emotion = currentDialogue.value.meta.emotion;
	switch (emotion) {
		case "proud":
			return "😌"; // Proud emoji
		case "happy":
			return "😊"; // Happy emoji
		case "sad":
			return "😢"; // Sad emoji
		case "angry":
			return "😠"; // Angry emoji
		case "excited":
			return "😆"; // Excited emoji
		case "confused":
			return "😕"; // Confused emoji
		case "playful":
			return "😜"; // Playful emoji
		// 其他情感对应的表情符号
		default:
			return ""; // 默认情况下不显示表情符号
	}
});

// 当前知识点卡片索引
const currentKnowledgeIndex = ref(0);

const handleSlideChange = (data) => {
	currentKnowledgeIndex.value = data;
};

/** 翻转卡片 */
const isFlipped = ref(false);
const togglePractice = () => {
	// 切换翻转状态
	isFlipped.value = !isFlipped.value;
	// 如果翻转到背面，显示练习题
	showPractice.value = isFlipped.value;
	userAnswer.value = "";
	answerFeedback.value = "";
};
</script>
<style scoped>
/* 右箭头 - 当前卡片向左滑出，下一张渐显 */
.fade-slide-right-enter-active,
.fade-slide-right-leave-active {
	transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
}

.fade-slide-right-enter-from {
	transform: translateX(30%);
	opacity: 0;
}

.fade-slide-right-enter-to {
	transform: translateX(0);
	opacity: 1;
}

.fade-slide-right-leave-from {
	transform: translateX(0);
	opacity: 1;
}

.fade-slide-right-leave-to {
	transform: translateX(-30%);
	opacity: 0;
}

/* 左箭头 - 当前卡片从左侧滑入，下一张渐隐 */
.fade-slide-left-enter-active,
.fade-slide-left-leave-active {
	transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
}

.fade-slide-left-enter-from {
	transform: translateX(-30%);
	opacity: 0;
}

.fade-slide-left-enter-to {
	transform: translateX(0);
	opacity: 1;
}

.fade-slide-left-leave-from {
	transform: translateX(0);
	opacity: 1;
}

.fade-slide-left-leave-to {
	transform: translateX(30%);
	opacity: 0;
}
.flip-container {
	perspective: 1000px;
}

.card {
	width: 100%;
	height: 100%;
	position: relative;
	transform-style: preserve-3d;
	transition: transform 0.8s ease-in-out;
}

.flip-container.flipped .card {
	transform: rotateY(180deg);
}

.front,
.back {
	backface-visibility: hidden;
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
}

.front {
	transform: rotateY(0deg);
	z-index: 2;
}

.back {
	transform: rotateY(180deg);
	z-index: 1;
}
</style>
