<template>
	<div
		class="navbar retro-nav w-full"
		style="z-index: 9999"
		:style="{
			background: isCategory || isProfile ? 'rgba(255,255,255,0.1)' : '#fff',
			'border-radius': isCategory || isMobile ? '0px' : '15px',
		}"
		v-if="!isEditor && !isLaunch && !isMochi"
	>
		<div class="container mx-auto flex justify-between items-center">
			<!-- Logo区域 -->
			<div class="flex-none">
				<a
					@click="goToHome"
					class="nav-brand btn btn-ghost hover:bg-transparent hover:text-inherit"
				>
					<!-- 桌面端显示 -->
					<img
						src="../assets/molidoki.png"
						alt="Bazinga Logo"
						class="logo-image hidden sm:block"
					/>
					<!-- 移动端显示 -->
					<img
						src="../assets/molidoki.png"
						alt="Bazinga Logo"
						class="logo-image block sm:hidden"
					/>
				</a>
			</div>

			<!-- 桌面端菜单 -->
			<div class="flex-none desktop-menu">
				<ul class="menu menu-horizontal gap-2">
					<li>
						<a
							class="retro-link"
							:class="{ active: route.path === '/' }"
							@click="goToHome()"
						>
							首页
						</a>
					</li>
					<li>
						<a
							class="retro-link"
							:class="{ active: route.path === '/collections' }"
							@click="goToLink('collections')"
						>
							合集
						</a>
					</li>
					<li>
						<a
							class="retro-link"
							:class="{ active: route.path === '/notebook' }"
							@click="goToLink('notebook')"
						>
							笔记本
						</a>
					</li>
					<li v-if="isLogin">
						<a
							class="retro-link"
							:class="{ active: route.path === '/profile' }"
							@click="goToLink('profile')"
						>
							个人资料
						</a>
					</li>
					<li v-if="isLogin">
						<a class="retro-link" @click="logout">
							<i class="bi bi-box-arrow-right"></i>
						</a>
					</li>
					<li v-if="!isLogin">
						<a class="retro-link" @click="goToLink('login')"> 登录 </a>
					</li>
				</ul>
			</div>

			<!-- 移动端汉堡菜单按钮 -->
			<div class="mobile-menu-toggle">
				<button
					@click="toggleMobileMenu"
					class="mobile-menu-btn"
					:class="{ active: isMobileMenuOpen }"
				>
					<span class="hamburger-line"></span>
					<span class="hamburger-line"></span>
					<span class="hamburger-line"></span>
				</button>
			</div>
		</div>

		<!-- 移动端下拉菜单 -->
		<div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
			<div class="mobile-menu-content w-full">
				<a
					class="mobile-menu-item"
					:class="{ active: route.path === '/' }"
					@click="handleMobileMenuClick('/')"
				>
					<i class="bi bi-house"></i>
					<span>首页</span>
				</a>
				<a
					class="mobile-menu-item"
					:class="{ active: route.path === '/collections' }"
					@click="handleMobileMenuClick('/collections')"
				>
					<i class="bi bi-collection"></i>
					<span>合集</span>
				</a>
				<a
					class="mobile-menu-item"
					:class="{ active: route.path === '/notebook' }"
					@click="handleMobileMenuClick('/notebook')"
				>
					<i class="bi bi-journal"></i>
					<span>笔记本</span>
				</a>
				<a
					v-if="isLogin"
					class="mobile-menu-item"
					:class="{ active: route.path === '/profile' }"
					@click="handleMobileMenuClick('/profile')"
				>
					<i class="bi bi-person"></i>
					<span>个人资料</span>
				</a>
				<a
					v-if="isLogin"
					class="mobile-menu-item logout"
					@click="handleMobileLogout"
				>
					<i class="bi bi-box-arrow-right"></i>
					<span>退出登录</span>
				</a>
				<a
					v-if="!isLogin"
					class="mobile-menu-item login"
					@click="handleMobileMenuClick('/login')"
				>
					<i class="bi bi-box-arrow-in-right"></i>
					<span>登录</span>
				</a>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { ref, watch, computed } from "vue";
import { useLoginStore } from "@/store/index";
import { useBreakpoint } from "@/composables/useBreakpoint";

const loginStore = useLoginStore();
const isLogin = computed(() => loginStore.isLogin);
const { setLoginState, setUserInfo } = loginStore;
const { isMobile } = useBreakpoint();

const router = useRouter();
const route = useRoute();
const username = ref("");
const isCategory = ref(false);
const isProfile = ref(false);
const isEditor = ref(false);
const isLaunch = ref(false);
const isMochi = ref(false);

// 移动端菜单状态
const isMobileMenuOpen = ref(false);

// 切换移动端菜单
const toggleMobileMenu = () => {
	isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// 处理移动端菜单点击
const handleMobileMenuClick = (path) => {
	if (path === "/") {
		goToHome();
	} else {
		goToLink(path.substring(1));
	}
	isMobileMenuOpen.value = false; // 关闭菜单
};

// 处理移动端退出登录
const handleMobileLogout = () => {
	logout();
	isMobileMenuOpen.value = false; // 关闭菜单
};

// 跳转到主页
const goToHome = () => {
	router.push("/");
};

// 跳转到其他页面
const goToLink = (path) => {
	router.push("/" + path);
};

// 登出逻辑
const logout = async () => {
	localStorage.removeItem("token");
	setLoginState(false);
	setUserInfo({});
	username.value = "";

	try {
		const { useCatStore } = await import("@/mochi/store/catStore");
		const catStore = useCatStore();
		catStore.$reset();
	} catch (error) {
		console.warn("Failed to reset catStore:", error);
	}

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

// 监听路由变化，关闭移动端菜单
watch(
	() => route.path,
	() => {
		isMobileMenuOpen.value = false;
	}
);

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

		if (newName === "CardEditor") {
			isEditor.value = true;
		} else {
			isEditor.value = false;
		}

		if (newName === "Mochi") {
			isMochi.value = true;
		} else {
			isMochi.value = false;
		}
	}
);
</script>

<style scoped>
/* 保持原有样式 */
.logo-image {
	height: 32px;
	width: auto;
	object-fit: contain;
	transition: all 0.3s ease;
	margin-top: 5px;
	margin-left: -5px;
}

.navbar {
	flex: 0 1 64px;
	position: relative;
	height: 44px;
	background: white;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	padding-left: 1rem;
	padding-right: 1rem;
}

.container {
	max-width: 1280px;
	height: 100%;
	width: 100%;
}

.nav-brand {
	font-size: 24px;
	font-weight: bold;
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.retro-link {
	padding: 0.5rem 0.75rem !important;
	font-size: 0.9rem;
	font-weight: 600;
	transform: skew(-6deg);
	transition: all 0.3s ease;
	background: transparent !important;
	border: 2px solid transparent;
	white-space: nowrap;
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

.retro-link.active {
	transform: skew(-6deg) scale(1.05);
	border: 2px solid #000;
	background: #fff !important;
	color: #222 !important;
}

.retro-link.active::after {
	transform: scaleX(1);
}

/* 移动端菜单样式 */
.mobile-menu-toggle {
	display: none;
}

.mobile-menu-btn {
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	width: 30px;
	height: 30px;
	background: transparent;
	border: none;
	cursor: pointer;
	padding: 0;
	z-index: 10;
	transition: all 0.3s ease;
}

.hamburger-line {
	width: 100%;
	height: 3px;
	background-color: #333;
	transition: all 0.3s ease;
	transform-origin: center;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
	transform: rotate(45deg) translate(6px, 6px);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
	opacity: 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
	transform: rotate(-45deg) translate(6px, -6px);
}

.mobile-menu {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: white;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	transform: translateY(-100%);
	opacity: 0;
	visibility: hidden;
	transition: all 0.3s ease;
	z-index: 999;
	border-radius: 0 0 15px 15px;
	overflow: hidden;
}

.mobile-menu.open {
	transform: translateY(0);
	opacity: 1;
	visibility: visible;
}

.mobile-menu-content {
	padding: 1rem 0;
}

.mobile-menu-item {
	display: flex;
	align-items: center;
	padding: 1rem 1.5rem;
	color: #333;
	text-decoration: none;
	transition: all 0.3s ease;
	border-bottom: 1px solid #f0f0f0;
	font-weight: 500;
	min-height: 60px; /* 增加触摸区域 */
}

.mobile-menu-item:last-child {
	border-bottom: none;
}

.mobile-menu-item i {
	margin-right: 12px;
	font-size: 1.2rem;
	width: 20px;
	text-align: center;
}

.mobile-menu-item:hover,
.mobile-menu-item.active {
	background-color: #f8f9fa;
	color: #007bff;
	transform: translateX(5px);
}

.mobile-menu-item.logout {
	color: #dc3545;
}

.mobile-menu-item.login {
	color: #28a745;
	font-weight: 600;
}

/* 响应式样式 */
@media (max-width: 768px) {
	.navbar {
		height: 56px; /* 移动端稍微降低高度 */
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.container {
		max-width: none;
	}

	.desktop-menu {
		display: none;
	}

	.mobile-menu-toggle {
		display: block;
	}

	.nav-brand {
		padding: 0.25rem;
		font-size: 18px;
	}

	/* 移动端 logo 图片变大 */
	.logo-image {
		height: 40px; /* 从 32px 增加到 40px */
		margin-top: 2px;
	}

	/* 汉堡菜单按钮变小 */
	.mobile-menu-btn {
		width: 36px; /* 减小按钮宽度 */
		height: 36px; /* 减小按钮高度 */
		padding: 6px; /* 减小内边距 */
	}

	.hamburger-line {
		height: 2px; /* 减小线条高度 */
		margin: 3px 0; /* 减小线条间距 */
	}
}

@media (max-width: 480px) {
	.navbar {
		height: 52px;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}

	/* 小屏幕下 logo 稍微调整 */
	.logo-image {
		height: 36px; /* 从 28px 增加到 36px */
	}

	/* 小屏幕下汉堡菜单按钮进一步调整 */
	.mobile-menu-btn {
		width: 32px;
		height: 32px;
		padding: 5px;
	}

	.mobile-menu-item {
		padding: 0.875rem 1rem;
		min-height: 56px;
	}
}

/* 深色主题适配 */
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

.navbar[data-theme="dark"] .retro-link.active {
	border-color: #fff;
	color: #fff;
}

.navbar[data-theme="dark"] .hamburger-line {
	background-color: #fff;
}

.navbar[data-theme="dark"] .mobile-menu {
	background: #1a1a1a;
	color: #fff;
}

.navbar[data-theme="dark"] .mobile-menu-item {
	color: #fff;
	border-bottom-color: #333;
}

.navbar[data-theme="dark"] .mobile-menu-item:hover,
.navbar[data-theme="dark"] .mobile-menu-item.active {
	background-color: #333;
	color: #007bff;
}
</style>
