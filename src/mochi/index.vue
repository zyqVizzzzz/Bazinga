<template>
	<div class="mochi-page-container">
		<MochiViewMobile />
	</div>
</template>

<script setup>
import { useRouter } from "vue-router";
import MochiViewMobile from "./MochiViewMobile.vue";

const router = useRouter();

const goBack = () => {
	router.go(-1);
};
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
