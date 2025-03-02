<template>
	<div class="container mx-auto p-6">
		<div class="bg-white rounded-lg shadow-md p-6 mb-6">
			<h2 class="text-xl font-bold mb-4">参数设置</h2>
			<div class="space-y-4">
				<div class="flex items-center">
					<label class="w-24 text-gray-700">catalogId:</label>
					<input
						type="text"
						v-model="catalogId"
						disabled
						class="flex-1 p-2 border rounded-md bg-gray-100"
					/>
					<label class="w-24 text-gray-700">lessonId:</label>
					<input
						type="text"
						v-model="lessonId"
						class="flex-1 p-2 border rounded-md"
					/>
					<label class="w-24 text-gray-700">sceneId:</label>
					<input
						type="text"
						v-model="sceneId"
						class="flex-1 p-2 border rounded-md"
					/>
				</div>
				<div class="flex items-center">
					<label class="w-24 text-gray-700">dialogues_number:</label>
					<input
						type="text"
						v-model="dialogues_number"
						class="flex-1 p-2 border rounded-md"
					/>
					<label class="w-24 text-gray-700">step:</label>
					<input
						type="text"
						v-model="step"
						class="flex-1 p-2 border rounded-md"
					/>
				</div>
				<div class="flex items-center">
					<label class="w-24 text-gray-700">extra:</label>
					<input
						type="text"
						v-model="extra"
						class="flex-1 p-2 border rounded-md"
					/>
				</div>
			</div>
			<button
				@click="generateContent"
				class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4"
			>
				生成内容
			</button>
			<button
				@click="submitContent"
				class="bg-green-500 ml-2 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4"
			>
				提交
			</button>
			<button
				@click="submitSingleContent"
				class="bg-green-500 ml-2 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4"
			>
				校正
			</button>
		</div>

		<div class="bg-white rounded-lg shadow-md p-6 mb-6">
			<h2 class="text-xl font-bold mb-4">练习题 prompt</h2>
			<textarea
				v-model="generatedContent"
				class="w-full min-h-[20rem] p-2 border rounded-md"
				style="height: auto"
			></textarea>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import apiClient from "@/api";
import { practiceData } from "./practice_data.js";

// 响应式状态
const catalogId = ref("67230dee6fc3d389ea1ffedf");
const lessonId = ref("67b84db843370048fe40c8f0");
const sceneId = ref(localStorage.getItem("sceneId") || "");
const extra = ref("");
const step = ref("1");
const dialogues_number = ref("5");
const generatedContent = ref("");

// 生成内容方法
const generateContent = async () => {
	try {
		const res = await apiClient.get(`/knowledge`, {
			params: {
				catalogId: catalogId.value,
				lessonId: lessonId.value,
				sceneId: "Scene" + parseInt(sceneId.value),
			},
		});
		const result = transformData(res.data.data.knowledge);
		generatedContent.value = result;
		localStorage.setItem("sceneId", sceneId.value);
	} catch (error) {
		console.error("Failed to fetch catalogs", error);
	}
};

const transformData = (data) => {
	// 提取关键词和解释
	const keyword = data.map((item) => ({
		knowledge: item.word,
		explanation: item.definition_zh,
	}));

	const output = keyword;

	return JSON.stringify(output, null, 2);
};

const VALID_EMOJIS = [
	"happy",
	"sad",
	"angry",
	"fearful",
	"disgusted",
	"surprised",
	"neutral",
];

// 提交内容方法
const submitContent = async () => {
	// 转换内容
	const practice = { ...practiceData };

	// 处理对话数据格式
	practice.dialogues = practice.dialogues.map((dialogue) => {
		// 创建新的对话对象，使用解构赋值来排除不需要的字段
		const { lines, chinese_lines, ...rest } = dialogue;
		// 标准化 emoji，如果不在有效列表中则使用 neutral
		const standardizedEmoji = VALID_EMOJIS.includes(dialogue.emoji)
			? dialogue.emoji
			: "neutral";
		return {
			...rest,
			emoji: standardizedEmoji,
			english: dialogue.lines || dialogue.english,
			chinese: dialogue.chinese_lines || dialogue.chinese,
		};
	});

	// 为每个对话生成语音URL
	for (const dialogue of practice.dialogues) {
		try {
			// 使用文本转语音API生成URL
			console.log({
				text: dialogue.english,
				role: dialogue.character,
				emotion: dialogue.emoji,
			});
			const response = await apiClient.post("/voice/generate", {
				text: dialogue.english,
				role: dialogue.character,
				emotion: dialogue.emoji,
			});
			if (response.data.code === 200) {
				// 添加语音URL到对话数据中
				dialogue.voiceUrl = response.data.data.audioUrl;
			}
		} catch (error) {
			console.error("生成语音URL失败:", error);
		}
	}

	// 输出转换后的数据
	console.log("转换后的数据:", practice);
	try {
		await apiClient.post(
			`/knowledge/${catalogId.value}/${lessonId.value}/Scene${parseInt(
				sceneId.value
			)}/practice`,
			{
				practice,
			}
		);
		localStorage.setItem("sceneId", "");
	} catch (error) {
		console.error("提交数据失败:", error);
	}
};

const submitSingleContent = async () => {
	const dialogue = {
		character: "Jinji",
		emoji: "happy",
		english:
			"Aww, Muz, that’s a solid start! Maybe spice it up like, 'Oh no, Jinji, that test was brutal! Let’s study together, and I’ll hype you up to make you feel all better.' See? Extra love makes it pop!",
		chinese:
			"哇，Muz，这开局很稳！也许可以加点料，比如，'天哪，Jinji，那考试太狠了！咱们一起学，我会给你打气让你感觉好起来。'看，多点爱就能更出彩！",
	};
	try {
		// 使用文本转语音API生成URL
		console.log({
			text: dialogue.english,
			role: dialogue.character,
			emotion: dialogue.emoji,
		});
		const response = await apiClient.post("/voice/generate", {
			text: dialogue.english,
			role: dialogue.character,
			emotion: dialogue.emoji,
		});
		if (response.data.code === 200) {
			// 添加语音URL到对话数据中
			dialogue.voiceUrl = response.data.data.audioUrl;
			console.log(dialogue.voiceUrl);
		}
	} catch (error) {
		console.error("生成语音URL失败:", error);
	}
};
</script>
<!-- 

-->
