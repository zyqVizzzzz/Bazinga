<template>
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
				@update:avatarUrl="(url) => $emit('update:profilePic', url)"
			/>

			<!-- 邮箱 -->
			<p class="text-sm mt-1 text-gray-800">
				{{ user.email }}
			</p>

			<!-- 签名 -->
			<div class="relative" style="background-color: rgba(0, 0, 0, 0.2)">
				<p class="text-xs border-b mt-2 py-2 text-gray-300 cursor-pointer">
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
							{{ checkInStatus.hasChecked ? "今日已签到" : "每日签到 +20" }}
						</div>
					</div>
					<div class="glitch-effect"></div>
				</button>
				<div
					class="points-display border-b w-full"
					v-if="user.points !== undefined"
				>
					<span class="points-value text-gray-300">
						<span class="text-sm relative" style="top: -2px">当前积分：</span>
						{{ user.points }}
					</span>
					<!-- <span class="points-label">积分</span> -->
				</div>
			</div>
		</div>
		<div
			class="dev-call absolute"
			style="bottom: -30px; left: 50%; transform: translateX(-50%); width: 100%"
		>
			<slot name="footer"></slot>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import AvatarUpload from "@/components/profile/avatar-upload.vue";
import { showToast } from "@/components/common/toast.js";
import apiClient from "@/api";
import { usePointsStore } from "@/store/index";

const props = defineProps({
	user: {
		type: Object,
		required: true,
	},
	checkInStatus: {
		type: Object,
		default: () => ({
			hasChecked: false,
			loading: false,
		}),
	},
});

const emit = defineEmits(["update:profilePic", "check-in-success"]);

// 积分相关的状态管理
const pointsStore = usePointsStore();

// 处理签到
const handleCheckIn = async () => {
	if (props.checkInStatus.hasChecked || props.checkInStatus.loading) return;

	try {
		emit("check-in-start");
		const response = await apiClient.post("/points/check-in");

		if (response.data.data) {
			emit("check-in-success");
			pointsStore.updatePoints(20);
			showToast({ message: "签到成功！获得20积分", type: "success" });
		}
	} catch (error) {
		showToast({
			message: error.response?.data?.message || "签到失败，请稍后再试",
			type: "error",
		});
	} finally {
		emit("check-in-end");
	}
};
</script>

<style scoped>
.character-card {
	width: 300px;
	padding: 8px;
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
	background: rgba(0, 0, 0, 0.2);
	color: #333;
	padding: 0.25rem 0.75rem;
	font-size: 0.9rem;
}

.points-value {
	font-weight: bold;
	font-size: 1rem;
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

.border-b {
	border-bottom: 2px dashed #333;
}
</style>
