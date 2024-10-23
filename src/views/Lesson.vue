<template>
	<div class="container mx-auto my-10 p-6">
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
			<div :key="currentDialogue.id" class="relative">
				<div
					class="card w-full bg-base-100 shadow-lg mb-6 h-100 overflow-y-auto flip-container"
					:class="{ flipped: isFlipped }"
					style="min-height: 500px; height: auto"
					:style="
						!isListenMode
							? 'box-shadow: 0px 8px 10px rgba(0,0,0, 0.2)'
							: 'box-shadow: 0px 8px 10px rgba(var(--primary-color-rgb), 0.2);'
					"
				>
					<div class="card w-full h-full">
						<div class="front">
							<div class="card-body relative">
								<!-- 卡片标题 -->
								<TitleBar
									:isFlipped="isFlipped"
									:title="currentDialogue.title"
									:id="currentDialogue.id"
									:showPractice="showPractice"
									:currentPractice="currentPractice"
									@on-toggle-practice="togglePractice"
								/>

								<!-- 卡片内容部分 -->
								<div class="card-content flex items-stretch">
									<!-- 听力胶囊 -->
									<div
										class="w-2/6 flex flex-col items-center p-4"
										v-if="!showHints"
									>
										<SpeakingCapsule :thumbnail="currentDialogue.img" />
									</div>
									<!-- 台词 -->
									<div
										:class="{
											'w-4/6': showHints,
											'w-full': !showHints,
										}"
										class="transition-all duration-500"
									>
										<DialogueCard
											ref="dialogueCard"
											:showHints="showHints"
											:showTrans="showTrans"
											:currentKnowledgePoints="currentKnowledgePoints"
											:highlightedText="highlightedText"
											:highlightedTextZh="highlightedTextZh"
										/>
									</div>
									<!-- 知识点胶囊 -->
									<div
										v-if="!showHints"
										class="w-1/6 flex flex-col items-center px-4 py-2"
									>
										<ReadingCapsule @toggleHints="toggleHints" />
									</div>

									<!-- 知识点卡片 -->
									<KnowledgeCard
										:showHints="showHints"
										:currentKnowledgePoints="currentKnowledgePoints"
										:showTrans="showTrans"
										@on-toggle-hints="toggleHints"
										@on-slide-change="handleSlideChange"
									/>
								</div>
							</div>
						</div>
						<div class="back" style="min-height: 500px">
							<!-- 背面：练习题 -->
							<div class="card-body flex flex-col h-full">
								<TitleBar
									:isFlipped="isFlipped"
									:title="currentDialogue.title"
									:showPractice="showPractice"
									:currentPractice="currentPractice"
									@on-toggle-practice="togglePractice"
								/>
								<!-- Practice 部分 -->
								<PracticeCard
									:currentPractice="currentPractice"
									:showHints="showHints"
									:currentKnowledgePoints="currentKnowledgePoints"
								/>
							</div>
						</div>
					</div>
				</div>
				<div
					v-if="!isFlipped"
					class="text-xs text-center mt-3 trans-capsule shadow-md absolute"
					:style="{
						opacity: isHovered ? 1 : 0.5,
					}"
					@mouseenter="isHovered = true"
					@mouseleave="isHovered = false"
				>
					<span
						@click="toggleTrans"
						class="cursor-pointer"
						:class="showTrans ? 'text-gray-400' : 'font-bold'"
						>英</span
					>
					/
					<span
						@click="toggleTrans"
						class="cursor-pointer"
						:class="!showTrans ? 'text-gray-400' : 'font-bold'"
						>译</span
					>
				</div>
			</div>
		</transition>
		<!-- 左右箭头按钮 -->
		<div
			v-if="!isFlipped"
			class="card-actions justify-between mt-4 w-1/5 mx-auto"
		>
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

import LeftArrowIcon from "@/components/icons/LeftArrow.vue";
import RightArrowIcon from "@/components/icons/RightArrow.vue";

import TitleBar from "@/components/card/title.vue";
import KnowledgeCard from "@/components/card/knowledge.vue";
import DialogueCard from "@/components/card/dialogue.vue";
import PracticeCard from "@/components/card/practice.vue";
import SpeakingCapsule from "@/components/capsule/Speaking.vue";
import ReadingCapsule from "@/components/capsule/Reading.vue";

import { useLessonStore } from "@/store";

const lessonStore = useLessonStore();
const isListenMode = ref(false);

const router = useRouter();
const route = useRoute();

const isHovered = ref(false);
// 初始化 scene 和 dialogues
const dialoguesData = ref(null);
const scene = ref({});
const dialogues = ref([]);
const currentDialogueIndex = ref(0); // 当前台词卡片索引
const currentKnowledgeIndex = ref(0); // 当前知识点卡片索引

const slideDirection = ref("right"); // 动画方向
const isFirstLoad = ref(true); // 只有在第一次点击箭头的时候才会载入动画，避免第一张图片出现动画
const isFlipped = ref(false); // 是否翻转卡片

// 控制子卡片显示状态
const showHints = ref(false);
const showPractice = ref(false);
const showTrans = ref(false);

const dialogueCard = ref(null); // 获取 DialogueCard 实例

// 在组件挂载时，确保数据加载正确
onMounted(async () => {
	const courseId = route.params.id; // 比如 'simpsons'
	const season = route.params.season; // 比如 'S01'
	const episode = route.params.episode; // 比如 'E01'
	const response = await fetch(
		`/constants/${courseId}/${season}/${episode}.json`
	);
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

watch(
	() => lessonStore.isListenMode, // 监控 isListenMode 的状态变化
	(newVal) => {
		if (newVal) {
			isListenMode.value = newVal;
			console.log("Listen mode is activated");
		} else {
			isListenMode.value = newVal;
			console.log("Listen mode is deactivated");
		}
	}
);

// 切换显示 Tabs 的状态
const toggleHints = () => {
	showHints.value = !showHints.value;
};

const toggleTrans = () => {
	showTrans.value = !showTrans.value;
};

const togglePractice = () => {
	// 切换翻转状态
	isFlipped.value = !isFlipped.value;
	// 如果翻转到背面，显示练习题
	showPractice.value = isFlipped.value;
};

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
	currentKnowledgeIndex.value = 0;
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
	let text = currentDialogue.value.text || [["", ""]];

	try {
		// 检查 text 是否为有效的 JSON 数组
		const parsedText = Array.isArray(text) ? text : JSON.parse(text);

		let wordMatched = false; // 用于标记知识点是否已经匹配

		// 逐条处理台词
		return parsedText.map(([speaker, line]) => {
			// 检查是否为 narration
			const isNarration = speaker.toLowerCase().includes("narration");

			// 检查是否需要高亮当前台词中的知识点
			let processedLine = line;
			const currentPoint =
				currentKnowledgePoints.value[currentKnowledgeIndex.value];

			// 如果提示灯开启且当前知识点存在，且没有匹配到知识点
			if (
				showHints.value &&
				currentPoint &&
				currentPoint.word &&
				typeof currentPoint.word === "string" &&
				!wordMatched // 确保知识点尚未匹配过
			) {
				// 构建正则表达式，仅匹配第一个单词
				const regex = new RegExp(`(${currentPoint.word})`, "i");

				// 使用回调函数确保只替换第一个匹配项
				processedLine = processedLine.replace(regex, (match) => {
					wordMatched = true; // 确保匹配后设置为 true，防止后续匹配
					return `<mark class="pink">${match}</mark>`;
				});
			}

			// 返回每句台词，带上角色名或处理 narration
			return { speaker, line: processedLine, isNarration };
		});
	} catch (error) {
		console.error("Failed to parse dialogue array:", error);
		return [];
	}
});

const highlightedTextZh = computed(() => {
	let textZh = currentDialogue.value.text_zh || [["", ""]];

	try {
		const parsedTextZh = textZh;

		return parsedTextZh.map(([speaker, line]) => {
			const isNarration = speaker.toLowerCase().includes("narration");

			return { speaker, line, isNarration };
		});
	} catch (error) {
		console.error("Failed to parse dialogue translation array:", error);
		return [];
	}
});

// 动态获取当前台词的知识点
const currentKnowledgePoints = computed(() => {
	// 确保 currentDialogue 有效并存在 knowledge
	return currentDialogue.value.knowledge || [];
});

// 动态获取当前台词的练习题
const currentPractice = computed(() => {
	return currentDialogue.value.practice || [];
});

const handleSlideChange = (data) => {
	currentKnowledgeIndex.value = data;
	const currentWord = currentKnowledgePoints.value[data].word;
	// 调用 DialogueCard 组件中的 scrollToWord 方法
	dialogueCard.value.scrollToWord(currentWord); // 调用子组件方法
};
</script>
<style scoped>
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

.trans-capsule {
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 12px; /* 等效于 py-4 */
	transition: opacity 0.3s ease, border-radius 0.3s ease; /* 添加过渡效果 */
	cursor: pointer;
	border-color: transparent; /* 初始状态下隐藏边框 */
	width: 90px;
	height: 20px;
	margin: 8px auto 0;
	border-radius: 20px;
	/* border: 2px solid rgba(var(--orange-color-rgb), 0.3); */
	/* box-shadow: 0 2px 4px rgba(var(--orange-color-rgb), 0.3); */
	bottom: 18px;
	left: 50%;
	transform: translateX(-50%);
}
</style>
