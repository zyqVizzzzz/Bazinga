<template>
	<div class="flex flex-col h-full">
		<!-- 顶部控制区域 -->
		<div class="mb-4">
			<!-- 左侧配置选项 -->
			<div class="flex flex-wrap gap-2">
				<select
					v-model="options.style"
					class="select select-bordered select-sm"
				>
					<option value="daily">日常对话</option>
					<option value="business">商务场景</option>
					<option value="academic">学术讨论</option>
					<option value="travel">旅游场景</option>
				</select>

				<select
					v-model="options.characters"
					class="select select-bordered select-sm"
				>
					<option value="2">两个角色</option>
					<option value="3">三个角色</option>
					<option value="4">四个角色</option>
				</select>

				<select
					v-model="options.length"
					class="select select-bordered select-sm"
				>
					<option value="short">简短</option>
					<option value="medium">中等</option>
					<option value="long">详细</option>
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

		<!-- 情景剧结果 -->
		<div class="flex-1 overflow-y-auto">
			<div
				v-if="sitcomContent.length === 0"
				class="flex flex-col items-center justify-center gap-4 h-full"
			>
				<button
					@click="generateSitcom"
					class="btn btn-circle btn-secondary w-16 h-16 text-white"
					:disabled="generating"
				>
					<i v-if="!generating" class="bi bi-camera-reels text-xl"></i>
					<span v-else class="loading loading-spinner loading-md"></span>
				</button>
			</div>
			<div v-else class="border p-4 rounded-md bg-gray-50">
				<div v-for="(section, idx) in sitcomContent" :key="idx" class="mb-4">
					<div class="font-bold mb-1">{{ section.character }}</div>
					<p class="text-gray-700">{{ section.content }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive } from "vue";
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
	editor: {
		type: Object,
		required: true,
	},
});

// 配置选项
const options = reactive({
	style: "daily",
	characters: "2",
	length: "medium",
	model: "deepseek-ai/DeepSeek-V2.5",
});

// 状态变量
const generating = ref(false);
const sitcomContent = ref([]);

// 生成情景剧方法（暂时只是界面展示，不实现具体功能）
const generateSitcom = async () => {
	if (props.sceneContent.length === 0) {
		showToast({ message: "没有可用的场景内容", type: "warning" });
		return;
	}

	try {
		generating.value = true;

		// 模拟生成过程
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// 暂时只是显示一些示例情景剧内容
		const characters = ["Alice", "Bob", "Charlie", "David"];
		const numCharacters = parseInt(options.characters);

		sitcomContent.value = [];

		// 生成模拟对话
		for (let i = 0; i < 6; i++) {
			const characterIndex = i % numCharacters;
			sitcomContent.value.push({
				character: characters[characterIndex],
				content: `这是一段${options.style}风格的对话示例内容。这里将展示生成的情景剧剧本。`,
			});
		}

		showToast({ message: "情景剧生成完成", type: "success" });
	} catch (error) {
		console.error("Sitcom generation error:", error);
		showToast({ message: "情景剧生成失败", type: "error" });
	} finally {
		generating.value = false;
	}
};

// 清空情景剧内容
const clearSitcom = () => {
	sitcomContent.value = [];
};

// 暴露方法给父组件
defineExpose({
	generateSitcom,
	clearSitcom,
});
</script>
