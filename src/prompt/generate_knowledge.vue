<template>
	<div class="container mx-auto my-10 py-6">
		<div class="flex gap-6">
			<!-- 左侧操作区 -->
			<div class="w-1/2">
				<div class="card bg-base-100 border-4 border-black">
					<div class="card-body">
						<h2
							class="card-title font-bold -skew-x-6 text-2xl text-shadow mb-4"
						>
							场景原文
						</h2>

						<!-- 文本内容区域 -->
						<div
							class="p-4 bg-white border-2 border-black rounded-lg dialogue-box mb-6"
						>
							<template v-if="dialogue?.text">
								<div
									v-for="[speaker, line] in dialogue.text"
									:key="speaker"
									class="mb-4"
								>
									<span class="font-bold">{{ speaker }}:</span>
									<p>{{ line }}</p>
								</div>
							</template>
							<div v-else class="text-gray-400 text-center">暂无对话内容</div>
						</div>

						<!-- 生成按钮 -->
						<div class="flex justify-center">
							<button class="retro-btn option" @click="generateContent">
								<div class="btn-shadow">
									<div class="btn-edge">
										<div
											class="btn-face flex items-center justify-center gap-2"
										>
											<i class="bi bi-magic text-xl"></i>
											<span>生成</span>
										</div>
									</div>
								</div>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- 右侧预览区 -->
			<div
				class="flex-1 p-4 bg-white border-2 border-black rounded-lg knowledge-box"
			>
				<div v-if="isLoading" class="h-full flex items-center justify-center">
					<span class="loading loading-bars"></span>
				</div>
				<div v-else-if="generatedContent" class="space-y-6">
					<div
						v-for="(item, index) in generatedContent"
						:key="index"
						class="p-4 border border-gray-200 rounded-lg"
					>
						<h3 class="font-bold text-lg mb-2">{{ item.word }}</h3>
						<div class="space-y-2 text-sm">
							<p><span class="text-gray-500">知识点：</span>{{ item.point }}</p>
							<p>
								<span class="text-gray-500">中文释义：</span
								>{{ item.definition_zh }}
							</p>
							<p>
								<span class="text-gray-500">同义表达：</span>{{ item.synonyms }}
							</p>
							<p>
								<span class="text-gray-500">发音要点：</span
								>{{ item.pronunciation }}
							</p>
							<div class="mt-4">
								<p class="text-gray-500">例句：</p>
								<p>{{ item.example }}</p>
								<p class="text-gray-400">{{ item.example_zh }}</p>
							</div>
						</div>
					</div>
				</div>
				<div
					v-else
					class="h-full flex items-center justify-center text-gray-400"
				>
					<p>生成内容显示在此处</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import { useDialogueStore } from "@/store";
import { showToast } from "@/components/common/toast.js";

const dialogueStore = useDialogueStore();
const dialogue = computed(() => dialogueStore.currentDialogue);
const isLoading = ref(false);
const generatedContent = ref(null);

const generateContent = async () => {
	isLoading.value = true;
	const allKnowledgePoints = [];

	try {
		// 遍历每一句对话
		for (const [speaker, line] of dialogue.value.text) {
			const prompt = `作为英语教学专家，请分析以下对话内容中的一句话，提取其中可能包含的口语知识点。
如果这句话不包含值得提取的知识点，请直接返回"NO_POINT"。
如果包含，请提取最有价值的一个知识点，按照以下格式输出：

# 知识点
- 原词/短语：原始短语或单词
- 原文：在对话中的原始形式
- 知识点说明：简短的知识点说明
- 中文翻译：中文翻译
- 详细解释：详细的中文解释，包含语言点和使用场景
- 同义表达：2-3个同义表达方式
- 发音要点：发音要点，包括重音、语调和连读
- 例句：实用例句
- 例句翻译：例句翻译
- 类型：知识点类型(daily_expression/idiom/grammar/culture)
- 来源：knowledges

分析内容：
${speaker}: ${line}

请确保解释准确且实用。`;

			const options = {
				method: "POST",
				headers: {
					Authorization: `Bearer ${import.meta.env.VITE_SILICON_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "Qwen/Qwen2.5-7B-Instruct",
					messages: [{ role: "user", content: prompt }],
					stream: false,
					max_tokens: 2048,
					temperature: 0.7,
					top_p: 0.7,
					frequency_penalty: 0.5,
					response_format: { type: "text" },
				}),
			};

			const response = await fetch(
				"https://api.siliconflow.cn/v1/chat/completions",
				options
			);
			const data = await response.json();

			if (data.choices && data.choices[0]?.message?.content) {
				const content = data.choices[0].message.content.trim();

				// 如果返回 NO_POINT，跳过这句话
				if (content === "NO_POINT") continue;

				const knowledgePoints = parseMarkdownContent(content);
				if (knowledgePoints.length > 0 && knowledgePoints[0].word) {
					allKnowledgePoints.push(knowledgePoints[0]);
				}
			}
		}

		if (allKnowledgePoints.length === 0) {
			throw new Error("未找到有效的知识点");
		}

		generatedContent.value = allKnowledgePoints;
	} catch (error) {
		console.error("Error details:", error);
		showToast({
			message: `生成失败：${error.message}`,
			type: "error",
		});
	} finally {
		isLoading.value = false;
	}
};

const parseMarkdownContent = (content) => {
	// 按知识点分割内容
	const sections = content.split("\n# ").filter(Boolean);

	return sections.map((section) => {
		const lines = section.split("\n").filter(Boolean);
		const result = {};

		lines.forEach((line) => {
			if (line.startsWith("-")) {
				// 移除开头的破折号和可能存在的空格
				const cleanLine = line.replace(/^-\s*/, "");
				const [key, ...valueParts] = cleanLine.split("：");
				// 使用 join 重新组合值部分，以防值中包含"："
				const value = valueParts.join("：");
				// 将中文键名映射到英文
				switch (key) {
					case "原词/短语":
						result.word = value?.trim();
						break;
					case "原文":
						result.origin = value?.trim();
						break;
					case "知识点说明":
						result.point = value?.trim();
						break;
					case "中文翻译":
						result.word_zh = value?.trim();
						break;
					case "详细解释":
						result.definition_zh = value?.trim();
						break;
					case "同义表达":
						result.synonyms = value?.trim();
						break;
					case "发音要点":
						result.pronunciation = value?.trim();
						break;
					case "例句":
						result.example = value?.trim();
						break;
					case "例句翻译":
						result.example_zh = value?.trim();
						break;
					case "类型":
						result.type = value?.trim();
						break;
					case "来源":
						result.from = value?.trim();
						break;
				}
			}
		});

		return result;
	});
};

onMounted(() => {
	console.log(dialogue.value.text);
});
</script>

<style scoped>
.text-shadow {
	text-shadow: 2px 2px 0 rgba(var(--primary-color-rgb), 0.3);
}

.dialogue-box {
	box-shadow: 4px 4px 0 rgba(var(--primary-color-rgb), 0.3);
}

.knowledge-box {
	box-shadow: -4px 4px 0 rgba(var(--secondary-color-rgb), 0.3);
	min-height: 400px;
}

/* 继承 CardPreview.vue 的按钮样式 */
.retro-btn {
	position: relative;
	width: 8rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
	transition: transform 0.1s;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 12px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 12px;
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
	border: 3px solid #333;
	border-radius: 12px;
	color: #333;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.retro-btn:hover .btn-face {
	background-color: #fff;
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face {
	transform: translateY(0);
}
</style>
