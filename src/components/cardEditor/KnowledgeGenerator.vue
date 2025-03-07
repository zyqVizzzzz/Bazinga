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
						<!-- 中间内容区域 -->
						<div class="flex gap-4 h-[50vh] mb-4">
							<!-- 左侧场景内容 -->
							<div class="w-1/2 overflow-y-auto">
								<div class="border p-4 rounded-md bg-paper text-sm">
									<p v-for="(line, idx) in selectedSceneContent" :key="idx">
										{{ line }}
									</p>
								</div>
							</div>

							<!-- 右侧动态组件区域 -->
							<div class="w-1/2">
								<component
									:is="currentTabComponent"
									:scene-content="selectedSceneContent"
									:selected-scene-index="selectedSceneIndex"
									:should-translate="shouldTranslate"
									:current-knowledge="currentKnowledge"
									:editor="editor"
									:bold-knowledge-words="boldKnowledgeWords"
									@update:knowledge="updateKnowledge"
								/>
							</div>
						</div>

						<!-- 底部场景列表 -->
						<div class="border-t pt-4">
							<div class="flex items-center justify-between">
								<div class="flex gap-2 overflow-x-auto pb-2 flex-1">
									<div
										v-for="(scene, index) in scenesList"
										:key="index"
										class="flex flex-col items-center gap-2"
									>
										<!-- 场景色块 -->
										<div
											@click="selectScene(index)"
											class="scene-container cursor-pointer w-20 h-12 rounded-lg transition-colors flex items-center justify-center"
											:class="
												selectedSceneIndex === index
													? 'bg-primary/20 border-2 border-primary'
													: 'bg-gray-100 hover:bg-gray-200'
											"
										>
											<div class="text-sm font-medium text-gray-600">
												场景 {{ index + 1 }}
											</div>
										</div>
										<!-- 场景标题 -->
										<!-- <div
											class="text-xs text-gray-600 w-32 truncate text-center"
										>
											{{ scene.title }}
										</div> -->
									</div>
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
import { ref, computed } from "vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import KnowledgeTab from "./tab/KnowledgeTab.vue";
import TranslateTab from "./tab/TranslateTab.vue";
import SitcomTab from "./tab/SitcomTab.vue";
import PodcastTab from "./tab/PodcastTab.vue";

const props = defineProps({
	editor: Object,
	currentKnowledge: Object,
	shouldTranslate: Function,
	boldKnowledgeWords: Function,
});

const emit = defineEmits(["update:currentKnowledge"]);

// 状态变量
const selectedSceneIndex = ref(0);
const scenesList = ref([]);
const selectedSceneContent = ref([]);

// 标签页管理
const currentTab = ref("knowledge");
const switchTab = (tab) => {
	currentTab.value = tab;
};

// 动态组件
const currentTabComponent = computed(() => {
	const tabs = {
		knowledge: KnowledgeTab,
		translate: TranslateTab,
		sitcom: SitcomTab,
		podcast: PodcastTab,
	};
	return tabs[currentTab.value];
});

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
};

// 更新知识点
const updateKnowledge = (updatedKnowledge) => {
	emit("update:currentKnowledge", updatedKnowledge);
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

.scene-container {
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(var(--primary-color-rgb), 0.1) 2px,
		rgba(var(--primary-color-rgb), 0.1) 4px
	);
}
</style>
