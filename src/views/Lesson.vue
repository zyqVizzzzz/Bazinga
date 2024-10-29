<template>
	<div v-if="!isEditMode" class="container mx-auto my-10 p-6">
		<div
			v-if="isSaveProgressToast"
			class="toast toast-top toast-center mt-5 opacity-70"
		>
			<div class="alert alert-info bg-black text-white">
				<span>进度保存成功！</span>
			</div>
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
								<div class="card-content flex items-stretch relative">
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
										:currentCustomNotes="
											customNotes[currentDialogueIndex + 1] || []
										"
										:currentDialogueIndex="currentDialogueIndex"
										:resourceId="episodeId"
										@on-toggle-hints="toggleHints"
										@on-slide-change="handleSlideChange"
										@update-note="handleUpdateNote"
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
					class="text-xs text-center mt-2 trans-capsule shadow-md absolute"
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
				<div
					v-if="!isFlipped"
					@click="saveProgress"
					class="text-xs text-center mt-2 save-capsule shadow-md absolute text-gray-600"
				>
					<span class="cursor-pointer font-bold">保存进度</span>
				</div>
				<div
					v-if="!isFlipped"
					@click="editCard"
					class="text-primary text-xs text-center mt-2 product-capsule shadow-md absolute"
				>
					<span class="cursor-pointer font-bold">编辑卡片</span>
				</div>
			</div>
		</transition>
		<!-- 左右箭头按钮 -->
		<div
			v-if="!isFlipped"
			class="card-actions justify-between mt-4 w-1/4 mx-auto items-center"
		>
			<button
				class="transform btn btn-primary btn-ghost px-4"
				@click="prevDialogue"
				:disabled="isFlipped || currentDialogueIndex === 0"
			>
				<LeftArrowIcon class="w-6 h-6" />
			</button>
			<input
				type="text"
				ref="editPageRef"
				v-model.number="currentPage"
				class="border rounded-md w-12 text-center mx-2"
				style="height: 3rem"
				@blur="editPage(false)"
				@keydown.enter="jumpToPage"
				v-if="isEditPage"
				:min="1"
				:max="totalPages"
			/>
			<div @click="editPage(true)" v-if="!isEditPage">
				{{ currentPage }} / {{ totalPages }}
			</div>
			<button
				class="transform btn btn-primary btn-ghost px-4"
				@click="nextDialogue"
				:disabled="isFlipped || currentDialogueIndex === dialogues.length - 1"
			>
				<RightArrowIcon class="w-6 h-6" />
			</button>
		</div>
	</div>
	<div v-else class="container mx-auto my-10 p-6">
		<CardEdit />
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";

import LeftArrowIcon from "@/components/icons/LeftArrow.vue";
import RightArrowIcon from "@/components/icons/RightArrow.vue";

import TitleBar from "@/components/card/title.vue";
import KnowledgeCard from "@/components/card/knowledge.vue";
import DialogueCard from "@/components/card/dialogue.vue";
import PracticeCard from "@/components/card/practice.vue";
import SpeakingCapsule from "@/components/capsule/Speaking.vue";
import ReadingCapsule from "@/components/capsule/Reading.vue";
import CardEdit from "./CardEdit.vue";
import { decryptUrl } from "@/utils/crypto.js";

import { useLessonStore, useAppStore } from "@/store";
import apiClient from "@/api";

const lessonStore = useLessonStore();
const isListenMode = ref(false);

const appStore = useAppStore();

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
const episodeId = ref("");

// 页码相关
const currentPage = ref(1);
const totalPages = ref(0);
const isEditPage = ref(false);
const editPageRef = ref(null);

const editCurrentPage = ref(0);
const editPage = (isTrue) => {
	isEditPage.value = isTrue;
	if (isTrue) {
		editCurrentPage.value = currentPage.value;
		nextTick(() => {
			editPageRef.value?.focus(); // 确保 DOM 渲染完成后再执行 focus
		});
	} else {
		if (currentPage.value) {
			jumpToPage();
		} else {
			currentPage.value = editCurrentPage.value;
		}
	}
};

const editCard = () => {
	const courseId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const script = route.query.script;
	router.push({
		path: `/category/${courseId}/${season}/${episode}`,
		query: {
			mode: "edit",
			script: script,
		},
	});
};

// 跳转到指定页码的函数
const jumpToPage = () => {
	const page = currentPage.value;
	if (page >= 1 && page <= dialogues.value.length) {
		currentDialogueIndex.value = page - 1;
		isEditPage.value = false;
	}
};

const progressJumpToPage = () => {
	const progress = appStore.progressList.find(
		(p) => p.course === route.params.id
	);
	currentPage.value = parseInt(progress.page);
	jumpToPage();
};

const isEditMode = ref(false);
const getLesson = async () => {
	const scriptUrl = route.query.script;
	const mode = route.query.mode;
	if (mode === "edit") {
		isEditMode.value = true;
		if (!scriptUrl) {
			return;
		}
	} else {
		isEditMode.value = false;
	}
	try {
		// 获取课程的元数据
		const scriptRes = await fetch(scriptUrl);
		if (!scriptRes.ok) {
			throw new Error("课程信息不完整或未找到");
		}

		const res = await scriptRes.json();
		console.log(res);
		dialoguesData.value = res.scriptData;

		// 检查 JSON 数据结构是否正确
		if (dialoguesData.value.scenes && dialoguesData.value.scenes.length > 0) {
			scene.value = dialoguesData.value.scenes[0];
			dialogues.value = scene.value.dialogues || [];
			episodeId.value = route.query.sign;
			totalPages.value = dialogues.value.length;
			await getVocabulary();
			if (route.query.progress) {
				progressJumpToPage();
			}
		} else {
			throw new Error("剧本中没有场景数据");
		}
	} catch (error) {
		console.error("Error loading lesson:", error);
	} finally {
	}
};

const customNotes = ref({});
const getVocabulary = async () => {
	try {
		const res = await apiClient.get(`/lesson-notes/${episodeId.value}`);
		const notes = res.data.notes;
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
	} catch (error) {
		console.error("Error fetching vocabulary:", error);
	}
};

const handleUpdateNote = ({ note, word, action, scene }) => {
	// 检查 customNotes.value 是否存在该 scene 的数组，如果不存在则初始化为一个空数组
	if (!customNotes.value[scene]) {
		customNotes.value[scene] = [];
	}

	if (action === "add") {
		// 如果是添加笔记，将新笔记推送到 customNotes 中
		customNotes.value[scene].push(note);
	} else if (action === "remove") {
		// 如果是移除笔记，根据 word 删除 customNotes 中的相应条目
		customNotes.value[scene] = customNotes.value[scene].filter(
			(n) => n.word !== word
		);
	}
};

// 在组件挂载时，确保数据加载正确
onMounted(async () => {
	await getLesson();
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

// 监听 route 变化
watch(
	() => route.query,
	async () => {
		await getLesson();
	},
	{ immediate: false }
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
				// 将单词中的所有标点替换为匹配的字符
				const sanitizedWord = currentPoint.word.replace(/[’']/g, "['’]");
				const regex = new RegExp(`\\b(${sanitizedWord})\\b`, "i");

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

const isSaveProgressToast = ref(false);
const saveProgress = async () => {
	const course = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const page = currentPage.value;
	appStore.saveProgress(course, season, episode, page);
	try {
		const response = await apiClient.post("/users/me/update", {
			learningProgress: appStore.progressList,
		});
		if ((response.status = 200)) {
			isSaveProgressToast.value = true;
			setTimeout(() => {
				isSaveProgressToast.value = false;
			}, 2000);
		}
	} catch (error) {
		console.error(error);
	}
};

// 监听对话索引变化，更新当前页码
watch(currentDialogueIndex, (newIndex) => {
	currentPage.value = newIndex + 1;
});
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
	height: 30px;
	margin: 0px auto 0;
	border-radius: 20px;
	/* border: 2px solid rgba(var(--orange-color-rgb), 0.3); */
	/* box-shadow: 0 2px 4px rgba(var(--orange-color-rgb), 0.3); */
	bottom: -50px;
	right: 8rem;
}
.save-capsule {
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 12px; /* 等效于 py-4 */
	transition: opacity 0.3s ease, border-radius 0.3s ease; /* 添加过渡效果 */
	cursor: pointer;
	border-color: transparent; /* 初始状态下隐藏边框 */
	width: 90px;
	height: 30px;
	margin: 0px auto 0;
	border-radius: 20px;
	/* border: 2px solid rgba(var(--orange-color-rgb), 0.3); */
	/* box-shadow: 0 2px 4px rgba(var(--orange-color-rgb), 0.3); */
	bottom: -50px;
	right: 1rem;
}
.product-capsule {
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 12px; /* 等效于 py-4 */
	transition: opacity 0.3s ease, border-radius 0.3s ease; /* 添加过渡效果 */
	cursor: pointer;
	border-color: transparent; /* 初始状态下隐藏边框 */
	width: 120px;
	height: 30px;
	margin: 0px auto 0;
	border-radius: 20px;
	border: 2px solid rgba(var(--primary-color-rgb), 0.3);
	box-shadow: 0 2px 4px rgba(var(--primary-color-rgb), 0.3);
	bottom: -50px;
	left: 1rem;
}
</style>
