<template>
	<div class="mt-40 flex items-center justify-center">
		<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
			<h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">
				{{ t("signup.title") }}
			</h1>

			<form @submit.prevent="register">
				<!-- Email Input -->
				<div class="mb-4">
					<label
						for="email"
						class="pl-3 text-left block text-gray-700 text-sm mb-2 focus:border-none"
						>{{ t("signup.email") }}:</label
					>
					<input
						type="email"
						id="email"
						v-model="email"
						class="input input-bordered w-full"
						:placeholder="t('signup.emailInput')"
						required
					/>
				</div>

				<!-- Password Input -->
				<div class="mb-4">
					<label
						for="password"
						class="text-left pl-3 block text-gray-700 text-sm mb-2"
						>{{ t("signup.password") }}:</label
					>
					<input
						type="password"
						id="password"
						v-model="password"
						class="input input-bordered w-full"
						:placeholder="t('signup.passwordInput')"
						required
					/>
				</div>

				<!-- Confirm Password Input -->
				<div class="mb-4">
					<label
						for="confirmPassword"
						class="text-left pl-3 block text-gray-700 text-sm mb-2"
						>{{ t("signup.passwordRepeat") }}:</label
					>
					<input
						type="password"
						id="confirmPassword"
						v-model="confirmPassword"
						class="input input-bordered w-full"
						:placeholder="t('signup.passwordRepeatInput')"
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
						{{ t("signup.submit") }}
					</button>
				</div>
			</form>

			<!-- Login Link -->
			<p class="text-center text-sm mt-4 text-gray-600">
				{{ t("signup.tips") }}
				<a @click="goToLogin" class="text-blue-500 cursor-pointer">{{
					t("signup.tips2")
				}}</a
				>.
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const router = useRouter();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

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
				showToast({ message: t("signup.success"), type: "success" });
				router.push("/login"); // 注册成功后跳转到登录页面
			}
		} else {
			errorMessage.value = t("signup.error");
		}
	} catch (error) {
		errorMessage.value = t("signup.error");
	}
};

// 跳转到登录页面
const goToLogin = () => {
	router.push("/login");
};
</script>

<style scoped>
input {
	border-radius: 0.375rem;
	border: 1px solid #e2e8f0;
}
</style>
