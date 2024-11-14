<template>
	<div class="w-full mx-auto px-4 mt-40 flex items-center justify-center">
		<div class="retro-card w-full max-w-sm">
			<div class="card-shadow">
				<div class="card-edge">
					<div class="card-face">
						<!-- 标题 -->
						<div class="retro-title-box mb-4">
							<h1
								class="font-bold text-shadow-retro flex justify-between items-center"
							>
								<div class="text-xl">
									{{ t("login.title") }}
								</div>
								<div class="title-decoration-right">
									<i class="bi bi-sunglasses text-3xl"></i>
								</div>
							</h1>
						</div>

						<form @submit.prevent="login" class="space-y-6">
							<!-- 邮箱输入 -->
							<div class="form-control">
								<label class="retro-label">
									<span class="label-text">{{ t("login.email") }}:</span>
								</label>
								<div class="retro-input-wrapper">
									<input
										type="text"
										v-model="email"
										class="retro-input"
										:placeholder="t('login.emailInput')"
										required
									/>
								</div>
							</div>

							<!-- 密码输入 -->
							<div class="form-control">
								<label class="retro-label">
									<span class="label-text">{{ t("login.password") }}:</span>
								</label>
								<div class="retro-input-wrapper">
									<input
										type="password"
										v-model="password"
										class="retro-input"
										:placeholder="t('login.passwordInput')"
										required
									/>
								</div>
							</div>

							<!-- 错误信息 -->
							<div v-if="errorMessage" class="text-red-500 text-sm text-center">
								{{ errorMessage }}
							</div>

							<!-- 提交按钮 -->
							<div class="flex justify-center mt-6">
								<button type="submit" class="retro-btn-large">
									<div class="btn-shadow">
										<div class="btn-edge">
											<div class="btn-face">
												{{ t("login.submit") }}
											</div>
										</div>
									</div>
								</button>
							</div>

							<!-- 注册链接 -->
							<p class="text-center text-sm mt-6 text-gray-600">
								{{ t("login.tips") }}
								<a
									@click="goToSignup"
									class="text-blue-600 cursor-pointer hover:text-blue-800 ml-1"
								>
									{{ t("login.tips2") }}
								</a>
							</p>
						</form>
					</div>
				</div>
			</div>
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
const { setLoginState, setUserInfo } = loginStore;

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
				setUserInfo(response.data.data);
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
/* 复古卡片样式 */
.retro-card {
	position: relative;
	width: 100%;
	text-align: left;
}

.card-shadow {
	background-color: #666;
	border-radius: 12px;
	transform: translateY(4px);
}

.card-edge {
	background-color: #b3b3b3;
	border-radius: 12px;
	transform: translateY(-4px);
}

.card-face {
	background-color: #f8f8f8;
	border: 3px solid #333;
	border-radius: 12px;
	padding: 1.5rem;
	transform: translateY(-4px);
	position: relative;
}

.retro-title-box {
	position: relative;
	width: 100%;
	padding: 0.5rem 0;
}

.text-shadow-retro {
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2),
		-1px -1px 0 rgba(255, 255, 255, 0.1);
}

.title-decoration-left {
	transform: rotateY(180deg);
}

.title-decoration-left,
.title-decoration-right {
	display: flex;
	align-items: center;
	padding: 0 1rem;
}

.title-decoration-left i,
.title-decoration-right i {
	transition: transform 0.3s ease;
}

.title-decoration-left i:hover,
.title-decoration-right i:hover {
	transform: scale(1.1);
}

/* 复古输入框样式 */
.retro-input-wrapper {
	position: relative;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
	padding: 2px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.retro-input {
	width: 100%;
	padding: 0.5rem;
	border: none;
	background: transparent;
	font-family: inherit;
}

.retro-input:focus {
	outline: none;
}

/* 复古按钮样式 */
.retro-btn-large {
	position: relative;
	width: 10rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 8px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	border: 2px solid #333;
	border-radius: 8px;
	color: #333;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
}

.retro-btn-large:hover .btn-face {
	background-color: white;
}

.retro-btn-large:active .btn-edge,
.retro-btn-large:active .btn-face {
	transform: translateY(0);
}

/* 复古标签样式 */
.retro-label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: bold;
	color: #333;
}

/* 纹理效果 */
.card-face::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.02) 2px,
		rgba(0, 0, 0, 0.02) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}

.card-face::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 50%;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
	border-radius: 9px 9px 0 0;
	pointer-events: none;
}
</style>
