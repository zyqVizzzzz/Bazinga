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
import { ref, onMounted, onUnmounted,onUpdated } from "vue";
import apiClient from "@/api";
import WordDictionary from "@/components/common/WordDictionary.vue";

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
	if (isGlobalPlaying.value) {
		// 停止所有音频播放并清理资源
		globalAudioQueue.forEach((audio) => {
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
				audio.src = ""; // 清除音频源
				audio.load(); // 强制重置
			}
		});
		globalAudioQueue = [];
		isGlobalPlaying.value = false;
		currentPlayingIndex = 0; // 重置播放索引

		// 移除所有对话框的 playing 类
		const dialogueElements = document.querySelectorAll(".log-item");
		dialogueElements.forEach((element) => {
			element.classList.remove("playing");
		});
		return;
	}

	// 确保开始新的播放前清理旧的状态
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.currentTime = 0;
		currentAudio.src = "";
		currentAudio.load();
		currentAudio = null;
	}

	isGlobalPlaying.value = true;
	currentPlayingIndex = 0;

	const playNext = async () => {
		if (
			currentPlayingIndex >= displayedDialogues.value.length ||
			!isGlobalPlaying.value
		) {
			isGlobalPlaying.value = false;
			currentPlayingIndex = 0;
			// 移除所有对话框的 playing 类
			const dialogueElements = document.querySelectorAll(".log-item");
			dialogueElements.forEach((element) => {
				element.classList.remove("playing");
			});
			return;
		}

		const dialogue = displayedDialogues.value[currentPlayingIndex];
		try {
			// 获取当前对话框元素
			const dialogueElements = document.querySelectorAll(".dialogue-wrapper");
			const currentElement = dialogueElements[currentPlayingIndex];

			// 滚动到当前对话框
			if (
				currentElement &&
				isGlobalPlaying.value &&
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
			if (isGlobalPlaying.value) {
				const currentDialogueElement = allDialogueElements[currentPlayingIndex];
				if (currentDialogueElement) {
					currentDialogueElement.classList.add("playing");
				}
			}

			if (isGlobalPlaying.value) {
				await playDialogueVoice(
					dialogue.voiceUrl,
					dialogue.english,
					dialogue.character,
					true
				);
				if (isGlobalPlaying.value) {
					// 确保仍在全局播放状态
					currentPlayingIndex++;
					await playNext();
				}
			}
		} catch (error) {
			console.error("播放失败:", error);
			isGlobalPlaying.value = false;
			// 移除所有对话框的 playing 类
			const dialogueElements = document.querySelectorAll(".log-item");
			dialogueElements.forEach((element) => {
				element.classList.remove("playing");
			});
		}
	};

	await playNext();
};

defineExpose({
	toggleTranslation,
	playAllDialogues,
});

// 修改现有的playDialogueVoice函数
const playDialogueVoice = async (
	voiceUrl,
	text,
	character,
	isGlobal = false
) => {
	// 如果正在全局播放，不允许单独播放
	if (!isGlobal && isGlobalPlaying.value) {
		return;
	}

	// 停止当前播放的音频并清理资源
	if (!isGlobal && currentAudio) {
		currentAudio.pause();
		currentAudio.currentTime = 0;
		currentAudio.src = "";
		currentAudio.load();
		currentAudio = null;

		// 移除所有对话框的 playing 类
		const dialogueElements = document.querySelectorAll(".log-item");
		dialogueElements.forEach((element) => {
			element.classList.remove("playing");
		});
		isPlaying.value = false;
	}

	try {
		// 如果有预生成的语音URL，直接播放
		if (voiceUrl) {
			const audio = new Audio();
			return new Promise((resolve, reject) => {
				audio.oncanplaythrough = async () => {
					try {
						if (isGlobal) {
							// 确保在添加新音频前清理已结束的音频
							globalAudioQueue = globalAudioQueue.filter((a) => !a.ended);
							globalAudioQueue.push(audio);
						} else {
							currentAudio = audio;
							isPlaying.value = true;
							// 找到当前播放的对话元素并添加 playing 类
							const currentDialogue = displayedDialogues.value.find(
								(d) => d.english === text
							);
							const dialogueIndex =
								displayedDialogues.value.indexOf(currentDialogue);
							const dialogueElements = document.querySelectorAll(".log-item");
							if (dialogueElements[dialogueIndex]) {
								dialogueElements[dialogueIndex].classList.add("playing");
							}
						}

						await audio.play();
						console.log("开始播放预生成音频");
						audio.onended = () => {
							if (!isGlobal) {
								// 移除 playing 类
								const currentDialogue = displayedDialogues.value.find(
									(d) => d.english === text
								);
								const dialogueIndex =
									displayedDialogues.value.indexOf(currentDialogue);
								const dialogueElements = document.querySelectorAll(".log-item");
								if (dialogueElements[dialogueIndex]) {
									dialogueElements[dialogueIndex].classList.remove("playing");
								}
								isPlaying.value = false;
								currentAudio = null;
							}
							resolve();
						};

						// 添加错误处理
						audio.onerror = () => {
							console.error("音频播放出错");
							if (!isGlobal) {
								isPlaying.value = false;
								currentAudio = null;
							}
							reject(new Error("Audio playback error"));
						};
					} catch (err) {
						// 确保在错误时清理资源
						audio.src = "";
						audio.load();
						reject(err);
					}
				};
				audio.src = voiceUrl;
				audio.load();
			});
		}

		// 如果没有预生成的语音URL，则生成新的语音
		const response = await apiClient.post("/voice/generate", {
			text: text,
			role: character,
		});

		if (response.data.code === 200 && response.data.data.audio) {
			const base64Data = response.data.data.audio;
			const binaryString = window.atob(base64Data);
			const bytes = new Uint8Array(binaryString.length);

			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			const blob = new Blob([bytes.buffer], { type: "audio/mp3" });
			const audioUrl = URL.createObjectURL(blob);
			const audio = new Audio();

			return new Promise((resolve, reject) => {
				audio.oncanplaythrough = async () => {
					try {
						if (!isGlobal) {
							currentAudio = audio;
							isPlaying.value = true;
						}
						await audio.play();
						console.log("开始播放生成的音频", response.data.data.extraInfo);
						audio.onended = () => {
							URL.revokeObjectURL(audioUrl);
							if (!isGlobal) {
								isPlaying.value = false;
								currentAudio = null;
							}
							resolve();
						};

						// 添加错误处理
						audio.onerror = () => {
							console.error("音频播放出错");
							URL.revokeObjectURL(audioUrl);
							const index = singleAudioQueue.indexOf(audio);
							if (index > -1) {
								singleAudioQueue.splice(index, 1);
							}
							reject(new Error("Audio playback error"));
						};
					} catch (err) {
						URL.revokeObjectURL(audioUrl);
						reject(err);
					}
				};
				audio.src = audioUrl;
				audio.load();
			});
		}
	} catch (error) {
		console.error("播放音频失败:", error);
		throw error;
	}
};

const cleanupAudioResources = () => {
	// 清理全局音频队列
	globalAudioQueue.forEach((audio) => {
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
			audio.src = "";
			audio.load();
		}
	});
	globalAudioQueue = [];

	// 清理当前音频
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.currentTime = 0;
		currentAudio.src = "";
		currentAudio.load();
		currentAudio = null;
	}

	// 重置状态
	isGlobalPlaying.value = false;
	isPlaying.value = false;
	currentPlayingIndex = 0;

	// 移除所有播放标记
	const dialogueElements = document.querySelectorAll(".log-item");
	dialogueElements.forEach((element) => {
		element.classList.remove("playing");
	});
};

// 在组件卸载时清理资源
onUnmounted(() => {
	cleanupAudioResources();
});

// 在组件更新时检查状态
onUpdated(() => {
	if (!isGlobalPlaying.value && !isPlaying.value) {
		cleanupAudioResources();
	}
});
const highlightWords = (text) => {
	return text
		.split(/\s+/)
		.map((word) => {
			return `<span class="word-highlight cursor-pointer hover:text-accent transition-colors duration-200" @click="showWordDefinition(word)">${word}</span>`;
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
