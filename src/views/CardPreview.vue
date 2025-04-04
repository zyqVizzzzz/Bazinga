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
			<div v-if="currentDialogue" :key="currentDialogue.id" class="relative">
				<!-- 主卡片容器 -->
				<div class="scene relative">
					<div
						class="card w-full bg-base-100 border-4 border-black manga-card"
						:class="{ active: isFlipped }"
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
										<div class="flex items-center gap-2" v-if="!guestNotAllow">
											<span class="badge badge-primary badge-outline rotate-2">
												Scene {{ currentPage }}
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
													v-if="!guestNotAllow"
													ref="dialogueCard"
													:showHints="showHints"
													:showTrans="showTrans"
													:currentKnowledgePoints="currentKnowledgePoints"
													:highlightedText="highlightedText"
													:highlightedTextZh="highlightedTextZh"
												/>
												<div v-if="guestNotAllow">登录后可查看全部内容</div>
											</div>
										</div>

										<!-- 知识点卡片 -->

										<!-- v-if="isKnowledgeReady" -->
										<KnowledgeCard
											class="w-2/6 border-2 border-black rounded-lg knowledge-box"
											style="background-color: var(--milk-color)"
											:showHints="showHints"
											:currentKnowledgePoints="currentKnowledgePoints"
											:currentCustomNotes="
												customNotes[currentDialogueIndex + 1] || []
											"
											:currentDialogueIndex="currentDialogueIndex"
											:resourceId="episodeId"
											:needUnlock="needUnlock"
											@on-slide-change="handleSlideChange"
											@update-note="handleUpdateNote"
											@unlock-package="handleUnlockPackage"
										/>
									</div>
								</div>
							</div>
						</div>

						<!-- 背面内容 -->
						<div class="back" v-if="!isLoading">
							<PracticeCard
								ref="practiceCard"
								:currentPractice="currentPractice"
								:currentPage="currentPage"
								:showHints="showHints"
								:showTranslation="showBazingaTrans"
								@play-complete="handlePlayComplete"
								class="practice-box text-left"
							/>
						</div>
					</div>
				</div>

				<div
					class="flex justify-between items-center"
					v-if="!isLoading && !guestNotAllow"
				>
					<!-- 控制按钮组 -->
					<div class="flex justify-center gap-6 mt-6">
						<!-- <button
							v-if="!isFlipped"
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
						</button> -->

						<button
							v-if="!isFlipped"
							class="retro-btn option"
							:class="{ 'btn-active': showTrans }"
							@click="toggleTransMode"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face flex items-center justify-center">
										<TranslationIcon size="5" />
									</div>
								</div>
							</div>
						</button>

						<button
							v-if="isFlipped"
							class="retro-btn option"
							:class="{ 'btn-active': showBazingaTrans }"
							@click="toggleBazingaTransMode"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face flex items-center justify-center">
										<TranslationIcon size="5" />
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
										<PodcastIcon />
									</div>
								</div>
							</div>
						</button>

						<div class="flex items-center gap-6">
							<!-- 竖线分隔符 -->
							<div class="h-8 w-[2px] bg-black"></div>

							<!-- 编辑按钮 -->
							<button class="retro-btn option" @click="editCard">
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face flex items-center justify-center">
											<i class="bi text-xl bi-pencil-square"></i>
										</div>
									</div>
								</div>
							</button>
						</div>
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
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import { useLessonStore, useAppStore, useLoginStore } from "@/store";
import apiClient from "@/api";

import PodcastIcon from "@/components/icons/Podcast.vue";
import EditIcon from "@/components/icons/Edit.vue";
import TranslationIcon from "@/components/icons/Translation.vue";
import PreviewIcon from "@/components/icons/Preview.vue";
import KnowledgeCard from "@/components/card/knowledge.vue";
import DialogueCard from "@/components/card/dialogue.vue";
import PracticeCard from "@/components/card/practice.vue";
import { showToast } from "@/components/common/toast.js";
import { useProgress } from "@/composables/useProgress";

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);

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
const showBazingaTrans = ref(false);
const showBazingaPlay = ref(false);

const dialogueCard = ref(null); // 获取 DialogueCard 实例
const practiceCard = ref(null); // 获取 PracticeCard 实例
const episodeId = ref("");

// 页码相关
const currentPage = ref(1);
const totalPages = ref(0);
const isEditPage = ref(false);
const editPageRef = ref(null);
const editCurrentPageNumber = ref(0); // 跳转页码

const isCustom = ref(false);
const isListenMode = ref(false);
const isLoading = ref(true);

const guestNotAllow = ref(false);
const needUnlock = ref(false); // 添加这个状态

const { saveProgress } = useProgress(
	appStore,
	apiClient,
	showToast,
	currentPage,
	route
);

const handleUnlockPackage = () => {
	// 跳转到购买页面或打开购买对话框
	router.push({
		path: "/purchase",
		query: {
			catalogId: route.params.id,
			returnTo: route.fullPath,
		},
	});
};

// 获取课程
const getLesson = async () => {
	try {
		const scriptRes = await apiClient.get(
			`/scripts/episode/${route.query.sign}`
		);

		if (scriptRes.data.code === 200) {
			const res = await scriptRes.data.data;
			isCustom.value = res.isCustom;
			dialoguesData.value = res.scriptData;

			if (dialoguesData.value.scenes && dialoguesData.value.scenes.length > 0) {
				scene.value = dialoguesData.value.scenes[0];
				dialogues.value = scene.value.dialogues || [];
				episodeId.value = route.query.sign;
				totalPages.value = dialogues.value.length;

				// 使用 Promise.all 等待所有数据加载完成
				const [knowledgeSuccess] = await Promise.all([
					getKnowledge(),
					isLogin.value && getVocabulary(),
				]);

				setTimeout(() => {
					isLoading.value = false;
				}, 1000);

				if (!knowledgeSuccess) {
					throw new Error("Failed to load knowledge data");
				}

				progressJumpToPage();
			} else {
				throw new Error("No scenes found in script");
			}
		} else {
			throw new Error(scriptRes.data.message || "Invalid lesson data");
		}
	} catch (error) {
		console.error("Error loading lesson:", error);
		isLoading.value = false;
		if (error === "Failed to load knowledge data") {
			guestNotAllow.value = true;
		} else {
		}
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
		if (error.status === 403) {
			needUnlock.value = true;
			knowledges.value = [];
			return false;
		}
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

// 获取当前dialog
const currentDialogue = computed(() => {
	return dialogues.value.length > 0
		? dialogues.value[currentDialogueIndex.value]
		: {};
});

// 获取当前对话的知识点
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

// 动态获取当前对话的练习题
const currentPractice = computed(() => {
	if (
		!knowledges.value ||
		!knowledges.value.length ||
		currentDialogueIndex.value >= knowledges.value.length
	) {
		return [];
	}
	return knowledges.value[currentDialogueIndex.value]?.practice[0] || {};
});

// 从已保存进度开始
const progressJumpToPage = () => {
	const progress = appStore.progressList.find(
		(p) => p.course === route.params.id
	);
	if (
		progress &&
		progress.season === route.params.season &&
		progress.episode === route.params.episode
	) {
		currentPage.value = parseInt(progress.page);
		jumpToPage();
	}
};

// 编辑卡片
const editCard = () => {
	const courseId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const sign = route.query.sign;
	router.push({
		path: `/card-editor/${courseId}/${season}/${episode}`,
		query: {
			sign: sign,
		},
	});
};

// 在组件挂载时，确保数据加载正确
onMounted(async () => {
	lessonStore.closeListenMode();
	isLoading.value = true;
	await getLesson();
});

onBeforeRouteLeave(async (to, from, next) => {
	console.log("Route leaving, saving progress...");
	await saveProgress();
	next();
});

const toggleTransMode = () => {
	showTrans.value = !showTrans.value;
};

const toggleBazingaTransMode = () => {
	showBazingaTrans.value = !showBazingaTrans.value;
};

const handlePlayComplete = () => {
	showBazingaPlay.value = false;
};

const toggleBazingaPlayMode = () => {
	showBazingaPlay.value = !showBazingaPlay.value;
	if (practiceCard.value) {
		practiceCard.value.playAllDialogues();
	}
};

const togglePracticeMode = () => {
	if (needUnlock.value) {
		console.log("hello");
		showToast({
			message: "解锁资源包体验完整内容",
			type: "warning",
		});
		return;
	}
	isFlipped.value = !isFlipped.value;
};

const toggleListenMode = async () => {
	lessonStore.setListenMode();
	isListenMode.value = lessonStore.isListenMode;
};

// 高亮知识点相关nline
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
		isFirstLoad.value = false;
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
.scene {
	position: relative;
	min-height: 590px;
	overflow: hidden;
}

.manga-card {
	position: relative;
	height: 590px;
	overflow: hidden;
}

/* 缩放效果 */
.manga-card.active .front {
	transform: translateY(-100%) scale(0.95);
}

.manga-card.active .back {
	transform: translateY(0) scale(1);
}

.box-shadow-back {
	box-shadow: -6px 6px 0 0 rgba(var(--accent-color-rgb), 0.8);
}

.front,
.back {
	position: absolute;
	width: 100%;
	min-height: 590px;
	transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.front {
	transform: translateY(0);
	background: white;
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

.dialogue-box {
	box-shadow: 4px 4px 0 rgba(var(--primary-color-rgb), 0.3);
	position: relative;
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

.back {
	position: absolute;
	width: 100%;
	height: 100%;
	transform: translateY(100%) scale(0.95);
	background-color: white;
	color: #333;
	display: flex;
	flex-direction: column;
	transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 4px 4px 0 rgba(var(--secondary-color-rgb), 0.3);
}

.back::before {
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

/* 添加播客元素 - 音波装饰 */
.back::after {
	content: "";
	position: absolute;
	bottom: 20px;
	right: 20px;
	width: 120px;
	height: 60px;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60' fill='rgba(0,0,0,0.1)'%3E%3Cpath d='M10,30 Q30,5 40,30 Q50,55 60,30 Q70,5 80,30 Q90,55 100,30 Q110,5 120,30'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-size: contain;
	opacity: 0.5;
	pointer-events: none;
}

.fade-slide-right-enter-active,
.fade-slide-right-leave-active,
.fade-slide-left-enter-active,
.fade-slide-left-leave-active {
	transition: all 500ms ease-in-out;
}

.fade-slide-right-enter-from {
	transform: translateX(15%);
	opacity: 0;
}

.fade-slide-right-leave-to {
	transform: translateX(-15%);
	opacity: 0;
}

.fade-slide-left-enter-from {
	transform: translateX(-15%);
	opacity: 0;
}

.fade-slide-left-leave-to {
	transform: translateX(15%);
	opacity: 0;
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
</style>
