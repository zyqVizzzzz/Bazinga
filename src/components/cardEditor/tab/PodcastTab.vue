<template>
	<div class="flex gap-4 w-full h-full">
		<!-- 左侧知识点列表 -->
		<div class="w-1/2 overflow-y-auto">
			<div class="p-4 rounded-md bg-line text-sm text-left min-h-full">
				<h4 class="text-center mb-4">请选择知识点</h4>
				<div v-if="currentKnowledge.size > 0">
					<div
						v-for="[key, value] in currentKnowledge"
						:key="key"
						class="mb-2 p-2 bg-white/50 rounded cursor-pointer relative"
						:class="{
							'saved-knowledge': savedPodcasts.has(key),
							'selected-knowledge': selectedKnowledges.includes(key),
							'hover:bg-white/70': !selectedKnowledges.includes(key),
						}"
						@click="toggleKnowledge(key)"
					>
						<div class="font-medium">{{ value.word }}</div>
						<div class="text-xs text-gray-600 mt-1">
							{{ value.word_zh }}
						</div>
						<!-- 已保存标识 -->
						<div v-if="savedPodcasts.has(key)" class="absolute top-1 right-1">
							<span class="badge badge-xs badge-success"></span>
						</div>
					</div>
				</div>
				<div v-else class="text-gray-500 text-center py-4">
					暂无知识点，请先生成知识点
				</div>
			</div>
		</div>

		<!-- 右侧播客内容 -->
		<div class="w-1/2 flex flex-col h-full">
			<!-- 顶部控制区域 -->
			<div class="mb-4 flex justify-between items-center">
				<!-- 左侧配置选项 -->
				<div class="flex flex-wrap gap-2 items-center">
					<span class="text-sm">主持人：</span>
					<select
						v-model="options.voice"
						class="select select-bordered select-sm"
					>
						<option value="muz">Muz</option>
						<option value="jinji">Jinji</option>
					</select>
				</div>
				<!-- 右侧按钮组 -->
				<div class="flex gap-2">
					<button
						v-if="
							(podcastUrl || podcastScript.length) &&
							selectedKnowledges.length > 0
						"
						@click="savePodcast"
						class="btn btn-sm btn-primary text-white"
						:disabled="generating || saving"
					>
						<i v-if="!saving" class="bi bi-floppy"></i>
						<span v-else class="loading loading-spinner loading-sm"></span>
						<span class="ml-1">保存</span>
					</button>
					<button
						v-if="
							(podcastUrl || podcastScript.length) &&
							selectedKnowledges.length > 0
						"
						@click="generatePodcast"
						class="btn btn-sm btn-secondary text-white"
						:disabled="generating"
					>
						<i v-if="!generating" class="bi bi-arrow-clockwise"></i>
						<span v-else class="loading loading-spinner loading-sm"></span>
						<!-- <span class="ml-1">重新生成</span> -->
					</button>
				</div>
			</div>

			<!-- 播客结果 -->
			<div class="flex-1 overflow-y-auto">
				<div
					v-if="
						!podcastUrl &&
						!podcastScript.length &&
						selectedKnowledges.length > 0
					"
					class="flex flex-col items-center justify-center gap-4 h-full"
					style="position: relative"
				>
					<!-- <span class="text-gray-500">暂无知识点<br />点击下方按钮自动生成</span> -->
					<button
						@click="generatePodcast"
						class="btn btn-circle btn-secondary w-16 h-16 text-white"
						:disabled="generating"
					>
						<i v-if="!generating" class="bi bi-send text-xl"></i>
						<span v-else class="loading loading-spinner loading-md"></span>
					</button>
				</div>
				<div
					v-else-if="selectedKnowledges.length === 0"
					class="flex items-center justify-center h-full"
				>
					<p class="text-gray-500">请先选择一个知识点</p>
				</div>
				<div v-else class="space-y-4">
					<!-- 音频播放器 -->
					<div v-if="podcastUrl" class="border p-4 rounded-md bg-gray-50">
						<h5 class="font-medium mb-2">音频播放</h5>
						<audio controls class="w-full">
							<source :src="podcastUrl" type="audio/mpeg" />
							您的浏览器不支持音频播放
						</audio>
					</div>

					<!-- 播客脚本 -->
					<div
						v-if="podcastScript.length"
						class="border p-4 rounded-md bg-gray-50"
					>
						<!-- 语言切换选项 -->
						<div class="flex justify-center items-center mb-4">
							<!-- <h5 class="font-medium text-sm">脚本预览</h5> -->

							<!-- 药丸式语言切换按钮组 -->
							<div
								class="flex rounded-full overflow-hidden border border-gray-800 border-2 text-xs"
							>
								<button
									class="px-3 py-1 transition-colors"
									:class="
										displayOptions.showEnglish
											? 'bg-primary text-white'
											: 'bg-white hover:bg-gray-100'
									"
									@click="toggleLanguage('english')"
								>
									英文
								</button>
								<button
									class="px-3 py-1 transition-colors"
									:class="
										displayOptions.showChinese
											? 'bg-secondary text-white'
											: 'bg-white hover:bg-gray-100'
									"
									@click="toggleLanguage('chinese')"
								>
									中文
								</button>
							</div>
						</div>
						<!-- 播客内容显示区域 -->
						<div
							v-for="(paragraph, idx) in podcastScript"
							:key="idx"
							class="podcast-paragraph mb-8 last:mb-0"
						>
							<!-- 英文内容 -->
							<p
								v-if="displayOptions.showEnglish"
								class="text-gray-700 text-sm leading-8 text-justify first-letter:text-2xl"
							>
								{{ paragraph }}
							</p>

							<!-- 中文内容 -->
							<p
								v-if="displayOptions.showChinese && podcastChineseScript[idx]"
								class="text-gray-600 text-sm leading-7 text-justify mt-2 italic"
							>
								{{ podcastChineseScript[idx] }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const props = defineProps({
	sceneContent: {
		type: Array,
		default: () => [],
	},
	selectedSceneIndex: {
		type: Number,
		default: 0,
	},
	currentKnowledge: {
		type: Map,
		required: true,
	},
});

// 选中的知识点
const selectedKnowledges = ref([]);

onMounted(() => {
	loadSavedPodcasts();
});

// 加载已保存的播客数据
const loadSavedPodcasts = async (sceneIndex = null) => {
	try {
		// 清空之前保存的播客数据
		savedPodcasts.value.clear();

		// 如果指定了场景索引，也清空该场景的缓存
		if (sceneIndex !== null && scenePodcastCache.value.has(sceneIndex)) {
			scenePodcastCache.value.delete(sceneIndex);
		}

		// 从URL获取资源ID
		const resourceId = window.location.pathname.split("/").pop() || "";
		if (!resourceId) return;

		// 调用后端接口获取已保存的播客列表
		const response = await apiClient.get(`/podcasts/resource/${resourceId}`);

		if (response.data.code === 200 && response.data.data.podcasts) {
			// 处理返回的播客数据
			const podcasts = response.data.data.podcasts;

			// 将播客数据保存到本地Map中
			podcasts.forEach((podcast) => {
				// 只加载当前场景的播客，如果提供了场景索引
				if (sceneIndex !== null && podcast.sceneId !== sceneIndex.toString()) {
					return;
				}

				// 根据knowledge查找对应的key
				for (const [key, value] of props.currentKnowledge.entries()) {
					if (value.word === podcast.knowledge) {
						savedPodcasts.value.set(key, {
							script: podcast.script,
							chineseScript: podcast.chineseScript || [],
							audioUrl: podcast.audioPath || "",
							timestamp: podcast.createdAt,
							id: podcast._id,
						});
						break;
					}
				}
			});
		}
	} catch (error) {
		console.error("加载已保存播客失败:", error);
	}
};

// 切换知识点选中状态
const toggleKnowledge = (key) => {
	const index = selectedKnowledges.value.indexOf(key);

	if (index > -1) {
		// 如果已选中，则取消选中
		selectedKnowledges.value.splice(index, 1);
		// 清空当前显示的内容
		clearPodcast();
	} else {
		// 如果未选中，则添加到选中列表（替换现有选择）
		selectedKnowledges.value = [key]; // 只保留当前选中的知识点

		// 检查该知识点是否有保存的播客内容
		if (savedPodcasts.value.has(key)) {
			// 加载该知识点的播客内容
			const podcastData = savedPodcasts.value.get(key);
			podcastScript.value = podcastData.script;
			podcastChineseScript.value = podcastData.chineseScript || [];
			podcastUrl.value = podcastData.audioUrl || "";
		} else {
			// 如果没有保存的内容，清空当前显示
			clearPodcast();
		}
	}
};

// 配置选项
const options = reactive({
	voice: "jinji",
	speed: "normal",
	model: "Qwen/QwQ-32B-Preview",
});

// 状态变量
const generating = ref(false);
const podcastUrl = ref("");
const podcastScript = ref([]);
const podcastChineseScript = ref([]);
const saving = ref(false);
const savedPodcasts = ref(new Map()); // 保存已生成的播客脚本
const scenePodcastCache = ref(new Map()); // 场景缓存，存储每个场景的播客内容

// 显示选项
const displayOptions = reactive({
	showEnglish: true,
	showChinese: false,
});

// 切换语言显示
const toggleLanguage = (lang) => {
	if (lang === "english") {
		displayOptions.showEnglish = !displayOptions.showEnglish;
		// 确保至少有一个选项被选中
		if (!displayOptions.showEnglish && !displayOptions.showChinese) {
			displayOptions.showChinese = true;
		}
	} else if (lang === "chinese") {
		displayOptions.showChinese = !displayOptions.showChinese;
		// 确保至少有一个选项被选中
		if (!displayOptions.showEnglish && !displayOptions.showChinese) {
			displayOptions.showEnglish = true;
		}
	}
};

// 生成播客
const generatePodcast = async () => {
	if (selectedKnowledges.value.length === 0) {
		showToast({ message: "请先选择知识点", type: "warning" });
		return;
	}

	try {
		generating.value = true;

		// 获取选中的知识点内容
		const keyPhrases = selectedKnowledges.value.map((key) => {
			const knowledge = props.currentKnowledge.get(key);
			return knowledge.word;
		});

		// 调用后端接口生成播客
		const response = await apiClient.post("/translation/generate-podcast", {
			keyPhrases,
			model: options.model,
			voice: options.voice,
			speed: options.speed,
		});

		if (response.data.code === 200) {
			// 处理返回的播客数据
			const podcastData = response.data.data.podcast;
			// 将播客脚本内容转换为数组形式
			podcastScript.value = podcastData.map((item) => item.lines);
			// 保存中文脚本内容
			podcastChineseScript.value = podcastData.map(
				(item) => item.chinese_lines || ""
			);
			generating.value = false;
			showToast({ message: "播客生成完成", type: "success" });
		}
	} catch (error) {
		console.error("Podcast generation error:", error);
		generating.value = false;
		showToast({
			message: error.response?.data?.message || "播客生成失败",
			type: "error",
		});
	} finally {
		generating.value = false;
	}
};

// 监听场景索引变化，自动切换显示内容
watch(
	() => props.selectedSceneIndex,
	(newIndex, oldIndex) => {
		// 保存当前场景的内容到缓存
		if (
			oldIndex !== undefined &&
			(podcastUrl.value || podcastScript.value.length)
		) {
			scenePodcastCache.value.set(oldIndex, {
				url: podcastUrl.value,
				script: [...podcastScript.value],
				chineseScript: [...podcastChineseScript.value],
				selectedKey:
					selectedKnowledges.value.length > 0
						? selectedKnowledges.value[0]
						: null,
				displayOptions: { ...displayOptions }, // 保存显示选项
			});
		}

		// 清空当前显示
		clearCurrentDisplay();

		// 从缓存恢复新场景的内容
		if (scenePodcastCache.value.has(newIndex)) {
			const cachedData = scenePodcastCache.value.get(newIndex);
			podcastUrl.value = cachedData.url;
			podcastScript.value = [...cachedData.script];
			podcastChineseScript.value = cachedData.chineseScript
				? [...cachedData.chineseScript]
				: [];

			// 恢复显示选项
			if (cachedData.displayOptions) {
				displayOptions.showEnglish = cachedData.displayOptions.showEnglish;
				displayOptions.showChinese = cachedData.displayOptions.showChinese;
			}

			// 如果有选中的知识点，恢复选中状态
			if (
				cachedData.selectedKey &&
				props.currentKnowledge.has(cachedData.selectedKey)
			) {
				selectedKnowledges.value = [cachedData.selectedKey];
			}
		}
	},
	{ immediate: false }
);

// 清空当前显示内容（不影响缓存）
const clearCurrentDisplay = () => {
	podcastUrl.value = "";
	podcastScript.value = [];
	podcastChineseScript.value = [];
	selectedKnowledges.value = [];
};

// 清空播客内容（同时清除缓存）
const clearPodcast = () => {
	podcastUrl.value = "";
	podcastScript.value = [];
	podcastChineseScript.value = [];

	// 清除当前场景的缓存
	if (scenePodcastCache.value.has(props.selectedSceneIndex)) {
		scenePodcastCache.value.delete(props.selectedSceneIndex);
	}
};

// 清空选中的知识点
const clearSelectedKnowledges = () => {
	selectedKnowledges.value = [];
	clearPodcast(); // 同时清空播客内容和缓存
};

// 保存播客
const savePodcast = async () => {
	if (!podcastScript.value.length || selectedKnowledges.value.length === 0) {
		showToast({ message: "没有可保存的播客内容", type: "warning" });
		return;
	}

	try {
		saving.value = true;

		// 获取当前选中的知识点信息
		const key = selectedKnowledges.value[0]; // 只取第一个，因为现在只能选择一个知识点
		const knowledge = props.currentKnowledge.get(key);

		if (!knowledge) {
			showToast({ message: "知识点信息不完整", type: "error" });
			return;
		}

		// 准备发送到后端的数据
		const podcastData = {
			knowledge: knowledge.word, // 知识点英文单词
			resourceId: window.location.pathname.split("/").pop() || "", // 从URL获取资源ID
			script: podcastScript.value, // 播客脚本内容
			chineseScript: podcastChineseScript.value,
			audioPath: podcastUrl.value || "", // 音频路径，可能为空
			sceneId: props.selectedSceneIndex.toString(), // 当前场景ID
			options: {
				voice: options.voice,
				speed: options.speed,
				model: options.model,
			},
		};

		// 保存播客
		const response = await apiClient.post("/podcasts/save", podcastData);

		if (response.data.code === 200) {
			// 保存成功后，更新本地缓存
			savedPodcasts.value.set(key, {
				script: [...podcastScript.value],
				chineseScript: [...podcastChineseScript.value],
				audioUrl: podcastUrl.value,
				timestamp: new Date().toISOString(),
				id: response.data.data.id, // 保存返回的ID，便于后续操作
			});

			showToast({ message: "播客保存成功", type: "success" });
		} else {
			throw new Error(response.data.message || "保存失败");
		}
	} catch (error) {
		console.error("保存播客失败:", error);
		showToast({
			message: error.response?.data?.message || "保存播客失败",
			type: "error",
		});
	} finally {
		saving.value = false;
	}
};

// 暴露方法给父组件
defineExpose({
	generatePodcast,
	clearPodcast,
	clearSelectedKnowledges,
	loadSavedPodcasts,
});
</script>
<style scoped>
/* 提高selected-knowledge的优先级 */
.selected-knowledge {
	background-color: rgba(255, 255, 255, 0.8) !important;
	border: 2px solid #333 !important;
	box-shadow: 2px 2px 0 #333 !important;
	transform: translate(-1px, -1px) !important;
}

.selected-knowledge:active {
	transform: translate(0, 0) !important;
	box-shadow: 0 0 0 #333 !important;
}

.saved-knowledge {
	border: 2px solid #10b981;
	box-shadow: 2px 2px 0 #10b981;
	background-color: rgba(255, 255, 255, 0.8);
}

.saved-knowledge:not(.selected-knowledge) {
	transform: translate(-1px, -1px);
}

.saved-knowledge:not(.selected-knowledge):active {
	transform: translate(0, 0);
	box-shadow: 0 0 0 #10b981;
}

/* 添加播客脚本的样式 */
.from-white {
	--tw-gradient-from: #ffffff var(--tw-gradient-from-position);
	--tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);
	--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-gray-50 {
	--tw-gradient-to: #f9fafb var(--tw-gradient-to-position);
}

/* 播客脚本样式优化 */
.podcast-paragraph {
	font-size: 1rem;
	text-indent: 0;
	padding: 0 1rem;
}

/* 优化文本选择效果 */
.podcast-paragraph::selection,
.podcast-paragraph *::selection {
	background: rgba(var(--color-secondary), 0.2);
}
</style>
