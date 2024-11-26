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
		<div class="text-center mb-16">
			<button class="retro-btn-medium" @click="goToAllScenes">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face text-sm">{{ t("home.more") }}</div>
					</div>
				</div>
			</button>
		</div>

		<!-- Roadmap -->
		<div class="w-full" style="margin-top: 80px">
			<!-- 标题 -->
			<div class="terminal-title text-center" @click="showDevLog = !showDevLog">
				<div class="terminal-header">
					<span class="terminal-dot red"></span>
					<span class="terminal-dot yellow"></span>
					<span class="terminal-dot green"></span>
					<span class="terminal-title-text">开发者留言.log</span>
					<span class="cursor text-xs">_</span>
				</div>
			</div>

			<!-- Dev Log -->
			<div class="retro-terminal max-w-3xl mx-auto" v-if="showDevLog">
				<div class="terminal-shadow">
					<div class="terminal-edge">
						<div class="terminal-face flex">
							<div class="character-card">
								<!-- 角色卡片容器 -->
								<div class="card-inner">
									<!-- 标题 -->
									<div class="card-title bg-gray-700">Muztagh(d/acc)</div>

									<!-- 头像区域 -->
									<div class="avatar-container">
										<slot name="avatar">
											<img src="../assets/avatar.jpg" alt="Muztag" />
										</slot>
									</div>

									<p class="text-sm mt-1 text-gray-800">zyqvizzz@gmail.com</p>
									<div style="background-color: rgba(0, 0, 0, 0.2)">
										<p class="text-xs mt-2 py-2 text-gray-300">
											With math, 6900 simply cannot be contained by 500
										</p>
									</div>
								</div>
							</div>
							<div>
								<!-- 命令提示符和时间戳 -->
								<div class="terminal-prompt mb-6">
									<span class="text-green-500">dev@Bazinga_妙哉</span>
									<span class="text-gray-400 mr-2">:</span>
									<span class="text-blue-500">~/projects/roadmap</span>
									<span class="text-gray-400">$</span>
									<span class="text-gray-200 ml-2">cat TODO.md</span>
									<div class="text-gray-400 text-sm mt-1">
										Last updated: {{ new Date().toLocaleDateString() }}
									</div>
								</div>

								<!-- 文章列表 -->
								<div class="space-y-6">
									<div
										v-for="(article, index) in articles"
										:key="index"
										class="log-item"
									>
										<div class="flex items-center gap-3 mb-2">
											<div class="status-badge">WIP</div>
											<h3 class="text-lg font-mono font-bold text-primary">
												{{ article.title }}
											</h3>
										</div>
										<div class="ml-10 font-mono">
											<div class="flex items-center gap-4">
												<span class="text-gray-300"
													># {{ "{" }} {{ article.title_zh }} {{ "}" }}
												</span>
											</div>
										</div>
									</div>
								</div>

								<!-- Matrix rain 动画 -->
								<div class="matrix-rain"></div>

								<!-- 签名 -->
								<div
									class="dev-signature mt-8 text-right font-mono text-sm text-gray-400"
								>
									<div>Best regards</div>
									<div class="text-primary mt-1">@Muztagh(d/acc)</div>
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
import { ref, onMounted } from "vue";
import { showToast } from "@/components/common/toast.js";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const showDevLog = ref(false);
const router = useRouter();
const scenes = ref([]);
const articles = ref([
	{
		title: "0110100001100101011011000110110001101111",
		title_zh: "开发者留言",
		progress: 0,
	},
]);

onMounted(() => {
	getCatalogs();
});

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
	margin-bottom: 100px;
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

.terminal-title {
	position: relative;
	display: inline-block;
	padding: 1rem;
}

.terminal-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 1rem;
}

.terminal-dot {
	width: 12px;
	height: 12px;
	border-radius: 50%;
}

.terminal-dot.red {
	background-color: var(--secondary-color);
}
.terminal-dot.green {
	background-color: var(--primary-color);
}
.terminal-dot.yellow {
	background-color: var(--accent-color);
}

.terminal-title-text {
	margin-left: 0.5rem;
	color: #666;
	font-family: monospace;
}

.cursor {
	color: #666;
	animation: blink 1s step-start infinite;
}

@keyframes blink {
	50% {
		opacity: 0;
	}
}

.retro-terminal {
	position: relative;
	background: #b3b3b3;
	border-radius: 12px;
	font-family: "Fira Code", monospace;
	padding: 0 0 6px;
}

.terminal-face {
	background-color: #0c0c0c;
	border: 3px solid #333;
	border-radius: 12px;
	padding: 2rem 1rem 1rem 0;
	transform: translateY(-4px);
	color: #33ff33;
	position: relative;
	overflow: hidden;
	box-shadow: inset 0 0 18px rgba(0, 255, 0, 0.1);
	animation: crt-flicker 0.15s infinite;
}

/* CRT 扫描线 */
.terminal-face::before {
	content: " ";
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: linear-gradient(
		to bottom,
		rgba(18, 16, 16, 0) 50%,
		rgba(0, 0, 0, 0.25) 50%
	);
	background-size: 100% 4px;
	pointer-events: none;
	z-index: 2;
}

/* CRT 光晕 */
.terminal-face::after {
	content: " ";
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: rgba(18, 16, 16, 0.1);
	opacity: 0;
	z-index: 2;
	pointer-events: none;
	animation: crt-flicker 0.15s infinite;
}

.log-item {
	position: relative;
	padding: 1rem;
	border-radius: 4px;
	background: rgba(51, 255, 51, 0.03);
	border-left: 3px solid #33ff33;
	text-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
}

.log-item:hover {
	background: rgba(51, 255, 51, 0.06);
	box-shadow: 0 0 15px rgba(51, 255, 51, 0.1);
}

.status-badge {
	background: rgba(51, 255, 51, 0.1);
	border: 1px solid #33ff33;
	color: #33ff33;
	text-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
}

.matrix-rain {
	position: absolute;
	top: 0;
	right: 0;
	width: 16%;
	height: 100%;
	opacity: 0.1;
	background: linear-gradient(transparent, #33ff33 50%, transparent 100%);
	background-size: 100% 30px;
	animation: rain 2s linear infinite;
}

@keyframes rain {
	0% {
		transform: translateY(-100%);
	}
	100% {
		transform: translateY(100%);
	}
}

/* CRT 闪烁动画 */
@keyframes crt-flicker {
	0% {
		opacity: 0.97;
	}
	50% {
		opacity: 1;
	}
	100% {
		opacity: 0.98;
	}
}

.dev-signature {
	text-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
}

.dev-signature:hover .text-primary {
	text-shadow: 0 0 15px rgba(51, 255, 51, 0.8);
}

.terminal-prompt {
	color: #33ff33;
}

.terminal-prompt span {
	text-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
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
	width: 90%;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: -1.8rem;
	left: 50%;
	transform: translateX(-50%);
	/* background: #000; */
	color: white;
	padding: 4px 16px;
	font-weight: bold;
	font-size: 1.25rem;
	border: 2px solid #fff;
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
}

.avatar-container {
	width: 90%;
	height: 90%;
	margin: 1rem auto 0;
	border: 4px solid #000;
	background: #fff;
	overflow: hidden;
}

.avatar-container img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}
</style>
