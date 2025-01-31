<template>
	<div class="home">
		<!-- 标题 -->
		<div class="retro-title-box text-center mb-10">
			<h1 class="text-2xl font-bold">
				<div class="text-shadow-retro">
					<span
						><mark class="retro-highlight">{{ t("home.title") }}</mark></span
					>
				</div>
				<div class="pronunciation">
					<span>n. {{ t("home.subTitle") }} - /kəˈlɛkʃənz/</span>
				</div>
			</h1>
		</div>

		<div @click="textVoice">生成语音</div>

		<!-- 卡片展示区 -->
		<div class="flex flex-wrap justify-center my-10 gap-12">
			<div
				v-for="scene in scenes.slice(0, 3)"
				:key="scene.id"
				class="retro-card"
				@click="goToCollection(scene._id)"
			>
				<div class="card-shadow">
					<div class="card-edge">
						<div class="card-face">
							<!-- Banner -->
							<div class="banner-container h-[160px]">
								<div v-if="scene.banner" class="banner-wrapper h-full">
									<img
										:src="scene.banner"
										alt="logo"
										class="banner-image w-full h-full object-cover"
									/>
								</div>
								<div
									v-else
									class="banner-placeholder h-full w-full"
									:style="{ backgroundColor: scene.theme }"
								></div>
							</div>
							<!-- 内容区域 -->
							<div class="content-container" :style="{ color: scene.theme }">
								<h2 class="text-lg font-bold">{{ scene.showName }}</h2>
								<p class="subtitle mt-2">{{ scene.name }}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- More -->
		<div class="text-center">
			<button class="retro-btn-medium" @click="goToAllScenes">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face text-sm">{{ t("home.more") }}</div>
					</div>
				</div>
			</button>
		</div>
	</div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { showToast } from "@/components/common/toast.js";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const router = useRouter();
const scenes = ref([]);

onMounted(() => {
	getCatalogs();
	aiTest();
});

const textVoice = async () => {
	try {
		const response = await apiClient.post("/voice/generate", {
			text: "Hey, everyone! Welcome back to Bazinga, I'm your host Jinji!",
		});

		if (response.data.code === 200 && response.data.data.audio) {
			const base64Data = response.data.data.audio;
			const binaryString = window.atob(base64Data);
			const bytes = new Uint8Array(binaryString.length);

			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			const blob = new Blob([bytes.buffer], { type: "audio/mp3" });
			const audioUrl = URL.createObjectURL(blob);
			const audio = new Audio();

			return new Promise((resolve, reject) => {
				audio.oncanplaythrough = async () => {
					try {
						await audio.play();
						console.log("开始播放音频", response.data.data.extraInfo);
						resolve();
					} catch (err) {
						reject(err);
					}
				};

				audio.onended = () => {
					URL.revokeObjectURL(audioUrl);
				};

				audio.src = audioUrl;
				audio.load();
			});
		}
	} catch (error) {
		console.error("播放音频失败:", error);
		throw error;
	}
};

const aiTest = async () => {
	try {
		// const response = await apiClient.post("/knowledge/generate", {
		// 	word: "collections",
		// });
	} catch (error) {
		console.error("Failed to fetch catalogs", error);
	}
};

const getCatalogs = async () => {
	try {
		const response = await apiClient.get("/catalogs");
		if (response.data.code === 200) {
			scenes.value = response.data.data;
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

const goToAllScenes = () => {
	router.push("/collections");
};

const goToCollection = (id) => {
	router.push("/collections/" + id);
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

/* 复古卡片样式 */
.retro-card {
	position: relative;
	width: 20rem;
	cursor: pointer;
	transition: transform 0.3s;
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

.retro-card:hover {
	transform: translateY(-5px);
}

.retro-card:hover .card-edge,
.retro-card:hover .card-face {
	transform: translateY(-6px);
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
</style>
