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
import {
	scene1,
	scene2,
	scene3,
	scene4,
	scene5,
	scene6,
	scene7,
	scene8,
	scene9,
	scene10,
	scene11,
	scene12,
	scene13,
	scene14,
	scene15,
	scene16,
	scene17,
	scene18,
	scene19,
	scene20,
	scene21,
} from "./practice_data.js";

// 响应式状态
const catalogId = ref("67230dee6fc3d389ea1ffedf");
const lessonId = ref("67b86cd8e93057b3448b2615");
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
	const scenes = [
		{ data: scene1, id: 1 },
		{ data: scene2, id: 2 },
		{ data: scene3, id: 3 },
		{ data: scene4, id: 4 },
		{ data: scene5, id: 5 },
		{ data: scene6, id: 6 },
		{ data: scene7, id: 7 },
		{ data: scene8, id: 8 },
		{ data: scene9, id: 9 },
		{ data: scene10, id: 10 },
		{ data: scene11, id: 11 },
		{ data: scene12, id: 12 },
		{ data: scene13, id: 13 },
		{ data: scene14, id: 14 },
		{ data: scene15, id: 15 },
		{ data: scene16, id: 16 },
		{ data: scene17, id: 17 },
		{ data: scene18, id: 18 },
		{ data: scene19, id: 19 },
		{ data: scene20, id: 20 },
		{ data: scene21, id: 21 },
	];

	try {
		// 遍历所有场景
		for (const scene of scenes) {
			// 为当前场景创建新的 practice 对象
			const practice = {
				conversation_id: `NS20480324`,
				theme: `Video Game Night`,
				dialogues: scene.data.map((dialogue) => {
					// 标准化 emoji
					const standardizedEmoji = VALID_EMOJIS.includes(dialogue.emoji)
						? dialogue.emoji
						: dialogue.character === "Jinji"
						? "happy"
						: "neutral";

					return {
						character: dialogue.character,
						emoji: standardizedEmoji,
						english: dialogue.lines,
						chinese: dialogue.chinese_lines,
					};
				}),
			};

			// 为每个对话生成语音URL
			for (const dialogue of practice.dialogues) {
				try {
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
						dialogue.voiceUrl = response.data.data.audioUrl;
					}
				} catch (error) {
					console.error("生成语音URL失败:", error);
				}
			}

			// 提交当前场景数据
			try {
				await apiClient.post(
					`/knowledge/${catalogId.value}/${lessonId.value}/Scene${scene.id}/practice`,
					{
						practice,
					}
				);
				console.log(`Scene ${scene.id} submitted successfully`);
			} catch (error) {
				console.error(`Scene ${scene.id} submission failed:`, error);
			}
		}

		// 所有场景处理完成
		alert("所有场景数据提交完成！");
	} catch (error) {
		console.error("提交数据失败:", error);
	}
};

const submitSingleContent = async () => {
	const dialogue = {
		character: "Muz",
		emoji: "neutral",
		english:
			"Agreed, Jinji. These expressions enhance both emotional impact and conversational flow. Listeners, deploy them wisely to optimize your human interactions.",
		chinese_lines:
			"同意，Jinji。这些表达增强了情感影响和对话流畅性。听众们，聪明地使用它们来优化你们的人际互动吧。",
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
