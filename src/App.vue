<script setup>
import Navbar from "@/layout/navbar.vue";
</script>

<template>
	<Navbar />
	<div class="content">
		<router-view></router-view>
		<!-- <div class="copyright text-sm text-center text-gray-400 mt-10 mb-2">
			Copyright 2024 Bazinga · All rights reserved
		</div> -->
	</div>
</template>

<style scoped>
.content {
	flex: 1 0 auto;
	min-height: 500px;
}
</style>
