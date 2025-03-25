<template>
	<div class="profile-page mt-20 px-10 relative w-full">
		<div class="profile-container">
			<!-- 左侧按钮组 -->
			<div class="action-buttons left-buttons relative right-[-10px]">
				<button
					class="action-btn update-password rotate-6 hover:-rotate-2"
					:class="{ 'btn-hide': isUpdatingPassword || isUpdatingEmail }"
					@click="togglePasswordUpdate"
				>
					<i class="bi bi-key-fill mr-1"></i>
					更新密码
				</button>

				<!-- 密码更新气泡 -->
				<div class="password-bubble" :class="{ show: isUpdatingPassword }">
					<div class="bubble-content">
						<div class="bubble-header">
							<h3 class="text-lg font-bold">更新密码</h3>
							<button class="close-btn" @click="togglePasswordUpdate">
								<i class="bi bi-x-lg"></i>
							</button>
						</div>
						<PasswordEdit />
					</div>
				</div>
				<button
					class="action-btn update-email -rotate-3 hover:rotate-1"
					:class="{ 'btn-hide': isUpdatingPassword || isUpdatingEmail }"
					@click="toggleEmailUpdate"
				>
					<i class="bi bi-envelope-fill mr-1"></i>
					更新邮箱
				</button>

				<!-- 邮箱更新气泡 -->
				<div class="email-bubble" :class="{ show: isUpdatingEmail }">
					<div class="bubble-content">
						<div class="bubble-header">
							<h3 class="text-lg font-bold">更新邮箱</h3>
							<button class="close-btn" @click="toggleEmailUpdate">
								<i class="bi bi-x-lg"></i>
							</button>
						</div>
						<EmailEdit
							:userEmail="user.email"
							@update:userEmail="(newEmail) => (user.email = newEmail)"
						/>
					</div>
				</div>
			</div>

			<!-- 个人资料卡片 -->
			<div
				class="personal-card"
				:class="{
					'slide-left': isEditing,
					'slide-right': isUpdatingPassword || isUpdatingEmail,
				}"
			>
				<CharacterCard
					:user="user"
					:checkInStatus="checkInStatus"
					@update:profilePic="(url) => (user.profilePic = url)"
					@check-in-start="checkInStatus.loading = true"
					@check-in-success="onCheckInSuccess"
					@check-in-end="checkInStatus.loading = false"
				>
					<template #footer>
						<Footer />
					</template>
				</CharacterCard>
			</div>

			<!-- 右侧按钮 -->
			<div class="action-buttons right-buttons">
				<button
					class="action-btn edit-profile rotate-6 hover:-rotate-1"
					:class="{ 'btn-hide': isEditing }"
					@click="toggleEdit"
				>
					<i class="bi bi-pencil-fill mr-1"></i>
					修改资料
				</button>

				<div class="edit-bubble" :class="{ show: isEditing }">
					<div class="bubble-content">
						<div class="bubble-header">
							<h3 class="text-lg font-bold">修改个人资料</h3>
							<button class="close-btn" @click="toggleEdit">
								<i class="bi bi-x-lg"></i>
							</button>
						</div>
						<!-- 编辑表单 -->
						<div class="space-y-4">
							<!-- 昵称部分 -->
							<div>
								<input
									type="text"
									v-model="tempNickname"
									class="input input-bordered w-full text-sm"
									:class="{ 'input-error': v$.tempNickname.$error }"
									placeholder="输入你的昵称"
								/>
								<div
									class="text-red-500 text-xs mt-1"
									v-if="v$.tempNickname.$error"
								>
									{{ v$.tempNickname.$errors[0].$message }}
								</div>
							</div>

							<!-- 签名部分 -->
							<div>
								<textarea
									v-model="tempSignature"
									class="input input-bordered w-full text-sm height form-textarea"
									:class="{ 'input-error': v$.tempSignature.$error }"
									placeholder="写下你的个性签名"
								></textarea>
								<div
									class="text-red-500 text-xs mt-1"
									v-if="v$.tempSignature.$error"
								>
									{{ v$.tempSignature.$errors[0].$message }}
								</div>
							</div>

							<!-- 保存按钮 -->
							<div class="mt-6">
								<button
									class="w-full py-3 bg-secondary hover:bg-secondary-focus text-white rounded-lg font-semibold text-sm transition-colors"
									@click="saveProfileChanges"
								>
									保存更改
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

import CharacterCard from "@/components/profile/character.vue";
import ProfileEditor from "@/components/profile/editor.vue";
import Footer from "../layout/footer.vue";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength, helpers } from "@vuelidate/validators";
import EmailEdit from "@/components/profile/email-edit.vue";
import PasswordEdit from "../components/profile/password-edit.vue";

const user = ref({});
const isEditing = ref(false);
const statistics = ref({});

// 签到状态变量
const checkInStatus = ref({
	hasChecked: false,
	loading: false,
});

const tempNickname = ref("");
const tempSignature = ref("");

// 验证规则
const rules = computed(() => ({
	tempNickname: {
		required: helpers.withMessage("请输入昵称", required),
		maxLength: helpers.withMessage("昵称不能超过20个字符", maxLength(20)),
	},
	tempSignature: {
		required: helpers.withMessage("请输入个性签名", required),
		maxLength: helpers.withMessage("个性签名不能超过140个字符", maxLength(140)),
	},
}));

const v$ = useVuelidate(rules, {
	tempNickname,
	tempSignature,
});

const isUpdatingPassword = ref(false);

const togglePasswordUpdate = () => {
	isUpdatingPassword.value = !isUpdatingPassword.value;
};

const isUpdatingEmail = ref(false);

const toggleEmailUpdate = () => {
	isUpdatingEmail.value = !isUpdatingEmail.value;
};

// 更新用户信息
const updateUserInfo = (updatedUser) => {
	user.value = updatedUser;
};

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

const getUserLearnInfo = async () => {
	try {
		const res = await apiClient.get("/users/statistics");
		if (res.data.code === 200) {
			statistics.value = res.data.data;
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} catch (error) {
		showToast({ message: res.data.message, type: "error" });
	}
};

// 保存个人资料
const saveProfileChanges = async () => {
	const isFormCorrect = await v$.value.$validate();
	if (!isFormCorrect) return;

	try {
		const response = await apiClient.post("/users/me/update", {
			nickname: tempNickname.value,
			signature: tempSignature.value,
		});

		if (response.data.code === 200) {
			user.value = {
				...user.value,
				nickname: response.data.data.nickname,
				signature: response.data.data.signature,
			};
			showToast({ message: "个人信息已更新", type: "success" });
			toggleEdit(); // 关闭编辑气泡
		} else {
			showToast({ message: response.data.message, type: "error" });
		}
	} catch (error) {
		showToast({ message: "个人信息修改失败", type: "error" });
	}
};

// 获取签到状态
const getCheckInStatus = async () => {
	try {
		const response = await apiClient.get("/points/check-in/status");
		if (response.data.code === 200) {
			checkInStatus.value.hasChecked = response.data.data.hasChecked;
		}
	} catch (error) {
		console.error("获取签到状态失败", error);
	}
};

// 签到成功的回调函数
const onCheckInSuccess = () => {
	// 更新用户积分
	user.value.points = (user.value.points || 0) + 20;
	checkInStatus.value.hasChecked = true;
};

// 将编辑按钮点击事件与 toggleEdit 关联
const editProfile = () => {
	// 确保用户数据已加载
	if (Object.keys(user.value).length > 0) {
		console.log("编辑时的用户数据:", user.value);
		toggleEdit();
	} else {
		showToast({ message: "用户数据加载中，请稍后再试", type: "warning" });
	}
};

const toggleEdit = () => {
	if (!isEditing.value) {
		// 打开编辑时，初始化表单数据
		tempNickname.value = user.value.nickname || "";
		tempSignature.value = user.value.signature || "";
	}
	isEditing.value = !isEditing.value;
};

onMounted(async () => {
	await getUserProfile();
	await getUserLearnInfo();
	await getCheckInStatus();
});
</script>

<style scoped>
.profile-container {
	display: flex;
	width: 100%;
	justify-content: center;
}

.personal-card {
	width: 18rem;
	flex-shrink: 0;
	position: relative;
	z-index: 10;
	transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.personal-card.slide-left {
	transform: translateX(-70px);
}

.personal-card.slide-right {
	transform: translateX(70px);
}

.log-card {
	flex: 1; /* Take up remaining space */
	min-width: 0; /* Prevent overflow issues */
	overflow: hidden;
	border-radius: 0;
}

.scene {
	position: relative;
	min-height: 533px;
	overflow: hidden;
}

/* 编辑个人资料按钮样式 */
.edit-profile-button {
	position: relative;
	border-radius: 4px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
	transition: all 0.2s ease;
}

.edit-profile-button:hover {
	transform: rotate(0deg) translateY(-2px);
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.3);
}

.edit-profile-button:active {
	transform: translateY(1px);
	box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.3);
}

.password-bubble {
	position: absolute;
	right: calc(100% - 130px); /* 调整位置，让气泡更靠近按钮 */
	top: -10px; /* 略微向上调整，与按钮对齐 */
	width: 320px;
	background: white;
	border: 3px solid black;
	border-radius: 12px;
	padding: 1.5rem;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
	opacity: 0;
	transform: scale(0.8);
	pointer-events: none;
	transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	transform-origin: right center;
	z-index: 20; /* 确保气泡显示在最上层 */
}

.password-bubble.show {
	opacity: 1;
	transform: scale(1);
	pointer-events: auto;
}

.password-bubble::before {
	content: "";
	position: absolute;
	right: -12px;
	top: 30px; /* 调整小三角的位置 */
	width: 20px;
	height: 20px;
	background: white;
	border-right: 3px solid black;
	border-top: 3px solid black;
	transform: rotate(45deg);
}

.email-bubble {
	position: absolute;
	right: calc(100% - 130px);
	top: 60px;
	width: 320px;
	background: white;
	border: 3px solid black;
	border-radius: 12px;
	padding: 1.5rem;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
	opacity: 0;
	transform: scale(0.8);
	pointer-events: none;
	transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	transform-origin: right center;
	z-index: 20;
}

.email-bubble.show {
	opacity: 1;
	transform: scale(1);
	pointer-events: auto;
}

.email-bubble::before {
	content: "";
	position: absolute;
	right: -12px;
	top: 30px;
	width: 20px;
	height: 20px;
	background: white;
	border-right: 3px solid black;
	border-top: 3px solid black;
	transform: rotate(45deg);
}

.personal-card {
	width: 18rem;
	flex-shrink: 0;
	position: relative;
	z-index: 10;
}

.action-buttons {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	padding-top: 4rem;
}

.action-btn {
	background-color: white;
	border: 2px solid black;
	padding: 0.75rem 1.5rem;
	border-radius: 8px;
	font-weight: 500;
	font-size: 0.875rem;
	transition: all 0.3s ease;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
	position: relative;
	white-space: nowrap;
}

.action-btn::before {
	content: "";
	position: absolute;
	top: -2px;
	left: -2px;
	right: -2px;
	bottom: -2px;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.05) 2px,
		rgba(0, 0, 0, 0.05) 4px
	);
	border-radius: 8px;
	z-index: -1;
}

.action-btn:hover {
	transform: translateY(-2px);
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
}

.action-btn:active {
	transform: translateY(1px);
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
}

/* 左侧按钮特殊样式 */
.left-buttons .action-btn {
	background-color: rgba(var(--primary-color-rgb), 0.1);
	border-color: var(--primary-color);
	color: var(--primary-color);
}

/* 右侧按钮特殊样式 */
.right-buttons .action-btn {
	background-color: rgba(var(--secondary-color-rgb), 0.1);
	border-color: var(--secondary-color);
	color: var(--secondary-color);
}

.right-buttons {
	position: relative;
	top: 3rem;
}

.btn-hide {
	opacity: 0;
	visibility: hidden;
	pointer-events: none;
}

.edit-bubble {
	position: absolute;
	left: 0;
	top: 0;
	width: 320px;
	background: white;
	border: 3px solid black;
	border-radius: 12px;
	padding: 1.5rem;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
	opacity: 0;
	transform: scale(0.8);
	pointer-events: none;
	transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	transform-origin: left center;
}

.edit-bubble.show {
	opacity: 1;
	transform: scale(1);
	pointer-events: auto;
}

.edit-bubble::before {
	content: "";
	position: absolute;
	left: -12px;
	top: 20px;
	width: 20px;
	height: 20px;
	background: white;
	border-left: 3px solid black;
	border-bottom: 3px solid black;
	transform: rotate(45deg);
}

.bubble-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1.5rem;
}

.close-btn {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: white;
	transition: all 0.2s ease;
}

.close-btn:hover {
	transform: rotate(90deg);
}

@media (max-width: 768px) {
	.profile-container {
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 0;
	}

	.action-buttons {
		flex-direction: row;
		padding-top: 0;
	}

	.action-btn {
		transform: rotate(0deg) !important;
	}
}

.form-label {
	display: block;
	font-size: 0.875rem;
	color: #666;
	margin-bottom: 0.5rem;
}
.form-textarea {
	width: 100%;
	padding: 1rem 1rem;
	min-height: 100px;
	resize: vertical;
}

.error-msg {
	color: #dc2626;
	font-size: 0.75rem;
	margin-top: 0.25rem;
}
</style>
