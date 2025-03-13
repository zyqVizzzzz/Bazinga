<template>
	<div class="profile-page mt-20 px-10 relative w-full">
		<div class="profile-container flex gap-10">
			<div class="personal-card">
				<div class="character-card bg-gray-300">
					<!-- 角色卡片容器 -->
					<div class="card-inner">
						<!-- 标题 -->
						<div class="card-title bg-gray-800">
							<h1
								class="nickname-text text-xl font-bold text-gray-200 relative w-full"
							>
								{{ user.nickname }}
							</h1>
						</div>

						<!-- 头像 -->
						<AvatarUpload
							:user="user"
							@update:avatarUrl="(url) => (user.profilePic = url)"
						/>

						<!-- 邮箱 -->
						<p class="text-sm mt-1 text-gray-800">
							{{ user.email }}
						</p>

						<!-- 签名 -->
						<div class="relative" style="background-color: rgba(0, 0, 0, 0.2)">
							<p
								class="text-xs border-b mt-2 py-2 text-gray-300 cursor-pointer"
							>
								{{ user.signature }}
							</p>
						</div>

						<!-- 签到按钮 -->
						<div class="check-in-container mt-4 relative">
							<button
								@click="handleCheckIn"
								:disabled="checkInStatus.hasChecked"
								class="check-in-button"
								:class="{ checked: checkInStatus.hasChecked }"
							>
								<div class="button-content">
									<div class="check-in-icon">
										<i
											class="bi"
											:class="
												checkInStatus.hasChecked
													? 'bi-check-circle-fill'
													: 'bi-gift-fill'
											"
										></i>
									</div>
									<div class="check-in-text">
										{{
											checkInStatus.hasChecked ? "今日已签到" : "每日签到 +20"
										}}
									</div>
								</div>
								<div class="glitch-effect"></div>
							</button>
							<div class="points-display" v-if="user.points !== undefined">
								<span class="points-value">当前积分：{{ user.points }}</span>
								<!-- <span class="points-label">积分</span> -->
							</div>
						</div>

						<!-- 状态条 -->
						<div class="progress-info mt-4 space-y-4">
							<!-- <div class="progress-bar relative">
								<p class="text-xs text-gray-700 mb-1">
									{{ t("profile.story_progress") }}
								</p>
								<div class="barcode-progress bg-primary primary-progress"></div>
							</div>
							<div class="progress-bar relative">
								<p class="text-xs text-gray-700 mb-1">
									{{ t("profile.word_progress") }}
								</p>
								<div
									class="barcode-progress bg-secondary secondary-progress"
								></div>
							</div> -->
						</div>
					</div>
					<div
						class="dev-call absolute"
						style="
							bottom: -30px;
							left: 50%;
							transform: translateX(-50%);
							width: 100%;
						"
					>
						<Footer />
					</div>
				</div>
			</div>
			<div
				class="log-card text-left card bg-base-100 border-4 border-black manga-card"
			>
				<div class="scene">
					<div class="flip-card" :class="{ active: isEditing }">
						<!-- 正面：学习报告 -->
						<div class="front">
							<div class="log-card-inner">
								<!-- 标题区域 -->
								<div class="notebook-title">
									<h2 class="sketch-title">Bazinga_Log</h2>
									<div class="date-stamp">{{ getCurrentDate() }}</div>
								</div>

								<!-- 学习数据卡片 -->
								<div class="study-note collection-note">
									<div class="paper-clip"></div>
									<h3>已创建合集</h3>
									<p class="stat-number">
										{{ statistics.catalogsCount }}<span class="unit">个</span>
									</p>
									<div class="mini-graph"></div>
								</div>

								<div class="study-note word-note">
									<div class="tape-section"></div>
									<h3>单词收藏</h3>
									<p class="stat-number">
										{{ statistics.wordsCount }}<span class="unit">词</span>
									</p>
									<div class="progress-indicator">
										<span class="completed"
											>重点单词: {{ statistics.importantWordsCount }}</span
										>
									</div>
								</div>

								<!-- 最近学习进度 -->
								<div class="study-note recent-progress">
									<div class="push-pin"></div>
									<h3 class="mb-2">学习进度</h3>
									<div v-if="statistics.learningProgress?.length > 0">
										<p class="manga-title">
											《{{
												statistics.learningProgress[currentIndex].courseName
											}}》
										</p>
										<p class="chapter">
											{{ statistics.learningProgress[currentIndex].season }}E{{
												formatEpisode(
													statistics.learningProgress[currentIndex].episode
												)
											}}
										</p>
										<div class="progress-nav">
											<button
												class="nav-btn prev"
												@click="prevProgress"
												:disabled="currentIndex === 0"
											>
												<i class="bi bi-chevron-left"></i>
											</button>
											<span class="progress-indicator" style="margin-top: 0"
												>{{ currentIndex + 1 }}/{{
													statistics.learningProgress.length
												}}</span
											>
											<button
												class="nav-btn next"
												@click="nextProgress"
												:disabled="
													currentIndex >= statistics.learningProgress.length - 1
												"
											>
												<i class="bi bi-chevron-right"></i>
											</button>
										</div>
									</div>
								</div>

								<!-- 随机装饰元素 -->
								<div class="doodle star-1"></div>
								<div class="doodle circle-1"></div>
								<div class="doodle arrow-1"></div>

								<div class="edit-profile-link" @click="editProfile">
									<i class="bi bi-pencil"></i>
									编辑个人资料
								</div>
							</div>
						</div>
						<!-- 背面：编辑区域 -->
						<div class="back">
							<div class="edit-area">
								<div class="edit-container">
									<!-- 标题 -->
									<div class="edit-header mb-4">
										<div
											class="text-sm text-gray-600 flex justify-between items-center"
										>
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
													class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
													@click="editProfile"
												>
													返回
												</button>
											</div>
										</div>
									</div>

									<!-- 编辑表单区域 - 使用 flex 布局 -->
									<div
										v-if="activeTab === 'account'"
										class="form-sections flex gap-8"
									>
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
													<label class="text-sm text-gray-600 mb-2 block"
														>个性签名</label
													>
													<textarea
														v-model="tempSignature"
														class="textarea textarea-bordered w-full text-sm min-h-[100px]"
														placeholder="写下你的个性签名"
													></textarea>
													<div
														class="text-red-500 text-xs"
														v-if="v$.tempSignature.$error"
													>
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
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useI18n } from "vue-i18n";
import avatar from "@/assets/avatar.jpg";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength, helpers } from "@vuelidate/validators";

import AvatarUpload from "@/components/profile/avatar-upload.vue";
import PasswordEdit from "../components/profile/password-edit.vue";
import EmailEdit from "../components/profile/email-edit.vue";
import Footer from "../layout/footer.vue";

const { t, locale } = useI18n();

const router = useRouter();
const errorMessage = ref("");

const tempNickname = ref("");
const tempSignature = ref("");
// 基本验证规则
const nicknameRule = {
	required: helpers.withMessage("请输入昵称", required),
	maxLength: helpers.withMessage("昵称不能超过20个字符", maxLength(20)),
};

const signatureRule = {
	maxLength: helpers.withMessage("个性签名不能超过140个字符", maxLength(140)),
};

// 签到状态
const checkInStatus = ref({
	hasChecked: false,
	loading: false,
});

const rules = computed(() => ({
	tempNickname: nicknameRule,
	tempSignature: signatureRule,
}));

const v$ = useVuelidate(rules, {
	tempNickname,
	tempSignature,
});

const activeTab = ref("profile"); // 默认显示账户安全设置

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
			user.value.nickname = response.data.data.nickname;
			user.value.signature = response.data.data.signature;
			showToast({ message: "个人信息已更新", type: "success" });
		} else {
			showToast({ message: "个人信息修改失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "个人信息修改失败", type: "error" });
	}
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

const statistics = ref({});
const getUserLearnInfo = async () => {
	try {
		const res = await apiClient.get("/users/statistics");
		if (res.data.code === 200) {
			console.log(res.data.data);
			statistics.value = res.data.data;
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} catch (error) {
		console.log("dddddd");
	}
};

const linkToMembership = () => {
	router.push("/membership");
};

// 处理签到
const handleCheckIn = async () => {
	if (checkInStatus.value.hasChecked || checkInStatus.value.loading) return;

	try {
		checkInStatus.value.loading = true;
		const response = await apiClient.post("/points/check-in");

		if (response.data.data) {
			// 更新用户积分
			user.value.points = (user.value.points || 0) + 20;
			checkInStatus.value.hasChecked = true;
			showToast({ message: "签到成功！获得20积分", type: "success" });
		}
	} catch (error) {
		showToast({
			message: error.response?.data?.message || "签到失败，请稍后再试",
			type: "error",
		});
	} finally {
		checkInStatus.value.loading = false;
	}
};

// 获取签到状态
const getCheckInStatus = async () => {
	try {
		const response = await apiClient.get("/points/check-in/status");
		if (response.data.code === 200) {
			checkInStatus.value.hasChecked = response.data.data.hasChecked;
			console.log(checkInStatus.value);
		}
	} catch (error) {
		console.error("获取签到状态失败", error);
	}
};

const isEditing = ref(false);

const toggleEdit = () => {
	isEditing.value = !isEditing.value;
};

// 将编辑按钮点击事件与 toggleEdit 关联
const editProfile = () => {
	toggleEdit();
	if (isEditing.value) {
		tempNickname.value = user.value.nickname;
		tempSignature.value = user.value.signature;
	} else {
		tempNickname.value = "";
		tempSignature.value = "";
	}
};

const formatEpisode = (episode) => {
	// 将 episode 转换为数字并格式化为两位数
	return episode.toString().padStart(2, "0");
};

const getCurrentDate = () => {
	const today = new Date();
	const year = today.getFullYear();
	// 月份需要 +1 因为 getMonth() 返回 0-11
	const month = (today.getMonth() + 1).toString().padStart(2, "0");
	const day = today.getDate().toString().padStart(2, "0");
	return `${year}.${month}.${day}`;
};

const currentIndex = ref(0);

const nextProgress = () => {
	if (currentIndex.value < statistics.value.learningProgress.length - 1) {
		currentIndex.value++;
	}
};

const prevProgress = () => {
	if (currentIndex.value > 0) {
		currentIndex.value--;
	}
};

onMounted(async () => {
	await getUserProfile();
	await getUserLearnInfo();
	await getCheckInStatus();
});
</script>

<style scoped>
.profile-page {
}

.profile-container {
	display: flex;
	width: 100%;
}

.personal-card {
	width: 18rem;
	flex-shrink: 0;
	position: relative;
}

.character-card {
	width: 300px;
	padding: 8px;
}

.edit-profile-link {
	position: absolute;
	display: inline-block;
	padding: 6px 12px;
	margin-top: 12px;
	top: 20px;
	right: 10px;
	transform: translateX(-50%);
	font-size: 1.2rem;
	color: #000; /* 中灰色 */
	border: 1px dashed #131516;
	transition: all 0.2s ease;
	cursor: pointer;
	transform: rotate(5deg);
	text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.edit-profile-link:hover {
	color: #000;
	border-style: solid;
}

.card-inner {
	position: relative;
	padding: 1rem;
	background: linear-gradient(
		180deg,
		rgba(var(--primary-color-rgb), 0.2) 0%,
		rgba(var(--accent-color-rgb), 0.1) 50%,
		rgba(var(--secondary-color-rgb), 0.2)
	);
	border: 4px solid #000;
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

.personal-card img {
	border: 3px solid #333;
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
	transition: transform 0.3s;
}

.personal-card img:hover {
	transform: scale(1.05);
}

.progress-bar {
	height: 24px;
	margin: 1rem 0;
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

.log-card {
	flex: 1; /* Take up remaining space */
	min-width: 0; /* Prevent overflow issues */
	overflow: hidden;
}

.scene {
	position: relative;
	min-height: 472px;
	overflow: hidden;
}

.flip-card {
	position: relative;
	width: 100%;
	height: 100%;
	transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.front,
.back {
	position: absolute;
	width: 100%;
	height: 100%;
	transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.front {
	transform: translateY(0);
	background: white;
}

.back {
	transform: translateY(100%);
	background: white;
}

/* 翻转时的效果 */
.flip-card.active .front {
	transform: translateY(-100%) scale(0.95);
}

.flip-card.active .back {
	transform: translateY(0) scale(1);
}

/* 编辑区域样式 */
.edit-area {
	width: 100%;
	height: 100%;
	padding: 1rem 2rem;
	background: white;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.edit-area::before {
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
		rgba(0, 0, 0, 0.05) 2px,
		rgba(0, 0, 0, 0.03) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}

.log-card-inner {
	background: white;
	position: absolute;
	width: 100%;
	min-height: 472px;
	transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	overflow: hidden;
}
.log-card-inner::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image: linear-gradient(
			rgba(255, 255, 255, 0.5),
			rgba(255, 255, 255, 0.5)
		),
		url(../assets/zfh.png);
	background-size: 100%;
	opacity: 0.7;
	border-radius: 9px;
	pointer-events: none;
}

/* 标题样式 */
.notebook-title {
	position: absolute;
	top: 2rem;
	left: 3rem;
	transform: rotate(-3deg);
}

.sketch-title {
	font-size: 2rem;
	color: #2c3e50;
	text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.date-stamp {
	position: absolute;
	top: 10rem;
	right: 4rem;
	background: linear-gradient(
		45deg,
		var(--primary-color),
		var(--secondary-color)
	);
	color: white;
	padding: 0.5rem 1rem;
	transform: rotate(15deg);
	border-radius: 4px;
	font-family: monospace;
	/* 添加一些效果使其更突出 */
	box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

/* 添加悬停效果 */
.date-stamp:hover {
	transform: rotate(10deg) scale(1.05);
	box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.15);
}

/* 学习笔记卡片基础样式 */
.study-note {
	background: white;
	padding: 1.5rem;
	border-radius: 8px;
	box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.1);
	position: absolute;
	width: 200px;
	min-height: 150px;
	transition: transform 0.3s ease;
}

.study-note:hover {
	transform: scale(1.05) rotate(0deg) !important;
}

/* 个别笔记定位和旋转 */
.collection-note {
	top: 10%;
	left: 40%;
	transform: rotate(-8deg);
}

.word-note {
	top: 40%;
	right: 12%;
	transform: rotate(5deg);
}

.recent-progress {
	bottom: 10%;
	left: 28%;
	transform: rotate(-3deg);
}

/* 装饰元素 */
.paper-clip {
	position: absolute;
	top: 142px;
	left: 20px;
	width: 50px;
	height: 60px;
	border: 4px solid #95a5a6;
	border-radius: 0 30px 30px 0;
	transform: rotate(-10deg);
}

.tape-section {
	position: absolute;
	top: -15px;
	right: 20px;
	width: 80px;
	height: 30px;
	background: rgba(255, 255, 255, 0.6);
	transform: rotate(-5deg);
}

.push-pin {
	position: absolute;
	top: -10px;
	left: 50%;
	width: 20px;
	height: 20px;
	background: var(--secondary-color);
	border-radius: 50%;
	box-shadow: 0 0 0 5px rgba(231, 76, 60, 0.3);
}

/* 统计数字样式 */
.stat-number {
	font-size: 2.5rem;
	font-weight: bold;
	color: #2c3e50;
	margin: 1rem 0;
}

.unit {
	font-size: 1rem;
	margin-left: 0.5rem;
}

/* 随机涂鸦装饰 */
.doodle {
	position: absolute;
	opacity: 0.6;
}

.star-1,
.star-2 {
	width: 30px;
	height: 30px;
	background: linear-gradient(
			45deg,
			transparent 45%,
			var(--primary-color) 45%,
			var(--primary-color) 55%,
			transparent 55%
		),
		linear-gradient(
			-45deg,
			transparent 45%,
			var(--primary-color) 45%,
			var(--primary-color) 55%,
			transparent 55%
		);
}

.star-1 {
	top: 30%;
	right: 10%;
	transform: rotate(30deg);
}

.star-2 {
	bottom: 20%;
	right: 30%;
	transform: rotate(-15deg);
}

.circle-1 {
	width: 40px;
	height: 40px;
	border: 3px dashed var(--secondary-color);
	border-radius: 50%;
	top: 15%;
	right: 25%;
}

.arrow-1 {
	width: 60px;
	height: 20px;
	border-right: 4px solid var(--accent-color);
	border-bottom: 4px solid var(--accent-color);
	transform: rotate(45deg);
	bottom: 30%;
	right: 80%;
}

/* 进度指示器 */
.progress-indicator {
	font-size: 0.9rem;
	color: #7f8c8d;
	margin-top: 1rem;
}

.completed {
	color: #27ae60;
	font-weight: bold;
}

/* 最近进度样式 */
.manga-title {
	font-weight: bold;
	color: #2c3e50;
	margin-bottom: 0.5rem;
}

.chapter {
	color: #7f8c8d;
	font-style: italic;
}

/* 添加随机铅笔线条效果 */
@keyframes pencilStroke {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 0.1;
	}
}

.log-card-inner::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 5px,
		rgba(0, 0, 0, 0.1) 5px,
		rgba(0, 0, 0, 0.1) 6px
	);
	opacity: 0;
	animation: pencilStroke 2s forwards;
	pointer-events: none;
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

.border-b {
	border-bottom: 2px dashed #333;
}

.text-red-500 {
	color: #dc2626;
	font-family: "Comic Sans MS", cursive;
	font-size: 0.75rem;
}

/* 标签按钮样式 */
.edit-header span {
	transition: all 0.3s ease;
}

.edit-header span:hover {
	transform: translateY(-1px);
}

/* 表单切换动画 */
.form-sections {
	animation: fadeIn 0.3s ease;
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

.textarea-bordered {
	border: 2px solid #333;
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.1);
}
.textarea-bordered:focus {
	outline: none;
	box-shadow: inset 2px 2px 0 rgba(var(--primary-color-rgb), 0.2);
}

.progress-nav {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	margin-top: 12px;
}

.nav-btn {
	background: none;
	border: none;
	padding: 4px 8px;
	cursor: pointer;
	border-radius: 4px;
	transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
	background-color: rgba(0, 0, 0, 0.05);
}

.nav-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.progress-indicator {
	font-size: 0.9em;
	color: #666;
	min-width: 40px;
	text-align: center;
}

/* 签到按钮样式 */
.check-in-container {
	margin: 1rem 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
}

.check-in-button {
	position: relative;
	width: 100%;
	padding: 0.55rem 1rem;
	background: linear-gradient(
		135deg,
		var(--secondary-color),
		rgba(var(--secondary-color-rgb), 0.5)
	);
	border: 3px solid #000;
	border-radius: 8px;
	color: white;
	font-weight: bold;
	text-transform: uppercase;
	letter-spacing: 1px;
	overflow: hidden;
	transition: all 0.3s;
	transform: rotate(-2deg) scale(1.05);
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.8);
	z-index: 1;
}

.check-in-button:hover:not(:disabled) {
	transform: rotate(0deg) scale(1.1);
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.6);
}

.check-in-button:active:not(:disabled) {
	transform: rotate(0deg) scale(1);
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.9);
}

.button-content {
	position: relative;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
}

.check-in-icon {
	font-size: 1.2rem;
}

.check-in-text {
	font-size: 0.9rem;
	font-weight: bold;
}

.glitch-effect {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		rgba(255, 255, 255, 0.1),
		rgba(255, 255, 255, 0.1) 10px,
		transparent 10px,
		transparent 20px
	);
	z-index: 1;
	opacity: 0.5;
	mix-blend-mode: overlay;
}

.check-in-button.checked {
	background: linear-gradient(
		135deg,
		var(--primary-color),
		rgba(var(--secondary-color-rgb), 0.4)
	);
	opacity: 0.8;
	transform: rotate(0deg) scale(1);
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}

.check-in-button:disabled {
	cursor: not-allowed;
}

.points-display {
	margin-top: 1rem;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.25rem;
	background: rgba(0, 0, 0, 0.1);
	color: #333;
	padding: 0.25rem 0.75rem;
	border-radius: 8px;
	font-size: 0.9rem;
	border: 1px solid rgba(0, 0, 0, 0.2);
}

.points-value {
	font-weight: bold;
	font-size: 1rem;
	color: #222;
}

.points-label {
	font-size: 0.8rem;
	opacity: 0.9;
}

/* 添加一些动画效果 */
@keyframes pulse {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.02);
	}
	100% {
		transform: scale(1);
	}
}

.check-in-button:not(.checked):not(:disabled) {
	animation: pulse 1.5s infinite;
}
</style>
