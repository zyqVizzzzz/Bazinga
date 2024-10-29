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
				>Bazinga!!!</a
			>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				<!-- 如果用户已登录，显示 Notebook 和 Profile -->
				<li v-if="isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToHome()"
						>首页</a
					>
				</li>
				<li v-if="isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToLink('notebook')"
						>笔记</a
					>
				</li>
				<li v-if="isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToLink('profile')"
						>个人主页</a
					>
				</li>
				<li v-if="isLogin">
					<a class="btn btn-white btn-ghost hover:text-inherit" @click="logout">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
							/>
						</svg>
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
		if (newPath.includes("category")) {
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
