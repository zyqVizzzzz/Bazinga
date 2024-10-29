<template>
	<div class="mt-40 flex items-center justify-center">
		<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
			<h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">
				登录
			</h1>

			<form @submit.prevent="login">
				<!-- Username Input -->
				<div class="mb-4">
					<label
						for="email"
						class="pl-3 text-left block text-gray-700 text-sm mb-2 focus:border-none"
						>邮箱:</label
					>
					<input
						type="text"
						id="email"
						v-model="email"
						class="input input-bordered w-full"
						placeholder="输入邮箱"
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
						placeholder="输入密码"
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
						登录
					</button>
				</div>
			</form>

			<!-- Sign up Link -->
			<p class="text-center text-sm mt-4 text-gray-600">
				还没有账号?
				<a @click="goToSignup" class="text-blue-500 cursor-pointer">立即注册</a
				>.
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import apiClient from "@/api"; // axios 实例

import { useLoginStore } from "@/store/index";
const loginStore = useLoginStore();
const { setLoginState } = loginStore;

const router = useRouter();
const route = useRoute();

// 用户输入的用户名和密码
const email = ref("");
const password = ref("");
const errorMessage = ref("");

// 登录函数
const login = async () => {
	try {
		const response = await apiClient.post("/auth/login", {
			email: email.value,
			password: password.value,
		});

		if (response.data.access_token) {
			localStorage.setItem("token", response.data.access_token); // 保存 token
			setLoginState(true);
			const redirectPath = route.query.redirect || "/";
			router.replace({ path: redirectPath, force: true });
		}
	} catch (error) {
		errorMessage.value = "邮箱或密码有误，请重新登录";
	}
};

// 跳转到注册页面
const goToSignup = () => {
	router.push("/signup");
};
</script>

<style scoped>
/* 页面布局样式 */
input {
	border-radius: 0.375rem;
	border: 1px solid #e2e8f0;
}
</style>
