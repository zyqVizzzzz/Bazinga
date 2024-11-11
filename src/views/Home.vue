<template>
	<div class="home">
		<!-- 复古标题 -->
		<div class="retro-title-box text-center mb-10">
			<h1 class="text-2xl font-bold">
				<div class="text-shadow-retro">
					<span><mark class="retro-highlight">Collections</mark></span>
				</div>
				<div class="pronunciation">
					<span>n. 合集(复数) - /kəˈlɛkʃənz/</span>
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
							<!-- Banner区域 -->
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

		<!-- More按钮 -->
		<div class="text-center mb-16">
			<button class="retro-btn-medium" @click="goToAllScenes">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face"><- More -></div>
					</div>
				</div>
			</button>
		</div>

		<!-- Next部分 -->
		<div class="w-full" style="margin-top: 120px">
			<!-- Terminal-style title -->
			<div class="terminal-title text-center mb-6">
				<div class="terminal-header">
					<span class="terminal-dot red"></span>
					<span class="terminal-dot yellow"></span>
					<span class="terminal-dot green"></span>
					<span class="terminal-title-text">dev_log.md</span>
				</div>
				<h1 class="text-2xl font-mono font-bold text-shadow-retro">
					> NEXT_PLAN
					<span class="cursor">_</span>
				</h1>
			</div>

			<!-- Dev Log Content -->
			<div class="retro-terminal max-w-3xl mx-auto">
				<div class="terminal-shadow">
					<div class="terminal-edge">
						<div class="terminal-face">
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
									<!-- 标题和状态标签 -->
									<div class="flex items-center gap-3 mb-2">
										<div class="status-badge">WIP</div>
										<h3 class="text-lg font-mono font-bold text-primary">
											{{ article.title }}
										</h3>
									</div>

									<!-- 中文说明和进度 -->
									<div class="ml-10 font-mono">
										<div class="flex items-center gap-4">
											<span class="text-gray-300"
												># {{ "{" }} {{ article.title_zh }} {{ "}" }}
											</span>
										</div>
									</div>
								</div>
							</div>

							<!-- 装饰性动画 -->
							<div class="matrix-rain"></div>

							<!-- 开发者签名 -->
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
</template>
<script setup>
import { ref, onMounted } from "vue";
import { showToast } from "@/components/common/toast.js";
import { useRouter } from "vue-router";
import apiClient from "@/api";

const router = useRouter();
const scenes = ref([]);
const articles = ref([
	{
		title: "With math, 6900 simply cannot be contained by 500",
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

/* 内容区域样式 */
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
		rgba(0, 0, 0, 0.02) 2px,
		rgba(0, 0, 0, 0.02) 4px
	);
}

/* More按钮样式 */
.retro-btn-medium {
	position: relative;
	width: 8rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

/* 文章列表卡片 */
.retro-article-card {
	position: relative;
	padding: 2rem;
	background-image: url("@/assets/cytus.jpg");
	background-repeat: no-repeat;
	background-position: right center;
	background-size: 16%;
}

.article-item {
	padding: 0.5rem;
	transition: background-color 0.3s;
	border-radius: 8px;
}

.article-item:hover {
	background-color: rgba(0, 0, 0, 0.05);
}

.progress-line {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.progress-line::after {
	content: "";
	flex: 1;
	height: 2px;
	background: repeating-linear-gradient(
		90deg,
		#666 0px,
		#666 4px,
		transparent 4px,
		transparent 8px
	);
}

.progress {
	font-weight: bold;
	color: var(--primary-color);
}

/* 交互效果 */
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
	background-color: #888;
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

/* 标题样式调整 */
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
	background-color: #ff5f56;
}
.terminal-dot.yellow {
	background-color: #ffbd2e;
}
.terminal-dot.green {
	background-color: #27c93f;
}

.terminal-title-text {
	margin-left: 1rem;
	color: #666;
	font-family: monospace;
}

/* 闪烁的光标 */
.cursor {
	animation: blink 1s step-start infinite;
}

.terminal-title-text {
	margin-left: 1rem;
	color: #666;
	font-family: monospace;
}

@keyframes blink {
	50% {
		opacity: 0;
	}
}

/* 终端主体样式 */
.retro-terminal {
	position: relative;
	background: #666;
	border-radius: 12px;
	font-family: "Fira Code", monospace;
	padding: 24px;
}

.terminal-face {
	background-color: #0c0c0c;
	border: 3px solid #333;
	border-radius: 12px;
	padding: 2rem;
	transform: translateY(-4px);
	color: #33ff33;
	position: relative;
	overflow: hidden;
	box-shadow: inset 0 0 18px rgba(0, 255, 0, 0.1);
	animation: crt-flicker 0.15s infinite;
}

/* CRT 扫描线效果 */
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

/* CRT 光晕效果 */
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

/* 日志条目样式 */
.log-item {
	position: relative;
	padding: 1rem;
	border-radius: 4px;
	background: rgba(51, 255, 51, 0.03);
	border-left: 3px solid #33ff33;
	text-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
}

.status-badge {
	background: rgba(51, 255, 51, 0.1);
	border: 1px solid #33ff33;
	color: #33ff33;
	text-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
}

/* 进度条样式 */
.progress-bar {
	flex: 1;
	height: 6px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 3px;
	position: relative;
	margin-left: 1rem;
}

.progress-fill {
	height: 100%;
	background: var(--primary-color);
	border-radius: 3px;
	transition: width 0.3s ease;
}

.progress-text {
	position: absolute;
	right: -2rem;
	top: -0.5rem;
	font-size: 0.75rem;
	color: var(--primary-color);
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

/* Matrix Rain Animation */
.matrix-rain {
	position: absolute;
	top: 0;
	right: 0;
	width: 16%;
	height: 100%;
	opacity: 0.1;
	background: linear-gradient(
		transparent,
		var(--primary-color) 50%,
		transparent 100%
	);
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
/* Matrix Rain 调整 */
.matrix-rain {
	background: linear-gradient(transparent, #33ff33 50%, transparent 100%);
}

/* 开发者签名调整 */
.dev-signature {
	color: #33ff33;
	text-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
}

.terminal-prompt {
	color: #33ff33;
}

.terminal-prompt span {
	text-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
}

/* 交互效果 */
.log-item:hover {
	background: rgba(51, 255, 51, 0.06);
	box-shadow: 0 0 15px rgba(51, 255, 51, 0.1);
}

.dev-signature:hover .text-primary {
	text-shadow: 0 0 15px rgba(51, 255, 51, 0.8);
}
</style>
