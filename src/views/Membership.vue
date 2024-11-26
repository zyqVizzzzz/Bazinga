<template>
	<div class="membership-page flex flex-col items-center justify-center py-10">
		<div
			class="membership-card bg-white shadow-lg rounded-lg p-8 w-96 text-center space-y-4"
		>
			<h2 class="text-2xl font-semibold text-primary mb-4">开通会员</h2>
			<p class="text-gray-600 mb-6">选择您喜欢的付款方式，享受会员专属特权。</p>

			<!-- 支付宝付款按钮 -->
			<div class="payment-method mb-4">
				<button
					class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md flex items-center justify-center space-x-2"
					@click="processPayment('支付宝')"
				>
					<!-- <img src="/img/alipay.svg" alt="支付宝" class="w-5 h-5" /> -->
					<span>使用支付宝付款</span>
				</button>
			</div>

			<!-- 微信付款按钮 -->
			<div class="payment-method">
				<button
					class="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-md flex items-center justify-center space-x-2"
					@click="processPayment('微信')"
				>
					<!-- <img src="/img/wechat.svg" alt="微信" class="w-5 h-5" /> -->
					<span>使用微信付款</span>
				</button>
			</div>

			<!-- 会员特权描述 -->
			<div class="benefits mt-6 text-left text-gray-700">
				<h3 class="text-lg font-medium mb-2">会员专属特权：</h3>
				<ul class="list-disc list-inside space-y-1">
					<li>无限访问高质量内容</li>
					<li>享受个性化定制推荐</li>
					<li>数据分析和学习进度追踪</li>
					<li>更多专属会员功能，尽情探索！</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";

const processPayment = (method) => {
	console.log(`Processing payment with ${method}`);
	// 这里可以添加付款逻辑
};
</script>

<style scoped>
.membership-page {
	padding-top: 120px;
}
</style>
