<template>
	<div
		class="password-section flex-1 bg-white p-6 rounded-xl border-2 border-gray-100"
	>
		<div class="space-y-4">
			<!-- 当前密码 -->
			<div>
				<!-- <label class="text-sm text-gray-600 mb-2 block">当前密码</label> -->
				<input
					type="password"
					id="current-password"
					v-model="passwordForm.currentPassword"
					class="input input-bordered w-full text-sm"
					:placeholder="t('profile.account_form.password_input')"
				/>
				<div class="text-red-500 text-xs mt-1" v-if="v$.currentPassword.$error">
					{{ v$.currentPassword.$errors[0].$message }}
				</div>
			</div>

			<!-- 新密码 -->
			<div>
				<!-- <label class="text-sm text-gray-600 mb-2 block">新密码</label> -->
				<input
					type="password"
					id="new-password"
					v-model="passwordForm.newPassword"
					class="input input-bordered w-full text-sm"
					:placeholder="t('profile.account_form.password_new_input')"
				/>
				<div v-if="passwordForm.newPassword" class="mt-2">
					<div class="w-full h-2 bg-gray-200 rounded-full mt-1">
						<div
							class="h-full rounded-full transition-all duration-300"
							:class="`bg-${passwordStrength.color}`"
							:style="`width: ${(passwordStrength.score + 1) * 20}%`"
						></div>
					</div>
				</div>
				<div class="text-red-500 text-xs mt-1" v-if="v$.newPassword.$error">
					{{ v$.newPassword.$errors[0].$message }}
				</div>
				<div class="text-gray-500 text-xs mt-2">
					<ul class="list-disc ml-4 mt-1">
						<li>长度至少8位</li>
						<li>必须包含字母和数字</li>
						<li>支持特殊字符（!@#$%^&*()-_=+[]{}|;:,.<>?）</li>
					</ul>
				</div>
			</div>

			<!-- 确认新密码 -->
			<div>
				<!-- <label class="text-sm text-gray-600 mb-2 block">确认新密码</label> -->
				<input
					type="password"
					id="confirm-password"
					v-model="passwordForm.confirmPassword"
					class="input input-bordered w-full text-sm"
					:placeholder="t('profile.account_form.password_confirm_input')"
				/>
				<div class="text-red-500 text-xs mt-1" v-if="v$.confirmPassword.$error">
					{{ v$.confirmPassword.$errors[0].$message }}
				</div>
			</div>

			<!-- 密码部分的保存按钮 -->
			<div class="mt-6">
				<button
					class="w-full py-3 bg-primary hover:bg-primary-focus text-white rounded-lg font-semibold text-sm transition-colors"
					@click="validateAndSavePassword"
				>
					更新密码
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useVuelidate } from "@vuelidate/core";
import { useI18n } from "vue-i18n";
import {
	required,
	maxLength,
	minLength,
	sameAs,
	helpers,
} from "@vuelidate/validators";

const router = useRouter();
const { t, locale } = useI18n();

const passwordForm = ref({
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
});

// 自定义验证规则
const containsLower = (value) => /[a-z]/.test(value);
const containsUpper = (value) => /[A-Z]/.test(value);
const containsNumber = (value) => /[0-9]/.test(value);
const validSpecialChars = /^[A-Za-z0-9!@#$%^&*()\-_=+[\]{}|;:,.<>?]*$/;

// 基本密码规则
const passwordRule = {
	required: helpers.withMessage("请输入密码", required),
	minLength: helpers.withMessage("密码长度不能小于6位", minLength(6)),
	containsLetter: helpers.withMessage(
		"密码必须包含字母",
		(value) => containsLower(value) || containsUpper(value)
	),
	containsNumber: helpers.withMessage("密码必须包含数字", containsNumber),
	format: helpers.withMessage(
		"密码只能包含字母、数字和特殊字符（!@#$%^&*()-_=+[]{}|;:,.<>?）",
		(value) => validSpecialChars.test(value)
	),
};

// 验证规则
const rules = computed(() => ({
	currentPassword: {
		required: helpers.withMessage("请输入当前密码", required),
		minLength: helpers.withMessage("密码长度不能小于6位", minLength(6)),
	},
	newPassword: {
		...passwordRule,
		notSameAsOld: helpers.withMessage(
			"新密码不能与当前密码相同",
			(value) => value !== passwordForm.value.currentPassword || !value
		),
	},
	confirmPassword: {
		...passwordRule,
		sameAsPassword: helpers.withMessage(
			"两次输入的密码不一致",
			sameAs(computed(() => passwordForm.value.newPassword))
		),
	},
}));

const v$ = useVuelidate(
	rules,
	computed(() => ({
		currentPassword: passwordForm.value.currentPassword,
		newPassword: passwordForm.value.newPassword,
		confirmPassword: passwordForm.value.confirmPassword,
	}))
);

// 密码强度计算
const calculatePasswordStrength = (password) => {
	if (!password) return 0;
	let score = 0;

	// 基础长度检查
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;

	// 字符类型检查
	if (containsLower(password)) score++;
	if (containsUpper(password)) score++;
	if (containsNumber(password)) score++;

	// 特殊字符作为额外加分项
	const specialChars = password.replace(/[A-Za-z0-9]/g, "");
	if (specialChars.length > 0) score++;

	return Math.min(score, 4);
};

const getPasswordStrengthText = (score) => {
	const strengthTexts = ["弱", "一般", "中等", "强", "很强"];
	return strengthTexts[score];
};

const getPasswordStrengthColor = (score) => {
	const strengthColors = [
		"red-500",
		"orange-500",
		"yellow-500",
		"green-500",
		"green-500",
	];
	return strengthColors[score];
};

const passwordStrength = computed(() => {
	const score = calculatePasswordStrength(passwordForm.value.newPassword);
	return {
		score,
		text: getPasswordStrengthText(score),
		color: getPasswordStrengthColor(score),
	};
});

const validateAndSavePassword = async () => {
	// 验证新密码和确认密码是否匹配
	const result = await v$.value.$validate();
	if (!result) {
		return;
	}

	try {
		// 调用修改密码接口
		const response = await apiClient.post("/users/update-password", {
			oldPassword: passwordForm.value.currentPassword,
			newPassword: passwordForm.value.newPassword,
		});

		if (response.data.code === 200) {
			resetPasswordForm();
			showToast({
				message: "密码更新成功, 3秒后返回登录页面",
				type: "success",
			});
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} else {
			showToast({ message: "密码更新失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "密码更新失败", type: "error" });
	}
};

const resetPasswordForm = () => {
	passwordForm.value.currentPassword = "";
	passwordForm.value.newPassword = "";
	passwordForm.value.confirmPassword = "";
	v$.value.$reset();
};

onMounted(() => {
	resetPasswordForm();
});
</script>

<style scoped></style>
