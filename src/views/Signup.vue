<template>
	<div class="mt-40 flex items-center justify-center">
		<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
			<h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">
				注册
			</h1>

			<form @submit.prevent="register">
				<!-- Email Input -->
				<div class="mb-4">
					<label
						for="email"
						class="pl-3 text-left block text-gray-700 text-sm mb-2 focus:border-none"
						>邮箱:</label
					>
					<input
						type="email"
						id="email"
						v-model="email"
						class="input input-bordered w-full"
						placeholder="请输入邮箱"
						required
					/>
				</div>

				<!-- Password Input -->
				<div class="mb-4">
					<label
						for="password"
						class="text-left pl-3 block text-gray-700 text-sm mb-2"
						>密码:</label
					>
					<input
						type="password"
						id="password"
						v-model="password"
						class="input input-bordered w-full"
						placeholder="请输入密码"
						required
					/>
				</div>

				<!-- Confirm Password Input -->
				<div class="mb-4">
					<label
						for="confirmPassword"
						class="text-left pl-3 block text-gray-700 text-sm mb-2"
						>确认密码:</label
					>
					<input
						type="password"
						id="confirmPassword"
						v-model="confirmPassword"
						class="input input-bordered w-full"
						placeholder="请再次输入密码"
						required
					/>
				</div>

				<!-- Error Message -->
				<div v-if="errorMessage" class="text-red-500 text-sm mb-4">
					{{ errorMessage }}
				</div>

				<!-- Submit Button -->
				<div class="text-center">
					<button type="submit" class="btn btn-primary w-full text-gray-100">
						注册
					</button>
				</div>
			</form>

			<!-- Login Link -->
			<p class="text-center text-sm mt-4 text-gray-600">
				已经有账户了?
				<a @click="goToLogin" class="text-blue-500 cursor-pointer">立即登录</a>.
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const router = useRouter();

// 用户输入的注册信息
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

// 注册函数
const register = async () => {
	if (password.value !== confirmPassword.value) {
		errorMessage.value = "Passwords do not match. Please try again.";
		return;
	}

	try {
		const response = await apiClient.post("/users/register", {
			email: email.value,
			password: password.value,
		});
		if (response.data.code === 200) {
			if (response.data.data.user) {
				showToast({ message: "注册成功！", type: "success" });
				router.push("/login"); // 注册成功后跳转到登录页面
			}
		} else {
			errorMessage.value = "邮箱或密码有误，请重新登录";
		}
	} catch (error) {
		errorMessage.value = "注册失败";
	}
};

// 跳转到登录页面
const goToLogin = () => {
	router.push("/login");
};
</script>

<style scoped>
/* 页面布局样式 */
input {
	border-radius: 0.375rem;
	border: 1px solid #e2e8f0;
}
</style>
