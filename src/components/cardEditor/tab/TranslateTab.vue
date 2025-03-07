<template>
	<div class="flex flex-col h-full">
		<!-- 顶部控制区域 -->
		<div class="mb-4">
			<!-- 左侧配置选项 -->
			<div class="flex flex-wrap gap-2">
				<select v-model="options.from" class="select select-bordered select-sm">
					<option value="en">英语</option>
					<option value="zh">中文</option>
				</select>

				<select v-model="options.to" class="select select-bordered select-sm">
					<option value="zh">中文</option>
					<option value="en">英语</option>
				</select>

				<select
					v-model="options.model"
					class="select select-bordered select-sm"
				>
					<option value="deepseek-ai/DeepSeek-V2.5">DeepSeek</option>
					<option value="Qwen/QwQ-32B-Preview">通义千问</option>
				</select>
			</div>

			<!-- 右侧翻译按钮 -->
		</div>

		<!-- 翻译结果 -->
		<div class="flex-1 overflow-y-auto">
			<div
				v-if="translatedContent.length === 0"
				class="flex flex-col items-center justify-center gap-4 h-full"
			>
				<button
					@click="translate"
					class="btn btn-circle btn-secondary w-16 h-16 text-white"
					:disabled="translating"
				>
					<i v-if="!translating" class="bi bi-translate text-xl"></i>
					<span v-else class="loading loading-spinner loading-md"></span>
				</button>
			</div>
			<div v-else class="border p-4 rounded-md bg-gray-50">
				<p v-for="(line, idx) in translatedContent" :key="idx" class="mb-2">
					{{ line }}
				</p>
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
	from: "en",
	to: "zh",
	model: "deepseek-ai/DeepSeek-V2.5",
});

// 状态变量
const translating = ref(false);
const translatedContent = ref([]);

// 翻译方法（暂时只是界面展示，不实现具体功能）
const translate = async () => {
	if (props.sceneContent.length === 0) {
		showToast({ message: "没有可用的场景内容", type: "warning" });
		return;
	}

	try {
		translating.value = true;

		// 模拟翻译过程
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// 暂时只是显示一些示例翻译结果
		translatedContent.value = props.sceneContent.map((line) => {
			if (options.from === "en" && options.to === "zh") {
				return `[翻译] ${line}`;
			} else {
				return `[Translation] ${line}`;
			}
		});

		showToast({ message: "翻译完成", type: "success" });
	} catch (error) {
		console.error("Translation error:", error);
		showToast({ message: "翻译失败", type: "error" });
	} finally {
		translating.value = false;
	}
};

// 清空翻译结果
const clearTranslation = () => {
	translatedContent.value = [];
};

// 暴露方法给父组件
defineExpose({
	translate,
	clearTranslation,
});
</script>
