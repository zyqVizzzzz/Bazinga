<template>
	<div class="home">
		<!-- 卡片展示区 -->
		<div class="flex flex-wrap justify-center my-10 gap-12">
			<div
				class="molidoki-card"
				@click="handleCardClick"
				v-for="scene in displayedScenes"
				:key="scene.id"
			>
				<div class="card-shadow">
					<div class="card-edge">
						<div class="card-face">
							<div class="molidoki-frame">
								<div class="paw-icon"></div>
								<div class="molidoki-screen gochi-screen-overlay">
									<div class="screen-content">
										<div class="chapter-title">CHAPTER 0</div>
										<div class="chapter-name">SORTING HAT</div>
										<div class="screen-footer">
											<div class="footer-text">RUN LIKE THIS</div>
											<div class="footer-text">RUN</div>
											<div class="footer-text">LOVE</div>
										</div>
									</div>
								</div>
								<div class="status-bar"></div>
								<div class="control-buttons">
									<button class="control-btn"></button>
									<button class="control-btn"></button>
									<button class="control-btn"></button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- More -->
		<div class="text-center" v-if="displayedScenes.length > 3">
			<button class="retro-btn-medium" @click="toggleExpand">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face text-sm">
							{{ isExpanded ? "收起" : "查看更多" }}
						</div>
					</div>
				</div>
			</button>
		</div>

		<dialog id="mochi_modal2" class="modal modal-mochi">
			<div
				class="modal-box p-0 flex items-center justify-center mochi-container"
				:class="{ 'w-11/12 max-w-5xl': !isMobile, 'w-full': isMobile }"
			>
				<form method="dialog" class="absolute right-6 top-6 z-[999]">
					<button class="btn btn-circle btn-ghost text-2xl hover-glow">
						<i class="bi bi-x"></i>
					</button>
				</form>
				<MochiView v-if="!isMobile" />
				<MochiViewMobile v-else />
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>关闭</button>
			</form>
		</dialog>
	</div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { showToast } from "@/components/common/toast.js";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import MochiView from "@/mochi/MochiView.vue";
import MochiViewMobile from "@/mochi/MochiViewMobile.vue";

import { useLoginStore } from "@/store/index";
import { useBreakpoint } from "@/composables/useBreakpoint";

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);

const router = useRouter();
const scenes = ref([]);
const { isMobile } = useBreakpoint();

onMounted(() => {
	getCatalogs();
});

const getCatalogs = async () => {
	try {
		const response = await apiClient.get("/catalogs");
		if (response.data.code === 200) {
			scenes.value = response.data.data.filter((catalog) => !catalog.isCustom);
		} else {
			showToast({
				message: response.data.message,
				type: "error",
				duration: 3000,
			});
		}
	} catch (error) {
		console.error("Failed to fetch catalogs", error);
	}
};

const isExpanded = ref(false);
const displayedScenes = computed(() => {
	return isExpanded.value ? scenes.value : scenes.value.slice(0, 3);
});

const toggleExpand = () => {
	isExpanded.value = !isExpanded.value;
};

const goToCollection = (id) => {
	// if (!isLogin.value) return;
	router.push("/collections/" + id);
};

const handleCardClick = () => {
	if (isMobile.value) {
		// 移动端：导航到Mochi页面
		router.push("/mochi");
	} else {
		// 桌面端：打开对话框
		window.mochi_modal2.showModal();
	}
};
</script>
<style scoped>
.home {
	width: 100%;
	margin-top: 50px;
}

/* 复古标题样式 */
.retro-title-box {
	position: relative;
	display: inline-block;
	padding: 1rem 3rem;
	margin: 0 auto;
}

.text-shadow-retro {
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2),
		-1px -1px 0 rgba(255, 255, 255, 0.2);
}

.pronunciation {
	font-size: 0.875rem;
	color: #666;
	font-weight: normal;
	margin-top: 0.5rem;
}

.retro-highlight {
	background: linear-gradient(
		transparent 60%,
		rgba(var(--secondary-color-rgb), 0.2) 40%
	);
	padding: 0 0.5rem;
	border-radius: 4px;
}

/* Banner样式 */
.banner-container {
	height: 160px;
	overflow: hidden;
}

.banner-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.banner-placeholder {
	width: 100%;
	height: 100%;
}

/* 角标样式 */
.status-badge {
	position: absolute;
	bottom: 10px;
	right: 10px;
	padding: 2px 8px;
	font-size: 0.75rem;
	border-radius: 4px;
	background-color: #333;
	color: white;
	font-weight: bold;
	box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.content-container {
	position: relative;
	height: 180px;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.05) 2px,
		rgba(0, 0, 0, 0.05) 4px
	);
}

.retro-btn-medium:hover .btn-face {
	background-color: white;
}

.retro-btn-medium:active .btn-edge,
.retro-btn-medium:active .btn-face {
	transform: translateY(0);
}

.retro-btn-medium {
	position: relative;
	width: 8rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

/* 按钮通用样式 */
.btn-shadow,
.btn-edge,
.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 8px;
}

.btn-shadow {
	background-color: #666;
	transform: translateY(2px);
}

.btn-edge {
	background-color: #b3b3b3;
	transform: translateY(-2px);
}

.btn-face {
	background-color: #f0f0f0;
	border: 2px solid #333;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-box {
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
	max-height: 100vh !important;
	height: 100vh !important;
	width: 100vw !important;
	max-width: 100vw !important;
	margin: 0 !important;
	padding: 0 !important;
	position: relative;
}

.modal {
	padding: 0 !important;
}

.modal-backdrop {
	/* background: rgba(0, 0, 0, 0.9); */
	opacity: 1 !important;
	backdrop-filter: blur(5px);
}

/* 添加模态框打开动画 */
.modal-mochi::backdrop {
	background: radial-gradient(
		circle,
		rgba(255, 255, 255, 0.95) 0%,
		rgba(240, 240, 240, 0.9) 100%
	);
	animation: modal-backdrop-in 0.3s ease-out;
}

.mochi-container {
	display: flex;
	align-items: center;
	justify-content: center;
}

@keyframes modal-backdrop-in {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.modal-box {
	background: transparent !important;
	border: none !important;
	box-shadow: none !important;
	max-height: 100vh !important;
	height: 100vh !important;
	width: 100vw !important;
	max-width: 100vw !important;
	margin: 0 !important;
	padding: 0 !important;
	position: relative;
}

.modal {
	padding: 0 !important;
}

.modal-backdrop {
	/* background: rgba(0, 0, 0, 0.9); */
	opacity: 1 !important;
	backdrop-filter: blur(5px);
}

/* 添加模态框打开动画 */
.modal-mochi::backdrop {
	background: radial-gradient(
		circle,
		rgba(255, 255, 255, 0.95) 0%,
		rgba(240, 240, 240, 0.9) 100%
	);
	animation: modal-backdrop-in 0.3s ease-out;
}

.mochi-container {
	display: flex;
	align-items: center;
	justify-content: center;
}

@keyframes modal-backdrop-in {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.molidoki-card {
	margin-top: 50px;
	position: relative;
	width: 320px;
	height: 300px;
	cursor: pointer;
	transition: transform 0.3s;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.molidoki-card:hover {
	transform: translateY(-5px);
}

.molidoki-card:hover .card-edge,
.molidoki-card:hover .card-face {
	transform: translateY(-6px);
}

.card-shadow {
	background-color: #666;
	border-radius: 12px;
	transform: translateY(4px);
}

.card-edge {
	background: linear-gradient(145deg, rgb(208, 213, 214), rgb(208, 213, 214));
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.2s;
}

.card-face {
	background-color: #f5f5f5;
	border: 3px solid #333;
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.2s;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
	/* padding: 30px 20px; */
}

.molidoki-frame {
	width: 96%;
	height: 96%;
	border-radius: 10px;
	background: #f5f5f5;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30px 20px;
	position: relative;
}

.paw-icon {
	width: 20px;
	height: 20px;
	background: #999;
	position: absolute;
	top: 25px;
	mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M256 224c-79.41 0-192 122.76-192 200.25 0 34.9 26.81 55.75 71.74 55.75 48.84 0 81.09-25.08 120.26-25.08 39.51 0 71.85 25.08 120.26 25.08 44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224zm-147.28-12.61c-10.4-34.65-42.44-57.09-71.56-50.13-29.12 6.96-44.29 40.69-33.89 75.34 10.4 34.65 42.44 57.09 71.56 50.13 29.12-6.96 44.29-40.69 33.89-75.34zm84.72-20.78c30.94-8.14 46.42-49.94 34.58-93.36s-46.52-72.01-77.46-63.87-46.42 49.94-34.58 93.36c11.84 43.42 46.53 72.02 77.46 63.87zm281.39-29.34c-29.12-6.96-61.15 15.48-71.56 50.13-10.4 34.65 4.77 68.38 33.89 75.34 29.12 6.96 61.15-15.48 71.56-50.13 10.4-34.65-4.77-68.38-33.89-75.34zm-156.27 29.34c30.94 8.14 65.62-20.45 77.46-63.87 11.84-43.42-3.64-85.21-34.58-93.36s-65.62 20.45-77.46 63.87c-11.84 43.42 3.64 85.22 34.58 93.36z'/%3E%3C/svg%3E")
		no-repeat center;
	-webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M256 224c-79.41 0-192 122.76-192 200.25 0 34.9 26.81 55.75 71.74 55.75 48.84 0 81.09-25.08 120.26-25.08 39.51 0 71.85 25.08 120.26 25.08 44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224zm-147.28-12.61c-10.4-34.65-42.44-57.09-71.56-50.13-29.12 6.96-44.29 40.69-33.89 75.34 10.4 34.65 42.44 57.09 71.56 50.13 29.12-6.96 44.29-40.69 33.89-75.34zm84.72-20.78c30.94-8.14 46.42-49.94 34.58-93.36s-46.52-72.01-77.46-63.87-46.42 49.94-34.58 93.36c11.84 43.42 46.53 72.02 77.46 63.87zm281.39-29.34c-29.12-6.96-61.15 15.48-71.56 50.13-10.4 34.65 4.77 68.38 33.89 75.34 29.12 6.96 61.15-15.48 71.56-50.13 10.4-34.65-4.77-68.38-33.89-75.34zm-156.27 29.34c30.94 8.14 65.62-20.45 77.46-63.87 11.84-43.42-3.64-85.21-34.58-93.36s-65.62 20.45-77.46 63.87c-11.84 43.42 3.64 85.22 34.58 93.36z'/%3E%3C/svg%3E")
		no-repeat center;
}

.molidoki-screen {
	width: 280px;
	height: 200px;
	background: #4a4a4a;
	border-radius: 10px;
	position: relative;
	border: 6px solid #d0d0d0;
	margin-top: 30px;
	margin-bottom: 20px;
	font-family: "PixelFont", sans-serif;
}

.molidoki-screen::before {
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
		rgba(0, 0, 0, 0.1) 2px,
		rgba(0, 0, 0, 0.03) 4px
	);
	border-radius: 40px;
	pointer-events: none;
}

.status-bar {
	width: 120px;
	height: 8px;
	background: #999;
	border-radius: 4px;
	margin-bottom: 20px;
}

.control-buttons {
	display: flex;
	gap: 20px;
	margin-top: auto;
	margin-bottom: 20px;
}

.control-btn {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #e0e0e0;
	border: none;
	cursor: pointer;
	box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.2);
}
@font-face {
	font-family: "PixelFont";
	src: url("./assets/VT.woff2") format("woff2");
	font-weight: normal;
	font-style: normal;
	font-display: swap;
}
.molidoki-frame::after {
	content: "MOCHI-0001";
	position: absolute;
	bottom: 15px;
	left: 50%;
	transform: translateX(-50%);
	font-size: 14px;
	font-family: "PixelFont", sans-serif;
	color: #666;
	white-space: nowrap;
}

.gochi-screen-overlay {
	background-color: #eff8cb;
	/* overflow: hidden; */
	border-radius: 40px;
	z-index: 5;
	padding: 8px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	box-shadow: inset 0px 0px 12px rgba(0, 0, 0, 0.4);
}

.gochi-screen-overlay::before {
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
		rgba(0, 0, 0, 0.1) 2px,
		rgba(0, 0, 0, 0.03) 4px
	);
	border-radius: 40px;
	pointer-events: none;
}
.screen-content {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 10px 20px 10px;
	color: #2c3e50;
	text-align: center;
}

.chapter-title {
	font-family: "PixelFont", sans-serif;
	font-size: 24px;
}

.chapter-name {
	font-family: "PixelFont", sans-serif;
	font-size: 32px;
	line-height: 1;
	margin-bottom: auto;
}

.screen-footer {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.footer-text {
	font-family: "PixelFont", sans-serif;
	font-size: 16px;
	opacity: 0.8;
}
</style>
