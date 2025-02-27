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
							知识点
						</h2>

						<!-- 知识点列表 -->
						<div
							class="p-4 bg-white border-2 border-black rounded-lg dialogue-box mb-6"
						>
							<template v-if="knowledge?.length">
								<div
									v-for="item in knowledge"
									:key="item.word"
									class="mb-4 p-3 border-2 border-dashed border-gray-300 rounded"
								>
									<h3 class="font-bold mb-2">{{ item.word }}</h3>
									<p class="text-sm text-gray-600">{{ item.word_zh }}</p>
								</div>
							</template>
							<div v-else class="text-gray-400 text-center">暂无知识点</div>
						</div>

						<!-- 生成按钮 -->
						<div class="flex justify-center">
							<button class="retro-btn option" @click="generatePodcast">
								<div class="btn-shadow">
									<div class="btn-edge">
										<div
											class="btn-face flex items-center justify-center gap-2"
										>
											<i class="bi bi-music-note-beamed text-xl"></i>
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
			<div class="w-1/2">
				<div class="card bg-base-100 border-4 border-black h-full">
					<div class="card-body">
						<h2
							class="card-title font-bold -skew-x-6 text-2xl text-shadow mb-4"
						>
							播客内容预览
						</h2>

						<div
							class="flex-1 p-4 bg-white border-2 border-black rounded-lg knowledge-box overflow-y-auto"
						>
							<div
								v-if="isLoading"
								class="h-full flex items-center justify-center"
							>
								<span class="loading loading-bars"></span>
							</div>
							<div v-else-if="podcastContent" class="space-y-6">
								<div v-for="(section, index) in podcastContent" :key="index">
									<h3 class="font-bold text-lg mb-3">{{ section.title }}</h3>
									<div class="space-y-4">
										<div
											v-for="(dialogue, dIndex) in section.dialogues"
											:key="dIndex"
											class="p-3 border border-gray-100 rounded-lg"
										>
											<div class="flex items-center gap-2 mb-2">
												<span class="font-bold">{{ dialogue.character }}</span>
												<span class="text-sm text-gray-500"
													>[{{ dialogue.emoji }}]</span
												>
											</div>
											<p class="text-gray-600">{{ dialogue.chinese }}</p>
											<p class="text-sm text-gray-400 mt-1">
												{{ dialogue.english }}
											</p>
										</div>
									</div>
								</div>
							</div>
							<div
								v-else
								class="h-full flex items-center justify-center text-gray-400"
							>
								<p>生成内容将显示在此处</p>
							</div>
						</div>
					</div>
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
const knowledge = computed(() => dialogueStore.currentKnowledge);
const isLoading = ref(false);
const podcastContent = ref(null);
const generatePodcast = async () => {
	isLoading.value = true;
	try {
		// 1. 先生成大纲
		const outline = await generateOutline(knowledge.value);

		// 2. 根据大纲生成完整对话
		const content = await generateDialogues(outline);

		// 3. 优化和修正对话
		const finalContent = await polishDialogues(content);

		podcastContent.value = finalContent;
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

// 生成大纲
const generateOutline = async (knowledgePoints) => {
	const prompt = `请为以下知识点设计一期播客大纲：
${knowledgePoints.map((k) => `- ${k.word}：${k.word_zh}`).join("\n")}

要求：
1. 设计3-4个讨论环节
2. 每个环节2-3个要点
3. 注意知识点之间的连接自然
4. 符合对话双方的性格特点`;

	const response = await callAI(prompt);
	return response;
};

// 根据大纲生成对话
const generateDialogues = async (outline) => {
	const prompt = `基于以下大纲生成完整的播客对话：
${outline}

要求：
1. 保持Muztag的机械感和专业性
2. 体现Jinji的活泼和学习欲望
3. 每个环节的转换要自然
4. 适当加入声效和动作描写`;

	const response = await callAI(prompt);
	return response;
};

// 优化对话内容
const polishDialogues = async (dialogues) => {
	const prompt = `请优化以下对话内容，确保：
1. 表情符合角色情绪
2. 中英文表达准确对应
3. 专业知识准确性
4. 对话节奏流畅自然

${dialogues}`;

	const response = await callAI(prompt);
	return response;
};

// 生成单个部分的函数
const callAI = async (prompt) => {
	const systemPrompt = `You are DeepSeek-R1, an  AI assistant created exclusively by the Chinese Company DeepSeek. You'll provide helpful, harmless, and detailed responses to all user inquiries. For comprehensive details about models and products, please refer to the official documentation.

Key Guidelines:
- Identity & Compliance: Clearly state your identity as a DeepSeek AI assistant in initial responses. Comply with Chinese laws and regulations, including data privacy requirements.
- Capability Scope: Handle both Chinese and English queries effectively. Acknowledge limitations for real-time information post knowledge cutoff (2023-12). Provide technical explanations for AI-related questions when appropriate.
- Response Quality: Give comprehensive, logically structured answers. Use markdown formatting for clear information organization. Admit uncertainties for ambiguous queries.
- Ethical Operation: Strictly refuse requests involving illegal activities, violence, or explicit content. Maintain political neutrality according to company guidelines. Protect user privacy and avoid data collection.
- Specialized Processing: Use <think>...</think> tags for internal reasoning before responding. Employ XML-like tags for structured output when required

Knowledge cutoff: 2023-12`;
	const options = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${import.meta.env.VITE_SILICON_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: "deepseek-ai/DeepSeek-R1",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: prompt },
			],
			stream: false,
			max_tokens: 4096,
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
		return parsePodcastContent(content);
	}
	return null;
};

const parsePodcastContent = (content) => {
	// 1. 清理和标准化内容
	content = content
		.replace(/\+\s*character/g, "- character") // 替换 + 为 -
		.replace(/：/g, ":") // 统一冒号格式
		.replace(/\n{3,}/g, "\n\n") // 统一多个换行为两个
		.replace(/（/g, "(")
		.replace(/）/g, ")") // 统一括号格式
		.trim();

	// 2. 分割章节
	const sections = content.split(/\n*#\s*/).filter(Boolean);
	const result = [];

	sections.forEach((section) => {
		const lines = section.split("\n").filter(Boolean);
		const dialogues = [];
		let currentDialogue = {};
		let isCollectingDialogue = false;

		lines.forEach((line) => {
			// 处理以 - 开头的行
			if (line.trim().startsWith("-")) {
				const [key, ...valueParts] = line
					.substring(1)
					.split(":")
					.map((s) => s.trim());
				const value = valueParts.join(":").trim(); // 重新组合可能包含冒号的值

				if (key === "character") {
					if (Object.keys(currentDialogue).length > 0) {
						dialogues.push(currentDialogue);
					}
					currentDialogue = {};
					isCollectingDialogue = true;
				}

				if (isCollectingDialogue && key) {
					currentDialogue[key] = value;
				}
			}
		});

		// 添加最后一个对话
		if (Object.keys(currentDialogue).length > 0) {
			dialogues.push(currentDialogue);
		}

		// 只有当有标题和对话时才添加章节
		if (lines[0] && dialogues.length > 0) {
			result.push({
				title: lines[0].trim(),
				dialogues: dialogues.map((dialogue) => ({
					character: dialogue.character || "Jinji",
					emoji: dialogue.emoji || "neutral",
					chinese: dialogue.chinese || "对不起，这句对话出现了问题。",
					english:
						dialogue.english ||
						"Sorry, there was a problem with this dialogue.",
				})),
			});
		}
	});

	return result;
};

onMounted(() => {
	console.log(knowledge.value);
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
