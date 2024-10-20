<script setup>
import Navbar from "@/layout/navbar.vue";
</script>

<template>
	<Navbar />
	<div class="content">
		<router-view></router-view>
	</div>
	<div class="copyright text-sm text-left text-gray-400">
		Copyright 2024 Bazinga · All rights reserved
	</div>
</template>

<style scoped>
.content {
	flex: 1 0 auto;
	min-height: 800px;
}
</style>
