<template>
	<div class="mt-40 flex items-center justify-center">
		<div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
			<h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">
				{{ t("login.title") }}
			</h1>

			<form @submit.prevent="login">
				<!-- Username Input -->
				<div class="mb-4">
					<label
						for="email"
						class="pl-3 text-left block text-gray-700 text-sm mb-2 focus:border-none"
						>{{ t("login.email") }}:</label
					>
					<input
						type="text"
						id="email"
						v-model="email"
						class="input input-bordered w-full"
						:placeholder="t('login.emailInput')"
						required
					/>
				</div>

				<!-- Password Input -->
				<div class="mb-4">
					<label
						for="password"
						class="text-left pl-3 block text-gray-700 text-sm mb-2"
						>{{ t("login.password") }}:</label
					>
					<input
						type="password"
						id="password"
						v-model="password"
						class="input input-bordered w-full"
						:placeholder="t('login.passwordInput')"
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
						{{ t("login.submit") }}
					</button>
				</div>
			</form>

			<!-- Sign up Link -->
			<p class="text-center text-sm mt-4 text-gray-600">
				{{ t("login.tips") }}
				<a @click="goToSignup" class="text-blue-500 cursor-pointer">{{
					t("login.tips2")
				}}</a>
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import apiClient from "@/api";

import { useLoginStore } from "@/store/index";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loginStore = useLoginStore();
const { setLoginState } = loginStore;

const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const errorMessage = ref("");

const login = async () => {
	try {
		const response = await apiClient.post("/auth/login", {
			email: email.value,
			password: password.value,
		});

		if (response.data.code === 200) {
			if (response.data.data.access_token) {
				localStorage.setItem("token", response.data.data.access_token); // 保存 token
				setLoginState(true);
				const redirectPath = route.query.redirect || "/";
				router.replace({ path: redirectPath, force: true });
			}
		} else {
			errorMessage.value = t("login.error");
		}
	} catch (error) {
		errorMessage.value = t("login.error");
	}
};

// 跳转到注册页面
const goToSignup = () => {
	router.push("/signup");
};
</script>

<style scoped>
input {
	border-radius: 0.375rem;
	border: 1px solid #e2e8f0;
}
</style>
