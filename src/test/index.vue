<template>
	<div class="navbar bg-base-100">
		<div class="flex-1">
			<a @click="goToHome" class="nav-brand btn btn-ghost text-xxl">Bazinga</a>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				<li>
					<details>
						<summary>Muztagh</summary>
						<ul class="bg-base-100 rounded-t-none p-2">
							<li><a>个人主页</a></li>
						</ul>
					</details>
				</li>
				<li><a>退出</a></li>
			</ul>
		</div>
	</div>
</template>
