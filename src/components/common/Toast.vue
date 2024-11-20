<template>
	<Transition name="toast">
		<div
			v-if="visible"
			class="fixed top-1 left-1/2 transform -translate-x-1/2 z-9999"
			style="z-index: 9999"
		>
			<div
				class="toast-container"
				:class="[
					'flex items-center gap-3 px-6 py-3 bg-white',
					'text-lg min-w-[300px]',
					'transition-all duration-300 ease-in-out',
					colorClasses[type],
				]"
				:style="toastStyles"
				@mouseenter="clearTimer"
				@mouseleave="startTimer"
			>
				<span
					class="icon"
					v-html="icons[type]"
					style="position: relative; top: 1px"
				></span>
				<span>{{ message }}</span>
			</div>

			<!-- SVG Filters for sketchy effect -->
			<svg width="0" height="0" style="position: absolute">
				<defs>
					<filter id="sketchy-filter">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.01"
							numOctaves="3"
							result="noise"
						/>
						<feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
					</filter>
				</defs>
			</svg>
		</div>
	</Transition>
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
		validator: (value) =>
			["success", "error", "warning", "info"].includes(value),
	},
	duration: {
		type: Number,
		default: 3000,
	},
});

const visible = ref(true);
let timer = null;

// Icons with sketchy style
const icons = {
	success: `<svg xmlns="http://www.w3.org/2000/svg" 
    class="h-6 w-6 stroke-current" 
    fill="none" 
    viewBox="0 0 24 24" 
    style="filter: url(#sketchy-filter)">
    <path stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`,
	error: `<svg xmlns="http://www.w3.org/2000/svg" 
    class="h-6 w-6 stroke-current" 
    fill="none" 
    viewBox="0 0 24 24" 
    style="filter: url(#sketchy-filter)">
    <path stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`,
	warning: `<svg xmlns="http://www.w3.org/2000/svg" 
    class="h-6 w-6 stroke-current" 
    fill="none" 
    viewBox="0 0 24 24" 
    style="filter: url(#sketchy-filter)">
    <path stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>`,
	info: `<svg xmlns="http://www.w3.org/2000/svg" 
    class="h-6 w-6 stroke-current" 
    fill="none" 
    viewBox="0 0 24 24" 
    style="filter: url(#sketchy-filter)">
    <path stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`,
};

const colorClasses = {
	success: "border-green-600 text-green-600",
	error: "border-red-600 text-red-600",
	warning: "border-yellow-600 text-yellow-600",
	info: "border-blue-600 text-blue-600",
};

const toastStyles = computed(() => ({
	border: "3px solid currentColor",
	borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
	filter: "url(#sketchy-filter)",
	boxShadow: "1px 1px 0 currentColor",
}));

const startTimer = () => {
	clearTimer();
	timer = setTimeout(() => {
		visible.value = false;
	}, props.duration);
};

const clearTimer = () => {
	if (timer) {
		clearTimeout(timer);
		timer = null;
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
	padding: 10px 20px;
	background: linear-gradient(
		135deg,
		rgba(255, 255, 255, 0.8),
		rgba(255, 255, 255, 0.9)
	);
	backdrop-filter: blur(8px); /* 背景模糊 */
	box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1), 0px 4px 4px rgba(0, 0, 0, 0.15); /* 更柔和的阴影 */
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

/* 纹理 */
.toast-container::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.05) 2px,
		rgba(0, 0, 0, 0.01) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}

/* 光泽 */
.toast-container::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 50%;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
	border-radius: 9px 9px 0 0;
	pointer-events: none;
}

.icon {
	font-size: 1.25rem;
	opacity: 0.8;
	display: inline-flex;
	align-items: center;
}

/* Toast 类型阴影 */
.toast-success {
	color: rgba(34, 197, 94);
	box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.4),
		0 4px 6px -4px rgba(34, 197, 94, 0.4);
}
.toast-success::before {
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(34 197 94, 0.1) 2px,
		rgba(34 197 94, 0.03) 4px
	);
}

.toast-error {
	border-color: rgb(239 68 68 / var(--tw-text-opacity));
	color: rgb(239 68 68 / var(--tw-text-opacity));
	/* box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4),
		0 4px 6px -4px rgba(239, 68, 68, 0.4); */
}
.toast-error::before {
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(239, 68, 68, 0.1) 2px,
		rgba(239, 68, 68, 0.03) 4px
	);
}

.toast-warning {
	color: rgb(234 179 8 / var(--tw-text-opacity));
	box-shadow: 0 10px 15px -3px rgba(234, 179, 15, 0.4),
		0 4px 6px -4px rgba(234, 179, 15, 0.4);
}
.toast-warning::before {
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(234, 179, 15, 0.1) 2px,
		rgba(234, 179, 15, 0.03) 4px
	);
}

.toast-info {
	color: rgb(59 130 246 / var(--tw-text-opacity));
	box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4),
		0 4px 6px -4px rgba(59, 130, 246, 0.4);
}
.toast-warning::before {
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(59, 130, 246, 0.1) 2px,
		rgba(59, 130, 246, 0.03) 4px
	);
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

@keyframes wobble {
	0% {
		transform: translate(-50%, 0) rotate(0deg);
	}
	25% {
		transform: translate(-52%, 0) rotate(-2deg);
	}
	75% {
		transform: translate(-48%, 0) rotate(2deg);
	}
	100% {
		transform: translate(-50%, 0) rotate(0deg);
	}
}

.toast-enter-active,
.toast-leave-active {
	transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
	opacity: 0;
	transform: translateY(-20px) translateX(-50%);
}

/* Additional sketchy hover effect */
div:hover {
	/* transform: translateX(-50%) scale(1.02);
	transition: transform 0.2s ease; */
}

.icon {
	display: inline-flex;
	align-items: center;
}

/* Optional: Add some paper texture */
div {
	/* background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"); */
}
</style>
