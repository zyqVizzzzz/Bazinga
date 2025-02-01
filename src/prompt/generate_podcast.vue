<template>
	<div class="container mx-auto my-10 py-6">
		<div class="flex gap-6">
			<!-- 左侧操作区 -->
			<div class="w-1/2">
				<div class="card bg-base-100 border-4 border-black">
					<div class="card-body">
						<h2
							class="card-title font-bold -skew-x-6 text-2xl text-shadow mb-4"
						>
							知识点
						</h2>

						<!-- 知识点列表 -->
						<div
							class="p-4 bg-white border-2 border-black rounded-lg dialogue-box mb-6"
						>
							<div
								class="mb-4 p-3 border-2 border-dashed border-gray-300 rounded"
							>
								<h3 class="font-bold mb-2">crazy</h3>
								<p class="text-sm text-gray-600">adj. 疯狂的，古怪的</p>
								<p class="text-sm text-gray-500 mt-1">
									Example: Don't be crazy!
								</p>
							</div>
							<div
								class="mb-4 p-3 border-2 border-dashed border-gray-300 rounded"
							>
								<h3 class="font-bold mb-2">test</h3>
								<p class="text-sm text-gray-600">v. 测试，检验</p>
								<p class="text-sm text-gray-500 mt-1">
									Example: I need to test this theory.
								</p>
							</div>
						</div>

						<!-- 生成按钮 -->
						<div class="flex justify-center">
							<button class="retro-btn option" @click="generatePodcast">
								<div class="btn-shadow">
									<div class="btn-edge">
										<div
											class="btn-face flex items-center justify-center gap-2"
										>
											<i class="bi bi-music-note-beamed text-xl"></i>
											<span>生成</span>
										</div>
									</div>
								</div>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- 右侧预览区 -->
			<div class="w-1/2">
				<div class="card bg-base-100 border-4 border-black h-full">
					<div class="card-body">
						<h2
							class="card-title font-bold -skew-x-6 text-2xl text-shadow mb-4"
						>
							播客内容预览
						</h2>

						<div
							class="flex-1 p-4 bg-white border-2 border-black rounded-lg knowledge-box"
						>
							<div
								class="h-full flex items-center justify-center text-gray-400"
							>
								<p>生成内容将显示在此处</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
const generatePodcast = () => {
	console.log("Generating podcast content...");
};
</script>

<style scoped>
.text-shadow {
	text-shadow: 2px 2px 0 rgba(var(--primary-color-rgb), 0.3);
}

.dialogue-box {
	box-shadow: 4px 4px 0 rgba(var(--primary-color-rgb), 0.3);
}

.knowledge-box {
	box-shadow: -4px 4px 0 rgba(var(--secondary-color-rgb), 0.3);
	min-height: 400px;
}

/* 继承 CardPreview.vue 的按钮样式 */
.retro-btn {
	position: relative;
	width: 8rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
	transition: transform 0.1s;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 12px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 12px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	border: 3px solid #333;
	border-radius: 12px;
	color: #333;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.retro-btn:hover .btn-face {
	background-color: #fff;
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face {
	transform: translateY(0);
}
</style>
