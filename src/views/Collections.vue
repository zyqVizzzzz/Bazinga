<template>
	<div class="all-collections">
		<!-- 标题 -->
		<div class="retro-title-box text-center mb-10">
			<h1 class="text-2xl font-bold">
				<span class="text-shadow-retro"
					>Collections <mark class="retro-highlight">Gallery</mark></span
				>
				<span class="pronunciation mt-2">n. 画廊 - /ˈɡæləri/</span>
			</h1>
			<!-- <div class="title-decoration left"></div>
			<div class="title-decoration right"></div> -->
		</div>

		<!-- 合集 -->
		<div class="grid-container justify-items-center">
			<div
				v-for="scene in scenes"
				:key="scene.id"
				class="retro-card"
				@click="goToCollection(scene._id)"
			>
				<div class="card-shadow">
					<div class="card-edge">
						<div class="card-face">
							<!-- Banner图片 -->
							<div class="banner-container">
								<div v-if="scene.banner" class="banner-wrapper">
									<img :src="scene.banner" alt="logo" class="banner-image" />
								</div>
								<div
									v-else
									class="banner-placeholder"
									:style="{ backgroundColor: scene.theme }"
								></div>
							</div>

							<!-- 内容区域 -->
							<div class="content-container" :style="{ color: scene.theme }">
								<h2 class="title text-lg">{{ scene.showName }}</h2>
								<p class="subtitle">{{ scene.name }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 新增合集 -->
			<div class="retro-card add-card" @click="addNewScene">
				<div class="card-shadow">
					<div class="card-edge">
						<div class="card-face">
							<div class="add-content">
								<i class="bi bi-folder-plus text-3xl mb-2"></i>
								<span class="text-lg font-bold">{{
									t("collections.create")
								}}</span>
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
import { useLoginStore } from "@/store/index";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);

const router = useRouter();
const scenes = ref([]);

onMounted(() => {
	getAllScenes();
});

const getAllScenes = async () => {
	try {
		const res = await apiClient.get("/catalogs");
		if (res.data.code === 200) {
			scenes.value = res.data.data;
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} catch (error) {
		console.error("Failed to fetch scenes", error);
	}
};

const goToCollection = (id) => {
	router.push("/collections/" + id);
};

const addNewScene = () => {
	if (isLogin.value) {
		router.push("/setup-collection");
	} else {
		showToast({ message: "登录后可创建合集", type: "info" });
	}
};
</script>

<style scoped>
.all-collections {
	width: 100%;
	margin-top: 40px;
	margin-bottom: 100px;
	min-height: 500px;
	padding: 20px;
}

.grid-container {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 2rem;
	padding: 1rem;
}

.retro-title-box {
	position: relative;
	display: inline-block;
	padding: 1rem 3rem;
	margin: 0 auto;
}

.title-decoration {
	position: absolute;
	width: 40px;
	height: 40px;
	border: 4px solid currentColor;
}

.title-decoration.left {
	left: -20px;
	top: 50%;
	transform: translateY(-50%) rotate(45deg);
}

.title-decoration.right {
	right: -20px;
	top: 50%;
	transform: translateY(-50%) rotate(45deg);
}

.text-shadow-retro {
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2),
		-1px -1px 0 rgba(255, 255, 255, 0.2);
}

.pronunciation {
	display: block;
	font-size: 0.875rem;
	color: #666;
	font-weight: normal;
}

.retro-highlight {
	background: linear-gradient(
		transparent 60%,
		rgba(var(--secondary-color-rgb), 0.2) 40%
	);
	padding: 0 0.5rem;
	border-radius: 4px;
}

.retro-card {
	position: relative;
	width: 100%;
	max-width: 320px;
	cursor: pointer;
	transition: transform 0.3s;
}

.retro-card:hover {
	transform: translateY(-5px);
}

.card-shadow {
	background-color: #666;
	border-radius: 12px;
	transform: translateY(4px);
}

.card-edge {
	background-color: #b3b3b3;
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.2s;
}

.card-face {
	background-color: white;
	border: 3px solid #333;
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.2s;
	overflow: hidden;
}

/* 卡片装饰效果 */
.card-face::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 40%;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
	pointer-events: none;
}

.retro-card:hover .card-edge,
.retro-card:hover .card-face {
	transform: translateY(-6px);
}

.retro-card:active .card-edge,
.retro-card:active .card-face {
	transform: translateY(-2px);
}

.banner-container {
	height: 150px;
	overflow: hidden;
}

.banner-wrapper {
	width: 100%;
	height: 100%;
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

.content-container {
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

.title {
	font-weight: bold;
	text-align: center;
	margin-bottom: 0.5rem;
}

.subtitle {
	font-weight: 900;
	text-align: center;
}

.add-card .card-face {
	background-color: #f8f8f8;
	border: 3px solid #333;
	height: 330px;
}

.add-content {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #666;
}
</style>
