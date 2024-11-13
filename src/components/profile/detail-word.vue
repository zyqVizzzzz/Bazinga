<template>
	<div class="word-module absolute">
		<div class="arrow-base arrow-word"></div>
		<div class="terminal-window right-aligned">
			<!-- 终端标题栏 -->
			<div class="terminal-header">
				<span class="terminal-title">vocabulary_stats.dat</span>
			</div>

			<!-- 终端内容 -->
			<div class="terminal-content">
				<div class="terminal-text">
					<p class="command-line text-xs">
						<span class="prompt">>></span>
						<span class="command">vocabulary.scan()</span>
					</p>

					<div class="output-block">
						<div class="stat-line">
							<span class="hex-prefix">0x01</span>
							<span class="stat-text">词汇库数量:</span>
							<span class="stat-value highlight-secondary">2</span>
							<span class="loading-dots">...</span>
						</div>

						<div class="stat-line">
							<span class="hex-prefix">0x02</span>
							<span class="stat-text">词汇块处理:</span>
							<span class="stat-value highlight-secondary">10</span>
							<span class="loading-dots">...</span>
						</div>
					</div>

					<!-- 状态框 -->
					<!-- <div class="status-box">
						<div class="scan-line"></div>
						<div class="matrix-bg"></div>
						<p class="status-text">
							<span class="system-text">[SYSTEM]</span>
							词汇模块损坏修复中<span class="blink">_</span>
						</p>
						<p class="status-text">
							<span class="hex-prefix">&gt;</span>
							请继续探索<span class="blink">_</span>
						</p>
					</div> -->
				</div>
			</div>
		</div>
	</div>
</template>
<script></script>
<style scoped>
.word-module {
	top: -140px;
	left: -400px;
	z-index: 20;
}

.arrow-base {
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
}

.arrow-word {
	width: 100px;
	height: 70px;
	background-image: url("@/assets/6.png");
	background-size: 100% 100%;
	position: absolute;
	top: 105px;
	right: -125px;
	transform: scaleX(-1) rotate(30deg);
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
	font-family: "Fira Code", monospace;
}

.terminal-header {
	background: #333;
	padding: 8px;
	display: flex;
	align-items: center;
}

.terminal-title {
	margin-left: 8px;
	color: #888;
	font-size: 12px;
}

/* 终端内容样式 */
.terminal-content {
	padding: 16px;
	color: #00ff00;
}

.command-line {
	text-align: left;
	margin-bottom: 16px;
}

.prompt {
	color: #ffbd2e;
	margin-right: 8px;
}

.command {
	color: #fff;
}

/* 状态行样式 */
.stat-line {
	text-align: left;
	margin-bottom: 8px;
	font-size: 14px;
}

.hex-prefix {
	color: #888;
	margin-right: 8px;
	font-size: 12px;
}

.stat-text {
	color: #00ff00;
}

.stat-value {
	font-size: 1rem;
	color: var(--secondary-color);
	font-weight: bold;
	text-shadow: 0 0 8px rgba(255, 105, 180, 0.5);
	margin: 0 4px;
}

.highlight-secondary {
	color: var(--secondary-color);
	text-shadow: 0 0 8px rgba(255, 105, 180, 0.5);
}

/* 错误效果 */
.error-text {
	color: #ff5f56;
	animation: glitch 0.3s ease infinite;
}

/* 状态框 */
.status-box {
	margin-top: 16px;
	padding: 12px;
	background: rgba(255, 105, 180, 0.1);
	border: 2px solid #ff69b4;
	border-radius: 4px;
	position: relative;
	overflow: hidden;
}

.scan-line {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 2px;
	background: rgba(255, 105, 180, 0.5);
	animation: scan 2s linear infinite;
}

.matrix-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: repeating-linear-gradient(
		0deg,
		rgba(255, 105, 180, 0.05) 0px,
		rgba(255, 105, 180, 0.05) 1px,
		transparent 1px,
		transparent 2px
	);
	pointer-events: none;
}

.status-text {
	color: #ff69b4;
	font-size: 12px;
	margin-bottom: 4px;
	text-align: left;
}

.system-text {
	color: #888;
	margin-right: 8px;
}

/* 动画效果 */
.loading-dots {
	animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
	0%,
	20% {
		content: ".";
	}
	40% {
		content: "..";
	}
	60% {
		content: "...";
	}
	80%,
	100% {
		content: "";
	}
}

@keyframes scan {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(100%);
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

.blink {
	animation: blink 1s step-end infinite;
}

@keyframes blink {
	50% {
		opacity: 0;
	}
}

/* CRT效果 */
.terminal-window::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(
		rgba(255, 105, 180, 0.1) 50%,
		rgba(0, 0, 0, 0.1) 50%
	);
	background-size: 100% 4px;
	pointer-events: none;
	animation: flicker 0.15s infinite;
}

@keyframes flicker {
	0% {
		opacity: 0.97;
	}
	50% {
		opacity: 0.95;
	}
	100% {
		opacity: 0.98;
	}
}
</style>
