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
				<span class="text-sm mr-2 font-extralight text-gray-400"
					>[{{ dialogue.speaker }}]</span
				>
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

defineProps({
	highlightedText: Object,
	highlightedTextZh: Object,
	showHints: Boolean,
	showTrans: Boolean,
	currentKnowledgePoints: Object,
});

const lessonStore = useLessonStore();

// 朗读台词
const speakText = (text) => {
	if (lessonStore.isListenMode) {
		// 停止当前正在播放的语音
		window.speechSynthesis.cancel();

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.voice = lessonStore.voicesList[0];
		utterance.lang = "en-US";

		let hasStarted = false; // 标记语音是否已开始播放

		// 播放开始时设置标志
		utterance.onstart = () => {
			hasStarted = true; // 语音播放已开始
			console.log("Primary voice started.");
		};

		// 当语音播放出错时，切换到备用语音
		utterance.onerror = () => {
			console.error("Primary voice failed, switching to backup voice.");
			switchToBackupVoice(text); // 切换到备用语音
		};

		// 设置超时机制（比如 3 秒）
		const timeout = setTimeout(() => {
			if (!hasStarted) {
				console.log(
					"Primary voice did not start within timeout, switching to backup voice."
				);
				switchToBackupVoice(text); // 超时未开始，切换到备用语音
			}
		}, 3000); // 3 秒超时

		window.speechSynthesis.speak(utterance);
	} else {
		console.log("Listen mode is not active.");
	}
};

// 切换到备用语音的函数
const switchToBackupVoice = (text) => {
	if (lessonStore.voicesList[1]) {
		// 停止当前正在播放的语音
		window.speechSynthesis.cancel();

		// 使用备用语音
		const backupUtterance = new SpeechSynthesisUtterance(text);
		backupUtterance.voice = lessonStore.voicesList[1]; // 使用备用语音
		backupUtterance.lang = "en-US";

		// 开始播放备用语音
		window.speechSynthesis.speak(backupUtterance);
		console.log("Switched to backup voice.");
	} else {
		console.error("No backup voice available.");
	}
};

// 中断播放的函数
const stopSpeech = () => {
	window.speechSynthesis.cancel(); // 取消所有正在播放的语音
};

const scrollToWord = (currentWord) => {
	const allElements = document.querySelectorAll(
		".dialogue-item span, .narration-item span"
	);

	// 遍历所有元素，查找包含当前单词的元素并滚动
	allElements.forEach((el) => {
		if (el.textContent.includes(currentWord)) {
			el.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	});
};

defineExpose({
	scrollToWord,
});
</script>
