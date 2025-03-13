<template>
	<div
		class="navbar retro-nav w-full"
		style="z-index: 9999"
		:style="{
			background: isCategory || isProfile ? 'rgba(255,255,255,0.1)' : '#fff',
			'border-radius': isCategory ? '0px' : '15px',
		}"
	>
		<div class="container mx-auto px-4 flex justify-between items-center">
			<div class="flex-none">
				<a
					@click="goToHome"
					class="nav-brand btn btn-ghost hover:bg-transparent hover:text-inherit"
				>
					Bazinga!
				</a>
			</div>
			<div class="flex-none">
				<ul class="menu menu-horizontal gap-2">
					<li>
						<a class="retro-link" @click="goToHome()">
							{{ t("nav.home") }}
						</a>
					</li>
					<li>
						<a class="retro-link" @click="goToLink('collections')">
							{{ t("nav.collections") }}
						</a>
					</li>
					<li>
						<a class="retro-link" @click="goToLink('notebook')">
							{{ t("nav.notes") }}
						</a>
					</li>
					<li v-if="isLogin">
						<a class="retro-link" @click="goToLink('profile')">
							{{ t("nav.profile") }}
						</a>
					</li>
					<li v-if="isLogin">
						<a class="retro-link" @click="logout">
							<i class="bi bi-box-arrow-right"></i>
						</a>
					</li>
					<li v-if="!isLogin">
						<a class="retro-link" @click="goToLink('login')">
							{{ t("nav.login") }}
						</a>
					</li>
				</ul>
			</div>
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
	() => route.name,
	(newName, oldName) => {
		if (newName === "Collection") {
			isCategory.value = true;
		} else {
			isCategory.value = false;
		}

		if (newName === "Profile") {
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

.navbar {
	height: 64px;
	background: white;
	/* border-bottom: 2px solid #e6e6e6; */
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(8px);
	/* border-radius: 15px; */
}

.container {
	max-width: 1280px;
	height: 100%;
}

.nav-brand {
	font-size: 24px; /* 稍微减小字体大小 */
	font-weight: bold;
	transform: skew(-6deg);
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
	padding: 0.5rem 1rem;
	transition: all 0.3s ease;
}

.retro-link {
	padding: 0.5rem 0.75rem !important; /* 减小内边距 */
	font-size: 0.9rem; /* 稍微减小字体大小 */
	font-weight: 600;
	transform: skew(-6deg);
	transition: all 0.3s ease;
	background: transparent !important;
	border: 2px solid transparent;
	white-space: nowrap; /* 防止文字换行 */
}

.retro-link:hover {
	transform: skew(-6deg) scale(1.05);
	border: 2px solid #000;
	background: #fff !important;
	color: #222;
}

.retro-link::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 2px;
	background: #666;
	transform: scaleX(0);
	transition: transform 0.3s ease;
}

.retro-link:hover::after {
	transform: scaleX(1);
}

/* 适配深色背景 */
.navbar[data-theme="dark"] {
	background: rgba(0, 0, 0, 0.8);
	border-bottom: 4px solid #fff;
}

.navbar[data-theme="dark"] .retro-link {
	color: #fff;
}

.navbar[data-theme="dark"] .retro-link:hover {
	border-color: #fff;
}

.navbar[data-theme="dark"] .retro-link::after {
	background: #fff;
}
</style>
