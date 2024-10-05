<template>
	<div class="container mx-auto my-10 p-6">
		<!-- 顶部标题 -->
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-3xl font-bold text-primary">S01-E01</h1>
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
					class="card w-full bg-base-100 shadow-lg mb-6 h-100 overflow-y-auto"
					style="min-height: 500px"
				>
					<div class="card-body">
						<!-- 提示灯图标 -->
						<h2 class="card-title text-accent relative mb-5">
							{{ scene.title }}
							<div class="absolute right-0 cursor-pointer" @click="toggleTrans">
								<TransIcon :showTrans="showTrans" />
							</div>
							<div
								class="absolute right-20 cursor-pointer"
								@click="toggleHints"
								v-if="currentKnowledgePoints.length > 0"
							>
								<LightIcon :showHints="showHints" />
							</div>
							<div
								class="absolute right-10 cursor-pointer"
								@click="togglePractice"
								v-if="currentKnowledgePoints.length > 0"
							>
								<PracticeIcon :showPractice="showPractice" />
							</div>
						</h2>
						<!-- 卡片内容部分 -->
						<div
							class="card-content flex items-stretch"
							style="min-height: 400px"
						>
							<!-- 台词部分 -->
							<div
								:class="
									showHints && currentKnowledgePoints.length > 0
										? 'w-3/5'
										: 'w-full'
								"
								class="card-dialogue transition-all duration-500"
							>
								<p
									class="text-lg flex-col items-center justify-center items-center mt-8"
								>
									<img
										:src="currentDialogue.img"
										alt="Dialogue Image"
										class="text-sm font-cute mx-auto text-center"
										:class="
											showHints && currentKnowledgePoints.length > 0
												? 'w-1/3'
												: 'w-1/4'
										"
									/>
									<!-- Character 和 Emotion -->
								</p>
								<p
									v-if="currentDialogue.meta"
									class="text-sm font-cute w-2/3 mx-auto text-neutral-400 text-center"
								>
									<strong>{{ currentDialogue.meta.character + " " }}</strong>
									<span>{{ emotionEmoji }}</span>
								</p>

								<!-- 台词文本 -->
								<p
									class="text-lg mt-8 mb-4 font-cute w-4/5 mx-auto"
									v-html="highlightedText"
								></p>
								<p
									v-if="showTrans"
									class="china-font w-4/5 mx-auto text-sm italic text-neutral-400"
								>
									{{ currentDialogue.text_zh }}
								</p>
							</div>

							<!-- 知识点展示 -->
							<div
								v-if="showHints && currentKnowledgePoints.length > 0"
								class="card-knowledge w-2/5 ml-4 transition-all duration-300 border-l relative"
							>
								<KnowledgeCard
									:currentKnowledgePoints="currentKnowledgePoints"
									:showTrans="showTrans"
									@on-slide-change="handleSlideChange"
								/>
							</div>
						</div>

						<!-- 左右箭头按钮 -->
					</div>
				</div>
			</div>
		</transition>
		<div class="card-actions justify-between mt-4 w-1/5 mx-auto">
			<button
				class="transform btn btn-primary btn-ghost px-4"
				@click="prevDialogue"
				:disabled="currentDialogueIndex === 0"
			>
				<LeftArrowIcon class="w-6 h-6" />
			</button>
			<button
				class="transform btn btn-primary btn-ghost px-4"
				@click="nextDialogue"
				:disabled="currentDialogueIndex === dialogues.length - 1"
			>
				<RightArrowIcon class="w-6 h-6" />
			</button>
		</div>
		<!-- Practice 部分 -->
		<div
			v-if="showPractice && currentPractice.length > 0"
			class="card w-full bg-base-100 shadow-lg"
		>
			<div class="card-body">
				<h3 class="card-title text-secondary">Practice Question</h3>
				<p>{{ currentPractice[0]?.question }}</p>
				<div v-if="currentPractice[0]?.type === 'multiple-choice'">
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
				<div v-else-if="currentPractice[0]?.type === 'fill-in-the-blank'">
					<input
						type="text"
						v-model="userAnswer"
						placeholder="Your answer"
						class="input input-bordered w-full mb-4"
					/>
				</div>
				<button class="btn btn-primary" @click="checkAnswer">Submit</button>
				<div v-if="answerFeedback" class="mt-4">
					<p>{{ answerFeedback }}</p>
				</div>
			</div>
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
import KnowledgeCard from "../components/knowledge-card/index.vue";

const mySwiper = ref(null); // Swiper 实例
const pagination = {
	el: ".swiper-pagination", // 分页点的容器
	clickable: true, // 允许点击切换
};

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
	const response = await fetch("/constants/S01/E01.json");
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

const togglePractice = () => {
	showPractice.value = !showPractice.value;
};

// 获取当前台词
const currentDialogue = computed(() => {
	// 检查 dialogues 是否有内容
	return dialogues.value.length > 0
		? dialogues.value[currentDialogueIndex.value]
		: {};
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
		answerFeedback.value =
			userAnswer.value === practice.answer ? "Correct! 🎉" : "Try again! ✨";
	} else if (practice.type === "fill-in-the-blank") {
		answerFeedback.value =
			userAnswer.value.toLowerCase() === practice.answer.toLowerCase()
				? "Correct! 🎉"
				: "Try again! ✨";
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

// 动态标记下划线
const highlightedText = computed(() => {
	// 如果提示灯未开启，或者没有知识点，直接返回原始文本
	if (!showHints.value || currentKnowledgePoints.value.length === 0) {
		return currentDialogue.value.text;
	}

	let text = currentDialogue.value.text;

	// 当前知识点
	const currentPoint =
		currentKnowledgePoints.value[currentKnowledgeIndex.value];

	// 增加安全检查，确保 `currentPoint` 存在
	if (
		currentPoint &&
		currentPoint.name &&
		typeof currentPoint.name === "string" &&
		text.toLowerCase().includes(currentPoint.name.toLowerCase())
	) {
		const regex = new RegExp(`(${currentPoint.name})`, "gi"); // 使用正则表达式查找匹配，忽略大小写
		// 使用 <span> 包裹匹配项，添加下划线样式
		text = text.replace(regex, '<mark class="pink">$1</mark>');
	} else {
		return currentDialogue.value.text;
	}

	return text;
});
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
/* 添加下划线样式 */
span[style*="text-decoration: underline"] {
	text-decoration: underline;
	color: #fbbf24; /* 你可以自定义颜色 */
	font-weight: bold; /* 你可以自定义粗细 */
}
</style>
