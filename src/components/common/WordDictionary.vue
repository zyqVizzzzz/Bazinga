<template>
	<div
		class="word-dictionary-popup bg-base-100 rounded-lg shadow-xl border border-accent/20 p-4 max-w-md"
	>
		<div class="flex justify-between items-center mb-4">
			<h3 class="text-xl font-bold text-accent">{{ word }}</h3>
			<button @click="$emit('close')" class="text-gray-400 hover:text-gray-200">
				<i class="bi bi-x-lg"></i>
			</button>
		</div>

		<div v-if="loading" class="flex justify-center py-4">
			<span class="loading loading-dots"></span>
		</div>

		<div v-else-if="error" class="text-error text-center py-4">
			{{ error }}
		</div>

		<div v-else class="space-y-4">
			<!-- 音标 -->
			<div class="flex items-center gap-2" v-if="wordData.phonetic">
				<span class="text-gray-400">[{{ wordData.phonetic }}]</span>
				<button
					@click="playPronunciation"
					class="text-accent hover:text-accent/80"
				>
					<i class="bi bi-volume-up"></i>
				</button>
			</div>

			<!-- 释义列表 -->
			<div class="space-y-2">
				<div
					v-for="(def, index) in wordData.definitions"
					:key="index"
					class="definition-item"
				>
					<span class="text-gray-400 text-sm">{{ def.partOfSpeech }}</span>
					<p class="text-gray-200">{{ def.definition }}</p>
					<p v-if="def.example" class="text-gray-400 text-sm italic mt-1">
						"{{ def.example }}"
					</p>
				</div>
			</div>

			<!-- 保存到生词本 -->
			<div class="flex justify-end mt-4">
				<button
					@click="toggleSaveWord"
					class="btn btn-sm btn-outline btn-accent"
					:class="{ 'btn-active': isSaved }"
				>
					<i
						class="bi"
						:class="isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'"
					></i>
					{{ isSaved ? "已保存" : "保存" }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import apiClient from "@/api";

const props = defineProps({
	word: {
		type: String,
		required: true,
	},
});

const emit = defineEmits(["close"]);

const loading = ref(true);
const error = ref(null);
const wordData = ref(null);
const isSaved = ref(false);

onMounted(async () => {
	try {
		// 调用词典API获取单词数据
		const response = await apiClient.get(`/dictionary/lookup/${props.word}`);
		if (response.data.code === 200) {
			wordData.value = response.data.data;
			// 检查单词是否已保存
			checkIfWordSaved();
		} else {
			error.value = "获取单词释义失败";
		}
	} catch (err) {
		error.value = "服务器错误";
	} finally {
		loading.value = false;
	}
});

const playPronunciation = () => {
	if (wordData.value?.pronunciationUrl) {
		const audio = new Audio(wordData.value.pronunciationUrl);
		audio.play();
	}
};

const checkIfWordSaved = async () => {
	try {
		const response = await apiClient.get(`/vocabulary/check/${props.word}`);
		isSaved.value = response.data.data.isSaved;
	} catch (err) {
		console.error("检查单词保存状态失败:", err);
	}
};

const toggleSaveWord = async () => {
	try {
		if (isSaved.value) {
			await apiClient.delete(`/vocabulary/${props.word}`);
		} else {
			await apiClient.post("/vocabulary/add", {
				word: props.word,
				data: wordData.value,
			});
		}
		isSaved.value = !isSaved.value;
	} catch (err) {
		console.error("保存/删除单词失败:", err);
	}
};
</script>

<style scoped>
.word-dictionary-popup {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 1000;
	max-height: 80vh;
	overflow-y: auto;
}

.definition-item {
	padding: 8px;
	border-radius: 4px;
	background: rgba(var(--accent-color-rgb), 0.05);
}
</style>
