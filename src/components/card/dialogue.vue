<template>
	<div
		class="px-6 py-2 text-left overflow-y-auto"
		:class="
			showHints && currentKnowledgePoints.length > 0 ? 'w-full' : 'w-full'
		"
		style="height: 350px"
		v-if="highlightedText.length"
	>
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
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useLessonStore } from "@/store";
import { useRoute } from "vue-router";
import apiClient from "@/api";
import { generateTextHash } from "@/utils";

const route = useRoute();

defineProps({
	highlightedText: Object,
	highlightedTextZh: Object,
	showHints: Boolean,
	showTrans: Boolean,
	currentKnowledgePoints: Object,
});

const lessonStore = useLessonStore();

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
				alert("转换失败，请稍后重试");
			} finally {
			}
		}
	} catch (error) {
		console.error("转换失败:", error);
		alert("转换失败，请稍后重试");
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

const pauseAudio = () => {
	if (audioObj) {
		audioObj.pause();
		isPlaying.value = false;
	}
};

const stopAudio = () => {
	if (audioObj) {
		audioObj.pause();
		audioObj.currentTime = 0;
		isPlaying.value = false;
	}
};

const downloadAudio = () => {
	if (latestAudio.value) {
		const link = document.createElement("a");
		link.href = latestAudio.value;
		link.download = `speech_${Date.now()}.mp3`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
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
</script>
