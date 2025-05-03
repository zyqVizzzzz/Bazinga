<script setup>
import { onMounted } from "vue";
import Navbar from "@/layout/navbar.vue";
import apiClient from "@/api";
import { useLoginStore } from "@/store/index";

const loginStore = useLoginStore();
const { setLoginState, setUserInfo } = loginStore;

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
	<Navbar v-if="$route.name !== 'molidoki'" />
	<div v-if="$route.name !== 'molidoki'" class="content">
		<router-view></router-view>
	</div>
	<div class="launch" v-else>
		<router-view></router-view>
	</div>
</template>

<style scoped>
.content {
	flex: 1 0 auto;
	min-height: 600px;
	min-width: 1200px;
}
</style>
