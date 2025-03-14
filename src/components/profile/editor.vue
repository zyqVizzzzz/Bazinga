<template>
	<div class="edit-area">
		<div class="edit-container">
			<!-- 标题 -->
			<div class="edit-header mb-4">
				<div class="text-sm text-gray-600 flex justify-between items-center">
					<div>
						<span
							class="cursor-pointer px-3 py-1 rounded-full text-xs mr-2"
							:class="
								activeTab === 'profile'
									? 'bg-primary text-white'
									: 'bg-gray-100 hover:bg-gray-200'
							"
							@click="activeTab = 'profile'"
						>
							个人信息
						</span>
						<span
							class="cursor-pointer px-3 py-1 rounded-full text-xs"
							:class="
								activeTab === 'account'
									? 'bg-primary text-white'
									: 'bg-gray-100 hover:bg-gray-200'
							"
							@click="activeTab = 'account'"
						>
							账户信息
						</span>
					</div>
					<div>
						<button
							class="px-4 py-2 bg-white border-2 border-black text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
							@click="$emit('close')"
							style="
								position: relative;
								border-radius: 4px;
								box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
								transition: all 0.2s ease;
							"
							onmouseover="this.style.transform='rotate(0deg) translateY(-2px)'; this.style.boxShadow='3px 3px 0 rgba(0, 0, 0, 0.3)';"
							onmouseout="this.style.transform=''; this.style.boxShadow='2px 2px 0 rgba(0, 0, 0, 0.2)';"
							onmousedown="this.style.transform='translateY(1px)'; this.style.boxShadow='1px 1px 0 rgba(0, 0, 0, 0.3)';"
							onmouseup="this.style.transform=''; this.style.boxShadow='2px 2px 0 rgba(0, 0, 0, 0.2)';"
						>
							<i class="bi bi-arrow-left"></i>
							返回
						</button>
					</div>
				</div>
			</div>

			<!-- 编辑表单区域 - 使用 flex 布局 -->
			<div v-if="activeTab === 'account'" class="form-sections flex gap-8">
				<!-- 左侧：邮箱部分 -->
				<EmailEdit :userEmail="user.email" />

				<!-- 右侧：密码部分 -->
				<PasswordEdit />
			</div>

			<div v-if="activeTab === 'profile'" class="form-sections">
				<div
					class="profile-form bg-white p-6 rounded-xl border-2 border-gray-100"
				>
					<!-- 昵称部分 -->
					<div class="mb-6">
						<div class="space-y-2">
							<label class="text-sm text-gray-600 mb-2 block"
								>昵称<span
									class="text-red-500 text-xs ml-2"
									v-if="v$.tempNickname.$error"
								>
									- {{ v$.tempNickname.$errors[0].$message }}
								</span></label
							>
							<input
								type="text"
								v-model="tempNickname"
								class="input input-bordered w-full text-sm"
								placeholder="输入你的昵称"
							/>
						</div>
					</div>

					<!-- 签名部分 -->
					<div class="mb-6">
						<div class="space-y-2">
							<label class="text-sm text-gray-600 mb-2 block">个性签名</label>
							<textarea
								v-model="tempSignature"
								class="textarea textarea-bordered w-full text-sm min-h-[100px]"
								placeholder="写下你的个性签名"
							></textarea>
							<div class="text-red-500 text-xs" v-if="v$.tempSignature.$error">
								{{ v$.tempSignature.$errors[0].$message }}
							</div>
						</div>
					</div>

					<!-- 保存按钮 -->
					<div class="mt-8">
						<button
							class="w-full py-3 bg-primary hover:bg-primary-focus text-white rounded-lg font-semibold text-sm transition-colors"
							@click="saveProfileChanges"
						>
							保存更改
						</button>
					</div>
				</div>
			</div>

			<!-- 错误消息 -->
			<p v-if="errorMessage" class="text-sm text-red-500 mt-4">
				{{ errorMessage }}
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength, helpers } from "@vuelidate/validators";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import EmailEdit from "./email-edit.vue";
import PasswordEdit from "./password-edit.vue";

const props = defineProps({
	user: {
		type: Object,
		required: true,
	},
});

const emit = defineEmits(["close", "update:user"]);

const activeTab = ref("profile"); // 默认显示个人信息设置
const errorMessage = ref("");
const tempNickname = ref(props.user.nickname || "");
const tempSignature = ref(props.user.signature || "");

onMounted(() => {
	console.log(props.user.nickname);
});

// 基本验证规则
const nicknameRule = {
	required: helpers.withMessage("请输入昵称", required),
	maxLength: helpers.withMessage("昵称不能超过20个字符", maxLength(20)),
};

const signatureRule = {
	maxLength: helpers.withMessage("个性签名不能超过140个字符", maxLength(140)),
};

const rules = computed(() => ({
	tempNickname: nicknameRule,
	tempSignature: signatureRule,
}));

const v$ = useVuelidate(rules, {
	tempNickname,
	tempSignature,
});

// 保存个人资料
const saveProfileChanges = async () => {
	const isFormCorrect = await v$.value.$validate();
	if (!isFormCorrect) {
		return;
	}
	try {
		const response = await apiClient.post("/users/me/update", {
			nickname: tempNickname.value,
			signature: tempSignature.value,
		});
		if (response.data.code === 200) {
			// 更新父组件中的用户信息
			emit("update:user", {
				...props.user,
				nickname: response.data.data.nickname,
				signature: response.data.data.signature,
			});
			showToast({ message: "个人信息已更新", type: "success" });
		} else {
			showToast({ message: "个人信息修改失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "个人信息修改失败", type: "error" });
	}
};

watch(
	() => props.user,
	(newUser) => {
		if (newUser && Object.keys(newUser).length > 0) {
			tempNickname.value = newUser.nickname || "";
			tempSignature.value = newUser.signature || "";
		}
	},
	{ immediate: true, deep: true }
);
</script>

<style scoped>
/* 编辑区域样式 - 蒙德里安风格 */
.edit-area {
	width: 100%;
	height: 100%;
	padding: 1.5rem;
	background: white;
	position: relative;
	box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.1);
}

.edit-container {
	position: relative;
	z-index: 1;
}

.edit-area::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		0deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.02) 2px,
		rgba(0, 0, 0, 0.02) 4px
	);
	pointer-events: none;
}

.edit-header {
	position: relative;
	border-bottom: 3px solid black;
	padding-bottom: 1rem;
	margin-bottom: 1.5rem;
}

.edit-header::after {
	content: "";
	position: absolute;
	bottom: -3px;
	left: 30%;
	width: 20%;
	height: 3px;
	background: var(--secondary-color);
}

.edit-header span {
	transition: all 0.3s ease;
	border: 2px solid #000;
	font-weight: bold;
}

.edit-header span:hover {
	transform: translateY(-1px);
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.edit-header button {
	border: 2px solid #000;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
	font-weight: bold;
	transition: all 0.2s;
}

.edit-header button:hover {
	transform: translateY(-2px);
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.3);
}

.edit-header button:active {
	transform: translateY(0);
	box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
}

/* 表单样式 */
.profile-form {
	border: 3px solid black !important;
	border-radius: 0 !important;
	position: relative;
	background: white;
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
}

.profile-form::before {
	content: "";
	position: absolute;
	top: 0;
	left: 20px;
	width: 30px;
	height: 6px;
	background: var(--accent-color);
	border-bottom: 2px solid black;
	border-left: 2px solid black;
	border-right: 2px solid black;
}

.input {
	border: 2px solid #333;
	border-radius: 0;
	background: rgba(255, 255, 255, 0.9);
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.1);
	transition: all 0.3s;
}

.input:focus {
	outline: none;
	box-shadow: inset 3px 3px 0 rgba(var(--primary-color-rgb), 0.2);
	border-color: var(--primary-color);
}

.textarea-bordered {
	border: 2px solid #333;
	border-radius: 0;
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.1);
	transition: all 0.3s;
}

.textarea-bordered:focus {
	outline: none;
	box-shadow: inset 3px 3px 0 rgba(var(--primary-color-rgb), 0.2);
	border-color: var(--primary-color);
}

/* 表单切换动画 */
.form-sections {
	animation: fadeIn 0.3s ease;
	position: relative;
}

.form-sections::after {
	content: "";
	position: absolute;
	bottom: 10px;
	left: 10px;
	width: 20px;
	height: 20px;
	background: var(--secondary-color);
	border: 2px solid black;
	z-index: 0;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 按钮样式 */
button {
	transition: all 0.2s;
}

.profile-form button {
	background: var(--primary-color);
	border: 3px solid black;
	border-radius: 0;
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
	transform: rotate(-1deg);
	font-weight: bold;
	letter-spacing: 1px;
}

.profile-form button:hover {
	transform: rotate(0) translateY(-2px);
	box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.4);
}

.profile-form button:active {
	transform: translateY(2px);
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
}

.text-red-500 {
	color: #dc2626;
	font-weight: bold;
	font-size: 0.75rem;
}

/* 账户信息部分的样式 */
.form-sections.flex > div {
	border: 3px solid black;
	padding: 1.5rem;
	position: relative;
	background: white;
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
}

.form-sections.flex > div:first-child::before {
	content: "";
	position: absolute;
	top: 15px;
	right: -10px;
	width: 20px;
	height: 20px;
	background: var(--accent-color);
	border: 2px solid black;
	z-index: 2;
}

.form-sections.flex > div:last-child::after {
	content: "";
	position: absolute;
	bottom: 15px;
	left: -10px;
	width: 20px;
	height: 20px;
	background: var(--primary-color);
	border: 2px solid black;
	z-index: 2;
}
</style>
