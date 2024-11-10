<template>
	<div
		class="navbar bg-base-100 shadow-lg"
		style="z-index: 9999"
		:style="{
			background: isCategory || isProfile ? 'rgba(255,255,255,0)' : '#fff',
		}"
	>
		<div class="flex-1">
			<a
				@click="goToHome"
				class="nav-brand btn btn-ghost text-xxl hover:bg-transparent hover:text-inherit"
			>
				<img src="../assets/banner2.png" style="width: 144px" alt="" />
			</a>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				<!-- 如果用户已登录，显示 Notebook 和 Profile -->
				<li v-if="isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToHome()"
						>Home</a
					>
				</li>
				<li v-if="isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToLink('collections')"
						>Collections</a
					>
				</li>
				<li v-if="isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToLink('notebook')"
						>Notes</a
					>
				</li>
				<li v-if="isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToLink('profile')"
						>Profile</a
					>
				</li>
				<li v-if="isLogin">
					<a class="btn btn-white btn-ghost hover:text-inherit" @click="logout">
						<i class="bi bi-box-arrow-right text-xl"></i>
					</a>
				</li>

				<!-- 如果用户未登录，显示 Signup 和 Login -->
				<li v-if="!isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToLink('login')"
						>登录</a
					>
				</li>
			</ul>
		</div>
	</div>
</template>
<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, watch, computed } from "vue";

import { useLoginStore } from "@/store/index";
const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);
const { setLoginState } = loginStore;

const router = useRouter();
const route = useRoute();
const username = ref(""); // 保存已登录用户的名字
const isCategory = ref(false);
const isProfile = ref(false);

// 跳转到主页
const goToHome = () => {
	router.push("/");
};

// 跳转到其他页面
const goToLink = (path) => {
	router.push("/" + path);
};

// 登出逻辑
const logout = () => {
	localStorage.removeItem("token"); // 删除 JWT
	setLoginState(false);
	username.value = "";
	router.push({
		path: "/login",
		query: { redirect: route.fullPath }, // 将当前路径作为 query 参数传递给登录页面
	});
};

// 在挂载时检查登录状态
onMounted(() => {
	// checkLoginStatus();
});

watch(
	() => route.path,
	(newPath, oldPath) => {
		if (newPath.includes("collections")) {
			isCategory.value = true;
		} else {
			isCategory.value = false;
		}

		if (newPath.includes("profile")) {
			isProfile.value = true;
		} else {
			isProfile.value = false;
		}
	}
);
</script>
<style scoped>
.navbar {
	flex: 0 1 64px;
}
.nav-brand {
	font-size: 24px;
}
</style>
