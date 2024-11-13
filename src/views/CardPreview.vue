<template>
	<div class="container mx-auto my-10 py-6">
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
				<!-- 主卡片容器 -->
				<div class="scene">
					<div
						class="card w-full bg-base-100 border-4 border-black manga-card"
						:class="{ flipped: isFlipped, 'box-shadow-back': isFlipped }"
					>
						<!-- 正面内容 -->
						<div class="front">
							<div
								v-if="isLoading"
								class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
							>
								<span class="loading loading-bars"></span>
							</div>
							<div v-if="!isLoading">
								<div
									class="absolute top-0 right-0 w-16 h-16 bg-primary/10 rotate-45 translate-x-8 -translate-y-8"
								></div>
								<div
									class="absolute bottom-0 left-0 w-16 h-16 bg-secondary/10 -rotate-45 -translate-x-8 translate-y-8"
								></div>
								<div class="card-body relative">
									<!-- 标题栏 -->
									<div class="flex justify-between items-center mb-4">
										<h2
											class="card-title font-bold -skew-x-6 text-2xl text-shadow"
										>
											{{ currentDialogue.title }}
										</h2>
										<div class="flex items-center gap-2">
											<span class="badge badge-primary badge-outline rotate-2">
												Episode {{ currentPage }}
											</span>
										</div>
									</div>

									<!-- 主要内容区域 -->
									<div class="card-content flex items-stretch relative">
										<div class="w-4/6 transition-all duration-500">
											<div
												class="p-4 bg-white border-2 border-black rounded-lg relative dialogue-box"
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
										</div>

										<!-- 知识点卡片 -->
										<KnowledgeCard
											v-if="isKnowledgeReady"
											class="w-2/6 border-2 border-black rounded-lg knowledge-box"
											style="background-color: var(--milk-color)"
											:showHints="showHints"
											:currentKnowledgePoints="currentKnowledgePoints"
											:currentCustomNotes="
												customNotes[currentDialogueIndex + 1] || []
											"
											:currentDialogueIndex="currentDialogueIndex"
											:resourceId="episodeId"
											@on-slide-change="handleSlideChange"
											@update-note="handleUpdateNote"
										/>
									</div>
								</div>
							</div>
						</div>

						<!-- 背面内容 -->
						<div class="back" v-if="!isLoading">
							<div class="card-body h-full">
								<!-- 标题 -->
								<div class="terminal-title text-left">
									<div class="terminal-header">
										<span class="terminal-dot red relative top-[2px]"></span>
										<span class="terminal-dot yellow relative top-[2px]"></span>
										<span class="terminal-dot green relative top-[2px]"></span>
										<span class="terminal-title-text">trust_terminal.exe</span>
									</div>
								</div>
								<!-- 终端容器 -->
								<div class="retro-terminal">
									<div class="terminal-face">
										<div class="terminal-prompt mb-6">
											<span class="text-accent">student@PRATICE</span>
											<span class="text-accent mr-2">:</span>
											<span class="text-gray-400"
												>~/episode/{{ currentPage }}</span
											>
											<span class="text-gray-400">$</span>
											<span class="text-gray-200 ml-2"
												>run {{ currentDialogue.title }}.sh</span
											>
										</div>
										<PracticeCard
											v-if="currentPractice.length"
											:currentPractice="currentPractice"
											:showHints="showHints"
											:currentKnowledgePoints="currentKnowledgePoints"
											class="h-full practice-box"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex justify-between items-center">
					<!-- 控制按钮组 -->
					<div class="flex justify-center gap-6 mt-6">
						<button
							class="retro-btn option"
							:class="{ 'btn-active': isListenMode }"
							@click="toggleListenMode"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face flex items-center justify-center">
										<i class="bi bi-headphones text-xl"></i>
									</div>
								</div>
							</div>
						</button>

						<button
							class="retro-btn option"
							:class="{ 'btn-active': showTrans }"
							@click="toggleTransMode"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face flex items-center justify-center">
										<i class="bi bi-translate text-xl"></i>
									</div>
								</div>
							</div>
						</button>

						<button
							class="retro-btn option"
							:class="{ 'btn-active': isFlipped }"
							@click="togglePracticeMode"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face flex items-center justify-center">
										<i class="bi bi-joystick text-xl"></i>
									</div>
								</div>
							</div>
						</button>

						<button class="retro-btn option" @click="editCard">
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face flex items-center justify-center">
										<i class="bi bi-pencil-square text-xl"></i>
									</div>
								</div>
							</div>
						</button>
					</div>

					<!-- 翻页控制器 -->
					<div class="flex justify-center items-center gap-6 mt-4">
						<button
							class="retro-btn"
							@click="prevDialogue"
							:disabled="currentDialogueIndex === 0"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face flex items-center justify-center">
										<span class="text-2xl transform -translate-y-0.5"
											>&#x27E8;</span
										>
									</div>
								</div>
							</div>
						</button>

						<div class="retro-display">
							<div class="display-shadow">
								<div class="display-edge">
									<div class="display-face">
										<input
											v-if="isEditPage"
											type="text"
											ref="editPageRef"
											v-model.number="currentPage"
											class="retro-input"
											@blur="jumpToPageBlur(false)"
											@keydown.enter="jumpToPage"
											:min="1"
											:max="totalPages"
										/>
										<span
											v-else
											@click="jumpToPageBlur(true)"
											class="retro-text"
										>
											{{ currentPage }} / {{ totalPages }}
										</span>
									</div>
								</div>
							</div>
						</div>

						<button
							class="retro-btn"
							@click="nextDialogue"
							:disabled="currentDialogueIndex === dialogues.length - 1"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face flex items-center justify-center">
										<span class="text-2xl transform -translate-y-0.5"
											>&#x27E9;</span
										>
									</div>
								</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLessonStore, useAppStore } from "@/store";
import apiClient from "@/api";

import TitleBar from "@/components/card/title.vue";
import KnowledgeCard from "@/components/card/knowledge.vue";
import DialogueCard from "@/components/card/dialogue.vue";
import PracticeCard from "@/components/card/practice.vue";
import { showToast } from "@/components/common/toast.js";

const lessonStore = useLessonStore();
const appStore = useAppStore();
const router = useRouter();
const route = useRoute();

const dialoguesData = ref(null); // 初始化 scene 和 dialogues
const scene = ref({});
const dialogues = ref([]);
const currentDialogueIndex = ref(0); // 当前台词卡片索引
const currentKnowledgeIndex = ref(0); // 当前知识点卡片索引
const customNotes = ref({});

const slideDirection = ref("right"); // 动画方向
const isFirstLoad = ref(true); // 只有在第一次点击箭头的时候才会载入动画，避免第一张图片出现动画
const isFlipped = ref(false); // 是否翻转卡片

// 控制子卡片显示状态
const showHints = ref(true);
const showTrans = ref(false);

const dialogueCard = ref(null); // 获取 DialogueCard 实例
const episodeId = ref("");

// 页码相关
const currentPage = ref(1);
const totalPages = ref(0);
const isEditPage = ref(false);
const editPageRef = ref(null);
const editCurrentPageNumber = ref(0); // 跳转页码

const isDefault = ref(true);
const isListenMode = ref(false);
const isHoveredJ = ref(false);
const isHoveredVoice = ref(false);
const isHoveredTrans = ref(false);

const isLoading = ref(true);

// 获取课程
const getLesson = async () => {
	try {
		const scriptRes = await apiClient.get(
			`/scripts/episode/${route.query.sign}`
		);

		if (scriptRes.data.code === 200) {
			const res = await scriptRes.data.data;
			dialoguesData.value = res.scriptData;

			if (dialoguesData.value.scenes && dialoguesData.value.scenes.length > 0) {
				scene.value = dialoguesData.value.scenes[0];
				dialogues.value = scene.value.dialogues || [];
				episodeId.value = route.query.sign;
				totalPages.value = dialogues.value.length;

				// 使用 Promise.all 等待所有数据加载完成
				const [knowledgeSuccess] = await Promise.all([
					getKnowledge(),
					getVocabulary(),
				]);

				setTimeout(() => {
					isLoading.value = false;
				}, 1500);

				if (!knowledgeSuccess) {
					throw new Error("Failed to load knowledge data");
				}

				if (route.query.progress) {
					progressJumpToPage();
				}
			} else {
				throw new Error("No scenes found in script");
			}
		} else {
			throw new Error(scriptRes.data.message || "Invalid lesson data");
		}
	} catch (error) {
		console.error("Error loading lesson:", error);
		showToast({
			message: "加载失败，请刷新页面重试",
			type: "error",
		});
	}
};

// 获取用户的词库 & 匹配用户单词本里的单词
const getVocabulary = async () => {
	try {
		const res = await apiClient.get(`/lesson-notes/${episodeId.value}`);
		if (res.data.code === 200) {
			if (res.data.data.statusCode === 404) return;
			const notes = res.data.data.notes;
			const categorizedNotes = {};
			// 根据 scene 进行分类
			notes.forEach((note) => {
				const scene = note.scene;
				if (!categorizedNotes[scene]) {
					categorizedNotes[scene] = [];
				}
				categorizedNotes[scene].push(note);
			});

			customNotes.value = categorizedNotes;
		} else {
			showToast({
				message: res.data.message,
				type: "error",
			});
		}
	} catch (error) {
		console.error("Error fetching vocabulary:", error);
	}
};

const knowledges = ref([]);
// 获取知识点
const getKnowledge = async () => {
	try {
		const res = await apiClient.get(`/knowledge`, {
			params: { catalogId: route.params.id, lessonId: route.query.sign },
		});

		if (res.data.code === 200 && Array.isArray(res.data.data)) {
			knowledges.value = res.data.data;
			return true;
		} else {
			throw new Error("Knowledge data is invalid");
		}
	} catch (error) {
		console.error("Error fetching knowledge:", error);
		knowledges.value = [];
		return false;
	}
};

// 追踪知识点数据是否准备就绪
const isKnowledgeReady = computed(() => {
	return (
		knowledges.value &&
		Array.isArray(knowledges.value) &&
		knowledges.value.length > 0 &&
		currentDialogueIndex.value < knowledges.value.length &&
		knowledges.value[currentDialogueIndex.value]?.knowledge
	);
});

// 获取当前台词
const currentDialogue = computed(() => {
	return dialogues.value.length > 0
		? dialogues.value[currentDialogueIndex.value]
		: {};
});

// 获取当前台词的知识点
const currentKnowledgePoints = computed(() => {
	if (
		!knowledges.value ||
		!knowledges.value.length ||
		currentDialogueIndex.value >= knowledges.value.length
	) {
		return [];
	}
	return knowledges.value[currentDialogueIndex.value]?.knowledge || [];
});

// 动态获取当前台词的练习题
const currentPractice = computed(() => {
	if (
		!knowledges.value ||
		!knowledges.value.length ||
		currentDialogueIndex.value >= knowledges.value.length
	) {
		return [];
	}
	return knowledges.value[currentDialogueIndex.value]?.practice || [];
});

// 从已保存进度开始
const progressJumpToPage = () => {
	const progress = appStore.progressList.find(
		(p) => p.course === route.params.id
	);
	currentPage.value = parseInt(progress.page);
	jumpToPage();
};

// 编辑卡片
const editCard = () => {
	const courseId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const sign = route.query.sign;
	router.replace({
		path: `/card-editor/${courseId}/${season}/${episode}`,
		query: {
			sign: sign,
		},
	});
};

// 在组件挂载时，确保数据加载正确
onMounted(async () => {
	if (route.params.id !== "67230dee6fc3d389ea1ffedf") {
		isDefault.value = false;
	}
	isLoading.value = true;
	await getLesson();
});

const toggleTransMode = () => {
	showTrans.value = !showTrans.value;
};

const togglePracticeMode = () => {
	isFlipped.value = !isFlipped.value;
};

const toggleListenMode = async () => {
	lessonStore.setListenMode();
};

const saveProgress = async () => {
	const course = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const page = currentPage.value;
	const sign = route.query.sign;

	appStore.saveProgress(course, season, episode, page, sign);
	try {
		const response = await apiClient.post("/users/me/update", {
			learningProgress: appStore.progressList,
		});
		if (response.data.code === 200) {
			showToast({
				message: "进度保存成功",
				type: "success",
			});
		} else {
			showToast({
				message: response.data.message,
				type: "error",
			});
		}
	} catch (error) {
		console.error(error);
	}
};

// 高亮知识点相关台词
const highlightedText = computed(() => {
	let text = currentDialogue.value.text || [["", ""]];

	try {
		const parsedText = Array.isArray(text) ? text : JSON.parse(text);
		let wordMatched = false;
		return parsedText.map(([speaker, line]) => {
			const isNarration = speaker.toLowerCase().includes("narration");

			let processedLine = line;
			const currentPoint =
				currentKnowledgePoints.value[currentKnowledgeIndex.value];

			// 如果提示灯开启且当前知识点存在，且没有匹配到知识点
			if (
				showHints.value &&
				currentPoint &&
				currentPoint.word &&
				typeof currentPoint.origin === "string" &&
				!wordMatched // 确保知识点尚未匹配过
			) {
				// 对知识点中的标点符号进行转义，允许任意标点符号替换
				const sanitizedWord = currentPoint.origin.replace(/([.?!,])/g, "\\$1");
				const regex = new RegExp(sanitizedWord, "i");

				// 确保只替换第一个匹配项
				processedLine = processedLine.replace(regex, (match) => {
					wordMatched = true;
					return `<mark class="pink">${match}</mark>`;
				});
			}

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

const handleSlideChange = (data) => {
	currentKnowledgeIndex.value = data;
	const currentWord = currentKnowledgePoints.value[data].origin;
	dialogueCard.value.scrollToWord(currentWord);
};

const handleUpdateNote = ({ note, word, action, scene }) => {
	if (!customNotes.value[scene]) {
		customNotes.value[scene] = [];
	}
	if (action === "add") {
		customNotes.value[scene].push(note);
	} else if (action === "remove") {
		customNotes.value[scene] = customNotes.value[scene].filter(
			(n) => n.word !== word
		);
	}
};

// 监听对话索引变化，更新当前页码
watch(currentDialogueIndex, (newIndex) => {
	currentPage.value = newIndex + 1;
});

watch(
	() => lessonStore.isListenMode,
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

watch(
	knowledges,
	(newValue) => {
		if (!newValue || newValue.length === 0) {
			console.warn("Knowledge data is empty or invalid");
		}
	},
	{ deep: true }
);

const nextDialogue = () => {
	if (currentDialogueIndex.value < dialogues.value.length - 1) {
		slideDirection.value = "right";
		currentDialogueIndex.value++;
		isFirstLoad.value = false;
		resetKnowledgeIndex();
	}
};

const prevDialogue = () => {
	if (currentDialogueIndex.value > 0) {
		slideDirection.value = "left";
		currentDialogueIndex.value--;
		resetKnowledgeIndex();
	}
};

// 重置知识点索引方法
const resetKnowledgeIndex = () => {
	currentKnowledgeIndex.value = 0;
};

// 跳转页码（enter）
const jumpToPage = () => {
	const page = currentPage.value;
	if (page >= 1 && page <= dialogues.value.length) {
		currentDialogueIndex.value = page - 1;
		isEditPage.value = false;
	}
};

// 跳转页码（blur）
const jumpToPageBlur = (isTrue) => {
	isEditPage.value = isTrue;
	if (isTrue) {
		editCurrentPageNumber.value = currentPage.value;
		nextTick(() => {
			editPageRef.value?.focus(); // 确保 DOM 渲染完成后再执行 focus
		});
	} else {
		if (currentPage.value) {
			jumpToPage();
		} else {
			currentPage.value = editCurrentPageNumber.value;
		}
	}
};
</script>
<style scoped>
/* 设置3D场景 */
.scene {
	perspective: 1000px;
	min-height: 540px;
}

.manga-card {
	position: relative;
	width: 100%;
	height: 100%;
	min-height: 550px;
	border-radius: 5px;
	transition: transform 1.4s;
	transform-style: preserve-3d;
	box-shadow: 6px 6px 0 0 rgba(var(--primary-color-rgb), 0.5);
}

.box-shadow-back {
	box-shadow: -6px 6px 0 0 rgba(var(--accent-color-rgb), 0.8);
}

/* 翻转状态 */
.manga-card.flipped {
	transform: rotateY(-180deg);
}

.front,
.back {
	position: absolute;
	width: 100%;
	height: 100%;
	min-height: 540px;
	backface-visibility: hidden;
	overflow: hidden;
	background: white;
}

.front {
	transform: rotateY(0deg);
}

/* 纹理 */
.front::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.1) 2px,
		rgba(0, 0, 0, 0.03) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}

/* 光泽 */
.front::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 50%;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
	border-radius: 9px 9px 0 0;
	pointer-events: none;
}

/* 背面旋转180度 */
.back {
	position: absolute;
	width: 100%;
	height: 100%;
	backface-visibility: hidden;
	color: var(--accent-color);
	background-color: rgba(12, 12, 12, 0.8);
	animation: crt-flicker 0.15s infinite;
	box-shadow: inset 0 0 18px rgba(0, 255, 0, 0.1);
	transform: rotateY(180deg);
}

.back::before {
	content: " ";
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: linear-gradient(
		to bottom,
		rgba(18, 16, 16, 0) 50%,
		rgba(0, 0, 0, 0.1) 50%
	);
	background-size: 100% 4px;
	pointer-events: none;
	z-index: 2;
}

.terminal-dot {
	width: 12px;
	height: 12px;
	border-radius: 9999px;
}

.terminal-dot.red {
	background-color: var(--secondary-color);
}
.terminal-dot.green {
	background-color: var(--primary-color);
}
.terminal-dot.yellow {
	background-color: var(--accent-color);
}

.dialogue-box {
	box-shadow: 4px 4px 0 rgba(var(--primary-color-rgb), 0.3);
}

.dialogue-box::before {
	content: "";
	position: absolute;
	bottom: -12px;
	left: 24px;
	width: 16px;
	height: 16px;
	background-color: white;
	border-right: 2px solid black;
	border-bottom: 2px solid black;
	transform: rotate(45deg);
}

.knowledge-box {
	box-shadow: -4px 4px 0 rgba(var(--secondary-color-rgb), 0.3);
}

.knowledge-box::before {
	content: "";
	position: absolute;
	bottom: -12px;
	right: 24px;
	width: 16px;
	height: 16px;
	background-color: var(--milk-color);
	border-right: 2px solid black;
	border-bottom: 2px solid black;
	transform: rotate(45deg);
}

.text-shadow {
	text-shadow: 2px 2px 0 rgba(var(--primary-color-rgb), 0.3);
}

.fade-slide-right-enter-active,
.fade-slide-right-leave-active,
.fade-slide-left-enter-active,
.fade-slide-left-leave-active {
	transition: all 500ms ease-in-out;
}

.fade-slide-right-enter-from {
	transform: translateX(30%);
	opacity: 0;
}

.fade-slide-right-leave-to {
	transform: translateX(-30%);
	opacity: 0;
}

.fade-slide-left-enter-from {
	transform: translateX(-30%);
	opacity: 0;
}

.fade-slide-left-leave-to {
	transform: translateX(30%);
	opacity: 0;
}

.font-comic {
	font-family: "Comic Sans MS", cursive;
}

/* 纹理 */
.btn-face::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.03) 2px,
		rgba(0, 0, 0, 0.03) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}

/* 光泽 */
.btn-face::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 50%;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
	border-radius: 9px 9px 0 0;
	pointer-events: none;
}

.retro-btn {
	position: relative;
	width: 3rem;
	height: 3rem;
	border: none;
	background: none;
	cursor: pointer;
	transition: transform 0.1s;
}

.retro-btn.option {
	width: 4rem;
	height: 2.2rem;
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face,
.retro-btn.btn-active .btn-edge,
.retro-btn.btn-active .btn-face {
	transform: translateY(0);
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 12px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 12px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	border: 3px solid #333;
	border-radius: 12px;
	color: #333;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.retro-display {
	position: relative;
	width: 6rem;
	height: 3rem;
}

.display-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.display-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 8px;
	transform: translateY(-2px);
}

.display-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #e8e8e8;
	border: 3px solid #333;
	border-radius: 8px;
	transform: translateY(-2px);
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: "Comic Sans MS", cursive;
	font-weight: bold;
	cursor: pointer;
	overflow: hidden;
}

/* 显示屏发光效果 */
.display-face::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		0deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.02) 2px,
		rgba(0, 0, 0, 0.02) 4px
	);
	pointer-events: none;
}

/* 显示屏反光效果 */
.display-face::after {
	content: "";
	position: absolute;
	top: 0;
	left: -50%;
	width: 200%;
	height: 100%;
	background: linear-gradient(
		90deg,
		transparent,
		rgba(255, 255, 255, 0.2),
		transparent
	);
	transform: rotate(-45deg);
	animation: shine 4s infinite linear;
	pointer-events: none;
}

/* 显示屏反光动画 */
@keyframes shine {
	from {
		transform: translateX(-200%) rotate(-45deg);
	}
	to {
		transform: translateX(200%) rotate(-45deg);
	}
}

.retro-input {
	width: 100%;
	height: 100%;
	background: transparent;
	border: none;
	text-align: center;
	font-family: inherit;
	font-weight: bold;
	font-size: 1rem;
	color: #333;
	padding: 0 0.5rem;
}

.retro-input:focus {
	outline: none;
}

.retro-text {
	font-size: 1rem;
	color: #333;
}

.retro-btn:hover .btn-face {
	background-color: #fff;
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face {
	transform: translateY(0);
}
.retro-btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
.retro-btn:disabled .btn-face {
	background-color: #ddd;
	border-color: #999;
	color: #999;
}
.retro-terminal {
	text-align: left;
	align-items: center;
	flex: 1 1 auto;
}

.terminal-title {
	position: relative;
	display: inline-block;
	padding: 0 1rem;
	width: 100%;
	flex: 0 0 30px;
}

.terminal-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 1rem;
}
.terminal-title-text {
	margin-left: 1rem;
	color: #666;
}
</style>
