<template>
	<transition name="fade">
		<div
			v-if="visible"
			class="text-gray-500"
			:class="['toast-container', toastTypeClass]"
			@mouseenter="clearTimer"
			@mouseleave="startTimer"
		>
			{{ message }}
		</div>
	</transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

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
		default: 3000, // Toast 显示时长
	},
});

const visible = ref(true);
let timer = null;

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
	background-color: #fff;
	font-weight: bold;
	box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
	z-index: 9999;
	transition: opacity 0.3s ease;
	min-width: 200px;
	text-align: center;
	border-radius: 0;
}

/* Toast 类型阴影 */
.toast-success {
	box-shadow: 0 10px 15px -3px rgba(var(--accent-color-rgb), 0.4),
		0 4px 6px -4px rgba(var(--accent-color-rgb), 0.4);
}

.toast-error {
	box-shadow: 0 10px 15px -3px rgba(255, 0, 0, 0.2),
		0 4px 6px -4px rgba(255, 0, 0, 0.2);
}

.toast-warning {
	box-shadow: 0px 4px 12px rgba(255, 165, 0, 0.3);
}

.toast-info {
	box-shadow: 0px 4px 12px rgba(0, 0, 255, 0.3);
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
