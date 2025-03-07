<template>
	<div class="flex flex-col h-full">
		<!-- 顶部控制区域 -->
		<div class="mb-4">
			<!-- 左侧配置选项 -->
			<div class="flex flex-wrap gap-2">
				<select
					v-model="options.voice"
					class="select select-bordered select-sm"
				>
					<option value="male">男声</option>
					<option value="female">女声</option>
					<option value="child">儿童声</option>
				</select>

				<select
					v-model="options.accent"
					class="select select-bordered select-sm"
				>
					<option value="us">美式英语</option>
					<option value="uk">英式英语</option>
					<option value="au">澳式英语</option>
				</select>

				<select
					v-model="options.speed"
					class="select select-bordered select-sm"
				>
					<option value="slow">慢速</option>
					<option value="normal">正常</option>
					<option value="fast">快速</option>
				</select>

				<select
					v-model="options.model"
					class="select select-bordered select-sm"
				>
					<option value="deepseek-ai/DeepSeek-V2.5">DeepSeek</option>
					<option value="Qwen/QwQ-32B-Preview">通义千问</option>
				</select>
			</div>

			<!-- 右侧生成按钮 -->
		</div>

		<!-- 播客结果 -->
		<div class="flex-1 overflow-y-auto">
			<div
				v-if="!podcastUrl && !podcastScript.length"
				class="flex flex-col items-center justify-center gap-4 h-full"
				style="position: relative"
			>
				<!-- <span class="text-gray-500">暂无知识点<br />点击下方按钮自动生成</span> -->
				<button
					@click="generatePodcast"
					class="btn btn-circle btn-secondary w-16 h-16 text-white"
					:disabled="generating"
				>
					<i v-if="!generating" class="bi bi-lightning text-xl"></i>
					<span v-else class="loading loading-spinner loading-md"></span>
				</button>
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
					<h5 class="font-medium mb-2">播客脚本</h5>
					<div
						v-for="(paragraph, idx) in podcastScript"
						:key="idx"
						class="mb-3"
					>
						<p>{{ paragraph }}</p>
					</div>
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
	voice: "female",
	accent: "us",
	speed: "normal",
	model: "deepseek-ai/DeepSeek-V2.5",
});

// 状态变量
const generating = ref(false);
const podcastUrl = ref("");
const podcastScript = ref([]);

// 生成播客方法（暂时只是界面展示，不实现具体功能）
const generatePodcast = async () => {
	if (props.sceneContent.length === 0) {
		showToast({ message: "没有可用的场景内容", type: "warning" });
		return;
	}

	try {
		generating.value = true;

		// 模拟生成过程
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// 设置模拟的播客脚本
		podcastScript.value = [
			"欢迎收听今天的英语学习播客！",
			"在这一集中，我们将探讨一些日常英语表达和实用短语。",
			"我们的场景发生在一个咖啡店，两个朋友正在讨论他们的周末计划。",
			"请注意听他们如何使用不同的时态和表达方式来描述未来的活动。",
			"这段对话包含了许多实用的词汇和表达，特别适合中级英语学习者。",
		];

		// 设置模拟的音频URL（实际应用中这应该是从API获取的）
		podcastUrl.value = "https://example.com/sample-podcast.mp3";

		showToast({ message: "播客生成完成", type: "success" });
	} catch (error) {
		console.error("Podcast generation error:", error);
		showToast({ message: "播客生成失败", type: "error" });
	} finally {
		generating.value = false;
	}
};

// 清空播客内容
const clearPodcast = () => {
	podcastUrl.value = "";
	podcastScript.value = [];
};

// 暴露方法给父组件
defineExpose({
	generatePodcast,
	clearPodcast,
});
</script>
