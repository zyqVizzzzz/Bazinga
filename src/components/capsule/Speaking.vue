<template>
	<div
		class="capsule primary-capsule mb-10"
		:style="{
			backgroundImage: `url(${thumbnail})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		}"
	></div>
	<div class="flex justify-around capsule-tooltips">
		<div
			class="capsule primary-capsule mb-4 capsule-tooltips_items relative"
			@mouseenter="isHoveredP = true"
			@mouseleave="isHoveredP = false"
			@click="openListenMode"
			:style="{
				opacity: isHoveredP ? 1 : 0.7,
				'box-shadow': isHoveredP
					? '0 4px 20px rgba(var(--primary-color-rgb), 0.8)'
					: '0 4px 15px rgba(var(--primary-color-rgb), 0.5)',
			}"
		>
			<RecordIcon />
		</div>
		<!-- <div
			class="capsule primary-capsule capsule-tooltips_items"
			@mouseenter="isHoveredR = true"
			@mouseleave="isHoveredR = false"
			:style="{
				'box-shadow': isHoveredR
					? '0 4px 20px rgba(var(--primary-color-rgb), 0.5)'
					: '0 4px 15px rgba(var(--primary-color-rgb), 0.3)',
			}"
		>
			<RecordIcon />
		</div> -->
	</div>
	<div v-if="lessonStore.isListenMode" class="text-xs" style="width: 90%">
		<p class="mt-4">朗读模式已启动，再次点击右侧对话即可开始朗读。</p>
		<p class="mt-4">
			注：语音服务由 Google TTS
			提供。搭配【谷歌浏览器】和科学上网可获得更优质的音频效果。
		</p>
	</div>
</template>
<script setup>
import { ref } from "vue";
import RecordIcon from "../icons/Record.vue";
import { useLessonStore } from "@/store";
import { getVoicesList } from "@/utils/speechSynthesisHelper";

defineProps({
	thumbnail: String,
});

const lessonStore = useLessonStore();
const isHoveredP = ref(false);
const isFocusP = ref(false);
const isSpeakingMode = ref(false);
const isHoveredR = ref(false);

const openListenMode = async () => {
	if (!lessonStore.voicesList.length) {
		const voicesList = await getVoicesList();
		lessonStore.setVoicesList(voicesList);
	}
	lessonStore.setListenMode();
	lessonStore.isListenMode ? (isFocusP.value = true) : (isFocusP.value = false);
};
</script>
<style scoped>
.capsule {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	padding: 8px 0;
	position: relative;
	transition: opacity 0.3s ease, border-radius 0.3s ease; /* 添加过渡效果 */
	cursor: pointer;
	border-color: transparent; /* 初始状态下隐藏边框 */
}
.primary-capsule {
	height: 100px;
	width: 150px;
	border-radius: 10px;
	/* border: 2px solid var(--primary-color); */
	box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.4); /* 蓝色阴影 */
}
.capsule-tooltips {
	height: 60px;
	width: 150px;
	border-radius: 10px;
}
.capsule-tooltips_items {
	height: 50px;
	width: 50px;
	border-radius: 25px;
}
.player-card {
	width: 150px;
	background-color: white;
	border: 1px solid #eaeaea;
	box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.4); /* 蓝色阴影 */
}

.play-btn,
.pause-btn,
.plus-btn {
	cursor: pointer;
	background-color: white;
}

.play-btn:hover,
.pause-btn:hover,
.plus-btn:hover {
	background-color: #f0f0f0;
}
</style>
