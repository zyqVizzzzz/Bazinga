<template>
	<div
		class="molidoki-page min-h-screen flex flex-col items-center justify-center p-8"
	>
		<div class="max-w-3xl mx-auto text-center space-y-8">
			<h1 class="text-4xl font-bold mb-6">Moli-Doki</h1>

			<div class="mt-12 space-y-4">
				<div class="flex justify-center gap-8">
					<a
						href="https://bazinga.molidoki.com"
						class="hover:text-primary transition-colors"
					>
						Bazinga - Tell a Friend
					</a>
				</div>
			</div>
		</div>

		<!-- 备案信息 -->
		<div class="mt-auto pt-12 text-center text-gray-400 text-sm">
			<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
				浙ICP备2025161223号
			</a>
		</div>
	</div>
</template>

<script setup>
// 暂时不需要任何逻辑
import { onMounted, onUnmounted } from "vue";

onMounted(() => {
	document.getElementById("app").classList.add("launch");
});

onUnmounted(() => {
	document.getElementById("app").classList.remove("launch");
});
</script>

<style scoped>
.molidoki-page {
	/* background-color: #fafafa; */
}
</style>
