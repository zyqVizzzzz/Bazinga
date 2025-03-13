<template>
	<div class="w-full mx-auto px-4 my-10 flex items-center justify-center">
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
									{{ t("signup.title") }}
								</div>
								<div class="title-decoration-right">
									<i class="bi bi-flower3 text-3xl"></i>
								</div>
							</h1>
						</div>

						<div class="space-y-6">
							<!-- 邮箱输入 -->
							<div class="form-control">
								<label class="retro-label">
									<span class="label-text">{{ t("signup.email") }}:</span>
								</label>
								<div class="flex space-x-2 items-center">
									<div class="retro-input-wrapper flex-1">
										<input
											type="email"
											v-model="formData.email"
											class="retro-input text-sm"
											:class="{ 'border-red-500': v$.email.$error }"
											:placeholder="t('signup.emailInput')"
											required
											autocomplete="off"
											autocorrect="off"
											spellcheck="false"
										/>
									</div>
									<button
										type="button"
										@click="sendVerificationCode"
										:disabled="cooldown > 0 || v$.email.$invalid"
										class="retro-btn-small"
									>
										<div class="btn-shadow">
											<div class="btn-edge">
												<div class="btn-face">
													{{
														cooldown > 0 ? `${cooldown}s` : t("signup.sendCode")
													}}
												</div>
											</div>
										</div>
									</button>
								</div>
								<div class="text-red-500 text-xs mt-1" v-if="v$.email.$error">
									{{ v$.email.$errors[0].$message }}
								</div>
							</div>

							<!-- 验证码输入 -->
							<div class="form-control">
								<label class="retro-label">
									<span class="label-text"
										>{{ t("signup.verificationCode") }}:</span
									>
								</label>
								<div class="retro-input-wrapper">
									<input
										type="text"
										v-model="formData.verificationCode"
										class="retro-input text-sm"
										:class="{ 'border-red-500': v$.verificationCode.$error }"
										:placeholder="t('signup.verificationCodeInput')"
										required
										autocomplete="off"
										autocorrect="off"
										spellcheck="false"
									/>
								</div>
								<div
									class="text-red-500 text-xs mt-1"
									v-if="v$.verificationCode.$error"
								>
									{{ v$.verificationCode.$errors[0].$message }}
								</div>
							</div>

							<!-- 密码输入 -->
							<div class="form-control">
								<label class="retro-label">
									<span class="label-text">{{ t("signup.password") }}:</span>
								</label>
								<div class="retro-input-wrapper">
									<input
										type="password"
										v-model="formData.password"
										class="retro-input text-sm"
										:class="{ 'border-red-500': v$.password.$error }"
										:placeholder="t('signup.passwordInput')"
										required
										autocomplete="new-password"
									/>
								</div>
								<div
									class="text-red-500 text-xs mt-1"
									v-if="v$.password.$error"
								>
									{{ v$.password.$errors[0].$message }}
								</div>
								<!-- 密码强度显示 -->
								<!-- <div v-if="formData.password" class="mt-2">
									<div class="w-full h-1.5 bg-gray-200 rounded-full mt-1">
										<div
											class="h-full rounded-full transition-all duration-300"
											:class="`bg-${passwordStrength.color}`"
											:style="`width: ${(passwordStrength.score + 1) * 20}%`"
										></div>
									</div>
								</div> -->
								<!-- 密码规则提示 -->
								<div class="text-gray-500 text-xs mt-2">
									密码要求：
									<ul class="list-disc ml-4 mt-1">
										<li>长度至少8位</li>
										<li>必须包含字母和数字</li>
										<li>
											如果包含特殊字符，仅限于：!@#$%^&*()-_=+[]{}|;:,.<>?
										</li>
									</ul>
								</div>
							</div>

							<!-- 确认密码输入 -->
							<div class="form-control">
								<label class="retro-label">
									<span class="label-text"
										>{{ t("signup.passwordRepeat") }}:</span
									>
								</label>
								<div class="retro-input-wrapper">
									<input
										type="password"
										v-model="formData.confirmPassword"
										class="retro-input text-sm"
										:class="{ 'border-red-500': v$.confirmPassword.$error }"
										:placeholder="t('signup.passwordRepeatInput')"
										required
										autocomplete="new-password"
									/>
								</div>
								<div
									class="text-red-500 text-xs mt-1"
									v-if="v$.confirmPassword.$error"
								>
									{{ v$.confirmPassword.$errors[0].$message }}
								</div>
							</div>

							<div class="form-control">
								<label class="retro-label">
									<span class="label-text">内测码:</span>
								</label>
								<div class="retro-input-wrapper">
									<input
										type="text"
										v-model="formData.invitationCode"
										class="retro-input text-sm"
										:class="{ 'border-red-500': v$.invitationCode.$error }"
										placeholder="请输入内测码"
										required
										autocomplete="off"
										autocorrect="off"
										spellcheck="false"
									/>
								</div>
								<div
									class="text-red-500 text-xs mt-1"
									v-if="v$.invitationCode.$error"
								>
									{{ v$.invitationCode.$errors[0].$message }}
								</div>
							</div>

							<!-- 提交按钮 -->
							<div class="flex justify-center mt-6">
								<button class="retro-btn-large" @click="register">
									<div class="btn-shadow">
										<div class="btn-edge">
											<div class="btn-face">
												{{ t("signup.submit") }}
											</div>
										</div>
									</div>
								</button>
							</div>

							<!-- 登录链接 -->
							<p class="text-center text-sm mt-6 text-gray-600">
								{{ t("signup.tips") }}
								<a
									@click="goToLogin"
									class="text-blue-600 cursor-pointer hover:text-blue-800 ml-1"
								>
									{{ t("signup.tips2") }}
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useI18n } from "vue-i18n";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";

const { t } = useI18n();
const router = useRouter();

// 表单数据 - 改用 formData 对象统一管理
const formData = ref({
	email: "",
	password: "",
	confirmPassword: "",
	verificationCode: "",
	invitationCode: "",
});
const errorMessage = ref("");
const cooldown = ref(0);

// 自定义验证规则
const containsLower = (value) => /[a-z]/.test(value);
const containsUpper = (value) => /[A-Z]/.test(value);
const containsNumber = (value) => /[0-9]/.test(value);
const validSpecialChars = /^[A-Za-z0-9!@#$%^&*()\-_=+[\]{}|;:,.<>?]*$/;
const customEmail = helpers.regex(
	/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
);

// 基本验证规则
const rules = computed(() => ({
	email: {
		required: helpers.withMessage("请输入邮箱地址", required),
		validFormat: helpers.withMessage("请输入有效的邮箱地址", customEmail),
	},
	password: {
		required: helpers.withMessage("请输入密码", required),
		minLength: helpers.withMessage(
			"密码长度不能小于8位",
			(value) => value.length >= 8
		),
		containsLetter: helpers.withMessage(
			"密码必须包含字母",
			(value) => containsLower(value) || containsUpper(value)
		),
		containsNumber: helpers.withMessage("密码必须包含数字", containsNumber),
		format: helpers.withMessage("密码格式不正确", (value) =>
			validSpecialChars.test(value)
		),
	},
	confirmPassword: {
		required: helpers.withMessage("请再次输入密码", required),
		sameAsPassword: helpers.withMessage(
			"两次输入的密码不一致",
			(value) => value === formData.value.password
		),
	},
	verificationCode: {
		required: helpers.withMessage("请输入验证码", required),
		length: helpers.withMessage(
			"验证码格式不正确",
			(value) => value.length === 6
		),
	},
	invitationCode: {
		required: helpers.withMessage("请输入内测码", required),
	},
}));

const v$ = useVuelidate(rules, formData);

// 发送验证码方法
const sendVerificationCode = async () => {
	// 验证邮箱
	const isEmailValid = await v$.value.email.$validate();
	if (!isEmailValid) {
		errorMessage.value = v$.value.email.$errors[0].$message;
		return;
	}

	try {
		await apiClient.post("/users/send-verification-code", {
			email: formData.value.email,
		});

		// 开始倒计时
		cooldown.value = 60;
		const timer = setInterval(() => {
			cooldown.value--;
			if (cooldown.value <= 0) {
				clearInterval(timer);
			}
		}, 1000);

		showToast({ message: t("signup.codeSent"), type: "success" });
	} catch (error) {
		if (error.response?.data?.code) {
			errorMessage.value = error.response.data.data;
		} else {
			errorMessage.value = t("signup.sendCodeError");
		}
	}
};

// 计算密码强度
const passwordStrength = computed(() => {
	const password = formData.value.password;
	if (!password) return { score: 0, text: "弱", color: "red-500" };

	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (containsLower(password)) score++;
	if (containsUpper(password)) score++;
	if (containsNumber(password)) score++;
	if (/[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(password)) score++;

	score = Math.min(score, 4);

	const strengthTexts = ["弱", "一般", "中等", "强", "很强"];
	const strengthColors = [
		"red-500",
		"orange-500",
		"yellow-500",
		"green-500",
		"green-500",
	];

	return {
		score,
		text: strengthTexts[score],
		color: strengthColors[score],
	};
});

// 注册
const register = async () => {
	try {
		const isFormValid = await v$.value.$validate();
		if (!isFormValid) {
			// 使用第一个验证错误作为错误信息
			const firstError = Object.values(v$.value).find((field) => field.$error);
			if (firstError) {
				errorMessage.value = firstError.$errors[0].$message;
			}
			return;
		}

		const response = await apiClient.post("/users/register", {
			email: formData.value.email,
			password: formData.value.password,
			verificationCode: formData.value.verificationCode,
			invitationCode: formData.value.invitationCode,
		});

		// 根据你的后端响应格式调整
		if (response.data.code === 200 || response.data.code === 0) {
			showToast({ message: t("signup.success"), type: "success" });
			router.push("/login");
		} else {
			errorMessage.value = response.data.data || response.data.message;
		}
	} catch (error) {
		if (error.response?.data) {
			errorMessage.value = error.response.data.message;
			showToast({ message: errorMessage.value, type: "error" });
		} else {
			errorMessage.value = t("signup.error");
		}
	}
};

// 跳转到登录页面
const goToLogin = () => {
	router.push("/login");
};
</script>

<style scoped>
.retro-btn-small {
	position: relative;
	width: 6rem;
	height: 2.51rem;
	border: none;
	background: none;
	cursor: pointer;
}

.retro-btn-small:hover .btn-face {
	background-color: white;
}

.retro-btn-small:active .btn-edge,
.retro-btn-small:active .btn-face {
	transform: translateY(0);
}

.retro-btn-small:disabled {
	opacity: 0.7;
	cursor: not-allowed;
}

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
