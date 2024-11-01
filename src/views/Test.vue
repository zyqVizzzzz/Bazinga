<template>
	<div>
		<input v-model="text" placeholder="请输入要翻译的文本" />
		<button @click="translate">翻译</button>
		<p>翻译结果：{{ translation }}</p>
	</div>
</template>
<script setup>
import apiClient from "@/api";
// 点击翻译按钮时调用
const translate = async () => {
	await apiClient.post("/translation", {
		text: "thank you",
		source: "auto",
		target: "zh",
	});
};
</script>

<!-- 引入CryptoJS库来进行HMAC签名 -->
