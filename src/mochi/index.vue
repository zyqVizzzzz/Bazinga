<template>
	<div
		class="mochi-page-container mochi-fullwidth"
		:class="{
			'w-11/12  p-0 flex items-center justify-center mochi-container':
				!isMobile,
			'w-full': isMobile,
		}"
	>
		<MochiViewMobile v-if="isMobile" />
		<MochiView v-else />
	</div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useBreakpoint } from "@/composables/useBreakpoint";
import MochiViewMobile from "./MochiViewMobile.vue";
import MochiView from "./MochiView.vue";
import { onMounted, onUnmounted } from "vue";

const { isMobile } = useBreakpoint();

onMounted(() => {
	const appElement = document.getElementById("app");
	if (appElement) {
		appElement.classList.add("mochi-fullwidth");
	}
});

onUnmounted(() => {
	const appElement = document.getElementById("app");
	if (appElement) {
		appElement.classList.remove("mochi-fullwidth");
	}
});
</script>

<style scoped>
.mochi-page-container {
	width: 100%;
	min-height: 100vh;
	background-color: var(--background-color);
	position: relative;
}

.back-button-container {
	position: fixed;
	top: 1rem;
	left: 1rem;
	z-index: 100;
}

.back-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	background-color: rgba(0, 0, 0, 0.5);
	color: white;
	border: none;
	border-radius: 4px;
	font-family: var(--pixel-font);
	cursor: pointer;
}
</style>
