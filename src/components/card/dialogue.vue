<template>
	<div
		class="px-6 py-2 text-left overflow-y-auto"
		:class="
			(showHints && currentKnowledgePoints.length > 0 ? 'w-full' : 'w-full',
			{ 'listen-mode-active': lessonStore.isListenMode })
		"
		style="height: 400px"
		v-if="highlightedText.length"
	>
		<!-- 电流动画和提示文字 -->
		<Transition name="mode-switch">
			<div v-if="showModeSwitch" class="mode-switch-overlay">
				<div class="electric-effect"></div>
				<div class="mode-switch-text">
					<i class="bi bi-headphones text-4xl mb-2"></i>
					<div class="text-xl font-bold">{{ switchMessage }}</div>
					<div class="text-sm opacity-80">{{ switchDescription }}</div>
				</div>
			</div>
		</Transition>

		<Transition name="fade">
			<div v-if="showHeadphone" class="headphone-background" aria-hidden="true">
				<i class="bi bi-headphones"></i>
			</div>
		</Transition>

		<div class="relative z-10">
			<div v-for="(dialogue, index) in highlightedText" :key="index">
				<!-- 渲染旁白 -->
				<p
					v-if="dialogue.isNarration"
					:class="{
						'text-narration narration-item italic text-gray-500 font-extralight text-sm': true,
						'mt-0 mb-6': index === 0 && !showTrans, // 第一个没有翻译时，mt-0, mb-6
						'mt-0 mb-2': index === 0 && showTrans, // 第一个有翻译时，mt-0, mb-2
						'mt-6 mb-6': index !== 0 && !showTrans, // 其他旁白没有翻译时，mt-4, mb-6
						'mt-6 mb-2': index !== 0 && showTrans, // 其他旁白有翻译时，mt-4, mb-2
					}"
				>
					<span @click="speakText(dialogue.line)" v-html="dialogue.line"></span>
				</p>

				<!-- 中文旁白翻译 -->
				<p
					v-if="showTrans && dialogue.isNarration"
					class="text-narration text-gray-500 font-normal text-xs italic mt-2 mb-6"
				>
					<span v-html="highlightedTextZh[index].line"></span>
				</p>

				<!-- 渲染台词 -->
				<p
					v-if="!dialogue.isNarration"
					class="dialogue-item"
					:class="{
						'text-dialogue mb-2': true, // 每个台词默认 mb-2
					}"
				>
					<span
						v-if="dialogue.speaker"
						class="text-sm mr-2 font-extralight text-gray-400"
						>[{{ dialogue.speaker }}]</span
					>
					<span v-else class="text-sm font-extralight text-gray-400">{{
						dialogue.speaker
					}}</span>
					<span @click="speakText(dialogue.line)" v-html="dialogue.line"></span>
				</p>

				<!-- 中文台词翻译 -->
				<p
					v-if="showTrans && !dialogue.isNarration"
					class="text-dialogue text-gray-500 font-normal text-xs italic mb-2"
				>
					<span v-html="highlightedTextZh[index].line"></span>
				</p>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref, watch, computed } from "vue";
import { useLessonStore } from "@/store";
import { useRoute } from "vue-router";
import apiClient from "@/api";
import { generateTextHash } from "@/utils";

defineProps({
	highlightedText: Object,
	highlightedTextZh: Object,
	showHints: Boolean,
	showTrans: Boolean,
	currentKnowledgePoints: Object,
});

const route = useRoute();
const lessonStore = useLessonStore();

const showModeSwitch = ref(false);
const showHeadphone = ref(false);
const isClosing = ref(false);

// 计算提示消息
const switchMessage = computed(() => {
	return isClosing.value ? "关闭语音模式" : "开启语音模式";
});

// 计算描述文字
const switchDescription = computed(() => {
	return isClosing.value ? "" : "点击对话即可朗读";
});

// 转换文本为语音
const speakText = async (text) => {
	if (!lessonStore.isListenMode) {
		return;
	}

	// 清理输入文本，移除HTML标签
	const cleanText = removeHtmlTags(text).trim();

	if (!cleanText) {
		alert("请输入要转换的文本");
		return;
	}

	try {
		// 先查询是否存在相同文本的记录
		const textHash = generateTextHash(cleanText);
		const searchRes = await apiClient.get("/audio/search/text", {
			params: { textHash },
		});

		if (searchRes.data.code === 200 && searchRes.data.data.length > 0) {
			const existingAudio = searchRes.data.data[0];
			latestAudio.value = existingAudio.audioPath;
			playAudio();
		} else {
			// 如果没找到记录，则进行新的转换
			// const res = await apiClient.post(`/text-to-speech`, { text: cleanText });
			const resourceId = route.params.id;
			const currentDialogueId =
				route.params.season + "-" + route.params.episode;
			try {
				const res = await apiClient.post(`/audio`, {
					text: cleanText,
					resourceId,
					currentDialogueId,
				});

				if (res.data.code === 200) {
					latestAudio.value = res.data.data.audioPath;
					playAudio();
				}
			} catch (error) {
				console.error("转换失败:", error);
			} finally {
			}
		}
	} catch (error) {
		console.error("转换失败:", error);
	}
};

// 去除HTML标签的辅助函数
const removeHtmlTags = (text) => {
	return text.replace(/<[^>]*>/g, "");
};

// 音频对象（用于自定义播放器）
let audioObj = null;
const latestAudio = ref("");
const isPlaying = ref(false);
// 自定义播放器方法
const playAudio = () => {
	if (!latestAudio.value) return;

	audioObj = new Audio(latestAudio.value);
	audioObj.onended = () => {
		isPlaying.value = false;
	};

	audioObj.play();
	isPlaying.value = true;
};

const scrollToWord = (currentWord) => {
	const allElements = document.querySelectorAll(
		".dialogue-item span, .narration-item span"
	);

	allElements.forEach((el) => {
		if (el.textContent.includes(currentWord)) {
			// 找到最近的可滚动祖先元素
			const scrollableParent = el.closest(".overflow-y-auto");

			// 获取目标元素在滚动容器中的相对位置
			if (scrollableParent) {
				const parentRect = scrollableParent.getBoundingClientRect();
				const elRect = el.getBoundingClientRect();

				const offsetTop =
					elRect.top - parentRect.top + scrollableParent.scrollTop;
				const offsetLeft =
					elRect.left - parentRect.left + scrollableParent.scrollLeft;

				// 平滑滚动到目标位置
				scrollableParent.scrollTo({
					top: offsetTop - parentRect.height / 2 + elRect.height / 2,
					left: offsetLeft,
					behavior: "smooth",
				});
			}
		}
	});
};

defineExpose({
	scrollToWord,
});

// 监听听力模式变化
watch(
	() => lessonStore.isListenMode,
	(newValue) => {
		showModeSwitch.value = true;
		showHeadphone.value = false; // 先隐藏耳机图标
		isClosing.value = !newValue;

		setTimeout(() => {
			showModeSwitch.value = false;
			if (newValue) {
				// 只在开启模式时显示耳机图标
				showHeadphone.value = true;
			}
		}, 1500);
	}
);
</script>
<style scoped>
/* 听力模式激活时的背景样式 */
.listen-mode-active {
	background: linear-gradient(135deg);
}

/* 耳机图标背景 */
.headphone-background {
	position: absolute;
	bottom: 1rem;
	right: 1rem;
	font-size: 8rem; /* 大图标 */
	opacity: 0.08; /* 半透明 */
	transform: rotate(-15deg); /* 稍微倾斜 */
	pointer-events: none; /* 确保不会干扰文字点击 */
	z-index: 1;
	color: var(--primary-color);
	transition: opacity 0.3s ease;
}

/* 当鼠标悬停在对话框上时，稍微增加图标透明度 */
.listen-mode-active:hover .headphone-background {
	opacity: 0.12;
}

/* 确保文字内容在图标上方 */
.dialogue-item,
.narration-item {
	position: relative;
	z-index: 2;
}

/* 模式切换遮罩层 */
.mode-switch-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.9);
	z-index: 100;
	backdrop-filter: blur(4px);
}

/* 电流效果 */
.electric-effect {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: radial-gradient(
			circle at 50% 50%,
			transparent 0%,
			rgba(var(--primary-color-rgb), 0.1) 100%
		),
		linear-gradient(
			45deg,
			transparent 45%,
			rgba(var(--primary-color-rgb), 0.2) 50%,
			transparent 55%
		);
	opacity: 0.5;
	animation: electric 1s infinite, pulse 2s infinite;
}

/* 提示文字容器 */
.mode-switch-text {
	position: relative;
	z-index: 101;
	text-align: center;
	color: var(--primary-color);
	animation: float 2s ease-in-out infinite;
}

/* 动画效果 */
@keyframes electric {
	0% {
		background-position: 0% 0%;
	}
	100% {
		background-position: 100% 100%;
	}
}

@keyframes pulse {
	0%,
	100% {
		opacity: 0.3;
	}
	50% {
		opacity: 0.7;
	}
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-10px);
	}
}

/* 过渡动画 */
.mode-switch-enter-active,
.mode-switch-leave-active {
	transition: all 0.5s ease;
}

.mode-switch-enter-from,
.mode-switch-leave-to {
	opacity: 0;
	transform: scale(0.95);
}

.mode-switch-enter-to,
.mode-switch-leave-from {
	opacity: 1;
	transform: scale(1);
}

/* 确保文字内容在动画上方 */
.dialogue-item,
.narration-item {
	position: relative;
	z-index: 2;
}

/* 耳机图标淡入动画 */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
