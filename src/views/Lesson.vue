<template>
	<div class="container mx-auto my-10 p-6">
		<!-- 顶部标题 -->
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-3xl font-bold text-primary">S01-E01</h1>
			<button class="btn btn-secondary" @click="goBack">Back</button>
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
							<div
								class="absolute right-0 cursor-pointer"
								@click="toggleHints"
								v-if="currentKnowledgePoints.length > 0"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									:stroke="showHints ? '#fcd34d' : '#9ca3af'"
									class="w-6 h-6 transition-colors duration-300"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
									/>
								</svg>
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
								class="card-dialogue transition-all duration-300"
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
								<p class="text-lg my-8 font-cute w-2/3 mx-auto">
									{{ currentDialogue.text }}
								</p>
							</div>

							<!-- 知识点部分 -->
							<div
								v-if="showHints && currentKnowledgePoints.length > 0"
								class="card-knowledge w-2/5 ml-4 transition-all duration-300 border-l"
							>
								<div
									class="card w-2/3 bg-base-100 shadow-lg mb-4 h-full mx-auto"
								>
									<div class="card-body">
										<h3 class="card-title text-secondary justify-center">
											{{ currentKnowledgePoints[0].name }}
										</h3>
										<p>{{ currentKnowledgePoints[0].desc }}</p>
										<button
											class="btn btn-sm btn-outline btn-primary"
											@click="addNote(currentKnowledgePoints[0])"
										>
											Save to Notebook
										</button>
									</div>
								</div>
							</div>
						</div>

						<!-- 左右箭头按钮 -->
						<div class="card-actions justify-between mt-4">
							<!-- Prev 按钮 - 左箭头 -->
							<button
								class="absolute left-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost"
								@click="prevDialogue"
								:disabled="currentDialogueIndex.value === 0"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>

							<!-- Next 按钮 - 右箭头 -->
							<button
								class="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost"
								@click="nextDialogue"
								:disabled="currentDialogueIndex.value === dialogues.length - 1"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</transition>

		<!-- Tabs 部分 -->
		<div
			v-if="showHints && currentKnowledgePoints.length > 0"
			class="tabs mb-6"
		>
			<a
				href="#"
				class="tab tab-bordered"
				:class="{ 'tab-active': activeTab === 'knowledge' }"
				@click.prevent="activeTab = 'knowledge'"
			>
				Knowledge Points
			</a>
			<a
				href="#"
				class="tab tab-bordered"
				:class="{ 'tab-active': activeTab === 'practice' }"
				@click.prevent="activeTab = 'practice'"
			>
				Practice
			</a>
		</div>

		<!-- Knowledge Card 展示 -->
		<div
			v-if="
				showHints &&
				activeTab === 'knowledge' &&
				currentKnowledgePoints.length > 0
			"
			class="grid grid-cols-1 md:grid-cols-2 gap-4"
		>
			<div
				v-for="(point, index) in currentKnowledgePoints"
				:key="index"
				class="card bg-base-100 shadow-lg"
			>
				<div class="card-body">
					<h3 class="card-title text-secondary justify-center">
						{{ point.name }}
					</h3>
					<p>{{ point.desc }}</p>
					<button
						class="btn btn-sm btn-outline btn-primary"
						@click="addNote(point)"
					>
						Save to Notebook
					</button>
				</div>
			</div>
		</div>

		<!-- Practice 部分 -->
		<div
			v-if="showHints && activeTab === 'practice' && currentPractice.length > 0"
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

// 切换显示 Tabs 的状态
const toggleHints = () => {
	showHints.value = !showHints.value;
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
	}
};

const prevDialogue = () => {
	if (currentDialogueIndex.value > 0) {
		slideDirection.value = "left"; // 设置方向为向左
		currentDialogueIndex.value--;
	}
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

// 添加到笔记本
const addNote = (point) => {
	// 将知识点添加到用户的笔记本中
	console.log("Added to notebook:", point);
};

// Tab 切换
const activeTab = ref("knowledge");

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
</style>
