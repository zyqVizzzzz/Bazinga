<template>
	<div class="fixed-action-buttons">
		<div class="tooltip" data-tip="退出">
			<button class="retro-btn" @click="$emit('back')">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">
							<i class="bi bi-box-arrow-left text-lg"></i>
						</div>
					</div>
				</div>
			</button>
		</div>

		<div class="tooltip" data-tip="保存">
			<button class="retro-btn" @click="$emit('save')" :disabled="!isCustom">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">
							<i class="bi bi-floppy text-lg"></i>
						</div>
					</div>
				</div>
			</button>
		</div>

		<div class="tooltip" data-tip="视图">
			<button
				class="retro-btn"
				@click="$emit('toggle-view')"
				:disabled="!isCustom"
			>
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">
							<i class="bi" :class="viewModeIcon"></i>
						</div>
					</div>
				</div>
			</button>
		</div>

		<div class="tooltip" data-tip="使用说明">
			<button class="retro-btn" @click="$emit('open-guide')">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">
							<i class="bi bi-question-circle text-lg"></i>
						</div>
					</div>
				</div>
			</button>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
	viewMode: {
		type: String,
		required: true,
	},
	isCustom: {
		type: Boolean,
		default: true,
	},
});

defineEmits(["back", "save", "toggle-view", "open-guide"]);

const viewModeIcon = computed(() => ({
	"bi-layout-split": props.viewMode === "both",
	"bi-layout-text-window": props.viewMode === "editor",
	"bi-layout-text-sidebar": props.viewMode === "card",
}));
</script>

<style scoped>
/* 悬浮按钮组样式 */
.fixed-action-buttons {
	position: fixed;
	right: 20px;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	flex-direction: column;
	gap: 15px;
	z-index: 100;
	background-color: rgba(255, 255, 255, 0.8);
	padding: 12px;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(5px);
}

/* 确保tooltip正确显示 */
.fixed-action-buttons .tooltip {
	margin: 5px 0;
}

.retro-btn {
	position: relative;
	width: 36px;
	height: 36px;
	border: none;
	background: none;
	cursor: pointer;
}

.retro-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 6px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 6px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	border: 2px solid #333;
	border-radius: 6px;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 按钮交互效果 */
.retro-btn:hover:not(:disabled) .btn-face {
	background-color: white;
}

.retro-btn:active:not(:disabled) .btn-edge,
.retro-btn:active:not(:disabled) .btn-face {
	transform: translateY(0);
}
</style>
