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

		<div class="bg-white rounded-lg shadow-md p-6">
			<h2 class="text-xl font-bold mb-4">播客上传</h2>
			<textarea
				v-model="podcastContent"
				class="w-full min-h-[10rem] p-2 border rounded-md mb-4"
				placeholder="请输入播客内容..."
			></textarea>
			<button
				@click="uploadPodcast"
				class="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
			>
				上传播客
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import apiClient from "@/api";
import {
	scene1,
	scene2,
	// scene3,
	// scene4,
	// scene5,
	// scene6,
	// scene7,
	// scene8,
	// scene9,
	// scene10,
	// scene11,
	// scene12,
	// scene13,
	// scene14,
	// scene15,
	// scene16,
	// scene17,
	// scene18,
	// scene19,
	// scene20,
	// scene21,
	// scene22,
	// scene23,
} from "./practice_data.js";

// 响应式状态
const catalogId = ref("67230dee6fc3d389ea1ffedf");
const lessonId = ref("67b86d75e93057b3448b2658");
const sceneId = ref(localStorage.getItem("sceneId") || "");
const extra = ref("");
const step = ref("1");
const dialogues_number = ref("5");
const generatedContent = ref("");

// 新增响应式状态
const podcastContent = ref("");

// 新增上传播客方法
const uploadPodcast = async () => {
	if (!podcastContent.value.trim()) {
		alert("请输入播客内容");
		return;
	}

	try {
		// 尝试解析 JSON 字符串
		let parsedContent;
		try {
			parsedContent = JSON.parse(podcastContent.value);
			console.log(parsedContent);
		} catch (error) {
			alert("JSON 格式不正确，请检查输入内容");
			return;
		}

		// 转换数据格式
		const podcastData = {
			knowledge: parsedContent.knowledge, // 这里需要传入知识点名称
			resourceId: lessonId.value, // 使用 lessonId 作为 resourceId
			script: parsedContent.script || [], // 英文脚本
			chineseScript: parsedContent.chineseScript || [], // 中文脚本
			audioPath: "", // 音频路径，初始为空
			sceneId: sceneId.value, // 使用输入的 sceneId
			options: {
				voice: parsedContent.character || "jinji", // 使用传入的角色，默认为 jinji
				speed: "normal",
				model: "Qwen/QwQ-32B-Preview",
			},
		};

		console.log("准备发送的数据：", podcastData);

		const response = await apiClient.post("/podcasts/save", podcastData);

		if (response.data.code === 200) {
			console.log("播客上传成功！");
			podcastContent.value = ""; // 清空输入框
		}

		// const response = await apiClient.post("/podcast/upload", {
		// 	content: parsedContent
		// });

		// if (response.data.code === 200) {
		// 	alert("播客上传成功！");
		// 	podcastContent.value = ""; // 清空输入框
		// }
	} catch (error) {
		console.error("上传播客失败:", error);
		alert("上传失败，请重试");
	}
};

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
		// { data: scene3, id: 3 },
		// { data: scene4, id: 4 },
		// { data: scene5, id: 5 },
		// { data: scene6, id: 6 },
		// { data: scene7, id: 7 },
		// { data: scene8, id: 8 },
		// { data: scene9, id: 9 },
		// { data: scene10, id: 10 },
		// { data: scene11, id: 11 },
		// { data: scene12, id: 12 },
		// { data: scene13, id: 13 },
		// { data: scene14, id: 14 },
		// { data: scene15, id: 15 },
		// { data: scene16, id: 16 },
		// { data: scene17, id: 17 },
		// { data: scene18, id: 18 },
		// { data: scene19, id: 19 },
		// { data: scene20, id: 20 },
		// { data: scene21, id: 21 },
		// { data: scene22, id: 22 },
		// { data: scene23, id: 23 },
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
		english:
			"Yup, and it’s so flexible! You can slap it on anything—like 'how was your trip?' or 'how was your class?' It’s basically the ultimate convo starter, no cap!",
		character: "Jinji",
		emoji: "surprised",
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
