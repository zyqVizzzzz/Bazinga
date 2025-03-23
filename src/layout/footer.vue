<template>
	<div class="w-full flex">
		<!-- Roadmap -->
		<div class="w-full text-center flex flex-col items-center">
			<!-- 标题 -->
			<div class="terminal-title text-center" @click="toggleShowDevLog">
				<div class="terminal-header">
					<span class="relative -top-[1px]"
						><i class="bi bi-code-square"></i
					></span>
					<span class="terminal-title-text">站内信.log</span>
					<span class="cursor text-xs">_</span>
				</div>
			</div>

			<dialog
				id="dev_log_modal"
				class="modal modal-dev-log modal-white relative"
			>
				<button
					@click="closeDevBox"
					class="btn btn-lg text-gray-800 btn-circle btn-ghost absolute right-[24px] top-[24px]"
				>
					<svg
						class="size-6"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
				<div
					v-if="showDevLog"
					class="modal-box"
					:class="{
						'expanded flex': isExpanded,
						'flex justify-center items-center relative': !isExpanded,
					}"
				>
					<form method="dialog"></form>
					<!-- Dev Log -->
					<div class="retro-terminal w-full h-full" v-if="isExpanded">
						<div class="terminal-face article">
							<p class="mb-6">我们的旅程从这里开始</p>
							<img
								src="../assets/dev_banner.jpg"
								alt=""
								class="w-[50%] my-6 mx-auto"
							/>
							<p class="mb-2">在下一个版本里</p>
							<p class="mb-2">我们可以通过 AI 更加便捷的定制知识点和课程...</p>
							<p class="mb-2">（我知道目前的自制合辑功能还处于很潦草的阶段）</p>
							<p class="mb-2">Muztag 和 Jinji 会以更丰满的形象出现...</p>
							<p class="mb-2">并且，每个用户都可以生成专属的虚拟角色...</p>
							<p class="mb-2">（它们会成为这个空间里最重要的一部分）</p>
							<p class="mb-2">最终所有虚拟角色将在某个时刻相遇...</p>
							<p class="mb-2">没人知道那一刻会发生什么...</p>
							<p class="mb-2">因为这会是一段新旅程的开始...</p>
							<p class="mb-2">我相信事情总会尽力向着有趣的地方靠拢...</p>
							<p class="mb-2">So...</p>
							<p class="mb-2">如果你喜欢这个应用</p>
							<p class="mb-2">并期待这里出现不可思议的变化</p>
							<p class="mb-2">那就可以把想法告诉我...</p>
							<p class="mb-2">任何想法、任何需求、任何事情、任何时间...</p>
							<p class="mb-2">
								只要你愿意，你甚至可以把这里当成一个情感树洞...
							</p>
							<p class="mb-4">开发者将尽其所能、为你解答世间万物 ...</p>

							<div class="terminal-input-container">
								<textarea
									v-model="userInput"
									placeholder="在这里输入你的想法..."
									class="terminal-input"
									spellcheck="false"
								></textarea>
								<p>{{ tips }}</p>
								<button
									class="terminal-submit"
									@click="handleSubmit"
									:disabled="!userInput.trim()"
								>
									<span class="submit-icon">></span>
									<span class="submit-text">提交留言</span>
								</button>
							</div>
						</div>
					</div>
					<div class="retro-terminal max-w-3xl mx-auto" v-if="!isExpanded">
						<div class="terminal-face panel flex">
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
										class="log-item cursor-pointer"
										@click="handleArticleClick"
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
			</dialog>
		</div>
	</div>
</template>
<script setup>
import { ref } from "vue";
import apiClient from "@/api";
const showDevLog = ref(false);
const articles = ref([
	{
		title: "0110100001100101011011000110110001101111",
		title_zh: "站内信",
		progress: 0,
	},
]);
const isExpanded = ref(false);
const userInput = ref("");

const handleArticleClick = () => {
	isExpanded.value = !isExpanded.value;
};

const toggleShowDevLog = () => {
	showDevLog.value = true;
	const binkModalDom = document.getElementById("dev_log_modal");
	binkModalDom.showModal();
};

const closeDevBox = () => {
	showDevLog.value = false;
	isExpanded.value = false;
	const binkModalDom = document.getElementById("dev_log_modal");
	binkModalDom.close();
};

const tips = ref("");

const handleSubmit = async () => {
	if (!userInput.value.trim()) return;

	// 这里处理提交逻辑
	console.log("提交留言:", userInput.value);
	try {
		const response = await apiClient.post("/messages", {
			content: userInput.value,
		});
		console.log(response.data.code);
		if (response.data.code === 200) {
			tips.value = "留言发送成功!";
			setTimeout(() => {
				tips.value = "";
			}, 3000);
		}
	} catch (error) {
		console.error("Failed to fetch catalogs", error);
	}
};
</script>
<style scoped>
.modal-dev-log {
	width: 100%;
}
.modal-dev-log .modal-box {
	width: 100%;
	max-width: 550px;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: fit-content;
}

/* 添加展开状态的样式 */
.modal-dev-log .modal-box.expanded {
	height: 90vh;
	margin: auto;
}

.modal-box {
	transition: all 0.3s ease-in-out;
}
.terminal-title {
	position: relative;
	display: inline-block;
}

.terminal-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
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
	transition: all 0.3s ease-in-out;
	height: 100%;
	/* overflow-y: auto; */
}

.terminal-face {
	background-color: #0c0c0c;
	border: 3px solid #333;
	border-radius: 12px;
	padding: 2rem 1rem 1rem;
	transform: translateY(-4px);
	color: #33ff33;
	position: relative;
	overflow: hidden;
	box-shadow: inset 0 0 18px rgba(0, 255, 0, 0.1);
}

.terminal-face.article {
	min-height: 100%;
}

.terminal-face.panel {
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

.terminal-input-container {
	position: relative;
	margin: 1rem auto;
}

.input-prompt {
	position: absolute;
	top: 1rem;
	left: 0.5rem;
	color: #33ff33;
	font-family: "Fira Code", monospace;
	font-weight: bold;
	text-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
}

.terminal-input-container textarea {
	/* padding-left: 2rem; */
}

textarea {
	width: 100%;
	min-height: 200px;
	height: auto;
	background-color: rgba(51, 255, 51, 0.05);
	border: 2px solid #33ff33;
	border-radius: 4px;
	color: #33ff33;
	font-family: "Fira Code", monospace;
	padding: 1rem;
	margin: 1rem 0;
	resize: vertical;
	outline: none;
	font-size: 0.875rem;
	box-shadow: 0 0 12px rgba(51, 255, 51, 0.1);
	transition: all 0.3s ease;
}

textarea:focus {
	background-color: rgba(51, 255, 51, 0.08);
	border-color: #33ff33;
	box-shadow: 0 0 15px rgba(51, 255, 51, 0.2);
}

/* 添加自定义滚动条样式 */
textarea::-webkit-scrollbar {
	width: 8px;
}

textarea::-webkit-scrollbar-track {
	background: rgba(51, 255, 51, 0.05);
	border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb {
	background: rgba(51, 255, 51, 0.2);
	border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
	background: rgba(51, 255, 51, 0.3);
}

/* 添加闪烁的光标效果 */
textarea::placeholder {
	color: rgba(51, 255, 51, 0.3);
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
	pointer-events: none;
	z-index: 1;
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

/* 提交按钮样式 */
.terminal-submit {
	margin: 0.5rem auto;
	padding: 0.5rem 1.5rem;
	background: transparent;
	border: 2px solid #33ff33;
	color: #33ff33;
	font-family: "Fira Code", monospace;
	font-size: 0.875rem;
	border-radius: 4px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
}

/* 悬停效果 */
.terminal-submit:hover:not(:disabled) {
	background: rgba(51, 255, 51, 0.1);
	box-shadow: 0 0 15px rgba(51, 255, 51, 0.2);
	transform: translateY(-1px);
}

/* 点击效果 */
.terminal-submit:active:not(:disabled) {
	transform: translateY(1px);
	box-shadow: 0 0 8px rgba(51, 255, 51, 0.15);
}

/* 禁用状态 */
.terminal-submit:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	border-color: rgba(51, 255, 51, 0.3);
	color: rgba(51, 255, 51, 0.3);
}

/* 提交图标 */
.submit-icon {
	font-weight: bold;
	font-size: 1.1em;
}

/* 按钮文字 */
.submit-text {
	position: relative;
	z-index: 1;
}

/* 添加扫描线动画效果 */
.terminal-submit::before {
	content: "";
	position: absolute;
	top: -100%;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(transparent, rgba(51, 255, 51, 0.1), transparent);
	animation: scan 2s linear infinite;
	pointer-events: none;
}

@keyframes scan {
	0% {
		transform: translateY(0);
	}
	100% {
		transform: translateY(200%);
	}
}
</style>
