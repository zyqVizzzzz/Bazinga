<template>
	<div class="space-y-8">
		<div
			class="podcast-header my-4 text-left relative p-3 bg-white border-2 border-black rounded-lg shadow-custom"
		>
			<div class="podcast-title flex items-center">
				<div class="podcast-icon mr-3">
					<PodcastIcon />
				</div>
				<div class="flex-1">
					<h3 class="font-bold text-black">
						Ayyyyyo! Welcome Back To BAZINGA ! ! !
					</h3>
					<div class="flex items-center text-sm text-gray-600">
						<span>第{{ props.currentPage }}期</span>
					</div>
				</div>
				<div
					class="podcast-badge px-2 py-1 bg-secondary/10 border border-secondary/30 rounded-md text-xs font-medium text-secondary transform rotate-2"
				>
					BAZINGA PODCAST
				</div>
			</div>
		</div>
		<div
			v-for="(dialogue, index) in dialogues"
			:key="index"
			class="dialogue-wrapper flex items-start gap-4"
			:class="{
				'animate-fade-in': index === dialogues.length - 1,
				'flex-row-reverse': dialogue.character === 'Jinji',
			}"
		>
			<div class="avatar-wrapper flex flex-col items-center gap-2">
				<div
					class="w-10 h-10 rounded-full overflow-hidden border-2 border-black shadow-custom"
				>
					<img
						:src="`https://bazinga-1251994034.cos.ap-shanghai.myqcloud.com/default/${dialogue.character.toLowerCase()}.jpg`"
						:alt="dialogue.character"
						class="w-full h-full object-cover"
					/>
				</div>
				<span class="text-gray-800 text-sm font-medium">{{
					dialogue.character
				}}</span>
			</div>
			<div class="flex-1 max-w-[70%]">
				<div
					class="log-item rounded-lg shadow-custom transition-all duration-300 hover:shadow-xl relative group"
					:class="{
						'bg-white border-2 border-black speech-bubble-right':
							dialogue.character === 'User',
						'bg-white border-2 border-black speech-bubble-left':
							dialogue.character !== 'User',
					}"
				>
					<div class="flex-1">
						<div class="text-gray-800 text-md leading-relaxed pb-2">
							<span v-html="highlightWords(dialogue.english)"></span>
						</div>
						<div
							class="text-gray-600 text-sm pt-3 border-t border-gray-200 transition-all duration-300"
							v-if="showTranslation"
							:class="{ 'opacity-0': !showTranslation }"
						>
							{{ dialogue.chinese }}
						</div>
					</div>
					<button
						class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-secondary hover:text-secondary/80"
						@click="
							playDialogueVoice(
								dialogue.voiceUrl,
								dialogue.english,
								dialogue.character,
								index
							)
						"
						:disabled="isGlobalPlaying"
						:class="{
							'cursor-not-allowed opacity-50': isGlobalPlaying,
						}"
					>
						<i
							class="bi text-lg"
							:class="
								currentPlayingIndex === index && isPlaying
									? 'bi-stop-circle'
									: 'bi-play-circle'
							"
						></i>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import PodcastIcon from "@/components/icons/Podcast.vue";

const props = defineProps({
	dialogues: {
		type: Array,
		required: true,
	},
	showTranslation: {
		type: Boolean,
		required: true,
	},
	isGlobalPlaying: {
		type: Boolean,
		required: true,
	},
	currentPage: {
		type: Number,
		required: true,
	},
});

const emit = defineEmits(["play-dialogue"]);

// 单独播放状态
const isPlaying = ref(false);
const currentPlayingIndex = ref(null);
const currentAudio = ref(null);

// 高亮单词
const highlightWords = (text) => {
	return text
		.split(/\s+/)
		.map((word, index) => {
			return `<span class="word-highlight cursor-pointer hover:text-secondary transition-colors duration-200" data-word-index="${index}">${word}</span>`;
		})
		.join(" ");
};

// 播放单个对话
const playDialogueVoice = async (voiceUrl, text, character, index) => {
	if (props.isGlobalPlaying) {
		return;
	}

	// 通知父组件处理播放
	emit("play-dialogue", {
		voiceUrl,
		text,
		character,
		index,
		isPlaying: isPlaying.value,
		currentPlayingIndex: currentPlayingIndex.value,
	});

	// 更新本地状态
	if (isPlaying.value && currentPlayingIndex.value === index) {
		isPlaying.value = false;
		currentPlayingIndex.value = null;
		if (currentAudio.value) {
			currentAudio.value.pause();
			currentAudio.value = null;
		}
	} else {
		if (isPlaying.value) {
			if (currentAudio.value) {
				currentAudio.value.pause();
				currentAudio.value = null;
			}
		}
		isPlaying.value = true;
		currentPlayingIndex.value = index;
	}
};

// 暴露方法给父组件
defineExpose({
	setPlayingState(state, index) {
		isPlaying.value = state;
		currentPlayingIndex.value = index;
	},
});
</script>

<style scoped>
/* 播客标题区域的特殊样式 */
.podcast-header {
	position: relative;
	overflow: hidden;
}

.podcast-header::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 10px,
		rgba(0, 0, 0, 0.03) 10px,
		rgba(0, 0, 0, 0.03) 12px
	);
	z-index: 0;
}

.podcast-header > * {
	position: relative;
	z-index: 1;
}

.podcast-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	background-color: white;
	border: 2px solid black;
	border-radius: 50%;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.shadow-custom {
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
}

.dialogue-wrapper {
	position: relative;
}

.log-item {
	padding: 1.5rem;
	background: white;
	transform-origin: bottom;
}

/* 修改对话气泡样式 */
.speech-bubble-left {
	position: relative;
	border-radius: 12px;
	border-top-left-radius: 0;
}

.speech-bubble-right {
	position: relative;
	border-radius: 12px;
	border-top-right-radius: 0;
}

.speech-bubble-right::before {
	content: "";
	position: absolute;
	top: -2px;
	right: -10px;
	width: 20px;
	height: 20px;
	background: white;
	border-right: 2px solid black;
	border-bottom: 2px solid black;
	transform: rotate(45deg);
	clip-path: polygon(0 100%, 100% 0, 0 0);
}

.log-item.playing {
	animation: playingPulse 2s infinite;
}

.shadow-custom {
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
}

.animate-fade-in {
	animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes playingPulse {
	0% {
		box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
		transform: scale(1);
	}
	50% {
		box-shadow: 4px 4px 0 rgba(var(--secondary-color-rgb), 0.4);
		transform: scale(1.02);
	}
	100% {
		box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
		transform: scale(1);
	}
}
</style>
