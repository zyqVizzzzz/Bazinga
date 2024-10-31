<template>
	<transition name="fade">
		<div
			v-if="visible"
			class="text-gray-600"
			:class="['toast-container', toastTypeClass]"
			@mouseenter="clearTimer"
			@mouseleave="startTimer"
		>
			<span v-if="icon" class="icon">{{ icon }}</span>
			<span>{{ message }}</span>
		</div>
	</transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
	message: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		default: "info",
	},
	duration: {
		type: Number,
		default: 3000,
	},
});

const visible = ref(true);
let timer = null;

const icons = {
	success: "✔️",
	error: "❌",
	warning: "⚠️",
	info: "ℹ️",
};

const icon = computed(() => icons[props.type] || "ℹ️");

const toastTypeClass = computed(() => {
	switch (props.type) {
		case "success":
			return "toast-success";
		case "error":
			return "toast-error";
		case "warning":
			return "toast-warning";
		default:
			return "toast-info";
	}
});

const startTimer = () => {
	timer = setTimeout(() => {
		visible.value = false;
	}, props.duration);
};

const clearTimer = () => {
	if (timer) {
		clearTimeout(timer);
	}
};

onMounted(() => {
	startTimer();
});

onUnmounted(() => {
	clearTimer();
});
</script>

<style scoped>
.toast-container {
	position: fixed;
	top: 2rem;
	left: 50%;
	transform: translateX(-50%);
	padding: 20px 30px;
	color: #000;
	background: linear-gradient(
		135deg,
		rgba(255, 255, 255, 0.8),
		rgba(255, 255, 255, 0.9)
	);
	backdrop-filter: blur(8px); /* 背景模糊 */
	border: 1px solid rgba(255, 255, 255, 0.5); /* 半透明边框 */
	box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1), 0px 8px 24px rgba(0, 0, 0, 0.15); /* 更柔和的阴影 */
	z-index: 9999;
	transition: opacity 0.3s ease;
	min-width: 250px;
	text-align: left;
	border-radius: 8px;
	display: flex;
	align-items: center;
	gap: 12px;
	font-size: 1rem;
}

.icon {
	font-size: 1.25rem;
	opacity: 0.8;
}

/* Toast 类型阴影 */
.toast-success {
	box-shadow: 0 10px 15px -3px rgba(46, 204, 113, 0.4),
		0 4px 6px -4px rgba(46, 204, 113, 0.4);
}

.toast-error {
	box-shadow: 0 10px 15px -3px rgba(231, 76, 60, 0.4),
		0 4px 6px -4px rgba(231, 76, 60, 0.4);
}

.toast-warning {
	box-shadow: 0 10px 15px -3px rgba(241, 196, 15, 0.4),
		0 4px 6px -4px rgba(241, 196, 15, 0.4);
}

.toast-info {
	box-shadow: 0 10px 15px -3px rgba(52, 152, 219, 0.4),
		0 4px 6px -4px rgba(52, 152, 219, 0.4);
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
