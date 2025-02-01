<template>
	<div class="scroll-container" ref="praticeContainerRef">
		<div class="space-y-8">
			<div
				class="terminal-prompt my-6 text-left relative p-4 bg-gray-600/20 rounded-lg shadow-lg"
			>
				<span class="text-accent">@Bazinga</span>
				<span class="text-accent mr-2">:</span>
				<span class="text-gray-400">~/episode/{{ props.currentPage }}</span>
				<span class="text-gray-400">$</span>
				<span class="text-gray-200 ml-2"
					>run {{ currentPractice.conversation_id }}.sh</span
				>
			</div>

			<!-- 对话历史 -->
			<div class="space-y-8">
				<div
					v-for="(dialogue, index) in displayedDialogues"
					:key="index"
					class="dialogue-wrapper flex items-start gap-4"
					:class="{
						'animate-fade-in': index === displayedDialogues.length - 1,
						'flex-row-reverse': dialogue.character === 'Jinji',
					}"
				>
					<div class="avatar-wrapper flex flex-col items-center gap-2">
						<div
							class="w-10 h-10 rounded-full overflow-hidden border-2 border-accent/50 shadow-lg"
						>
							<img
								:src="`/src/assets/${dialogue.character.toLowerCase()}.png`"
								:alt="dialogue.character"
								class="w-full h-full object-cover"
							/>
						</div>
						<span class="text-accent text-sm font-medium">{{
							dialogue.character
						}}</span>
					</div>
					<div class="flex-1 max-w-[70%]">
						<div
							class="log-item rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl relative group"
							:class="{
								'bg-primary/10 border-primary rounded-tr-sm':
									dialogue.character === 'User',
								'bg-accent/10 border-accent rounded-tl-sm':
									dialogue.character !== 'User',
							}"
						>
							<div class="flex-1">
								<div class="text-gray-100 text-md leading-relaxed">
									<span v-html="highlightWords(dialogue.english)"></span>
								</div>
								<div
									class="text-gray-400 text-sm pt-3 border-t border-gray-700/30 transition-all duration-300"
									v-if="showTranslation"
									:class="{ 'opacity-0': !showTranslation }"
								>
									{{ dialogue.chinese }}
								</div>
							</div>
							<button
								class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-accent hover:text-accent/80"
								@click="
									playDialogueVoice(
										dialogue.voiceUrl,
										dialogue.english,
										dialogue.character
									)
								"
								:disabled="
									isPlaying &&
									dialogueElements[index]?.classList.contains('playing')
								"
								:class="{
									'cursor-not-allowed opacity-50':
										isPlaying &&
										dialogueElements[index]?.classList.contains('playing'),
								}"
							>
								<i class="bi bi-play-circle text-lg"></i>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onUpdated } from "vue";
import apiClient from "@/api";
import WordDictionary from "@/components/common/WordDictionary.vue";

// 全局播放器类
class GlobalPlayer {
	constructor() {
		this.isPlaying = ref(false);
		this.currentIndex = 0;
		this.currentAudio = null;
	}

	async playAudio(voiceUrl, text, character) {
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio = null;
		}

		return new Promise((resolve, reject) => {
			this.currentAudio = new Audio(voiceUrl);
			this.currentAudio.onended = () => {
				resolve();
			};
			this.currentAudio.onerror = (error) => {
				reject(error);
			};
			this.currentAudio.play().catch(reject);
		});
	}

	cleanup() {
		this.isPlaying.value = false;
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio = null;
		}
		// 清理时重置索引
		this.currentIndex = 0;
		// 移除所有对话框的 playing 类
		const allDialogueElements = document.querySelectorAll(".log-item");
		allDialogueElements.forEach((element) => {
			element.classList.remove("playing");
		});
	}
}

// 单独播放器类
class SinglePlayer {
	constructor() {
		this.isPlaying = ref(false);
		this.currentAudio = null;
	}

	async playAudio(voiceUrl, text, character, dialogueElements, dialogueIndex) {
		// 如果已经在播放，先停止当前播放
		if (this.isPlaying.value) {
			// 停止当前音频
			if (this.currentAudio) {
				this.currentAudio.pause();
				this.currentAudio = null;
			}
			// 移除所有播放状态
			dialogueElements.forEach((element) => {
				element.classList.remove("playing");
			});
			this.isPlaying.value = false;
		}

		// 给当前播放的对话框添加 playing 类
		dialogueElements[dialogueIndex].classList.add("playing");
		this.isPlaying.value = true;

		try {
			this.currentAudio = new Audio(voiceUrl);
			await this.currentAudio.play();

			return new Promise((resolve) => {
				this.currentAudio.onended = () => {
					this.cleanup();
					dialogueElements[dialogueIndex].classList.remove("playing");
					resolve();
				};
			});
		} catch (error) {
			console.error("播放失败:", error);
			this.cleanup();
			dialogueElements[dialogueIndex].classList.remove("playing");
		}
	}

	cleanup() {
		this.isPlaying.value = false;
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio = null;
		}
	}
}

// 创建播放器实例
const globalPlayer = new GlobalPlayer();
const singlePlayer = new SinglePlayer();

const props = defineProps({
	currentPractice: {
		type: Object,
		required: true,
	},
	currentPage: {
		type: Number,
		required: true,
	},
});

const displayedDialogues = ref([]);
const praticeContainerRef = ref(null);
const showTranslation = ref(false);

const toggleTranslation = () => {
	showTranslation.value = !showTranslation.value;
};

onMounted(() => {
	displayedDialogues.value = props.currentPractice.dialogues;
});

// 全局播放状态
const isGlobalPlaying = ref(false);
let currentPlayingIndex = 0;
let globalAudioQueue = [];

// 单独播放状态
const isPlaying = ref(false);
let currentAudio = null;

const playAllDialogues = async () => {
	if (globalPlayer.isPlaying.value) {
		// 只暂停播放，不清理索引
		globalPlayer.isPlaying.value = false;
		if (globalPlayer.currentAudio) {
			globalPlayer.currentAudio.pause();
			globalPlayer.currentAudio = null;
		}
		// 移除当前播放对话框的 playing 类
		const allDialogueElements = document.querySelectorAll(".log-item");
		allDialogueElements.forEach((element) => {
			element.classList.remove("playing");
		});
		return;
	}

	// 停止单独播放器
	singlePlayer.cleanup();

	globalPlayer.isPlaying.value = true;
	// 如果没有暂停位置记录，从头开始播放
	if (globalPlayer.currentIndex >= displayedDialogues.value.length) {
		globalPlayer.currentIndex = 0;
	}

	const playNext = async () => {
		if (
			globalPlayer.currentIndex >= displayedDialogues.value.length ||
			!globalPlayer.isPlaying.value
		) {
			globalPlayer.cleanup();
			return;
		}

		const dialogue = displayedDialogues.value[globalPlayer.currentIndex];
		try {
			// 获取当前对话框元素
			const dialogueElements = document.querySelectorAll(".dialogue-wrapper");
			const currentElement = dialogueElements[globalPlayer.currentIndex];

			// 滚动到当前对话框
			if (
				currentElement &&
				globalPlayer.isPlaying.value &&
				praticeContainerRef.value
			) {
				const container = praticeContainerRef.value;
				const containerRect = container.getBoundingClientRect();
				const elementRect = currentElement.getBoundingClientRect();
				const targetScrollTop =
					container.scrollTop +
					(elementRect.top - containerRect.top) -
					containerRect.height / 2 +
					elementRect.height / 2;

				container.scrollTo({
					top: targetScrollTop,
					behavior: "smooth",
				});
			}

			// 移除所有对话框的 playing 类
			const allDialogueElements = document.querySelectorAll(".log-item");
			allDialogueElements.forEach((element) => {
				element.classList.remove("playing");
			});

			// 只给当前播放的对话框添加 playing 类
			if (globalPlayer.isPlaying.value) {
				const currentDialogueElement =
					allDialogueElements[globalPlayer.currentIndex];
				if (currentDialogueElement) {
					currentDialogueElement.classList.add("playing");
				}
			}

			if (globalPlayer.isPlaying.value) {
				await globalPlayer.playAudio(
					dialogue.voiceUrl,
					dialogue.english,
					dialogue.character
				);
				if (globalPlayer.isPlaying.value) {
					// 确保仍在全局播放状态
					globalPlayer.currentIndex++;
					await playNext();
				}
			}
		} catch (error) {
			console.error("播放失败:", error);
			globalPlayer.cleanup();
		}
	};

	await playNext();
};

// 修改单独播放函数
const playDialogueVoice = async (voiceUrl, text, character) => {
	// 如果正在全局播放，不允许单独播放
	if (globalPlayer.isPlaying.value) {
		return;
	}

	const currentDialogue = displayedDialogues.value.find(
		(d) => d.english === text
	);
	const dialogueIndex = displayedDialogues.value.indexOf(currentDialogue);
	const dialogueElements = document.querySelectorAll(".log-item");

	await singlePlayer.playAudio(
		voiceUrl,
		text,
		character,
		dialogueElements,
		dialogueIndex
	);
};

// 在组件卸载时清理资源
onUnmounted(() => {
	globalPlayer.cleanup();
	singlePlayer.cleanup();
});

defineExpose({
	toggleTranslation,
	playAllDialogues,
});

// 在组件更新时检查状态
onUpdated(() => {
	if (!globalPlayer.isPlaying.value && !singlePlayer.isPlaying.value) {
		globalPlayer.cleanup();
		singlePlayer.cleanup();
	}
});
const highlightWords = (text) => {
	return text
		.split(/\s+/)
		.map((word, index) => {
			return `<span class="word-highlight cursor-pointer hover:text-accent transition-colors duration-200" data-word-index="${index}" @click="showWordDefinition(word)">${word}</span>`;
		})
		.join(" ");
};

const showWordDefinition = async (word) => {
	const dictionaryPopup = document.createElement("div");
	const app = createApp(WordDictionary, {
		word,
		onClose: () => {
			document.body.removeChild(dictionaryPopup);
		},
	});
	dictionaryPopup.id = "word-dictionary-popup";
	document.body.appendChild(dictionaryPopup);
	app.mount("#word-dictionary-popup");
};
</script>

<style scoped>
.scroll-container {
	position: relative;
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding: 0 24px 48px 24px;
	position: relative;
	z-index: 3;
	height: 0;
	-webkit-overflow-scrolling: touch;
	scroll-behavior: smooth;
	overscroll-behavior-y: contain;
}

.dialogue-wrapper {
	position: relative;
}

.log-item {
	padding: 1.5rem;
	background: rgba(var(--accent-color-rgb), 0.05);
	border-left: 4px solid var(--accent-color);
	text-shadow: 0 0 10px rgba(var(--accent-color-rgb), 0.3);
	transform-origin: bottom;
}

.log-item.playing {
	animation: borderPulse 2s infinite;
}

@keyframes borderPulse {
	0% {
		border-left-color: var(--accent-color);
	}
	50% {
		border-left-color: transparent;
	}
	100% {
		border-left-color: var(--accent-color);
	}
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
</style>
