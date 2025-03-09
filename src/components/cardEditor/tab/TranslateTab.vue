<template>
	<div class="flex flex-col h-full">
		<!-- 顶部控制区域 -->
		<div class="mb-4">
			<!-- 左侧配置选项 -->
			<div class="flex flex-wrap gap-2">
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
import apiClient from "@/api";

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

// 判断是否为英文内容
const isEnglishContent = (text) => {
	// 移除 HTML 标签
	const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "").trim();
	// 检查是否包含英文字符（至少一个字母）
	return /[a-zA-Z]/.test(cleanText);
};

// 翻译方法
// 翻译方法
const translate = async () => {
	if (props.sceneContent.length === 0) {
		showToast({ message: "没有可用的场景内容", type: "warning" });
		return;
	}

	try {
		translating.value = true;

		// 分析所有内容，按段落组织
		const paragraphs = [];
		let currentParagraph = [];

		props.sceneContent.forEach((line) => {
			const cleanLine = line.trim();
			if (!cleanLine || cleanLine === "\u200B") {
				if (currentParagraph.length > 0) {
					paragraphs.push(currentParagraph);
					currentParagraph = [];
				}
			} else {
				currentParagraph.push(cleanLine);
			}
		});
		if (currentParagraph.length > 0) {
			paragraphs.push(currentParagraph);
		}

		// 收集需要翻译的文本
		const textsToTranslate = [];
		const paragraphAnalysis = paragraphs.map((p) => analyzeParagraph(p));

		paragraphAnalysis.forEach((analysis) => {
			if (
				analysis &&
				isEnglishContent(analysis.originalText) &&
				!analysis.hasTranslation
			) {
				textsToTranslate.push(analysis.originalText);
			}
		});

		if (textsToTranslate.length === 0) {
			showToast({ message: "未找到需要翻译的英文内容", type: "warning" });
			return;
		}

		// 调用翻译接口
		const response = await apiClient.post("/translation/batch", {
			texts: textsToTranslate,
			source: options.from,
			target: options.to,
		});

		if (response.data.code === 200) {
			const translations = response.data.data.translations;
			let translationIndex = 0;

			// 重建内容，保持原有格式
			translatedContent.value = [];
			paragraphs.forEach((paragraph, idx) => {
				// 添加段落前的空行
				if (idx > 0) translatedContent.value.push("\u200B");

				const analysis = paragraphAnalysis[idx];
				if (!analysis) {
					paragraph.forEach((line) => translatedContent.value.push(line));
					return;
				}

				// 添加原文
				translatedContent.value.push(analysis.originalText);

				// 添加翻译
				if (isEnglishContent(analysis.originalText)) {
					if (analysis.hasTranslation) {
						// 保留现有翻译
						translatedContent.value.push(analysis.existingTranslation);
					} else {
						// 添加新翻译
						translatedContent.value.push(translations[translationIndex++]);
					}
				}
			});

			// 添加最后的空行
			translatedContent.value.push("\u200B");

			showToast({ message: "翻译完成", type: "success" });
		} else {
			throw new Error(response.data.message || "翻译失败");
		}
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

// 判断一段文本是否是中文翻译
const isChineseTranslation = (text) => {
	// 移除 HTML 标签和空格
	const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "").trim();
	// 检查是否包含中文字符
	return /[\u4e00-\u9fa5]/.test(cleanText);
};

// 分析段落内容
const analyzeParagraph = (lines) => {
	// 过滤掉空行和零宽字符
	const validLines = lines.filter((line) => {
		const cleaned = line.replace(/\u200B/g, "").trim();
		return cleaned.length > 0;
	});

	if (validLines.length === 0) return null;

	// 返回段落分析结果
	return {
		originalText: validLines[0], // 第一行始终是原文
		hasTranslation:
			validLines.length > 1 && isChineseTranslation(validLines[1]),
		existingTranslation: validLines.length > 1 ? validLines[1] : null,
	};
};

// 暴露方法给父组件
defineExpose({
	translate,
	clearTranslation,
});
</script>
