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

		<div class="input-group">
			<label for="sceneId">Scene ID:</label>
			<input
				id="sceneId"
				v-model="formData.sceneId"
				type="text"
				placeholder="Enter scene ID"
			/>
		</div>

		<button @click="handleSubmit">Submit</button>
	</div>
</template>

<script setup>
import { ref } from "vue";
import apiClient from "@/api";
import { scene1 } from "./02.js";

const formData = ref({
	catalogId: "67230dee6fc3d389ea1ffedf",
	lessonId: "67230dee6fc3d389ea1ffee1",
	sceneId: "Scene1",
});

// 提交处理函数
const handleSubmit = async () => {
	try {
		const response = await apiClient.post("/knowledge/upsert", {
			...formData.value,
			knowledge: scene1,
		});
	} catch (error) {
		console.error("Error uploading knowledge:", error);
		alert("Upload failed: " + error.message);
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
