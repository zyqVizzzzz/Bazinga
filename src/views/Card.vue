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
									:currentPractice="currentPractice"
								/>

								<!-- 卡片内容部分 -->
								<div class="card-content flex items-stretch relative">
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
									:currentPractice="currentPractice"
								/>
								<!-- Practice 部分 -->
								<PracticeCard
									v-if="currentPractice.length"
									:currentPractice="currentPractice"
									:showHints="showHints"
									:currentKnowledgePoints="currentKnowledgePoints"
								/>
							</div>
						</div>
					</div>
				</div>
				<div class="lesson-options flex space-x-2">
					<div
						class="flex items-center text-xs title-jam shadow-md"
						@click="togglePracticeMode"
						@mouseenter="isHoveredJ = true"
						@mouseleave="isHoveredJ = false"
						:class="{ expanded: isHoveredJ, 'shadow-primary': isFlipped }"
					>
						<div class="jam-text-wrapper">
							<!-- 旧文字 -->
							<span
								class="text-slide text-xs font-bold"
								:class="{ 'text-out': isHoveredJ, 'text-in': !isHoveredJ }"
							>
								练习模式
							</span>
							<!-- 新文字 -->
							<span
								class="text-slide font-bold"
								:class="{ 'text-in': isHoveredJ, 'text-out': !isHoveredJ }"
							>
								Let's Jam!
							</span>
						</div>
					</div>
					<div
						@click="toggleListenMode"
						class="flex items-center text-xs title-jam shadow-md"
						@mouseenter="isHoveredVoice = true"
						@mouseleave="isHoveredVoice = false"
						:class="{
							expanded: isHoveredVoice,
							'shadow-primary': lessonStore.isListenMode,
						}"
					>
						<span class="cursor-pointer font-bold">语音模式</span>
					</div>
					<div
						@click="toggleTransMode"
						class="flex items-center text-xs title-jam shadow-md"
						@mouseenter="isHoveredTrans = true"
						@mouseleave="isHoveredTrans = false"
						:class="{ expanded: isHoveredTrans, 'shadow-primary': showTrans }"
					>
						<span class="cursor-pointer font-bold">双语模式</span>
					</div>
				</div>
				<div class="lesson-options-left flex space-x-2">
					<div
						v-if="!isFlipped && !isDefault"
						@click="editCard"
						class="text-primary text-xs text-center mt-2 product-capsule shadow-lg"
					>
						<span class="cursor-pointer font-bold">编辑卡片</span>
					</div>
				</div>
				<div class="lesson-options-right flex space-x-2">
					<div class="tooltip" data-tip="保存进度">
						<div
							v-if="!isFlipped"
							@click="saveProgress"
							class="text-xs text-center mt-2 save-capsule shadow-md text-gray-600"
						>
							<span class="cursor-pointer font-bold">
								<DocumentUploadIcon />
							</span>
						</div>
					</div>
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
				@blur="jumpToPageBlur(false)"
				@keydown.enter="jumpToPage"
				v-if="isEditPage"
				:min="1"
				:max="totalPages"
			/>
			<div @click="jumpToPageBlur(true)" v-if="!isEditPage">
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
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLessonStore, useAppStore } from "@/store";
import apiClient from "@/api";

import LeftArrowIcon from "@/components/icons/LeftArrow.vue";
import RightArrowIcon from "@/components/icons/RightArrow.vue";
import DocumentUploadIcon from "@/components/icons/DocumentUpload.vue";
import TitleBar from "@/components/card/title.vue";
import ReadingCapsule from "@/components/capsule/Reading.vue";
import KnowledgeCard from "@/components/card/knowledge.vue";
import DialogueCard from "@/components/card/dialogue.vue";
import PracticeCard from "@/components/card/practice.vue";
import { showToast } from "@/components/common/toast.js";

import { getVoicesList } from "@/utils/speechSynthesisHelper";

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

// 获取课程
const getLesson = async () => {
	const scriptUrl = route.query.script;
	try {
		// 获取课程的元数据
		// const scriptRes = await apiClient.get("/scripts/url", {
		// 	params: { scriptUrl },
		// });
		const scriptRes = await apiClient.get(
			`/scripts/episode/${route.query.sign}`
		);
		// const scriptRes = await fetch(scriptUrl);
		if (!scriptRes.data.code === 200) {
			throw new Error("课程信息不完整或未找到");
		}

		const res = await scriptRes.data.data;

		dialoguesData.value = res.scriptData;
		if (dialoguesData.value.scenes && dialoguesData.value.scenes.length > 0) {
			scene.value = dialoguesData.value.scenes[0];
			dialogues.value = scene.value.dialogues || [];
			episodeId.value = route.query.sign;
			totalPages.value = dialogues.value.length;

			await getVocabulary();
			route.query.progress && progressJumpToPage();
		} else {
			throw new Error("剧本中没有场景数据");
		}
	} catch (error) {
		console.error("Error loading lesson:", error);
	} finally {
	}
};

// 获取单词库 & 匹配用户单词本里的单词
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
				duration: 3000,
			});
		}
	} catch (error) {
		console.error("Error fetching vocabulary:", error);
	}
};

// 获取当前台词
const currentDialogue = computed(() => {
	return dialogues.value.length > 0
		? dialogues.value[currentDialogueIndex.value]
		: {};
});

// 动态获取当前台词的知识点
const currentKnowledgePoints = computed(() => {
	return currentDialogue.value.knowledge || [];
});

// 动态获取当前台词的练习题
const currentPractice = computed(() => {
	return currentDialogue.value.practice || [];
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
			mode: "edit",
			sign: sign,
		},
	});
};

// 在组件挂载时，确保数据加载正确
onMounted(async () => {
	if (route.params.id !== "67230dee6fc3d389ea1ffedf") {
		isDefault.value = false;
	}
	await getLesson();
});

// 切换显示 Tabs 的状态
const toggleHints = () => {
	if (currentKnowledgePoints.value.length) {
		showHints.value = !showHints.value;
	} else {
		showToast({
			message: "暂无单词，请在卡片编辑器中添加知识点单词",
			type: "warning",
		});
	}
};

const toggleTransMode = () => {
	showTrans.value = !showTrans.value;
};

const togglePracticeMode = () => {
	isFlipped.value = !isFlipped.value;
};

const toggleListenMode = async () => {
	if (!lessonStore.voicesList.length) {
		const voicesList = await getVoicesList();
		lessonStore.setVoicesList(voicesList);
	}
	lessonStore.setListenMode();
};

const saveProgress = async () => {
	const course = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const page = currentPage.value;
	const scriptUrl = route.query.script;
	const sign = route.query.sign;

	appStore.saveProgress(course, season, episode, page, scriptUrl, sign);
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
				typeof currentPoint.origin === "string" &&
				!wordMatched // 确保知识点尚未匹配过
			) {
				// 对知识点中的标点符号进行转义，允许任意标点符号替换
				const sanitizedWord = currentPoint.origin.replace(/([.?!,])/g, "\\$1");
				const regex = new RegExp(sanitizedWord, "i");

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

const handleSlideChange = (data) => {
	currentKnowledgeIndex.value = data;
	const currentWord = currentKnowledgePoints.value[data].origin;
	dialogueCard.value.scrollToWord(currentWord); // 调用子组件方法
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

// 下一页
const nextDialogue = () => {
	if (currentDialogueIndex.value < dialogues.value.length - 1) {
		slideDirection.value = "right"; // 设置方向为向右
		currentDialogueIndex.value++;
		isFirstLoad.value = false;
		resetKnowledgeIndex(); // 重置知识点索引
	}
};

// 上一页
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

.shadow-primary {
	box-shadow: 0 4px 6px 2px rgb(0 0 255 / 0.1),
		0 2px 4px -2px rgb(0 0 255 / 0.1);
	color: var(--primary-color);
}

.product-capsule {
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 12px; /* 等效于 py-4 */
	transition: opacity 0.3s ease, border-radius 0.3s ease, color 0.3s ease,
		box-shadow 0.3s ease, width 0.3s ease;
	cursor: pointer;
	border-color: transparent; /* 初始状态下隐藏边框 */
	width: 120px;
	height: 30px;
	margin: 0px auto 0;
	border-radius: 20px;
	box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
	bottom: -50px;
	left: 1rem;
}
.product-capsule:hover {
	box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.5);
}
.title-jam {
	display: flex;
	align-items: center;
	justify-content: space-around;
	cursor: pointer;
	padding: 12px; /* 等效于 py-4 */
	height: 30px;
	border-radius: 20px;
	transition: opacity 0.3s ease, border-radius 0.3s ease, color 0.3s ease,
		box-shadow 0.3s ease, width 0.3s ease;
	background-color: white;
	width: 90px;
	bottom: -50px;
	right: 14rem;
}

.title-jam.expanded {
	width: 142px;
}

.title-jam:hover {
	/* color: var(--accent-color); */
}

/* 保证容器高度和宽度 */
.jam-text-wrapper {
	position: relative;
	display: inline-block;
	height: 15px; /* 设置文字高度一致 */
	overflow: hidden;
}

/* 文字滑动效果 */
.text-slide {
	display: inline-block;
	transition: all 0.6s ease;
	white-space: nowrap;
}

/* 文字被抹去的效果 */
.text-out {
	opacity: 0;
	transform: translateX(-100%);
}

/* 文字被抹出的效果 */
.text-in {
	opacity: 1;
	transform: translateX(0%);
}

.lesson-options {
	position: absolute;
	bottom: -50px;
	right: 1rem;
}
.lesson-options-left {
	position: absolute;
	bottom: -50px;
	left: 1rem;
}
.lesson-options-right {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	right: -5rem;
}
.save-capsule {
	display: flex;
	align-items: center;
	justify-content: space-around;
	cursor: pointer;
	width: 60px;
	height: 60px;
	border-radius: 30px;
}
</style>
