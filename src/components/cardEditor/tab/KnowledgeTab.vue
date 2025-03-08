<template>
	<div class="flex flex-col h-full">
		<!-- 顶部控制区域 -->
		<div class="mb-4">
			<div class="flex flex-wrap gap-2">
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
					<option v-for="n in 10" :key="n" :value="n">{{ n }}个短语</option>
				</select>

				<select
					v-model="options.model"
					class="select select-bordered select-sm"
				>
					<option value="deepseek-ai/DeepSeek-V2.5">DeepSeek</option>
					<option value="Qwen/QwQ-32B-Preview">通义千问</option>
				</select>
			</div>
		</div>

		<!-- 知识点列表 -->
		<div class="flex-1 overflow-y-auto relative">
			<!-- 空状态和按钮组合 -->
			<div
				class="flex flex-col items-center justify-center gap-4 h-full"
				:class="{
					'absolute inset-0 z-10':
						(getCurrentSceneKnowledge().length > 0 ||
							parentKnowledge.size > 0) &&
						generating,
				}"
				:style="
					(getCurrentSceneKnowledge().length > 0 || parentKnowledge.size > 0) &&
					generating
						? 'background-color: rgba(255, 255, 255, 0.7);'
						: ''
				"
				v-if="
					(getCurrentSceneKnowledge().length === 0 &&
						parentKnowledge.size === 0) ||
					generating
				"
			>
				<button
					@click="generateKnowledge"
					class="btn btn-circle btn-secondary w-16 h-16 text-white"
					:disabled="generating"
					:class="{
						'opacity-80':
							getCurrentSceneKnowledge().length > 0 || parentKnowledge.size > 0,
					}"
				>
					<i v-if="!generating" class="bi bi-book text-xl"></i>
					<span v-else class="loading loading-spinner loading-md"></span>
				</button>
			</div>

			<!-- 内容区域 -->
			<div
				v-if="parentKnowledge.size > 0 || getCurrentSceneKnowledge().length > 0"
				class="space-y-4"
			>
				<!-- 已有知识点列表 -->
				<div v-if="parentKnowledge.size > 0" class="mb-4">
					<div class="text-sm font-medium text-gray-500 mb-2 pl-2">
						已有知识点
					</div>
					<div class="space-y-2">
						<div
							v-for="(item, idx) in Array.from(parentKnowledge.values())"
							:key="'parent-' + idx"
							class="parent-knowledge-item border rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-100"
							@click="showKnowledgeDetail(item, idx, true)"
						>
							<div class="font-medium">{{ item.word }}</div>
						</div>
					</div>
				</div>

				<!-- 分隔线，只在两种知识点都存在时显示 -->
				<div
					class="divider my-2"
					v-if="parentKnowledge.size > 0 && generatedKnowledge.length > 0"
				>
					新生成的知识点
				</div>

				<!-- 生成的知识点列表 -->
				<div v-if="generatedKnowledge.length > 0" class="space-y-2">
					<div
						class="text-sm font-medium text-gray-500 mb-2 pl-2"
						v-if="parentKnowledge.size === 0"
					>
						生成的知识点
					</div>
					<div
						v-for="(item, idx) in getCurrentSceneKnowledge()"
						:key="idx"
						class="knowledge-item border rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-100"
						:class="['animate-fade-in']"
						@click="!generating && showKnowledgeDetail(item, idx)"
					>
						<div class="font-medium">{{ item.word }}</div>
					</div>
				</div>

				<!-- 再次生成按钮，仅在生成完成后显示 -->
				<div
					v-if="!generating"
					class="flex justify-center my-4 transition-all"
					:class="['generate-again-btn']"
				>
					<button
						@click="generateKnowledge"
						class="btn btn-circle btn-secondary text-white h-12 w-12 mt-2"
						:disabled="generating"
					>
						<i v-if="!generating" class="bi bi-book text-sm"></i>
						<span v-else class="loading loading-spinner loading-md"></span>
					</button>
				</div>
			</div>

			<div
				class="knowledge-drawer fixed right-0 top-0 h-full bg-white shadow-xl z-10 overflow-y-auto"
				:class="selectedKnowledge ? 'w-80' : 'w-0'"
			>
				<div class="p-4" v-if="selectedKnowledge">
					<div class="flex justify-between items-center mb-4 pb-2 border-b">
						<h3 class="text-lg font-bold">{{ selectedKnowledge.word }}</h3>
						<button
							class="btn btn-sm btn-circle"
							@click="
								selectedKnowledge = null;
								selectedKnowledgeIndex = -1;
							"
						>
							<i class="bi bi-x"></i>
						</button>
					</div>

					<div class="mb-4 text-left pb-2">
						<div class="text-sm text-gray-500 mb-1">中文翻译</div>
						<div class="text-sm">{{ selectedKnowledge.word_zh }}</div>
					</div>
					<div
						class="mb-4 text-left pb-2"
						v-if="selectedKnowledge.definition_zh"
					>
						<div class="text-sm text-gray-500 mb-1">释义</div>
						<div class="text-sm">{{ selectedKnowledge.definition_zh }}</div>
					</div>
					<div class="mb-4 text-left pb-2" v-if="selectedKnowledge.synonyms">
						<div class="text-sm text-gray-500 mb-1">近义表达</div>
						<div class="text-sm">{{ selectedKnowledge.synonyms }}</div>
					</div>
					<div class="mb-4 text-left pb-2" v-if="selectedKnowledge.example">
						<div class="text-sm text-gray-500 mb-1">例句</div>
						<div class="text-sm">{{ selectedKnowledge.example }}</div>
						<div class="text-sm">{{ selectedKnowledge.example_zh }}</div>
					</div>
					<div class="flex justify-center mt-8">
						<button
							@click="addToKnowledge(selectedKnowledge)"
							class="btn btn-sm btn-secondary text-white"
						>
							<i
								class="bi bi-plus-circle mr-1"
								style="position: relative; top: 1px"
							></i>
							添加到知识点
						</button>
					</div>
				</div>
			</div>

			<!-- 半透明遮罩，点击关闭抽屉 -->
			<div
				v-if="selectedKnowledge"
				class="fixed inset-0 bg-black/20 z-5"
				@click="
					selectedKnowledge = null;
					selectedKnowledgeIndex = -1;
				"
			></div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from "vue";
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
	shouldTranslate: {
		type: Function,
		required: true,
	},
	currentKnowledge: {
		type: Object,
		default: () => new Map(),
	},
	editor: {
		type: Object,
		required: true,
		default: null, // 允许为 null
	},
	boldKnowledgeWords: {
		type: Function,
		required: true,
	},
});

const emit = defineEmits(["update:knowledge"]);

// 配置选项
const options = reactive({
	maxPhrases: 5,
	difficulty: "intermediate",
	direction: "spoken",
	model: "deepseek-ai/DeepSeek-V2.5",
});

// 状态变量
const generating = ref(false);
const generatedKnowledge = ref([]); // 当前场景的生成知识点
const selectedKnowledge = ref(null);
const selectedKnowledgeIndex = ref(-1); // 添加这一行

// 父组件知识点状态
const parentKnowledge = ref(new Map());
// 标记是否来自父组件的状态
const isFromParent = ref(false);

// 场景知识点缓存，存储每个场景的生成知识点
const sceneGeneratedKnowledge = ref(new Map());

const initSceneKnowledge = () => {
	// 加载当前场景的知识点
	generatedKnowledge.value =
		sceneGeneratedKnowledge.value.get(props.selectedSceneIndex) || [];
};
// 在组件挂载时调用
onMounted(() => {
	initSceneKnowledge();
	// 如果已有父组件知识点，需要过滤当前场景的知识点
	if (props.currentKnowledge && props.currentKnowledge.size > 0) {
		filterParentKnowledgeByScene(props.currentKnowledge);
	}
});

// 获取当前场景的知识点
const getCurrentSceneKnowledge = () => {
	return sceneGeneratedKnowledge.value.get(props.selectedSceneIndex) || [];
};

// 根据当前场景过滤父组件知识点
const filterParentKnowledgeByScene = (knowledge) => {
	const currentSceneId = `Scene${props.selectedSceneIndex + 1}`;
	const filteredKnowledge = new Map();

	knowledge.forEach((item, key) => {
		if (item.scenes && item.scenes.has(currentSceneId)) {
			filteredKnowledge.set(key, item);
		}
	});

	parentKnowledge.value = filteredKnowledge;
};

// 显示知识点详情
const showKnowledgeDetail = (item, index, isParent = false) => {
	selectedKnowledge.value = item;
	selectedKnowledgeIndex.value = index;
	isFromParent.value = isParent;
};

// 设置父组件知识点
const setParentKnowledge = (knowledge) => {
	// 过滤当前场景的知识点
	filterParentKnowledgeByScene(knowledge);
};

// 生成知识点
const generateKnowledge = async () => {
	if (props.sceneContent.length === 0) {
		showToast({ message: "没有可用的场景内容", type: "warning" });
		return;
	}

	try {
		generating.value = true;
		generatedKnowledge.value = []; // 清空当前场景的知识点

		// 获取当前场景的英文内容（过滤掉中文和空行）
		const sceneContent = props.sceneContent
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

		if (generatedKnowledge.value.length > 0) {
			// 将生成的知识点缓存到对应场景
			sceneGeneratedKnowledge.value.set(props.selectedSceneIndex, [
				...generatedKnowledge.value,
			]);
			showToast({
				message: `成功生成 ${generatedKnowledge.value.length} 个知识点`,
				type: "success",
			});
		} else {
			showToast({ message: "未能生成知识点", type: "warning" });
		}
	} catch (error) {
		console.error("Failed to generate scene knowledge:", error);
		showToast({ message: "生成知识点失败", type: "error" });
	} finally {
		generating.value = false;
	}
};

// 提取关键词或短语
const extractKeyPhrases = async (text) => {
	try {
		const response = await apiClient.post("/translation/extract-key-phrases", {
			text,
			options: options,
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
	return uniqueWords.slice(0, options.maxPhrases);
};

// 添加到知识点
const addToKnowledge = (item) => {
	// 检查是否已存在
	if (props.currentKnowledge.has(item.word)) {
		// 如果已存在，检查是否在当前场景中
		const existingItem = props.currentKnowledge.get(item.word);
		const currentSceneId = `Scene${props.selectedSceneIndex + 1}`;

		if (existingItem.scenes.has(currentSceneId)) {
			showToast({ message: "该知识点已在当前场景中", type: "info" });
			return;
		}

		// 如果知识点存在但不在当前场景，则添加当前场景
		const updatedKnowledge = new Map(props.currentKnowledge);
		const updatedItem = { ...existingItem };
		updatedItem.scenes.add(currentSceneId);
		updatedKnowledge.set(item.word, updatedItem);

		emit("update:knowledge", updatedKnowledge);

		// 如果不是来自父组件的知识点，则从生成的知识点中移除
		if (!isFromParent.value) {
			removeFromGeneratedKnowledge(item);
			// 立即更新父组件知识点列表显示
			parentKnowledge.value = new Map(updatedKnowledge);
		}

		showToast({ message: "知识点已添加到当前场景", type: "success" });
		return;
	}

	// 如果是新知识点，创建新的记录
	const currentSceneId = `Scene${props.selectedSceneIndex + 1}`;
	const updatedKnowledge = new Map(props.currentKnowledge);
	updatedKnowledge.set(item.word, {
		...item,
		scenes: new Set([currentSceneId]),
	});

	emit("update:knowledge", updatedKnowledge);

	// 更新编辑器中的加粗效果
	if (props.editor) {
		props.boldKnowledgeWords(updatedKnowledge, props.editor);
	}

	// 如果不是来自父组件的知识点，则从生成的知识点中移除
	if (!isFromParent.value) {
		removeFromGeneratedKnowledge(item);
		// 立即更新父组件知识点列表显示
		parentKnowledge.value = new Map(updatedKnowledge);
	}

	showToast({ message: "知识点已添加", type: "success" });
};

// 更新父组件知识点列表
const updateParentKnowledge = (knowledge) => {
	// 更新本地的父组件知识点状态
	parentKnowledge.value = new Map(knowledge);
};

// 清空所有缓存
const clearAllKnowledge = () => {
	generatedKnowledge.value = [];
	sceneGeneratedKnowledge.value.clear();
};

// 清空生成的知识点
const clearKnowledge = () => {
	generatedKnowledge.value = [];
	sceneGeneratedKnowledge.value.delete(props.selectedSceneIndex);
};

// 从生成的知识点中移除
const removeFromGeneratedKnowledge = (item) => {
	// 获取当前场景的知识点
	const currentSceneKnowledge =
		sceneGeneratedKnowledge.value.get(props.selectedSceneIndex) || [];

	// 过滤掉要移除的知识点
	const updatedKnowledge = currentSceneKnowledge.filter(
		(k) => k.word !== item.word
	);

	// 更新场景知识点缓存
	sceneGeneratedKnowledge.value.set(props.selectedSceneIndex, updatedKnowledge);

	// 更新当前显示的知识点
	generatedKnowledge.value = updatedKnowledge;

	// 关闭抽屉
	selectedKnowledge.value = null;
	selectedKnowledgeIndex.value = -1;
};

watch(
	() => props.selectedSceneIndex,
	(newIndex) => {
		// 清空选中的知识点
		selectedKnowledge.value = null;
		selectedKnowledgeIndex.value = -1;

		// 加载当前场景的知识点
		generatedKnowledge.value =
			sceneGeneratedKnowledge.value.get(newIndex) || [];

		// 根据新场景过滤父组件知识点
		if (props.currentKnowledge) {
			filterParentKnowledgeByScene(props.currentKnowledge);
		}
	}
);

// 监听 currentKnowledge
watch(
	() => props.currentKnowledge,
	(newKnowledge) => {
		if (newKnowledge) {
			filterParentKnowledgeByScene(newKnowledge);
		}
	},
	{ deep: true }
);

// 暴露方法给父组件
defineExpose({
	generateKnowledge,
	clearKnowledge,
	clearAllKnowledge,
	setParentKnowledge,
});
</script>
<style scoped>
.knowledge-item {
	transition: all 0.3s ease;
	animation: fadeIn 0.5s ease-in-out;
	animation-fill-mode: both;
}

.knowledge-item:hover {
	transform: scale(1.05);
}

/* 为再次生成按钮添加特殊的动画 */
.generate-again-btn {
	animation: fadeIn 0.5s ease-in-out;
	animation-fill-mode: both;
	animation-delay: 0.1s; /* 比最后一个知识点多延迟0.2秒 */
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
/* 为已有知识点添加不同的动画延迟 */
.parent-knowledge-item:nth-child(1) {
	animation-delay: 0.05s;
}
.parent-knowledge-item:nth-child(2) {
	animation-delay: 0.1s;
}

/* 为新生成知识点添加不同的动画延迟 */
.knowledge-item:nth-child(1) {
	animation-delay: 0.1s;
}
.knowledge-item:nth-child(2) {
	animation-delay: 0.2s;
}
.knowledge-item:nth-child(3) {
	animation-delay: 0.3s;
}
.knowledge-item:nth-child(4) {
	animation-delay: 0.4s;
}
.knowledge-item:nth-child(5) {
	animation-delay: 0.5s;
}
.knowledge-item:nth-child(6) {
	animation-delay: 0.6s;
}
.knowledge-item:nth-child(7) {
	animation-delay: 0.7s;
}
.knowledge-item:nth-child(8) {
	animation-delay: 0.8s;
}
.knowledge-item:nth-child(9) {
	animation-delay: 0.9s;
}
.knowledge-item:nth-child(10) {
	animation-delay: 1s;
}
</style>
