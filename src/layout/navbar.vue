<template>
	<div
		class="navbar bg-base-100 shadow-lg"
		style="z-index: 9999"
		:style="{
			background: isCategory || isProfile ? 'rgba(255,255,255,0.1)' : '#fff',
		}"
	>
		<div class="flex-1">
			<a
				@click="goToHome"
				class="nav-brand btn btn-ghost text-xxl hover:bg-transparent hover:text-inherit"
			>
				<!-- <img src="../assets/banner2.png" class="w-[144px]" alt="" /> -->
				Bazinga
			</a>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				<!-- 如果用户已登录，显示 Notebook 和 Profile -->
				<li>
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToHome()"
						>{{ t("nav.home") }}</a
					>
				</li>
				<li>
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToLink('collections')"
						>{{ t("nav.collections") }}</a
					>
				</li>
				<li>
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToLink('notebook')"
						>{{ t("nav.notes") }}</a
					>
				</li>
				<li v-if="isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="goToLink('profile')"
						>{{ t("nav.profile") }}</a
					>
				</li>
				<li v-if="isLogin">
					<a
						class="btn btn-white btn-ghost hover:text-inherit"
						@click="changeLanguage"
					>
						<i class="bi bi-translate text-xl"></i>
					</a>
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
						>{{ t("nav.login") }}</a
					>
				</li>
			</ul>
		</div>
	</div>
</template>
<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLoginStore } from "@/store/index";

const { t, locale } = useI18n();

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);
const { setLoginState, setUserInfo } = loginStore;

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
	setUserInfo({});
	username.value = "";

	// 获取当前路由的完整路径和查询参数
	const currentQuery = { ...route.query };
	const fullPath =
		route.path +
		(Object.keys(currentQuery).length > 0
			? "?" + new URLSearchParams(currentQuery).toString()
			: "");

	router.push({
		path: "/login",
		query: { redirect: fullPath },
	});
};

const changeLanguage = () => {
	if (t("app.lang") === "zh-CN") {
		locale.value = "en-US";
		localStorage.setItem("language", "en-US");
	} else {
		locale.value = "zh-CN";
		localStorage.setItem("language", "zh-CN");
	}
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
