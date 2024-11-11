<template>
	<div class="story-module absolute">
		<div class="arrow-base arrow-story"></div>
		<div class="terminal-window">
			<!-- 终端标题栏 -->
			<div class="terminal-header">
				<span class="terminal-title">story_progress.log</span>
			</div>

			<!-- 终端内容 -->
			<div class="terminal-content">
				<div class="terminal-text">
					<p class="command-line">
						<span class="prompt">$</span>
						<span class="command">current_progress</span>
					</p>

					<div class="output-block">
						<p class="progress-line">
							<span class="indicator">[01]</span> 目前已完成
							<span class="highlight-primary mr-1">第 10 集</span>
							<span class="loading-dots">...</span>
						</p>

						<p class="progress-line">
							<span class="indicator">[02]</span> 下一个节点在
							<span class="highlight-primary mr-1">S02E05</span>
							<span class="loading-dots">...</span>
						</p>

						<p class="progress-line">
							<span class="indicator">[03]</span>
							请继续前行
						</p>
					</div>
				</div>

				<!-- 播放按钮 -->
				<div class="retro-button-container">
					<button class="retro-play-button mt-2">
						<div class="button-face">
							<div class="current-play">
								<img src="`../../assets/05.png`" alt="" width="200px" />
							</div>
						</div>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script></script>
<style scoped>
.story-module {
	top: -100px;
	right: -400px;
	z-index: 20;
}

.arrow-base {
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
}

.arrow-story {
	width: 100px;
	height: 100px;
	background-image: url("@/assets/5.png");
	position: absolute;
	bottom: 150px;
	left: -120px;
	transform: scaleX(-1) scaleY(-1) rotate(200deg);
	filter: drop-shadow(3px 3px 0 rgba(0, 0, 0, 0.2));
}

/* 终端窗口样式 */
.terminal-window {
	width: 300px;
	background: #1a1a1a;
	border: 3px solid #333;
	border-radius: 8px;
	box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
	overflow: hidden;
}

.terminal-header {
	background: #333;
	padding: 8px;
	display: flex;
	align-items: center;
}

.terminal-dot {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	margin-right: 6px;
}

.terminal-dot.red {
	background: #ff5f56;
}
.terminal-dot.yellow {
	background: #ffbd2e;
}
.terminal-dot.green {
	background: #27c93f;
}

.terminal-title {
	margin-left: 8px;
	color: #888;
	font-family: monospace;
	font-size: 12px;
}

/* 终端内容样式 */
.terminal-content {
	padding: 16px;
	color: #33ff33;
	font-family: monospace;
}

.command-line {
	margin-bottom: 12px;
}

.prompt {
	color: #ffbd2e;
	margin-right: 8px;
}

.command {
	color: #fff;
}

.output-block {
	margin-left: 16px;
	margin-bottom: 16px;
	text-align: left;
}

.progress-line {
	margin-bottom: 8px;
	line-height: 1.4;
}

.indicator {
	color: #888;
	margin-right: 8px;
}

.highlight-primary {
	color: var(--primary-color);
	font-weight: bold;
	text-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

/* 按钮样式 */
.retro-button-container {
	margin: 16px 0;
}

.retro-play-button {
	position: relative;
	width: 130px;
	height: 85px;
	border: none;
	background: none;
	cursor: pointer;
}

.button-shadow {
	position: absolute;
	inset: 0;
	background: #333;
	border-radius: 8px;
	transform: translateY(4px);
}

.button-edge {
	position: absolute;
	inset: 0;
	background: #444;
	border-radius: 8px;
	transform: translateY(-4px);
}

.button-face {
	position: absolute;
	inset: 0;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
	transform: translateY(-4px);
	overflow: hidden;
}

/* 状态框样式 */
.status-box {
	background: rgba(59, 130, 246, 0.1);
	border: 2px solid #3b82f6;
	border-radius: 4px;
	padding: 12px;
	position: relative;
	overflow: hidden;
}

/* 动画效果 */
@keyframes scan {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(100%);
	}
}

.blink {
	animation: blink 1s step-start infinite;
}

@keyframes blink {
	50% {
		opacity: 0;
	}
}

@keyframes glitch {
	0% {
		transform: translateX(0);
	}
	25% {
		transform: translateX(2px);
	}
	50% {
		transform: translateX(-2px);
	}
	75% {
		transform: translateX(1px);
	}
	100% {
		transform: translateX(0);
	}
}

.status-text {
	color: rgba(255, 255, 255, 0.9);
	font-size: 12px;
	margin-bottom: 4px;
}

.warning {
	color: #ffbd2e;
}

/* 扫描线效果 */
.terminal-window::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(
		transparent 50%,
		rgba(var(--primary-color-rgb), 0.2) 50%
	);
	background-size: 100% 4px;
	pointer-events: none;
}
</style>
