<template>
	<div class="profile-page relative w-full">
		<div
			class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/3 z-10"
			style="top: 353px; padding-bottom: 64px"
		>
			<div
				class="personal-card bg-white shadow-lg rounded-lg p-6 text-center w-72 h-auto"
			>
				<img
					class="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-neutral"
					:src="user.avatarUrl"
					alt="Profile Avatar"
				/>

				<NicknameCard
					v-if="user.nickname"
					:nickname="user.nickname"
					@on-save-nickname="onSaveNickname"
				/>
				<p class="text-sm mt-1">{{ user.email }}</p>
				<p class="text-sm mt-2 border-b pb-4">Level - 1</p>

				<div class="progress-info mt-4 space-y-4">
					<!-- 剧集进度 -->
					<div class="progress-bar relative">
						<p class="text-xs text-gray-700 mb-1">剧集进度</p>
						<div class="barcode-progress bg-primary primary-progress"></div>
						<StoryProgressDetail />
					</div>

					<!-- 单词收集进度 -->
					<div class="progress-bar relative">
						<p class="text-xs text-gray-700 mb-1">单词进度</p>
						<div class="barcode-progress bg-secondary secondary-progress"></div>
						<WordProgressDetail />
					</div>

					<!-- 数据碎片收集进度 -->
					<div class="progress-bar relative">
						<p class="text-xs text-gray-700 mb-1">数据碎片收集进度</p>
						<div class="barcode-progress bg-accent accent-progress"></div>
						<FragmentProgressDetail />
					</div>
				</div>
			</div>

			<div class="edit-module absolute">
				<div class="arrow-base arrow-2"></div>
				<button
					@click="linkToMembership"
					class="edit-button w-40 h-10 bg-white pl-2 shadow-lg text-center text-bold"
				>
					加入社区！
				</button>
			</div>

			<div class="account-module absolute">
				<div class="arrow-base arrow-6"></div>
				<button
					v-if="!isEditingAccount"
					@click="editAccount"
					class="account-button w-40 h-10 bg-white pl-2 shadow-lg text-center text-bold"
				>
					账户设置
				</button>
				<!-- 编辑区域卡片 -->
				<div
					v-if="isEditingAccount"
					class="account-edit-card bg-white shadow-lg rounded-lg p-6 pb-3 w-60"
				>
					<!-- 账户信息表单 -->
					<div v-if="!isEditingPassword">
						<div class="mb-4">
							<input
								type="email"
								id="email"
								v-model="user.email"
								class="input input-bordered w-full text-sm input-sm"
								placeholder="输入新的邮箱地址"
							/>
						</div>

						<!-- 保存和取消按钮 -->
						<div class="flex space-x-2">
							<button
								class="text-sm w-full py-2 bg-primary hover:bg-primary-focus text-white rounded-lg font-semibold"
								@click="saveAccountChanges"
							>
								保存更改
							</button>
							<button
								class="text-sm w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold"
								@click="cancelEdit"
							>
								取消
							</button>
						</div>

						<!-- 修改密码链接 -->
						<p
							class="text-xs text-blue-500 text-right mt-2 pr-2 cursor-pointer"
							@click="togglePasswordEdit"
						>
							修改密码
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
								placeholder="输入当前密码"
							/>
						</div>

						<!-- 新密码 -->
						<div class="mb-4">
							<input
								type="password"
								id="new-password"
								v-model="passwordForm.newPassword"
								class="input input-bordered w-full text-sm input-sm"
								placeholder="输入新密码"
							/>
						</div>

						<!-- 确认新密码 -->
						<div class="mb-4">
							<input
								type="password"
								id="confirm-password"
								v-model="passwordForm.confirmPassword"
								class="input input-bordered w-full text-sm input-sm"
								placeholder="确认新密码"
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
								保存密码
							</button>
							<button
								class="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold text-sm"
								@click="cancelPasswordEdit"
							>
								取消
							</button>
						</div>
					</div>
				</div>
			</div>

			<SignatureCard
				:signature="user.signature"
				@update-signature="onSaveSignature"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api";
import avatar from "@/assets/avatar.jpg";
import NicknameCard from "@/components/profile/nickname.vue";
import StoryProgressDetail from "@/components/profile/detail-story.vue";
import WordProgressDetail from "@/components/profile/detail-word.vue";
import FragmentProgressDetail from "@/components/profile/detail-fragment.vue";
import SignatureCard from "@/components/profile/signature.vue";

const router = useRouter();
const isEditingAccount = ref(false); // 控制编辑区域显示状态
const isEditingPassword = ref(false); // 控制密码编辑表单显示状态
const errorMessage = ref("");
const passwordForm = ref({
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
});
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

		if (response.status === 201) {
			errorMessage.value = "密码更新成功, 3秒后返回登录页面";
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} else {
			errorMessage.value = response.data.message || "密码更新失败";
		}
	} catch (error) {
		errorMessage.value = error.response?.data?.message || "密码更新失败";
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
	avatarUrl: avatar,
});

const getUserProfile = async () => {
	try {
		const response = await apiClient.get("/users/me");
		user.value = Object.assign(user.value, response.data);
	} catch (error) {
		console.log(error);
	}
};

const onSaveNickname = async (inputNickname) => {
	try {
		user.value.nickname = inputNickname; // 保存修改
		await apiClient.post("/users/me/update", {
			nickname: user.value.nickname,
		});
	} catch (error) {
		throw error;
	}
};

const linkToMembership = () => {
	router.push("/membership");
};

// 保存签名
const onSaveSignature = async (newSignature) => {
	user.value.signature = newSignature;
	try {
		// 这里处理保存逻辑
		await apiClient.post("/users/me/update", {
			signature: user.value.signature,
		});
	} catch (error) {
		console.error(error);
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
}
/* 个人信息卡片样式保持不变 */
.personal-card {
	width: 18rem;
	z-index: 999;
}

.edit-module {
	top: -30px;
	left: -200px;
}
.arrow-2 {
	width: 120px;
	height: 80px;
	background-image: url("@/assets/7.png");
	background-size: 100% 100%;
	transform: scaleX(-1) rotate(-40deg);
	position: absolute;
	top: 25px;
	right: -125px;
}
.edit-button {
	box-shadow: 0 4px 12px rgba(0, 0, 255, 0.2); /* 蓝色阴影 */
	border: none; /* 无边框 */
	border-radius: 0px; /* 圆角 */
	font-size: 14px;
	font-weight: 900;
	width: 130px;
	transition: box-shadow 0.3s ease;
	transform: rotate(-10deg);
}
.edit-button:hover {
	box-shadow: 0 6px 16px rgba(0, 0, 255, 0.3); /* 更深的蓝色阴影 */
}

.account-module {
	top: -150px;
	right: -420px;
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
	box-shadow: 0 4px 12px rgba(0, 0, 255, 0.2); /* 蓝色阴影 */
	border: none; /* 无边框 */
	border-radius: 0px; /* 圆角 */
	font-size: 14px;
	font-weight: 900;
	width: 130px;
	transition: box-shadow 0.3s ease;
	transform: rotate(10deg);
}
.account-button:hover {
	box-shadow: 0 6px 16px rgba(0, 0, 255, 0.3); /* 更深的蓝色阴影 */
}

/* 条形码样式 */
.barcode-progress {
	width: 100%;
	height: 12px;
	background: repeating-linear-gradient(
		to right,
		transparent 0px,
		transparent 2px,
		rgba(0, 0, 0, 0.2) 2px,
		rgba(0, 0, 0, 0.2) 4px
	);
	position: relative;
	overflow: hidden;
}

/* 动态进度条 */
.barcode-progress::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 50%; /* 动态调整宽度表示进度 */
	background-color: rgba(0, 0, 0, 0.1);
}

.primary-progress::before {
	background-color: rgba(0, 0, 255, 0.2);
}

.secondary-progress::before {
	background-color: rgba(255, 0, 211, 0.2);
}

.accent-progress::before {
	background-color: rgba(0, 215, 192, 0.2);
}

.sign-container {
	width: 150%;
	font-size: 0.875rem;
	position: absolute;
	left: 50%;
	top: -120px;
	border-width: 2px;
	padding: 0.5rem;
	border-color: #000;
	transform: translate(-50%, -33%);
	z-index: 10;
	display: flex;
	align-items: center;
	justify-content: center;
	height: auto;
}
.edit-description {
	transform: rotate(-3deg);
	bottom: -20px;
	left: -30px;
}

.account-edit-card {
	position: absolute;
	left: -250px;
	top: -10px;
	transform: rotate(-2deg);
	box-shadow: 0 4px 12px rgba(0, 0, 255, 0.2); /* 蓝色阴影 */
}
</style>
