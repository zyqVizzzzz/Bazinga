<template>
	<div>
		<button class="btn btn-primary" onclick="window.mochi_modal.showModal()">
			打开宠物游戏
		</button>

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
</style>
