<template>
	<div class="email-section flex-1 bg-white rounded-xl">
		<div class="space-y-4">
			<!-- 邮箱输入 -->
			<div>
				<div class="flex-1">
					<input
						type="email"
						id="email"
						v-model="tempEmail"
						:class="{ 'input-error': v$.tempEmail.$error }"
						class="input input-bordered w-full text-sm"
						:placeholder="t('profile.account_form.email_input')"
						autocomplete="off"
						autocorrect="off"
						spellcheck="false"
					/>
					<div class="text-red-500 text-xs mt-1" v-if="v$.tempEmail.$error">
						{{ v$.tempEmail.$errors[0].$message }}
					</div>
				</div>
			</div>

			<!-- 验证码输入 -->
			<div>
				<div class="flex space-x-2 items-center">
					<div class="flex-1">
						<input
							type="text"
							v-model="verificationCode"
							:class="{ 'input-error': v$.verificationCode.$error }"
							class="input input-bordered w-full text-sm"
							:placeholder="'请输入验证码'"
						/>
						<div
							class="text-red-500 text-xs mt-1"
							v-if="v$.verificationCode.$error"
						>
							{{ v$.verificationCode.$errors[0].$message }}
						</div>
					</div>
					<button
						type="button"
						@click="sendVerificationCode"
						:disabled="cooldown > 0 || !tempEmail || v$.tempEmail.$error"
						class="px-4 py-2 bg-primary hover:bg-primary-focus text-white rounded-lg text-sm transition-colors whitespace-nowrap"
					>
						{{ cooldown > 0 ? `${cooldown}s` : "发送验证码" }}
					</button>
				</div>
			</div>

			<!-- 邮箱部分的保存按钮 -->
			<div class="mt-6">
				<button
					class="w-full py-3 bg-primary hover:bg-primary-focus text-white rounded-lg font-semibold text-sm transition-colors"
					@click="validateAndSaveEmail"
					:disabled="isSubmitting || !verificationCode"
				>
					<span v-if="!isSubmitting">更新邮箱</span>
					<span v-else>更新中...</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useVuelidate } from "@vuelidate/core";
import { useI18n } from "vue-i18n";
import { required, helpers } from "@vuelidate/validators";

const { t } = useI18n();
const router = useRouter();
const isSubmitting = ref(false);
const verificationCode = ref("");
const cooldown = ref(0);

const props = defineProps({
	userEmail: {
		type: String,
		required: true,
	},
});

// 使用 tempEmail 来避免命名冲突
const tempEmail = ref("");

// 自定义邮箱验证规则
const customEmail = helpers.regex(
	/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
);

// 验证规则
const rules = computed(() => ({
	tempEmail: {
		required: helpers.withMessage("请输入邮箱地址", required),
		validFormat: helpers.withMessage("请输入有效的邮箱地址", customEmail),
		notSameAsOld: helpers.withMessage(
			"新邮箱不能与当前邮箱相同",
			(value) => value !== props.userEmail || !value
		),
	},
	verificationCode: {
		required: helpers.withMessage("请输入验证码", required),
		length: helpers.withMessage(
			"验证码格式不正确",
			(value) => value.length === 6
		),
	},
}));

const v$ = useVuelidate(rules, { tempEmail, verificationCode });

// 发送验证码
const sendVerificationCode = async () => {
	const isValid = await v$.value.tempEmail.$validate();
	if (!isValid) {
		return;
	}

	try {
		await apiClient.post("/users/send-verification-code", {
			email: tempEmail.value,
		});

		// 开始倒计时
		cooldown.value = 60;
		const timer = setInterval(() => {
			cooldown.value--;
			if (cooldown.value <= 0) {
				clearInterval(timer);
			}
		}, 1000);
	} catch (error) {
		showToast({
			type: "error",
			message: error.response?.data?.message || "验证码发送失败",
		});
	}
};

// 验证并保存邮箱
const validateAndSaveEmail = async () => {
	try {
		// 验证表单
		const result = await v$.value.$validate();
		if (!result) {
			return;
		}

		isSubmitting.value = true;

		// 调用 API 更新邮箱
		const res = await apiClient.post("/users/update-email", {
			email: tempEmail.value,
			verificationCode: verificationCode.value,
		});

		if (res.data.code === 200) {
			const data = res.data.data;
			console.log(data);
			if (data.message === "failed") {
				showToast({
					type: "error",
					message: data.data,
				});
			} else {
				showToast({
					message: "邮箱更新成功, 3秒后返回登录页面",
					type: "success",
				});
				setTimeout(() => {
					router.push("/login");
				}, 3000);
			}
		}

		// 触发更新事件
		emit("update:userEmail", tempEmail.value);
	} catch (error) {
		console.log(error);
	} finally {
		isSubmitting.value = false;
	}
};

// 定义更新事件
const emit = defineEmits(["update:userEmail"]);

// 监听 props 变化，更新本地状态
watch(
	() => props.userEmail,
	(newVal) => {
		tempEmail.value = newVal;
	}
);
</script>
