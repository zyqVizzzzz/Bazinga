<template>
	<div class="container w-full mx-auto mt-10 pt-2">
		<div class="flex editor-box">
			<div
				class="editor-container text-sm relative"
				:class="editorClasses"
				v-if="isCustom"
			>
				<EditorJS
					@update:content="handleEditorChange"
					@editor-ready="handleEditorReady"
				/>
			</div>

			<div class="right-panel" :class="cardViewClasses">
				<CardView
					:scenes="scenes"
					:currentScene="currentScene"
					:currentBlocks="currentSceneBlocks"
					:isCustom="isCustom"
					@scene-change="handleSceneChange"
					@block-click="handleBlockClick"
					@translate-scene="handleTranslateScene"
				/>
			</div>
		</div>

		<FloatingActions
			:view-mode="viewMode"
			:is-custom="isCustom"
			@back="backToPreview"
			@save="saveDialogue"
			@toggle-view="toggleViewMode"
			@open-guide="openGuideModal"
		/>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import EditorJS from "./components/Editor/EditorJS.vue";
import CardView from "./components/Card/CardView.vue";
import FloatingActions from "./components/Common/FloatingActions.vue";
import { useEditorStore } from "./stores/editor";
import { useScenesStore } from "./stores/scenes";
import { BlockManager } from "./utils/blockManager";
import { SceneManager } from "./utils/sceneManager";

const editorClasses = computed(() => ({
	"w-1/2": viewMode.value === "both",
	"w-2/3 mx-auto": viewMode.value === "editor",
	hidden: viewMode.value === "card",
}));

const cardViewClasses = computed(() => ({
	"w-1/2": viewMode.value === "both",
	"w-2/3 mx-auto": viewMode.value === "card",
	hidden: viewMode.value === "editor",
	"pointer-events-none opacity-95": rightPanelLoading.value,
}));

// Store
const editorStore = useEditorStore();
const scenesStore = useScenesStore();

// 路由
const route = useRoute();

// 基础状态
const isCustom = ref(true);
const viewMode = ref("both");
const rightPanelLoading = ref(false);

// 场景相关状态
const scenes = ref([]);
const currentScene = ref(null);
const currentSceneBlocks = ref([]);

// 管理器实例
const blockManager = new BlockManager();
const sceneManager = new SceneManager(scenes, [], blockManager.blocksMap);

// 编辑器就绪处理
const handleEditorReady = (editorInstance) => {
	editorStore.setEditor(editorInstance);
};

// 处理编辑器内容变化
const handleEditorChange = async (content) => {
	if (!content || !content.blocks) return;

	try {
		// 标记未保存更改
		editorStore.markUnsavedChanges();

		// 解析内容
		const parsedScenes = parseEditorContent(content.blocks);
		scenes.value = parsedScenes;

		// 初始化 store
		scenesStore.initStore(parsedScenes);

		// 更新当前场景
		if (parsedScenes.length > 0) {
			currentScene.value = parsedScenes[0];
			currentSceneBlocks.value = currentScene.value.blocks;
		}
	} catch (error) {
		console.error("处理编辑器内容变化时出错:", error);
	}
};

// 解析编辑器内容
const parseEditorContent = (blocks) => {
	const parsedScenes = [];
	let currentSceneObj = null;

	blocks.forEach((block, index) => {
		const text = block.data.text;

		if (text.startsWith("#")) {
			currentSceneObj = {
				index: parsedScenes.length,
				title: text.replace("#", "").trim(),
				blockIds: [],
				blocks: [],
			};
			parsedScenes.push(currentSceneObj);
		} else {
			if (!currentSceneObj) {
				currentSceneObj = {
					index: 0,
					title: "默认场景",
					blockIds: [],
					blocks: [],
				};
				parsedScenes.push(currentSceneObj);
			}

			const blockId = `block-${index}`;
			const newBlock = blockManager.createBlock("text", text, { id: blockId });

			currentSceneObj.blockIds.push(blockId);
			currentSceneObj.blocks.push(newBlock);
		}
	});

	return parsedScenes;
};

// 处理场景切换
const handleSceneChange = (index) => {
	if (scenes.value[index]) {
		currentScene.value = scenes.value[index];
		currentSceneBlocks.value = currentScene.value.blocks;
	}
};

// 更新当前场景的块
const updateCurrentSceneBlocks = () => {
	if (!currentScene.value) return;

	currentSceneBlocks.value = currentScene.value.blockIds
		.map((id) => blocksMap.value.get(id))
		.filter(Boolean);
};

// 处理块点击
const handleBlockClick = (index, block) => {
	// 暂时只记录选中状态
	scenesStore.setSelectedBlock(block);
};

// 处理场景翻译
const handleTranslateScene = async () => {
	// TODO: 实现场景翻译功能
};

// 初始化
onMounted(async () => {
	try {
		if (route.query.mode === "edit") {
			// 新建模式：创建空白编辑器
			await initEditMode();
		} else {
			// 查看模式：加载已有内容
			await initViewMode();
		}
	} catch (error) {
		console.error("初始化失败:", error);
		showToast({ message: "初始化失败，请刷新重试", type: "error" });
	}
});

// 初始化编辑模式
const initEditMode = async () => {
	// 创建默认场景
	const defaultScene = {
		index: 0,
		title: "# 新卡片",
		blockIds: [],
		blocks: [],
	};

	// 初始化状态
	scenes.value = [defaultScene];
	currentScene.value = defaultScene;
	currentSceneBlocks.value = [];

	// 初始化 stores
	scenesStore.initStore([defaultScene]);
	editorStore.clearUnsavedChanges();

	// 设置默认视图模式
	viewMode.value = "both";
};

// 初始化查看模式
const initViewMode = async () => {
	try {
		rightPanelLoading.value = true;

		// 按顺序初始化数据
		await Promise.all([
			scenesStore.loadScenes(), // 加载场景数据
			knowledgeStore.loadKnowledge(), // 加载知识点数据
		]);

		// 设置初始场景
		if (scenes.value.length > 0) {
			currentScene.value = scenes.value[0];
			currentSceneBlocks.value = currentScene.value.blocks;
		}

		// 应用知识点高亮
		await knowledgeManager.applyHighlights();
	} catch (error) {
		console.error("加载已有内容失败:", error);
		throw error;
	} finally {
		rightPanelLoading.value = false;
	}
};

// 添加按钮组相关方法
const toggleViewMode = () => {
	const modes = ["both", "editor", "card"];
	const currentIndex = modes.indexOf(viewMode.value);
	viewMode.value = modes[(currentIndex + 1) % modes.length];
};

const saveDialogue = async () => {
	try {
		rightPanelLoading.value = true;
		const content = await editorStore.editor.save();
		await scenesStore.saveScenes({
			content,
			scenes: scenes.value,
		});
		showToast({ message: "保存成功", type: "success" });
	} catch (error) {
		console.error("保存失败:", error);
		showToast({ message: "保存失败，请重试", type: "error" });
	} finally {
		rightPanelLoading.value = false;
	}
};

const backToPreview = () => {
	if (editorStore.hasUnsavedChanges) {
		document.getElementById("leave_confirm_modal").showModal();
	} else {
		confirmLeave();
	}
};

const openGuideModal = () => {
	document.getElementById("guide_modal").showModal();
};
</script>

<style scoped>
.editor-box {
	min-height: calc(100vh - 8rem);
}

.editor-container {
	border: 1px solid #e5e7eb;
	border-radius: 0.75rem;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -1px rgba(0, 0, 0, 0.06);
	background-color: white;
	overflow: hidden;
}

.right-panel {
	position: relative;
	padding-left: 1rem;
}

.toolbox-container {
	position: sticky;
	top: 1rem;
	background: white;
}

/* 添加阴影效果 */
.shadow-knowledge {
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.editor-box {
	position: relative;
	gap: 2rem;
}

/* 选项按钮容器 */
.optionbox-container {
	margin-top: 5%;
	position: sticky;
	top: 10%;
	right: 0;
	height: 10vh;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

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

.editor-wrapper {
	height: 100%;
	overflow-y: auto;
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
}

.editor-wrapper::-webkit-scrollbar {
	display: none; /* Chrome, Safari and Opera */
}

.editorjs-container {
	padding: 2rem;
	min-height: 100%;
}

/* .optionbox-container button:hover {
	transform: translate(2px, 2px);
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.optionbox-container button:active {
	transform: translate(4px, 4px);
	box-shadow: none;
} */

/* 编辑器容器 */
.editor-container {
	text-align: left;
	height: calc(100vh - 150px);
	border: 3px solid #333;
	border-radius: 12px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
	overflow: visible;
}

.editorjs-container {
	padding: 2rem;
	height: 100%;
	overflow-y: auto;
	background-size: 100% 24px;
}

.right-panel {
	position: relative;
	height: fit-content;
}

/* 工具箱容器 */
.toolbox-container {
	height: calc(100vh - 150px);
	overflow-y: auto;
	border: 3px solid #333;
	border-radius: 12px;
	background: white;
	box-shadow: -3px 3px 0 rgba(0, 0, 0, 0.2);
}

/* 工具箱装饰 */
.decorated-card {
	position: relative;
	overflow: hidden;
}

/* 知识点列表样式 */
.group {
	border: 2px solid transparent;
	transition: all 0.3s;
}

/* 滚动条样式 */
.toolbox-container::-webkit-scrollbar {
	width: 8px;
}

.toolbox-container::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}

.toolbox-container::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
}

.toolbox-container::-webkit-scrollbar-thumb:hover {
	background: rgba(0, 0, 0, 0.3);
}

/* 顶部装饰条 */
.bg-gradient-to-r {
	height: 4px;
	background: repeating-linear-gradient(
		90deg,
		rgba(var(--primary-color-rgb), 0.3),
		rgba(var(--secondary-color-rgb), 0.3) 20px,
		rgba(var(--primary-color-rgb), 0.3) 40px
	);
}

/* 按钮悬停效果 */
.btn-ghost:hover {
	background: rgba(var(--secondary-color-rgb), 0.1);
	transform: translateY(-1px);
}

.shadow-retro {
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.8);
}

.ghost-btn {
	padding: 0.375rem 0.75rem;
	font-size: 0.75rem;
	line-height: 1rem;
	display: flex;
	align-items: center;
	gap: 0.25rem;
	background-color: transparent;
	border: none;
	border-radius: 0.5rem;
	color: rgb(31, 41, 55);
	position: relative;
	overflow: hidden;
	transition: all 0.2s ease;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.ghost-btn:hover {
	/* background-color: rgb(249, 250, 251); */
	/* border-color: rgba(31, 41, 55, 0.4); */
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.ghost-btn:active {
	transform: translateY(1px);
	/* background-color: rgb(243, 244, 246); */
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.ghost-btn::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	/* background: rgba(0, 0, 0, 0.05); */
	transform: translateX(-100%);
	transition: transform 0.2s ease;
}

.ghost-btn:hover::before {
	transform: translateX(0);
}

.text-toolbox {
	display: flex;
	gap: 0.5rem;
	padding: 0.3rem;
	/* background-color: #f3f4f6; */
	/* border: 1px solid #e5e7eb; */
	border-radius: 0.375rem;
	margin-bottom: -0.2rem;
}

/* 可以添加纸张纹理背景 */
.text-toolbox::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	opacity: 0.1;
	pointer-events: none;
	border-radius: 0.5rem;
}

.translated-text {
	color: #4b5563;
	font-style: italic;
	background-color: #f8fafc;
	margin-top: -0.5rem !important; /* 添加负的上边距，使翻译文本向上移动 */
	padding-top: 0.25rem; /* 添加上内边距，保持文本不会太靠近原文 */
}

.original-text
	.text-sm.p-2.rounded:not(.translated-text):not(.knowledge-block) {
	margin-bottom: 0.25rem; /* 减小原文块的下边距 */
}

.knowledge-block {
	cursor: default;
	background-color: rgba(var(--milk-color-rgb), 0.5);
	border-radius: 0.5rem;
	margin: 0.75rem 0;
	border-left: 3px solid rgba(var(--secondary-color-rgb), 1);
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.speaker-badge {
	font-weight: 500;
	min-width: 60px;
	text-align: center;
}

/* 如果是旁白，使用不同的样式 */
.text-primary .speaker-badge {
	background-color: var(--primary-color);
	opacity: 0.8;
}
</style>
<style>
/* 知识点按钮样式 - 全局定义以应用于动态生成的内容 */
.knowledge-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border-radius: 4px;
	background: transparent;
	border: none;
	cursor: pointer;
	margin-left: 4px;
	transition: all 0.2s;
}

.knowledge-btn:hover {
	background-color: rgba(0, 0, 0, 0.05);
}

.knowledge-detail-btn {
	color: #222; /* 蓝色 */
}

.knowledge-delete-btn {
	color: #222; /* 红色 */
}

.knowledge-btn i {
	font-size: 14px;
}
</style>
