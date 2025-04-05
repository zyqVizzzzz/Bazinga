<template>
	<dialog ref="podcastModalRef" class="modal">
		<div class="modal-box vintage-radio max-w-2xl min-h-[400px] p-6">
			<!-- 关闭按钮 -->
			<form method="dialog" class="absolute right-4 top-4">
				<button class="btn btn-sm btn-circle btn-ghost">
					<i class="bi bi-x-lg"></i>
				</button>
			</form>
			<!-- 初始状态 -->
			<div v-if="!hasContent" class="h-full flex flex-col">
				<!-- 收音机顶部装饰区 -->
				<div class="radio-top-panel flex items-center mb-4">
					<div class="radio-indicator"></div>
					<div class="radio-brand text-amber-200 ml-4">BAZINGA RADIO</div>
				</div>

				<!-- 知识点显示屏 -->
				<div class="radio-display p-4 mb-8">
					<!-- <div class="frequency-display mb-2">FM 98.7 MHz</div> -->
					<div class="font-medium text-lg text-secondary-200 font-bold">
						{{ knowledge?.word }}
					</div>
					<div class="text-secondary-100/70 mt-1 font-bold">
						{{ knowledge?.word_zh }}
					</div>
				</div>

				<!-- 生成按钮区域 -->
				<div class="flex-1 flex items-center justify-center">
					<button
						@click="generatePodcast"
						class="retro-btn w-[200px] h-10"
						:disabled="generating"
					>
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<span
										v-if="generating"
										class="loading loading-spinner loading-sm mr-2"
									></span>
									<i v-else class="bi bi-broadcast mr-2"></i>
									生成播客
								</div>
							</div>
						</div>
					</button>
				</div>
			</div>

			<!-- 生成后状态 -->
			<div v-else>
				<!-- 收音机顶部装饰区 -->
				<div class="radio-top-panel flex items-center mb-2">
					<div class="radio-indicator"></div>
					<div class="radio-brand text-amber-200 ml-4">BAZINGA RADIO</div>
				</div>
				<!-- 收音机顶部面板 -->
				<div class="radio-top-panel flex justify-between items-center">
					<div class="radio-display p-3 flex-1 mr-4">
						<div class="text-base-700 font-bold">
							{{ knowledge?.word }}
						</div>
						<div class="text-base-700 mt-1 text-sm font-bold">
							{{ knowledge?.word_zh }}
						</div>
					</div>

					<button
						class="retro-btn w-10 h-10"
						@click="generatePodcast"
						:disabled="generating"
					>
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<span
										v-if="generating"
										class="loading loading-spinner loading-xs"
									></span>
									<i v-else class="bi bi-arrow-clockwise"></i>
								</div>
							</div>
						</div>
					</button>
				</div>

				<!-- 播放器控制区 -->
				<div class="radio-control-panel p-4">
					<div class="flex items-center gap-4">
						<audio
							v-if="audioUrl"
							controls
							class="radio-player flex-1"
							ref="audioElement"
						>
							<source :src="audioUrl" type="audio/mpeg" />
						</audio>

						<div class="language-toggle flex justify-center items-center">
							<div class="vintage-toggle-group">
								<button
									class="vintage-toggle-btn text-xs"
									:class="{ active: showEnglish }"
									@click="toggleLanguage('english')"
								>
									英
								</button>
								<button
									class="vintage-toggle-btn text-xs"
									:class="{ active: showChinese }"
									@click="toggleLanguage('chinese')"
								>
									中
								</button>
							</div>
						</div>
					</div>

					<!-- 脚本显示区 -->
					<div v-if="showScript" class="radio-script-panel">
						<div class="radio-script-content">
							<div
								v-for="(paragraph, idx) in podcastScript"
								:key="idx"
								class="script-paragraph"
							>
								<p v-if="showEnglish" class="text-sm text-base-700 text-left">
									{{ paragraph }}
								</p>
								<p
									v-if="showChinese && podcastChineseScript[idx]"
									class="text-sm text-base-700/70 mt-1.5 italic text-left"
								>
									{{ podcastChineseScript[idx] }}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</dialog>
</template>
<script setup>
import { ref, reactive, watch, computed } from "vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { usePointsStore } from "@/store/index";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";

const props = defineProps({
	knowledge: {
		type: Object,
		required: true,
	},
	sceneIndex: {
		// 添加场景索引属性
		type: Number,
		default: 0,
	},
});

const route = useRoute();

// 状态变量
const generating = ref(false);
const audioUrl = ref("");
const podcastScript = ref([]);
const podcastChineseScript = ref([]);
const showScript = ref(true);
const showEnglish = ref(true);
const showChinese = ref(false);

// 引用
const podcastModalRef = ref(null);
const audioElement = ref(null);

// 计算属性
const hasContent = computed(() => podcastScript.value.length > 0);

// 方法定义
const toggleScript = () => {
	showScript.value = !showScript.value;
};

const toggleLanguage = (lang) => {
	if (lang === "english") {
		showEnglish.value = !showEnglish.value;
		if (!showEnglish.value && !showChinese.value) {
			showChinese.value = true;
		}
	} else {
		showChinese.value = !showChinese.value;
		if (!showEnglish.value && !showChinese.value) {
			showEnglish.value = true;
		}
	}
};

// 生成播客
const generatePodcast = async () => {
	try {
		generating.value = true;

		// 1. 生成播客脚本
		const scriptResponse = await apiClient.post(
			"/translation/generate-podcast",
			{
				keyPhrases: [props.knowledge.word],
				model: "deepseek-ai/DeepSeek-V3",
				voice: "Furin",
			}
		);

		if (scriptResponse.data.code === 200) {
			const podcastData = scriptResponse.data.data.podcast;
			podcastScript.value = podcastData.map((item) => item.lines);
			podcastChineseScript.value = podcastData.map(
				(item) => item.chinese_lines || ""
			);

			// 2. 生成音频 (使用 Azure TTS)
			const audioResponse = await apiClient.post(
				"/podcasts/generate-audio-edge",
				{
					knowledge: props.knowledge.word,
					script: podcastScript.value.join("\n"),
					voice: "en-US-AvaNeural",
					resourceId: route.query.sign || "",
					sceneId: props.sceneIndex?.toString() || "0",
				}
			);

			if (audioResponse.data.code === 200) {
				audioUrl.value = audioResponse.data.data.result.audioUrl;
				if (audioElement.value) {
					setTimeout(() => {
						const source = audioElement.value.querySelector("source");
						if (source) {
							source.src = audioUrl.value;
							audioElement.value.load();
						}
					}, 0);
				}

				// 3. 保存播客
				const podcastData = {
					knowledge: props.knowledge.word,
					resourceId: route.query.sign || "",
					script: podcastScript.value,
					chineseScript: podcastChineseScript.value,
					audioPath: audioUrl.value,
					sceneId: (props.selectedSceneIndex + 1).toString(),
					options: {},
				};

				const saveResponse = await apiClient.post(
					"/podcasts/save",
					podcastData
				);

				if (saveResponse.data.code === 200) {
					// 更新本地缓存
					// savedPodcasts.value.set(key, {
					// 	script: [...podcastScript.value],
					// 	chineseScript: [...podcastChineseScript.value],
					// 	audioUrl: podcastUrl.value,
					// 	timestamp: new Date().toISOString(),
					// 	id: saveResponse.data.data.id,
					// });

					// // 扣除积分（脚本生成10分，音频生成20分）
					// pointsStore.updatePoints(-30);
					showToast({ message: "播客生成完成", type: "success" });
				}
			}
		}
	} catch (error) {
		console.error("Podcast generation error:", error);
		showToast({
			message: error.response?.data?.message || "播客生成失败",
			type: "error",
		});
	} finally {
		generating.value = false;
	}
};

// 监听 knowledge 变化，如果有现有播客数据则直接加载
watch(
	() => props.knowledge,
	(newVal) => {
		if (newVal?.existingPodcast) {
			audioUrl.value = newVal.existingPodcast.audioPath;
			podcastScript.value = newVal.existingPodcast.script;
			podcastChineseScript.value = newVal.existingPodcast.chineseScript;
		} else {
			// 重置状态
			audioUrl.value = "";
			podcastScript.value = [];
			podcastChineseScript.value = [];
		}
	},
	{ immediate: true }
);

// 对外暴露方法
defineExpose({
	showModal: () => podcastModalRef.value?.showModal(),
	closeModal: () => podcastModalRef.value?.close(),
});
</script>

<style scoped>
.modal-box {
	background: #ffffff;
	border: 2px solid #000;
	/* box-shadow: 8px 8px 0 #000; */
	overflow: hidden;
}

.radio-top-panel {
	/* border-bottom: 2px solid #000; */
	padding-bottom: 1rem;
}

.radio-brand {
	font-family: "Courier New", monospace;
	font-weight: bold;
	letter-spacing: 2px;
	color: #000;
	-webkit-text-stroke: 1px #000;
}

.radio-display {
	background: #f5f5f5;
	padding: 8px;
	border-radius: 4px;
	border: 2px solid #000;
	box-shadow: 2px 2px 0 #000;
}

.frequency-display {
	color: var(--secondary-color);
	font-family: monospace;
	font-size: 14px;
	font-weight: bold;
}

.radio-indicator {
	width: 8px;
	height: 8px;
	background: var(--secondary-color);
	border-radius: 50%;
	border: 2px solid #000;
	box-shadow: 0 0 0 2px #fff, 0 0 8px var(--secondary-color),
		0 0 15px var(--secondary-color);
	animation: blink 2s ease-in-out infinite;
}

.radio-control-panel {
	background: #f5f5f5;
	/* border: 2px solid #000; */
	border-radius: 8px;
	/* box-shadow: 4px 4px 0 #000; */
}

.radio-player {
	width: 100%;
	height: 36px;
	border-radius: 4px;
	border: 2px solid #000;
}

.radio-script-panel {
	background: #f5f5f5;
	border-radius: 6px;
	padding: 1rem 0;
}

.radio-script-content {
	padding: 0.75rem;
	background: #fff;
	border: 2px solid #000;
	border-radius: 4px;
	color: #000;
}

.vintage-toggle-group {
	display: flex;
	background: #fff;
	padding: 2px;
	border-radius: 20px;
	border: 2px solid #000;
}

.vintage-toggle-btn {
	padding: 4px 12px;
	color: #000;
	border-radius: 16px;
	transition: all 0.2s;
	font-weight: bold;
}

.vintage-toggle-btn.active {
	background: #000;
	color: #fff;
}

.vintage-btn,
.vintage-btn-xs {
	background: #fff;
	border: 2px solid #000;
	border-radius: 8px;
	transition: all 0.2s;
	box-shadow: 4px 4px 0 #000;
}

.vintage-btn:hover:not(:disabled),
.vintage-btn-xs:hover:not(:disabled) {
	transform: translate(-2px, -2px);
	box-shadow: 6px 6px 0 #000;
}

.vintage-btn:active:not(:disabled),
.vintage-btn-xs:active:not(:disabled) {
	transform: translate(2px, 2px);
	box-shadow: 2px 2px 0 #000;
}

.vintage-btn-face {
	color: #000;
	font-weight: bold;
	padding: 8px 16px;
}

.vintage-btn-xs .vintage-btn-face {
	padding: 4px 8px;
	font-size: 12px;
}

@keyframes blink {
	0% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.3;
		transform: scale(0.85);
	}
	100% {
		opacity: 1;
		transform: scale(1);
	}
}

.script-paragraph {
	margin-bottom: 1.5rem;
}

.script-paragraph:last-child {
	margin-bottom: 0;
}
.retro-btn {
	position: relative;
	border: none;
	background: none;
	cursor: pointer;
}

.retro-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 6px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 6px;
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
	border: 2px solid #333;
	border-radius: 6px;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 按钮交互效果 */
.retro-btn:hover:not(:disabled) .btn-face {
	background-color: white;
}

.retro-btn:active:not(:disabled) .btn-edge,
.retro-btn:active:not(:disabled) .btn-face {
	transform: translateY(0);
}
</style>
