<template>
	<div class="container w-full mx-auto mt-10 pt-2">
		<TextEditor
			v-if="route.query.mode === 'edit'"
			v-model="editorContent"
			@create-collection="handleCreateCollection"
		/>
		<!-- 卡片编辑器 -->
		<CardView
			v-else
			:scenes="scenes"
			:isCustom="isCustom"
			:from="from"
			@update:scenes="updateScenes"
		/>
	</div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { showToast } from "@/components/common/toast.js";
import TextEditor from "@/components/cardEditorNext/TextEditor.vue";
import CardView from "@/components/cardEditorNext/CardView.vue";

const route = useRoute();
const router = useRouter();
const editorContent = ref("");
const isCustom = ref(true);

const scenes = ref([]); // 存储所有场景
const from = ref(""); // 来源：edit 或 card

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

		if (!processedBlocks.length) {
			showToast({ message: "请输入内容", type: "error" });
			return;
		}

		// 场景分割
		scenes.value = splitIntoScenes(processedBlocks);
		from.value = "edit";

		// 更新路由，移除 mode 参数
		const query = { ...route.query };
		delete query.mode;
		router.replace({ query });
	} catch (error) {
		console.error("制作卡片合集失败:", error);
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
</script>
<style scoped></style>
