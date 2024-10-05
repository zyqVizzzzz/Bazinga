<script setup></script>

<template>
	<div class="navbar bg-base-100">
		<div class="flex-1">
			<a class="nav-brand btn btn-ghost text-xxl">Bazinga!!!</a>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				<li><a>About</a></li>
				<li>
					<details>
						<summary>Muztagh</summary>
						<ul class="bg-base-100 rounded-t-none p-2">
							<li><a>Link 1</a></li>
							<li><a>Link 2</a></li>
						</ul>
					</details>
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
	/* display: flex;
	align-items: center;
	justify-content: center;
	margin-top: -140px; */
}
</style>
