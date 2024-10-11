<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";

const isOpen = ref(false);
const router = useRouter();
const goToHome = () => {
	router.push("/");
};

const goToLink = (path) => {
	router.push("/" + path);
};

const closeDropdown = () => {
	isOpen.value = false; // 关闭下拉菜单
};

const logout = () => {
	// Logout logic here
};
</script>

<template>
	<div class="navbar bg-base-100 shadow-lg">
		<div class="flex-1">
			<a
				@click="goToHome"
				class="nav-brand btn btn-ghost text-xxl hover:bg-transparent hover:text-inherit"
				>Bazinga</a
			>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				<li @click="goToLink('notebook')">
					<a class="btn btn-white btn-ghost hover:text-inherit">Notebook</a>
				</li>
				<li @click="goToLink('profile')">
					<a class="btn btn-white btn-ghost hover:text-inherit">Profile</a>
				</li>

				<li @click="logout">
					<a class="btn btn-white btn-ghost hover:text-inherit">
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
			</ul>
		</div>
	</div>
	<div class="content">
		<router-view></router-view>
	</div>
</template>

<style scoped>
.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: filter 300ms;
}
.logo:hover {
	filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}

.navbar {
	flex: 0 1 64px;
}
.nav-brand {
	font-size: 24px;
}
.content {
	flex: 1 0 auto;
}

.dropdown-content {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Material 风格阴影 */
	border-radius: 8px;
}

img {
	border-radius: 50%;
}

hr {
	border: none;
	height: 1px;
	background-color: #e5e7eb;
}
</style>
