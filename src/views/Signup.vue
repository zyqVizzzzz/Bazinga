<template>
	<div class="mt-40 flex items-center justify-center">
		<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
			<h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">
				Sign Up
			</h1>

			<form @submit.prevent="register">
				<!-- Email Input -->
				<div class="mb-4">
					<label
						for="email"
						class="pl-3 text-left block text-gray-700 text-sm mb-2 focus:border-none"
						>Email:</label
					>
					<input
						type="email"
						id="email"
						v-model="email"
						class="input input-bordered w-full"
						placeholder="Enter your email"
						required
					/>
				</div>

				<!-- Password Input -->
				<div class="mb-4">
					<label
						for="password"
						class="text-left pl-3 block text-gray-700 text-sm mb-2"
						>Password:</label
					>
					<input
						type="password"
						id="password"
						v-model="password"
						class="input input-bordered w-full"
						placeholder="Enter your password"
						required
					/>
				</div>

				<!-- Confirm Password Input -->
				<div class="mb-4">
					<label
						for="confirmPassword"
						class="text-left pl-3 block text-gray-700 text-sm mb-2"
						>Confirm Password:</label
					>
					<input
						type="password"
						id="confirmPassword"
						v-model="confirmPassword"
						class="input input-bordered w-full"
						placeholder="Confirm your password"
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
						Sign Up
					</button>
				</div>
			</form>

			<!-- Login Link -->
			<p class="text-center text-sm mt-4 text-gray-600">
				Already have an account?
				<a @click="goToLogin" class="text-blue-500 cursor-pointer"
					>Log in here</a
				>.
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";

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
		console.log(response.data);
		if (response.data.user) {
			router.push("/login"); // 注册成功后跳转到登录页面
		}
	} catch (error) {
		errorMessage.value = "Registration failed. Please try again.";
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
