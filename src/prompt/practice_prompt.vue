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
const lessonId = ref("67230dee6fc3d389ea1ffee1");
const sceneId = ref(localStorage.getItem("sceneId") || "");
const extra = ref("");
const step = ref("1");
const dialogues_number = ref("5");
const generatedContent = ref("");
const submittedContent = ref("");

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

	// 创建输出对象
	const output = {
		controversy_scale: "1", // 默认值
		daily_life_scale: "3", // 默认值
		philosophy_scale: "1", // 默认值
		emotion_scale: "1", // 默认值
		keyword: keyword,
		extra: extra.value || "", // 空字符串
		step: step.value,
		dialogues_number: dialogues_number.value,
	};

	return JSON.stringify(output, null, 2);
};

// 提交内容方法
const submitContent = async () => {
	console.log("准备提交的内容:", submittedContent.value);

	// 转换内容
	const practice = practiceData;

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
	} catch (error) {}
};
</script>
