<template>
	<transition name="fade">
		<div
			v-show="visible"
			class="text-gray-600 flex items-center font-bold"
			:class="['toast-container', toastTypeClass]"
			@mouseenter="clearTimer"
			@mouseleave="startTimer"
		>
			<span v-if="icon" class="icon" v-html="icon"></span>
			<span class="relative" style="top: -2px">{{ message }}</span>
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

// SVG 图标
const icons = {
	success: `<svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6 shrink-0 stroke-current text-green-500"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`,
	error: ` <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6 shrink-0 stroke-current text-red-500"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`,
	warning: `<svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6 shrink-0 stroke-current text-yellow-500"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>`,
	info: `<svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    class="h-6 w-6 shrink-0 stroke-current text-blue-500">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>`,
};

const icon = computed(() => icons[props.type] || icons.info);

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
	padding: 10px 30px;
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
	font-size: 0.9rem;
}

.icon {
	font-size: 1.25rem;
	opacity: 0.8;
	display: inline-flex;
	align-items: center;
}

/* Toast 类型阴影 */
.toast-success {
	color: rgb(34 197 94 / var(--tw-text-opacity));
	box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.4),
		0 4px 6px -4px rgba(34, 197, 94, 0.4);
}

.toast-error {
	color: rgb(239 68 68 / var(--tw-text-opacity));
	box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4),
		0 4px 6px -4px rgba(239, 68, 68, 0.4);
}

.toast-warning {
	color: rgb(234 179 8 / var(--tw-text-opacity));
	box-shadow: 0 10px 15px -3px rgba(234, 179, 15, 0.4),
		0 4px 6px -4px rgba(234, 179, 15, 0.4);
}

.toast-info {
	color: rgb(59 130 246 / var(--tw-text-opacity));
	box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4),
		0 4px 6px -4px rgba(59, 130, 246, 0.4);
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
