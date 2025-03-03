<template>
	<div class="purchase-page w-full mx-auto flex flex-col items-center py-8">
		<div class="w-full max-w-2xl px-4">
			<!-- 商品信息卡片 -->
			<div v-if="productInfo" class="retro-card mb-8">
				<div class="card-content p-6">
					<h1 class="text-2xl font-bold mb-4">{{ productInfo.name }}</h1>
					<p class="text-gray-600 mb-6">{{ productInfo.description }}</p>

					<!-- 价格展示 -->
					<div class="price-tag mb-8">
						<span class="text-3xl font-bold text-secondary"
							>¥{{ productInfo.price }}</span
						>
					</div>

					<!-- 功能特性列表 -->
					<div class="features-list mb-8">
						<h2 class="text-lg font-semibold mb-4">包含以下内容：</h2>
						<ul class="space-y-3">
							<li
								v-for="(feature, index) in productInfo.features"
								:key="index"
								class="flex items-center"
							>
								<i class="bi bi-check2-circle text-secondary mr-2"></i>
								<span>{{ feature }}</span>
							</li>
						</ul>
					</div>

					<!-- 支付方式选择 -->
					<div class="payment-methods mb-6">
						<!-- <h2 class="text-lg font-semibold mb-4">请选择支付方式</h2> -->
						<div class="flex space-x-4">
							<div
								class="payment-method-item"
								:class="{ active: paymentMethod === 'alipay' }"
								@click="paymentMethod = 'alipay'"
							>
								<i class="bi bi-alipay"></i>
								<span>支付宝</span>
							</div>
							<div
								class="payment-method-item"
								:class="{ active: paymentMethod === 'wechat' }"
								@click="paymentMethod = 'wechat'"
							>
								<i class="bi bi-wechat"></i>
								<span>微信支付</span>
							</div>
						</div>
					</div>

					<!-- 支付按钮 -->
					<button
						@click="handlePurchase"
						class="retro-primary-btn w-full"
						:disabled="isProcessing"
					>
						<div class="btn-face">
							<span v-if="isProcessing">处理中...</span>
							<span v-else>确认购买</span>
						</div>
					</button>
				</div>
			</div>

			<!-- 加载状态 -->
			<div v-else class="text-center py-8">
				<p>加载中...</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { showToast } from "@/components/common/toast.js";
import apiClient from "@/api";

const route = useRoute();
const router = useRouter();

const productInfo = ref(null);
const isProcessing = ref(false);

const paymentMethod = ref("alipay"); // 支付方式
const showQRCode = ref(false); // 控制二维码显示
const qrCodeUrl = ref(""); // 二维码图片URL
const paymentStatus = ref(""); // 支付状态
let checkPaymentTimer = null; // 轮询定时器

// 获取商品信息
const fetchProductInfo = async () => {
	try {
		const res = await apiClient.get(
			`/packages/catalog/${route.query.catalogId}`
		);
		if (res.data.code === 200) {
			productInfo.value = res.data.data;
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} catch (error) {
		showToast({ message: "获取商品信息失败", type: "error" });
		console.error("Failed to fetch product info:", error);
	}
};

// 处理购买
const handlePurchase = async () => {
	if (isProcessing.value) return;

	try {
		isProcessing.value = true;
		// 创建订单
		const res = await apiClient.post("/purchases/create", {
			catalogId: route.query.catalogId,
			paymentMethod: paymentMethod.value,
		});

		if (res.data.code === 200) {
			// 显示支付二维码
			qrCodeUrl.value = res.data.data.qrCode;
			showQRCode.value = true;
			// 开始轮询支付状态
			startCheckPaymentStatus(res.data.data.orderId);
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} catch (error) {
		showToast({ message: "创建订单失败，请重试", type: "error" });
		console.error("Create order failed:", error);
	} finally {
		isProcessing.value = false;
	}
};

// 轮询检查支付状态
const startCheckPaymentStatus = (orderId) => {
	checkPaymentTimer = setInterval(async () => {
		try {
			const res = await apiClient.get(`/purchases/status/${orderId}`);
			if (res.data.code === 200) {
				if (res.data.data.status === "paid") {
					clearInterval(checkPaymentTimer);
					showQRCode.value = false;
					showToast({ message: "支付成功", type: "success" });
					goBack();
				}
			}
		} catch (error) {
			console.error("Check payment status failed:", error);
		}
	}, 3000); // 每3秒检查一次
};

// 返回上一页
const goBack = () => {
	if (route.query.returnTo) {
		router.push(route.query.returnTo);
	} else {
		router.back();
	}
};

onMounted(() => {
	if (!route.query.catalogId) {
		showToast({ message: "无效的商品信息", type: "error" });
		router.back();
		return;
	}
	fetchProductInfo();
});
</script>

<style scoped>
.purchase-page {
	min-height: calc(100vh - 64px);
	margin-top: -64px;
	padding-top: 156px;
}

.retro-card {
	background: white;
	border: 3px solid #666;
	border-radius: 12px;
	box-shadow: 0 4px 0 #666, 4px 8px 15px rgba(0, 0, 0, 0.1);
}

.price-tag {
	padding: 1rem;
	background-color: rgba(var(--secondary-color-rgb), 0.1);
	border-radius: 8px;
	text-align: center;
}

.retro-primary-btn {
	position: relative;
	height: 48px; /* 增加按钮高度 */
	border: none;
	background: none;
	cursor: pointer;
}

.retro-primary-btn .btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: var(--secondary-color);
	color: white;
	border: 2px solid #666;
	border-radius: 8px;
	font-size: 1rem; /* 增大字号 */
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	transform: translateY(-4px);
	transition: transform 0.2s;
}

.retro-primary-btn:hover .btn-face {
	transform: translateY(-5px);
}

.retro-primary-btn:active .btn-face {
	transform: translateY(-2px);
}

.retro-primary-btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.features-list li {
	padding: 0.5rem;
	background-color: rgba(var(--secondary-color-rgb), 0.05);
	border-radius: 6px;
}

.text-secondary {
	color: var(--secondary-color);
}

.payment-methods {
	padding: 1rem;
	border-radius: 8px;
}

.payment-method-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 24px;
	border: 2px solid #666;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.3s ease;
}

.payment-method-item.active {
	border-color: var(--secondary-color);
	background-color: rgba(var(--secondary-color-rgb), 0.1);
}

.qr-code-modal {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	background: white;
	padding: 2rem;
	border-radius: 12px;
	text-align: center;
	position: relative;
	max-width: 90%;
	width: 360px;
}

.qr-code-img {
	width: 200px;
	height: 200px;
	margin: 0 auto;
}

.close {
	position: absolute;
	right: 1rem;
	top: 1rem;
	cursor: pointer;
	font-size: 1.5rem;
}
</style>
