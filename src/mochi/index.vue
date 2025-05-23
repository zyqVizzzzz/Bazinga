<template>
	<div>
		<div class="tamagotchi-card" @click="window.mochi_modal.showModal()">
			<div class="card-shadow">
				<div class="card-edge">
					<div class="card-face">
						<div class="tamagotchi-frame">
							<div class="paw-icon"></div>
							<div class="tamagotchi-screen"></div>
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
		<!-- <button class="btn btn-primary" onclick="window.mochi_modal.showModal()">
			打开宠物游戏
		</button> -->

		<dialog id="mochi_modal" class="modal modal-mochi">
			<div
				class="modal-box w-11/12 max-w-5xl p-0 flex items-center justify-center mochi-container"
			>
				<form method="dialog" class="absolute right-6 top-6 z-[999]">
					<button class="btn btn-circle btn-ghost text-2xl hover-glow">
						<i class="bi bi-x"></i>
					</button>
				</form>
				<MochiView />
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>关闭</button>
			</form>
		</dialog>
	</div>
</template>

<script setup>
import MochiView from "./MochiView.vue";
</script>

<style scoped>
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

.tamagotchi-card {
	margin-top: 150px;
	margin: 150px auto;
	position: relative;
	width: 300px;
	height: 300px;
	cursor: pointer;
	transition: transform 0.3s;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.tamagotchi-card:hover {
	transform: translateY(-5px);
}

.tamagotchi-card:hover .card-edge,
.tamagotchi-card:hover .card-face {
	transform: translateY(-6px);
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

.tamagotchi-frame {
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

.tamagotchi-screen {
	width: 240px;
	height: 200px;
	background: #4a4a4a;
	border-radius: 10px;
	position: relative;
	border: 12px solid #d0d0d0;
	margin-top: 30px;
	margin-bottom: 30px;
}

.status-bar {
	width: 120px;
	height: 8px;
	background: #999;
	border-radius: 4px;
	margin-bottom: 25px;
}

.control-buttons {
	display: flex;
	gap: 20px;
	margin-top: auto;
	margin-bottom: 30px;
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

.tamagotchi-frame::after {
	content: "入学考试";
	position: absolute;
	bottom: 15px;
	left: 50%;
	transform: translateX(-50%);
	font-size: 14px;
	color: #666;
	white-space: nowrap;
}
</style>
