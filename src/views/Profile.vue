<template>
	<div class="profile-page mt-20 px-10 relative w-full">
		<div class="profile-container flex gap-10">
			<div class="personal-card">
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

			<div
				class="log-card text-left card bg-base-100 border-4 border-black manga-card"
			>
				<div class="scene">
					<div class="flip-card" :class="{ active: isEditing }">
						<!-- 正面：学习报告 -->
						<div class="front">
							<div class="dashboard-container p-6 bg-line">
								<!-- 标题区域 -->
								<div
									class="dashboard-header flex justify-between items-center mb-4"
								>
									<h2 class="text-2xl font-bold">日志</h2>
									<button
										@click="editProfile"
										class="edit-profile-button px-4 py-2 bg-white border-2 border-black text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
									>
										<i class="bi bi-pencil-square"></i>
										编辑个人资料
									</button>
								</div>

								<!-- 内容区域：左侧排行榜 + 右侧统计卡片 -->
								<div class="content-grid grid grid-cols-3 gap-6">
									<!-- 左侧：排行榜 -->
									<div class="col-span-2">
										<Leaderboard :rankingList="selfRankingList" />
									</div>

									<!-- 右侧：统计卡片 -->
									<div class="col-span-1 stats-column space-y-4 mt-2">
										<Statsboard :statistics="statistics" />
									</div>
								</div>
							</div>
						</div>
						<!-- 背面：编辑区域 -->
						<div class="back">
							<ProfileEditor
								v-if="Object.keys(user).length > 0"
								:user="user"
								@close="editProfile"
								@update:user="updateUserInfo"
							/>
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
import Leaderboard from "@/components/profile/leaderboard.vue";
import Statsboard from "@/components/profile/statsboard.vue";
import ProfileEditor from "@/components/profile/editor.vue";
import Footer from "../layout/footer.vue";
import { usePointsStore } from "@/store/index";

// 积分相关的状态管理
const pointsStore = usePointsStore();

const user = ref({});
const isEditing = ref(false);
const statistics = ref({});

// 签到状态变量
const checkInStatus = ref({
	hasChecked: false,
	loading: false,
});

// 排行榜数据
const selfRankingList = computed(() => {
	// 如果有真实API数据，使用真实数据
	if (statistics.value && statistics.value.selfRanking) {
		return statistics.value.selfRanking;
	}

	// 否则使用生成的假数据
	return generateSelfRankingData(user.value.nickname || "Bazinga用户");
});

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
	isEditing.value = !isEditing.value;
};

// 生成排行榜的假数据
const generateSelfRankingData = (nickname) => {
	if (!nickname) return [];

	// 生成过去14天的日期
	const dates = [];
	for (let i = 14; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		dates.push({
			date: date,
			dateStr: `${date.getMonth() + 1}月${date.getDate()}日`,
		});
	}

	// 为每一天生成随机积分
	return dates
		.map((dateInfo, index) => {
			// 今天的日期标记为今日
			const isToday = index === dates.length - 1;

			// 生成随机积分，今天的积分稍微高一些
			const basePoints = Math.floor(Math.random() * 80) + 20;
			const points = isToday ? basePoints + 30 : basePoints;

			return {
				nickname: `${nickname}${dateInfo.dateStr.replace(/[月日]/g, "")}`,
				date: dateInfo.date,
				dateStr: dateInfo.dateStr,
				points: points,
				isToday: isToday,
			};
		})
		.sort((a, b) => b.points - a.points); // 按积分从高到低排序
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
}

.personal-card {
	width: 18rem;
	flex-shrink: 0;
	position: relative;
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
</style>
