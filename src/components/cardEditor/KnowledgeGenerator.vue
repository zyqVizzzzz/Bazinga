<template>
	<div>
		<!-- 知识点生成模态框 -->
		<dialog id="knowledge_modal" class="modal">
			<div class="modal-box w-11/12 max-w-5xl">
				<div class="flex justify-between items-center mb-6">
					<h3 class="text-lg font-bold">智能工作台</h3>
					<form method="dialog">
						<button class="btn btn-sm btn-circle btn-ghost">
							<i class="bi bi-x-lg"></i>
						</button>
					</form>
				</div>
				<div class="flex">
					<!-- 左侧按钮栏 -->
					<div
						class="option-group flex flex-col justify-start space-y-4 mr-6 pt-2"
					>
						<div class="tooltip tooltip-right" data-tip="生成知识点">
							<button
								class="retro-btn"
								:class="{ 'btn-active': currentTab === 'knowledge' }"
								@click="switchTab('knowledge')"
							>
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face">
											<i class="bi bi-book text-lg"></i>
										</div>
									</div>
								</div>
							</button>
						</div>

						<div class="tooltip tooltip-right" data-tip="全文翻译">
							<button
								class="retro-btn"
								:class="{ 'btn-active': currentTab === 'translate' }"
								@click="switchTab('translate')"
							>
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face">
											<i class="bi bi-translate text-lg"></i>
										</div>
									</div>
								</div>
							</button>
						</div>

						<div class="tooltip tooltip-right" data-tip="生成情景剧">
							<button
								class="retro-btn"
								:class="{ 'btn-active': currentTab === 'sitcom' }"
								@click="switchTab('sitcom')"
							>
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face">
											<i class="bi bi-camera-reels text-lg"></i>
										</div>
									</div>
								</div>
							</button>
						</div>

						<div class="tooltip tooltip-right" data-tip="生成播客">
							<button
								class="retro-btn"
								:class="{ 'btn-active': currentTab === 'podcast' }"
								@click="switchTab('podcast')"
							>
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face">
											<i class="bi bi-mic text-lg"></i>
										</div>
									</div>
								</div>
							</button>
						</div>
					</div>
					<div class="flex-1">
						<!-- 顶部控制区域 -->
						<div
							class="flex justify-between mb-4"
							v-if="currentTab === 'knowledge'"
						>
							<!-- 左侧配置选项 -->
							<div class="flex gap-4">
								<select
									v-model="options.difficulty"
									class="select select-bordered select-sm"
								>
									<option value="beginner">初级</option>
									<option value="intermediate">中级</option>
									<option value="advanced">高级</option>
								</select>

								<select
									v-model="options.direction"
									class="select select-bordered select-sm"
								>
									<option value="spoken">日常口语</option>
									<option value="written">书面表达</option>
								</select>

								<select
									v-model="options.maxPhrases"
									class="select select-bordered select-sm"
								>
									<option v-for="n in 10" :key="n" :value="n">
										{{ n }}个短语
									</option>
								</select>

								<select
									v-model="options.model"
									class="select select-bordered select-sm"
								>
									<option value="Qwen/QwQ-32B-Preview">通义千问</option>
									<option value="deepseek-ai/DeepSeek-V2.5">DeepSeek</option>
								</select>
							</div>

							<!-- 右侧生成按钮 -->
							<button
								@click="generateSceneKnowledge"
								class="btn btn-sm btn-primary"
								:disabled="generatingScene"
							>
								<i v-if="!generatingScene" class="bi bi-lightning mr-1"></i>
								<span
									v-else
									class="loading loading-spinner loading-xs mr-1"
								></span>
								生成知识点
							</button>
						</div>
						<div
							class="flex justify-between mb-4"
							v-if="currentTab === 'translate'"
						>
							<!-- 左侧配置选项 -->
							<div class="flex gap-4">
								<select
									v-model="options.model"
									class="select select-bordered select-sm"
								>
									<option value="Qwen/QwQ-32B-Preview">通义千问</option>
									<option value="deepseek-ai/DeepSeek-V2.5">DeepSeek</option>
								</select>
							</div>

							<!-- 右侧生成按钮 -->
							<button
								@click="generateSceneKnowledge"
								class="btn btn-sm btn-primary"
								:disabled="generatingScene"
							>
								<i v-if="!generatingScene" class="bi bi-lightning mr-1"></i>
								<span
									v-else
									class="loading loading-spinner loading-xs mr-1"
								></span>
								生成知识点
							</button>
						</div>
						<div
							class="flex justify-between mb-4"
							v-if="currentTab === 'sitcom'"
						>
							<!-- 左侧配置选项 -->
							<div class="flex gap-4">
								<select
									v-model="options.model"
									class="select select-bordered select-sm"
								>
									<option value="Qwen/QwQ-32B-Preview">通义千问</option>
									<option value="deepseek-ai/DeepSeek-V2.5">DeepSeek</option>
								</select>
							</div>

							<!-- 右侧生成按钮 -->
							<button
								@click="generateSceneKnowledge"
								class="btn btn-sm btn-primary"
								:disabled="generatingScene"
							>
								<i v-if="!generatingScene" class="bi bi-lightning mr-1"></i>
								<span
									v-else
									class="loading loading-spinner loading-xs mr-1"
								></span>
								生成知识点
							</button>
						</div>
						<!-- 中间内容区域 -->
						<div class="flex gap-4 h-[50vh] mb-4">
							<!-- 左侧场景内容 -->
							<div class="w-1/2 overflow-y-auto">
								<h4 class="font-bold mb-2">场景内容</h4>
								<div class="border p-4 rounded-md bg-gray-50">
									<p v-for="(line, idx) in selectedSceneContent" :key="idx">
										{{ line }}
									</p>
								</div>
							</div>

							<!-- 右侧知识点列表 -->
							<div class="w-1/2 overflow-y-auto">
								<h4 class="font-bold mb-2">生成的知识点</h4>
								<div
									v-if="generatedKnowledge.length === 0"
									class="text-gray-500 text-center py-4"
								>
									暂无生成的知识点，请点击"生成知识点"按钮
								</div>
								<div v-else class="space-y-2">
									<div
										v-for="(item, idx) in generatedKnowledge"
										:key="idx"
										class="border p-3 rounded-md"
									>
										<div class="flex justify-between">
											<div class="font-medium">{{ item.word }}</div>
											<button
												@click="addToKnowledge(item)"
												class="btn btn-xs btn-ghost text-primary"
											>
												<i class="bi bi-plus-circle"></i> 添加
											</button>
										</div>
										<div class="text-sm text-gray-600 mt-1">
											{{ item.word_zh }}
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- 底部场景列表 -->
						<div class="border-t pt-4">
							<h4 class="font-bold mb-2">场景列表</h4>
							<div class="flex gap-2 overflow-x-auto pb-2">
								<div
									v-for="(scene, index) in scenesList"
									:key="index"
									@click="selectScene(index)"
									class="cursor-pointer p-2 rounded-md whitespace-nowrap transition-colors"
									:class="
										selectedSceneIndex === index
											? 'bg-primary/20'
											: 'hover:bg-gray-100'
									"
								>
									{{ scene.title }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>关闭</button>
			</form>
		</dialog>
	</div>
</template>

<script setup>
import { ref } from "vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const props = defineProps({
	editor: Object,
	currentKnowledge: Object,
	shouldTranslate: Function,
	boldKnowledgeWords: Function,
});

const emit = defineEmits(["update:currentKnowledge"]);

// 添加配置选项
const options = ref({
	maxPhrases: 5,
	difficulty: "intermediate",
	direction: "spoken",
	model: "deepseek-ai/DeepSeek-V2.5",
});

// 状态变量
const selectedSceneIndex = ref(0);
const scenesList = ref([]);
const selectedSceneContent = ref([]);
const generatedKnowledge = ref([]);
const generatingScene = ref(false);

const currentTab = ref("knowledge");
const switchTab = (tab) => {
	currentTab.value = tab;
};

// 提供给父组件调用的方法，用于打开模态框
const openModal = async () => {
	try {
		// 获取编辑器内容
		const savedData = await props.editor.save();

		// 解析场景
		parseScenes(savedData.blocks);

		// 如果有场景，默认选择第一个
		if (scenesList.value.length > 0) {
			selectScene(0);
		}

		// 打开模态框
		document.getElementById("knowledge_modal").showModal();
	} catch (error) {
		console.error("Failed to open knowledge modal:", error);
		showToast({ message: "获取编辑器内容失败", type: "error" });
	}
};

// 解析场景
const parseScenes = (blocks) => {
	scenesList.value = [];
	let currentSceneIndex = -1;

	blocks.forEach((block, index) => {
		// 检查是否是场景标题（以 # 开头）
		if (block.type === "paragraph" && block.data.text.startsWith("#")) {
			currentSceneIndex++;
			// 删除 HTML 标签
			const title = block.data.text
				.replace(/^#\s*/, "")
				.replace(/<\/?[^>]+(>|$)/g, "") // 移除所有 HTML 标签
				.trim();
			scenesList.value.push({
				title,
				startIndex: index,
				content: [],
			});
		}
		// 如果已经有场景，将内容添加到当前场景
		else if (currentSceneIndex >= 0) {
			// 删除 HTML 标签后添加内容
			const cleanText = block.data.text.replace(/<\/?[^>]+(>|$)/g, "");
			scenesList.value[currentSceneIndex].content.push(cleanText);
		}
	});
};

// 选择场景
const selectScene = (index) => {
	selectedSceneIndex.value = index;
	selectedSceneContent.value = scenesList.value[index].content;
	generatedKnowledge.value = []; // 清空之前生成的知识点
};

// 生成场景知识点
const generateSceneKnowledge = async () => {
	if (
		selectedSceneIndex.value < 0 ||
		!scenesList.value[selectedSceneIndex.value]
	) {
		return;
	}

	try {
		generatingScene.value = true;

		// 获取当前场景的英文内容（过滤掉中文和空行）
		const sceneContent = selectedSceneContent.value
			.filter((line) => {
				// 确保行不为空且是英文内容
				return line.trim() && props.shouldTranslate(line);
			})
			.map((line) => {
				// 移除所有 HTML 标签
				return line.replace(/<\/?[^>]+(>|$)/g, "");
			})
			.join(" ");

		if (!sceneContent) {
			showToast({ message: "未找到有效的英文内容", type: "warning" });
			return;
		}

		// 提取关键词或短语
		const keyPhrases = await extractKeyPhrases(sceneContent);

		// 显示提取到的短语
		console.log("提取到的短语:", keyPhrases);

		// 为每个关键词生成知识点
		generatedKnowledge.value = []; // 清空现有知识点

		for (const phrase of keyPhrases) {
			try {
				const res = await apiClient.post("/knowledge/generate", {
					word: phrase,
				});

				if (res.data.code === 200) {
					// 将新生成的知识点添加到列表中
					generatedKnowledge.value.push({
						word: phrase,
						word_zh: res.data.data.word_zh || phrase, // 如果没有翻译，使用原文
						...res.data.data,
					});
				}
			} catch (err) {
				console.error(`Failed to generate knowledge for "${phrase}":`, err);
				// 即使生成失败，也添加原始短语
				generatedKnowledge.value.push({
					word: phrase,
					word_zh: phrase,
					error: true,
				});
			}
		}

		if (generatedKnowledge.value.length === 0) {
			showToast({ message: "未能生成知识点", type: "warning" });
		} else {
			showToast({
				message: `成功生成 ${generatedKnowledge.value.length} 个知识点`,
				type: "success",
			});
		}
	} catch (error) {
		console.error("Failed to generate scene knowledge:", error);
		showToast({ message: "生成知识点失败", type: "error" });
	} finally {
		generatingScene.value = false;
	}
};

// 提取关键词或短语
const extractKeyPhrases = async (text) => {
	console.log(text);
	try {
		const response = await apiClient.post("/translation/extract-key-phrases", {
			text,
			options: options.value,
		});

		if (response.data.code === 200) {
			return response.data.data.phrases;
		}

		return fallbackExtractPhrases(text);
	} catch (error) {
		console.error("Failed to extract key phrases:", error);
		return fallbackExtractPhrases(text);
	}
};

// 备用的关键词提取方法
const fallbackExtractPhrases = (text) => {
	// 简单的规则：提取所有大于3个字符的单词，最多5个
	const words = text.match(/\b[A-Za-z]{4,}\b/g) || [];
	const uniqueWords = [...new Set(words)];
	return uniqueWords.slice(0, 5);
};

// 添加到知识点
const addToKnowledge = (item) => {
	// 检查是否已存在
	if (props.currentKnowledge.has(item.word)) {
		showToast({ message: "该知识点已存在", type: "info" });
		return;
	}

	// 获取当前场景ID
	const sceneId = `Scene${selectedSceneIndex.value + 1}`;

	// 创建新的知识点Map
	const updatedKnowledge = new Map(props.currentKnowledge);

	// 添加到知识点集合
	updatedKnowledge.set(item.word, {
		...item,
		scenes: new Set([sceneId]),
	});

	// 通过事件更新父组件中的知识点
	emit("update:currentKnowledge", updatedKnowledge);

	// 更新编辑器中的加粗效果
	if (props.editor) {
		props.boldKnowledgeWords(updatedKnowledge, props.editor);
	}

	showToast({ message: "知识点已添加", type: "success" });
};

// 暴露方法给父组件
defineExpose({
	openModal,
});
</script>
<style scoped>
.retro-btn {
	position: relative;
	width: 36px;
	height: 36px;
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
/* 添加按钮激活状态的样式 */
.btn-active {
	transform: translateY(2px);
}

.btn-active .btn-shadow {
	transform: translateY(-2px);
}

.btn-active .btn-edge {
	transform: translateY(2px);
}
</style>
