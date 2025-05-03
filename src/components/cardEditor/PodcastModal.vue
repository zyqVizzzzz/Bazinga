<template>
	<dialog ref="podcastModalRef" class="modal" @close="handleClose">
		<div class="modal-box vintage-radio max-w-2xl min-h-[400px] p-6">
			<!-- 生成后状态 -->
			<div>
				<!-- 收音机顶部装饰区 -->
				<div class="radio-top-panel flex items-center mb-2">
					<div class="radio-brand text-xs text-amber-200">
						BAZINGA RADIO SYSTEM
					</div>
				</div>
				<!-- 收音机顶部面板 -->
				<div class="radio-top-panel flex justify-between items-center">
					<div class="radio-display p-3 flex-1 relative">
						<!-- 知识点内容 -->
						<div class="text-base-700 font-bold">
							{{ knowledge?.word }}
						</div>
						<div class="text-base-700 mt-1 text-sm font-bold">
							{{ knowledge?.word_zh }}
						</div>

						<!-- 将按钮移到这里，并添加绝对定位样式 -->
						<div
							class="tooltip absolute bottom-0 right-2 w-8 h-8"
							:data-tip="hasContent ? '重新生成' : '生成播客'"
						>
							<button @click="generatePodcast" :disabled="generating">
								<!-- 添加 flex 居中图标 -->
								<span
									v-if="generating"
									class="loading loading-spinner loading-sm"
								></span>
								<!-- 调整图标大小 -->
								<i
									v-else-if="hasContent"
									class="bi bi-arrow-clockwise text-sm"
								></i>
								<i v-else class="bi bi-broadcast text-sm"></i>
							</button>
						</div>
					</div>
				</div>

				<!-- 播放器控制区 -->
				<div class="radio-control-panel p-4">
					<div class="flex items-center gap-4">
						<div class="flex-1">
							<audio
								v-if="audioUrl"
								controls
								class="radio-player"
								ref="audioElement"
							>
								<source :src="audioUrl" type="audio/mpeg" />
							</audio>
							<div
								v-else-if="generating"
								class="radio-player flex items-center justify-center gap-2 text-base-700"
							>
								<span class="loading loading-spinner loading-sm"></span>
								音频生成中...
							</div>
							<audio v-else controls class="radio-player" ref="audioElement">
								<source :src="undefined" type="audio/mpeg" />
							</audio>
						</div>

						<div class="language-toggle flex justify-center items-center">
							<button
								class="translation-toggle-btn text-sm"
								:class="{ active: showTranslated }"
								@click="toggleLanguage"
								title="显示/隐藏中文翻译"
							>
								<TranslationIcon size="4" />
							</button>
						</div>
					</div>

					<!-- 脚本显示区 -->
					<div v-if="hasContent" class="radio-script-panel">
						<div class="radio-script-content">
							<div
								v-for="(paragraph, idx) in podcastScript"
								:key="idx"
								class="script-paragraph"
							>
								<p class="text-sm text-base-700 text-left">
									{{ paragraph }}
								</p>
								<p
									v-if="showTranslated && podcastChineseScript[idx]"
									class="text-sm text-base-700/70 mt-1.5 italic text-left"
								>
									{{ podcastChineseScript[idx] }}
								</p>
							</div>
						</div>
					</div>
					<div v-else class="radio-script-panel empty-script-panel">
						<div class="text-center text-base-700/70">
							<p>
								暂无内容，点击 <i class="bi bi-broadcast"></i> 图标生成播客。
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>关闭</button>
		</form>
	</dialog>
</template>
<script setup>
import { ref, watch, computed } from "vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useRoute } from "vue-router";
import TranslationIcon from "@/components/icons/Translation.vue";

const props = defineProps({
	knowledge: {
		type: Object,
		required: false,
		default: null,
	},
	sceneIndex: {
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
const showTranslated = ref(false);

// 引用
const podcastModalRef = ref(null);
const audioElement = ref(null);

const emit = defineEmits(["updatePodcast"]);

// 计算属性
const hasContent = computed(() => podcastScript.value.length > 0);

const toggleLanguage = () => {
	showTranslated.value = !showTranslated.value;
};

// 生成播客
const generatePodcast = async () => {
	try {
		generating.value = true;
		// 立即清除旧的音频 URL
		audioUrl.value = "";
		console.log(props.knowledge.word_zh);
		// 1. 生成播客脚本
		const scriptResponse = await apiClient.post(
			"/translation/generate-podcast",
			{
				keyPhrases: [props.knowledge.word, props.knowledge.word_zh],
				model: "deepseek-ai/DeepSeek-V3",
				voice: "Doryn",
			}
		);

		if (scriptResponse.data.code === 200) {
			if (scriptResponse.data.data.error) {
				showToast({ message: scriptResponse.data.data.error, type: "error" });
				return;
			}
			const podcastData = scriptResponse.data.data.podcast;
			podcastScript.value = podcastData.map((item) => item.lines);
			podcastChineseScript.value = podcastData.map(
				(item) => item.chinese_lines || ""
			);

			// 2. 生成音频
			const audioResponse = await apiClient.post("/podcasts/generate-audio", {
				knowledge: props.knowledge.word,
				script: podcastScript.value.join("\n"),
				resourceId: route.query.sign || "",
				sceneId: props.sceneIndex?.toString() || "0",
			});

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

				// 通知父组件更新 podcastBlocksMap
				emit("updatePodcast", {
					audioPath: audioUrl.value,
					script: podcastScript.value,
					chineseScript: podcastChineseScript.value,
					sceneIndex: props.sceneIndex,
					knowledge: props.knowledge.word,
				});
			}
		}
	} catch (error) {
		// 处理限流异常
		if (error.response?.status === 429) {
			const { message } = error.response.data;
			// 从 error.response.data.data 获取限流详情
			const { retryAfter, reset } = error.response.data.data || {};

			// 将 reset 时间戳转换为可读格式
			let resetTimeStr = "";
			if (reset) {
				const resetDate = new Date(reset);
				// 使用 toLocaleTimeString 获取本地时间格式 HH:mm:ss
				resetTimeStr = resetDate.toLocaleTimeString();
			}

			// 显示限流提示，包含重试时间
			showToast({
				message: `${message} 请等待 ${retryAfter || "60"} 秒后重试`,
				type: "warning",
				duration: 5000, // 延长显示时间
			});

			return;
		}
		showToast({
			message: error.response?.data?.message || "播客生成失败",
			type: "error",
		});
	} finally {
		generating.value = false;
	}
};

const handleClose = () => {
	if (audioElement.value) {
		audioElement.value.pause(); // 暂停音频
		audioElement.value.currentTime = 0; // 将播放进度重置到开头
		console.log("音频已停止");
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
	background: var(--milk-color, #f5f2eb); /* 使用 milk-color 作为背景 */
	border: 3px solid #000; /* 加粗黑色边框 */
	box-shadow: 3px 3px 0 #222; /* 增加黑色阴影 */
	border-radius: 12px; /* 轻微圆角 */
	overflow: hidden; /* 隐藏溢出内容 */

	color: #000; /* 默认文字颜色为黑色 */
}

/* 顶部面板 */
.radio-top-panel {
	border-bottom: 2px solid #000; /* 添加黑色下边框 */
	margin-bottom: 1rem; /* 增加下边距 */
}

/* 收音机品牌文字 */
.radio-brand {
	font-weight: bold;
	letter-spacing: 1px;
	color: #000; /* 黑色文字 */
	font-family: "Courier New", monospace; /* 使用等宽字体 */
}

/* 收音机指示灯 */
.radio-indicator {
	width: 10px; /* 调整大小 */
	height: 10px;
	background: var(--secondary-color); /* 使用 secondary-color */
	border-radius: 50%;
	border: 2px solid #000; /* 黑色边框 */
	box-shadow: 0 0 0 2px var(--milk-color, #f5f2eb),
		/* 内部白色辉光 */ 0 0 8px var(--secondary-color),
		0 0 15px var(--secondary-color); /* 外部辉光效果 */
	animation: blink 2s ease-in-out infinite; /* 保持闪烁动画 */
}

/* 知识点显示屏 */
.radio-display {
	background: #ffffff;
	padding: 1rem; /* 增加内边距 */
	border-radius: 6px; /* 轻微圆角 */
	border: 2px solid #000; /* 黑色边框 */
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.2); /* 内阴影 */
	margin-bottom: 1rem; /* 增加下边距 */
	text-align: center; /* 文本居中 */
}

.radio-display .font-medium {
	color: #000; /* 英文单词用黑色 */
}

.radio-display .text-secondary-100\/70 {
	color: #555; /* 中文释义用深灰色 */
	font-size: 0.9rem; /* 调整字体大小 */
}

/* 复古按钮 */
.retro-btn {
	/* 保持现有 retro-btn 样式 */
	color: #000; /* 确保按钮文字是黑色 */
}

.retro-btn .btn-face {
	background-color: #fff; /* 按钮表面白色 */
	color: #000; /* 按钮文字黑色 */
	border: 2px solid #000; /* 按钮边框黑色 */
}

.retro-btn .btn-edge {
	background-color: #ccc; /* 按钮边缘灰色 */
}

.retro-btn .btn-shadow {
	background-color: #000; /* 按钮阴影黑色 */
}

.retro-btn:disabled .btn-face {
	background-color: #eee; /* 禁用时按钮表面浅灰 */
	color: #999; /* 禁用时文字灰色 */
}

.retro-btn:disabled .btn-edge {
	background-color: #bbb; /* 禁用时边缘颜色 */
}

/* 播放器控制区 */
.radio-control-panel {
	background: #f1f1f1; /* 浅灰色背景 */
	padding: 1rem;
	border-radius: 6px;
	border: 2px solid #000;
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.2); /* 内阴影 */
	margin-top: 1rem; /* 增加上边距 */
}

/* 音频播放器 */
.radio-player {
	width: 100%;
	height: 40px; /* 调整高度 */
	border-radius: 4px;
	filter: grayscale(1) contrast(1.2); /* 黑白滤镜并增加对比度 */
}

/* 音频生成中提示 */
.radio-player.flex {
	background: rgba(0, 0, 0, 0.05); /* 轻微背景 */
	border-radius: 4px;
	height: 40px;
	color: #333; /* 深灰色文字 */
}

/* 语言切换按钮组 */
.vintage-toggle-group {
	display: flex;
	border: 2px solid #000; /* 黑色边框 */
	border-radius: 20px; /* 圆角 */
	overflow: hidden;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2); /* 阴影 */
}

.vintage-toggle-btn {
	padding: 4px 12px;
	background: #fff; /* 白色背景 */
	border: none;
	cursor: pointer;
	font-weight: bold;
	color: #000; /* 黑色文字 */
	transition: all 0.2s ease;
	font-size: 0.75rem; /* 调整字体大小 */
}

.vintage-toggle-btn:not(:last-child) {
	border-right: 2px solid #000; /* 分隔线 */
}

.vintage-toggle-btn:hover {
	background: #ccc; /* 悬停时灰色背景 */
}

.vintage-toggle-btn.active {
	background: #000; /* 激活时黑色背景 */
	color: #fff; /* 激活时白色文字 */
}

/* 翻译切换按钮样式 */
.translation-toggle-btn {
	padding: 8px;
	border-radius: 6px;
	background-color: transparent;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease-in-out;
}

.translation-toggle-btn:hover {
	background-color: rgba(200, 200, 200, 0.2);
	transform: translateY(-1px);
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

/* 脚本显示区 */
.radio-script-panel {
	margin-top: 1rem; /* 增加上边距 */
	min-height: 150px; /* 确保即使内容为空也有最小高度 */
	max-height: 200px; /* 限制最大高度 */
	overflow-y: auto; /* 允许滚动 */
	background: #fff; /* 白色背景 */
	border: 2px solid #000; /* 黑色边框 */
	border-radius: 6px; /* 圆角 */
	padding: 0.8rem; /* 内边距 */
	box-shadow: inset 1px 1px 0 rgba(0, 0, 0, 0.1); /* 轻微内阴影 */
	position: relative; /* 添加相对定位 */
}

.empty-script-panel {
	display: flex; /* 使用 flex 布局 */
	justify-content: center; /* 水平居中 */
	align-items: center; /* 垂直居中 */
	text-align: center; /* 确保文本居中 */
}

/* 调整提示文字样式 */
.empty-script-panel div {
	color: #555; /* 设置文字颜色 */
	font-size: 0.9rem;
}

.empty-script-panel i {
	vertical-align: middle; /* 图标垂直居中 */
}

/* 滚动条样式 (可选) */
.radio-script-panel::-webkit-scrollbar {
	width: 8px;
}
.radio-script-panel::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}
.radio-script-panel::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.3);
	border-radius: 4px;
}
.radio-script-panel::-webkit-scrollbar-thumb:hover {
	background: rgba(0, 0, 0, 0.5);
}

.radio-script-content {
	/* 脚本内容容器 */
}

.script-paragraph {
	margin-bottom: 1rem; /* 段落下边距 */
	padding-bottom: 0.8rem; /* 段落底内边距 */
	border-bottom: 1px dashed rgba(0, 0, 0, 0.2); /* 虚线分隔 */
}

.script-paragraph:last-child {
	margin-bottom: 0;
	padding-bottom: 0;
	border-bottom: none; /* 最后一段无分隔线 */
}

.script-paragraph p {
	line-height: 1.6; /* 增加行高 */
	color: #000; /* 默认黑色 */
}

.script-paragraph .text-base-700\/70 {
	color: #555; /* 中文翻译用深灰色 */
	font-style: italic; /* 斜体 */
}

/* 闪烁动画 */
@keyframes blink {
	0%,
	100% {
		opacity: 1;
		box-shadow: 0 0 0 2px var(--milk-color, #f5f2eb),
			0 0 8px var(--secondary-color), 0 0 15px var(--secondary-color);
	}
	50% {
		opacity: 0.5;
		box-shadow: 0 0 0 2px var(--milk-color, #f5f2eb),
			0 0 4px var(--secondary-color), 0 0 8px var(--secondary-color);
	}
}
</style>
