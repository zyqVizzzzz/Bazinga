<template>
	<div class="container w-full mx-auto mt-10 pt-2">
		<TextEditor
			v-if="isCustom && viewMode === 'editor'"
			v-model="editorContent"
			@create-collection="handleCreateCollection"
			@back-to-preview="backToPreview"
		/>
		<!-- 卡片编辑器 -->
		<CardView
			v-if="viewMode === 'card'"
			:view-mode="viewMode"
			:scenes="scenes"
			:is-custom="isCustom"
			@back="backToPreview"
			@update:scenes="updateScenes"
		/>
	</div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "@/components/common/toast.js";
import TextEditor from "@/components/cardEditorNext/TextEditor.vue";
import CardView from "@/components/cardEditorNext/CardView.vue";
import apiClient from "@/api";

const route = useRoute();
const router = useRouter();
const editorContent = ref("");
const isSaved = ref(false);
const isCustom = ref(false);

const viewMode = ref("editor"); // 'editor' | 'card'
const scenes = ref([]); // 存储所有场景

const handleCreateCollection = async (blocks) => {
	try {
		// 处理编辑器生成的数据
		const processedBlocks = blocks.map((block) => ({
			id: block.id,
			text: block.data.text,
			isTitle: block.id.startsWith("title_"),
			narration: false,
			isTranslated: false,
		}));

		// 场景分割
		scenes.value = splitIntoScenes(processedBlocks);
		viewMode.value = "card";

		showToast({ message: "开始制作卡片合辑...", type: "info" });
	} catch (error) {
		console.error("制作卡片合辑失败:", error);
		showToast({ message: "制作失败，请重试", type: "error" });
	}
};

// 场景分割
const splitIntoScenes = (blocks) => {
	const splitScenes = [];
	let currentScene = [];
	let hasTitle = false; // 标记当前场景是否已有标题

	blocks.forEach((block) => {
		const isBlockTitle = block.isTitle;

		// 如果是标题且当前场景已有内容，开始新场景
		if (isBlockTitle && currentScene.length > 0) {
			splitScenes.push([...currentScene]);
			currentScene = [];
			hasTitle = false;
		}

		// 处理当前块
		if (isBlockTitle && !hasTitle) {
			// 第一个标题保持原样
			hasTitle = true;
			currentScene.push(block);
		} else if (isBlockTitle && hasTitle) {
			// 后续标题转为普通文本
			currentScene.push({
				...block,
				isTitle: false,
				text: block.text.replace(/^#\s*/, ""), // 移除开头的 # 号
			});
		} else {
			// 非标题块直接添加
			currentScene.push(block);
		}
	});

	// 保存最后一个场景
	if (currentScene.length > 0) {
		splitScenes.push(currentScene);
	}

	// 如果没有任何标题分割，将所有内容作为一个场景
	if (splitScenes.length === 0 && blocks.length > 0) {
		splitScenes.push(blocks);
	}

	return splitScenes;
};

// 更新场景数据
const updateScenes = (updatedScenes) => {
	scenes.value = updatedScenes;
};

onMounted(async () => {
	// 初始化
	if (route.query.mode === "edit") {
		isCustom.value = true;
		viewMode.value = "editor";
	} else {
		isCustom.value = true;
		viewMode.value = "card";
	}
});

const backToPreview = () => {
	const courseId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const sign = route.query.sign;
	const mode = route.query?.mode;
	if (mode === "edit" && !isSaved.value) {
		router.replace("/collections/" + courseId);
		return;
	}
	router.replace({
		path: `/collections/${courseId}/${season}/${episode}`,
		query: {
			sign: sign,
		},
	});
};
</script>
<style scoped></style>
