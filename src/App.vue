<script setup>
import { ref, computed, onMounted } from "vue";
import Navbar from "@/layout/navbar.vue";
import apiClient from "@/api";
import { useLoginStore } from "@/store/index";

const loginStore = useLoginStore();
const { setLoginState, setUserInfo } = loginStore;
const isLogin = computed(() => loginStore.isLogin);

const getUserProfile = async () => {
	try {
		const res = await apiClient.get("/users/me");
		if (res.data.code === 200) {
			setLoginState(true);
			setUserInfo(res.data.data);
		}
	} catch (error) {
		console.log(error);
	}
};

onMounted(async () => {
	if (localStorage.token) {
		await getUserProfile();
	}
});
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
