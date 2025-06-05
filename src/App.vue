<script setup>
import { onMounted } from "vue";
import Navbar from "@/layout/navbar.vue";
import apiClient from "@/api";
import { useLoginStore } from "@/store/index";
import { useMobile } from "@/composables/useBreakpoint";

const { isMobile } = useMobile();

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
	<div class="app-container">
		<Navbar v-if="$route.name !== 'molidoki'" />
		<div
			v-if="$route.name !== 'molidoki'"
			class="content"
			:class="{ 'mobile-content': isMobile }"
		>
			<router-view></router-view>
		</div>
		<div class="launch" v-else>
			<router-view></router-view>
		</div>
	</div>
</template>

<style scoped>
.app-container {
	/* min-height: 100vh; */
	/* background: linear-gradient(135deg, #f5f5f5, #e0e0e0); */
}

.content {
	flex: 1 0 auto;
	min-height: 600px;
	overflow-y: auto;
	padding: 0 1rem;
}

/* 移动端移除 padding */
.mobile-content {
	padding: 0 !important;
}

@media (max-width: 768px) {
	.content {
		padding: 0;
	}
}
</style>
