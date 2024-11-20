<template>
	<div class="profile-page relative w-full">
		<div class="relative mt-10" style="padding-bottom: 64px">
			<div class="character-card bg-gray-800">
				<!-- 角色卡片容器 -->
				<div class="card-inner">
					<!-- 标题 -->
					<div class="card-title bg-gray-700">
						<NicknameCard
							v-if="user.nickname"
							:nickname="user.nickname"
							@on-save-nickname="onSaveNickname"
						/>
					</div>

					<!-- 头像区域 -->
					<AvatarUpload
						:user="user"
						@update:avatarUrl="(url) => (user.profilePic = url)"
					/>

					<p class="text-sm mt-1 text-gray-800">
						{{ user.email }}
					</p>
					<div
						class="relative"
						@click="editSignature"
						style="background-color: rgba(0, 0, 0, 0.2)"
					>
						<p class="text-xs border-b mt-2 py-2 text-gray-300 cursor-pointer">
							{{ user.signature }}
						</p>
						<SignatureCard
							ref="signatureRef"
							:signature="user.signature"
							@update-signature="onSaveSignature"
						/>
					</div>

					<!-- <p class="text-sm mt-2 border-b pb-4">Level - 1</p> -->

					<!-- 状态条 -->
					<div class="progress-info mt-4 space-y-4">
						<div class="progress-bar relative">
							<p class="text-xs text-gray-700 mb-1">
								{{ t("profile.story_progress") }}
							</p>
							<div class="barcode-progress bg-primary primary-progress"></div>
							<StoryProgressDetail />
						</div>
						<div class="progress-bar relative">
							<p class="text-xs text-gray-700 mb-1">
								{{ t("profile.word_progress") }}
							</p>
							<div
								class="barcode-progress bg-secondary secondary-progress"
							></div>
							<WordProgressDetail />
						</div>
						<!-- <div class="progress-bar relative">
							<p class="text-xs text-gray-700 mb-1">数据碎片收集进度</p>
							<div class="barcode-progress bg-accent accent-progress"></div>
							<FragmentProgressDetail />
						</div> -->
					</div>
				</div>
			</div>

			<div class="edit-module absolute">
				<div class="arrow-base arrow-2" style="z-index: 999"></div>
				<button
					@click="linkToMembership"
					class="edit-button w-40 h-10 bg-white shadow-lg text-center text-bold"
				>
					{{ t("profile.button_community") }}
				</button>
			</div>

			<div class="account-module absolute">
				<button
					v-if="!isEditingAccount"
					@click="editAccount"
					class="account-button w-40 h-10 bg-white shadow-lg text-center text-bold"
				>
					{{ t("profile.button_account") }}
				</button>
				<!-- 编辑区域卡片 -->
				<div
					v-if="isEditingAccount"
					class="account-edit-card bg-white shadow-lg p-6 pb-3 w-60"
				>
					<!-- 账户信息表单 -->
					<div v-if="!isEditingPassword">
						<div class="mb-4">
							<input
								type="email"
								id="email"
								v-model="user.email"
								class="input input-bordered w-full text-sm input-sm"
								:placeholder="t('profile.account_form.email_input')"
							/>
						</div>

						<!-- 保存和取消按钮 -->
						<div class="flex space-x-2">
							<button
								class="text-sm w-full py-2 bg-primary hover:bg-primary-focus text-white rounded-lg font-semibold"
								@click="saveAccountChanges"
							>
								{{ t("profile.account_form.save_account") }}
							</button>
							<button
								class="text-sm w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold"
								@click="cancelEdit"
							>
								{{ t("profile.account_form.cancel_account") }}
							</button>
						</div>

						<!-- 修改密码链接 -->
						<p
							class="text-xs text-blue-500 text-right mt-2 pr-2 cursor-pointer"
							@click="togglePasswordEdit"
						>
							{{ t("profile.change_password") }}
						</p>
					</div>

					<!-- 修改密码表单 -->
					<div v-else>
						<!-- 当前密码 -->
						<div class="mb-4">
							<input
								type="password"
								id="current-password"
								v-model="passwordForm.currentPassword"
								class="input input-bordered w-full text-sm input-sm"
								:placeholder="t('profile.account_form.password_input')"
							/>
						</div>

						<!-- 新密码 -->
						<div class="mb-4">
							<input
								type="password"
								id="new-password"
								v-model="passwordForm.newPassword"
								class="input input-bordered w-full text-sm input-sm"
								:placeholder="t('profile.account_form.password_new_input')"
							/>
						</div>

						<!-- 确认新密码 -->
						<div class="mb-4">
							<input
								type="password"
								id="confirm-password"
								v-model="passwordForm.confirmPassword"
								class="input input-bordered w-full text-sm input-sm"
								:placeholder="t('profile.account_form.password_confirm_input')"
							/>
						</div>
						<!-- 错误消息显示 -->
						<p v-if="errorMessage" class="text-xs text-red-500 mb-4">
							{{ errorMessage }}
						</p>

						<!-- 保存和取消按钮 -->
						<div class="flex space-x-2">
							<button
								class="w-full py-2 bg-primary hover:bg-primary-focus text-white rounded-lg font-semibold text-sm"
								@click="validateAndSavePassword"
							>
								{{ t("profile.account_form.save_password") }}
							</button>
							<button
								class="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold text-sm"
								@click="cancelPasswordEdit"
							>
								{{ t("profile.account_form.cancel_password") }}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import NicknameCard from "@/components/profile/nickname.vue";
import StoryProgressDetail from "@/components/profile/detail-story.vue";
import WordProgressDetail from "@/components/profile/detail-word.vue";
import FragmentProgressDetail from "@/components/profile/detail-fragment.vue";
import SignatureCard from "@/components/profile/signature.vue";
import { showToast } from "@/components/common/toast.js";
import { useI18n } from "vue-i18n";
import AvatarUpload from "@/components/profile/avatar-upload.vue";
import avatar from "@/assets/avatar.jpg";

const { t, locale } = useI18n();

const router = useRouter();
const isEditingAccount = ref(false); // 控制编辑区域显示状态
const isEditingPassword = ref(false); // 控制密码编辑表单显示状态
const errorMessage = ref("");
const passwordForm = ref({
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
});
const signatureRef = ref(null);
const editAccount = () => {
	isEditingAccount.value = true;
};
const togglePasswordEdit = () => {
	isEditingPassword.value = !isEditingPassword.value;
};

const saveAccountChanges = async () => {
	try {
		console.log("Account changes saved:", user.value);
		isEditingAccount.value = false;
	} catch (error) {
		console.error("Failed to save changes:", error);
	}
};

const isSignatureEdit = ref(false);
const editSignature = () => {
	isSignatureEdit.value = true;
	signatureRef.value.toggleEditing();
};

const cancelEdit = () => {
	isEditingAccount.value = false;
};

const validateAndSavePassword = async () => {
	// 验证新密码和确认密码是否匹配
	if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
		errorMessage.value = "新密码和确认密码不匹配";
		return;
	}

	// 验证新密码长度
	if (passwordForm.value.newPassword.length < 6) {
		errorMessage.value = "新密码至少需要6个字符";
		return;
	}

	try {
		// 调用修改密码接口
		const response = await apiClient.post("/users/update-password", {
			oldPassword: passwordForm.value.currentPassword,
			newPassword: passwordForm.value.newPassword,
		});

		if (response.data.code === 200) {
			errorMessage.value = "密码更新成功, 3秒后返回登录页面";
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} else {
			errorMessage.value = response.data.message || "密码更新失败";
			showToast({ message: "密码更新失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "密码更新失败", type: "error" });
		errorMessage.value = "密码更新失败";
	}
};

const resetPasswordForm = () => {
	passwordForm.value.currentPassword = "";
	passwordForm.value.newPassword = "";
	passwordForm.value.confirmPassword = "";
	errorMessage.value = "";
};

const cancelPasswordEdit = () => {
	isEditingPassword.value = false;
	resetPasswordForm();
};

const user = ref({
	// avatarUrl: avatar,
});

const getUserProfile = async () => {
	try {
		const response = await apiClient.get("/users/me");
		if (response.data.code === 200) {
			user.value = Object.assign(user.value, response.data.data);
		} else {
			showToast({ message: response.data.message, type: "error" });
		}
	} catch (error) {
		showToast({ message: response.data.message, type: "error" });
	}
};

const onSaveNickname = async (inputNickname) => {
	try {
		user.value.nickname = inputNickname; // 保存修改
		const response = await apiClient.post("/users/me/update", {
			nickname: user.value.nickname,
		});
		if (response.data.code === 200) {
		} else {
			showToast({ message: "昵称修改失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "昵称修改失败", type: "error" });
	}
};

const linkToMembership = () => {
	router.push("/membership");
};

// 保存签名
const onSaveSignature = async (newSignature) => {
	user.value.signature = newSignature;
	try {
		const response = await apiClient.post("/users/me/update", {
			signature: user.value.signature,
		});
		if (response.data.code === 200) {
		} else {
			showToast({ message: "签名修改失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "签名修改失败", type: "error" });
	}
};

onMounted(() => {
	getUserProfile();
});
</script>

<style scoped>
.profile-page {
	height: calc(100vh - 128px);
	min-height: 770px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.personal-card {
	width: 18rem;
	z-index: 999;
	border: 3px solid #333;
	box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
	background: repeating-linear-gradient(
			90deg,
			transparent,
			transparent 20px,
			rgba(0, 0, 0, 0.02) 20px,
			rgba(0, 0, 0, 0.02) 40px
		),
		white;
	position: relative;
}

.personal-card img {
	border: 3px solid #333;
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
	transition: transform 0.3s;
}

.personal-card img:hover {
	transform: scale(1.05);
}

.edit-module {
	top: -30px;
	left: -200px;
}
.arrow-2 {
	width: 70px;
	height: 70px;
	background-image: url("@/assets/7.png");
	background-size: 100% 100%;
	transform: scaleX(-1) rotate(-60deg);
	position: absolute;
	top: 35px;
	right: -50px;
}
.edit-button {
	border: none;
	border-radius: 0px;
	font-size: 14px;
	font-weight: 900;
	width: 130px;
	transition: box-shadow 0.3s ease;
	transform: rotate(-10deg);
}

.account-module {
	top: -80px;
	right: -320px;
}
.arrow-6 {
	width: 120px;
	height: 80px;
	background-image: url("@/assets/6.png");
	background-size: 60% 60%;
	background-repeat: no-repeat;
	transform: scaleX(-1) rotate(125deg);
	position: absolute;
	top: -50px;
	right: 0px;
	z-index: 0;
}
.account-button {
	font-size: 14px;
	font-weight: 900;
	width: 130px;
	transition: box-shadow 0.3s ease;
	transform: rotate(10deg);
}

/* 条形码 */
.barcode-progress {
	height: 24px;
	border: 2px solid #333;
	background: rgba(31, 41, 55, 0.5);
	position: relative;
	overflow: hidden;
}

/* 进度条 */
.barcode-progress::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 50%; /* 动态调整宽度表示进度 */
	background-color: rgba(0, 0, 0, 0.1);
}

/* 进度条动画 */
.primary-progress::before {
	background: rgba(var(--primary-color-rgb), 0.8);
}

.secondary-progress::before {
	background: rgba(var(--secondary-color-rgb), 0.8);
}

.accent-progress::before {
	background: repeating-linear-gradient(
		45deg,
		rgba(var(--accent-color-rgb), 0.3),
		rgba(var(--accent-color-rgb), 0.3) 10px,
		rgba(var(--accent-color-rgb), 0.1) 10px,
		rgba(var(--accent-color-rgb), 0.1) 20px
	);
}
.edit-description {
	transform: rotate(-3deg);
	bottom: -20px;
	left: -30px;
}
.profile-page {
	height: calc(100vh - 128px);
	min-height: 770px;
}

.progress-bar {
	height: 24px;
	margin: 1rem 0;
}

.edit-button,
.account-button {
	position: relative;
	border: 4px solid #222;
	color: white;
	font-weight: bold;
	transform-style: preserve-3d;
	transition: transform 0.2s, box-shadow 0.2s;
	background: rgba(55, 65, 81, 0.8);
}

.edit-button:hover,
.account-button:hover {
	transform: translate(2px, 2px);
}

.edit-button:hover::after,
.account-button:hover::after {
	transform: translate(-2px, -2px);
}

.arrow-2,
.arrow-6 {
	filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.2));
}

.account-edit-card {
	position: absolute;
	left: -250px;
	top: -10px;
	transform: rotate(-2deg);
	border: 3px solid #333;
	box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.1);
	background: white;
}

.input {
	border: 2px solid #333;
	background: rgba(255, 255, 255, 0.9);
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.1);
	transition: box-shadow 0.3s;
}

.input:focus {
	outline: none;
	box-shadow: inset 2px 2px 0 rgba(var(--primary-color-rgb), 0.2);
}

.personal-card::after {
	content: "";
	position: absolute;
	bottom: 0;
	right: 0;
	width: 20px;
	height: 20px;
	background: linear-gradient(-135deg, #333 0%, #333 40%, transparent 40%);
	border-top-left-radius: 100%;
}

.border-b {
	border-bottom: 2px dashed #333;
}

.text-red-500 {
	color: #dc2626;
	font-family: "Comic Sans MS", cursive;
	font-size: 0.75rem;
}

/* 按钮动画 */
@keyframes pulse {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
	100% {
		transform: scale(1);
	}
}

.edit-button:active,
.account-button:active {
	transform: translate(4px, 4px);
	box-shadow: none;
}

.character-card {
	width: 300px;
	padding: 8px;
}

.card-inner {
	position: relative;
	padding: 1rem;
	background: linear-gradient(
		180deg,
		rgba(var(--primary-color-rgb), 0.5) 0%,
		rgba(var(--accent-color-rgb), 0.5) 50%,
		rgba(var(--secondary-color-rgb), 0.5)
	);
	border: 4px solid #000;
}

.card-title {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: -1.8rem;
	left: 50%;
	transform: translateX(-50%);
	color: white;
	border: 2px solid #fff;
	padding: 4px 16px;
	font-weight: bold;
	font-size: 1.25rem;

	white-space: nowrap;
}

.status-bars {
	margin-top: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.status-bar {
	height: 24px;
	background: #2d3748;
	border: 2px solid #000;
	position: relative;
	overflow: hidden;
}

.bar-fill {
	height: 100%;
	color: #fff;
	font-size: 0.875rem;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: width 0.3s ease;
}

.health .bar-fill {
	background: var(--milk-color);
}

.energy .bar-fill {
	background: var(--secondary-color);
}

.card-inner::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: repeating-linear-gradient(
		0deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.05) 2px,
		rgba(0, 0, 0, 0.05) 4px
	);
	pointer-events: none;
}
</style>
