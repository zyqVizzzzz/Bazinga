<template>
	<div class="upload-container">
		<div class="input-group">
			<label for="catalogId">Catalog ID:</label>
			<input
				id="catalogId"
				v-model="formData.catalogId"
				type="text"
				placeholder="Enter catalog ID"
			/>
		</div>

		<div class="input-group">
			<label for="lessonId">Lesson ID:</label>
			<input
				id="lessonId"
				v-model="formData.lessonId"
				type="text"
				placeholder="Enter lesson ID"
			/>
		</div>

		<button @click="handleSubmit">Submit</button>
	</div>
</template>

<script setup>
import { ref } from "vue";
import apiClient from "@/api";
import * as knowledgeData from "./02.js";

const formData = ref({
	catalogId: "67230dee6fc3d389ea1ffedf",
	lessonId: "67230dee6fc3d389ea1ffee1",
});

const uploadProgress = ref(0);
const totalScenes = Object.keys(knowledgeData).length;

// 提交处理函数
const handleSubmit = async () => {
	try {
		// 遍历所有场景并上传
		for (const [key, data] of Object.entries(knowledgeData)) {
			const sceneNumber = key.replace("scene", "");
			uploadProgress.value = sceneNumber;

			await apiClient.post("/knowledge/upsert", {
				...formData.value,
				sceneId: `Scene${sceneNumber}`,
				knowledge: data,
			});
		}

		alert("所有场景上传成功！");
	} catch (error) {
		console.error("Error uploading knowledge:", error);
		alert(`上传失败: ${error.message}`);
	} finally {
		uploadProgress.value = 0;
	}
};
</script>

<style scoped>
.upload-container {
	max-width: 500px;
	margin: 0 auto;
	padding: 21px;
}

.input-group {
	margin-bottom: 16px;
}

.input-group label {
	display: block;
	margin-bottom: 5px;
}

.input-group input {
	width: 100%;
	padding: 8px;
	border: 1px solid #ddd;
	border-radius: 4px;
}

button {
	background-color: #4caf50;
	color: white;
	padding: 10px 21px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

button:hover {
	background-color: #45a049;
}
</style>
CAF
