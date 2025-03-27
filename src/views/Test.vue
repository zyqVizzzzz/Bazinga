<template>
	<div class="container w-full mx-auto mt-10 pt-2">
		<!-- 标题 -->
		<div class="retro-title-box text-center mb-10">
			<h1 class="text-2xl font-bold">
				<div class="text-shadow-retro">
					<span><mark class="retro-highlight">URL 导入测试</mark></span>
				</div>
			</h1>
		</div>

		<!-- 输入区域 -->
		<div class="max-w-2xl mx-auto">
			<div class="flex gap-4 items-center">
				<input
					v-model="url"
					type="url"
					placeholder="请输入网页地址..."
					class="input input-bordered flex-1"
					:disabled="loading"
				/>
				<button
					class="retro-btn-medium"
					@click="importUrl"
					:disabled="loading || !url"
				>
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">
								<span
									v-if="loading"
									class="loading loading-spinner loading-xs"
								></span>
								<span v-else>导入</span>
							</div>
						</div>
					</div>
				</button>
			</div>

			<!-- 结果展示 -->
			<div v-if="content" class="mt-8 space-y-4">
				<!-- 统计信息 -->
				<div class="stats stats-vertical lg:stats-horizontal shadow w-full">
					<div class="stat">
						<div class="stat-title">总字数</div>
						<div class="stat-value text-lg">{{ content.totalLength }}</div>
					</div>
					<div class="stat">
						<div class="stat-title">段落数</div>
						<div class="stat-value text-lg">{{ content.paragraphCount }}</div>
					</div>
					<div class="stat">
						<div class="stat-title">平均长度</div>
						<div class="stat-value text-lg">{{ content.averageLength }}</div>
					</div>
				</div>

				<!-- 段落内容 -->
				<!-- 场景内容 -->
				<div
					v-if="content.scenes && content.scenes.length > 0"
					class="bg-base-100 rounded-lg border p-4"
				>
					<h3 class="font-bold mb-4">场景划分:</h3>
					<div class="space-y-6">
						<div
							v-for="(scene, sceneIndex) in content.scenes"
							:key="`scene-${sceneIndex}`"
							class="p-4 border rounded-lg bg-base-200"
						>
							<div class="flex justify-between items-center mb-2">
								<h4 class="font-bold">场景 {{ sceneIndex + 1 }}</h4>
								<span class="badge">{{ scene.length }}段</span>
							</div>
							<div class="space-y-3">
								<div
									v-for="(paragraph, paraIndex) in scene"
									:key="`para-${sceneIndex}-${paraIndex}`"
									class="text-sm leading-relaxed"
								>
									{{ paragraph }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { showToast } from "@/components/common/toast.js";
import apiClient from "@/api";

const url = ref("");
const loading = ref(false);
const content = ref(null);

const importUrl = async () => {
	if (!url.value || loading.value) return;

	try {
		loading.value = true;
		const response = await apiClient.post("/scripts/import-url", {
			url: url.value,
		});

		if (response.data.code === 200) {
			content.value = response.data.data.content;
			showToast({ message: "导入成功", type: "success" });
		} else {
			showToast({ message: response.data.message, type: "error" });
		}
	} catch (error) {
		console.error("导入失败:", error);
		showToast({
			message: error.response?.data?.message || "导入失败，请检查URL是否正确",
			type: "error",
		});
	} finally {
		loading.value = false;
	}
};
</script>

<style scoped>
.retro-title-box {
	position: relative;
	display: inline-block;
	padding: 1rem 3rem;
	margin: 0 auto;
}

.text-shadow-retro {
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2),
		-1px -1px 0 rgba(255, 255, 255, 0.2);
}

.retro-highlight {
	background: linear-gradient(
		transparent 60%,
		rgba(var(--secondary-color-rgb), 0.2) 40%
	);
	padding: 0 0.5rem;
	border-radius: 4px;
}

/* 按钮样式复用 Home.vue 的样式 */
.retro-btn-medium {
	position: relative;
	width: 8rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

.btn-shadow,
.btn-edge,
.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 8px;
}

.btn-shadow {
	background-color: #666;
	transform: translateY(2px);
}

.btn-edge {
	background-color: #b3b3b3;
	transform: translateY(-2px);
}

.btn-face {
	background-color: #f0f0f0;
	border: 2px solid #333;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	display: flex;
	align-items: center;
	justify-content: center;
}

.retro-btn-medium:hover .btn-face {
	background-color: white;
}

.retro-btn-medium:active .btn-edge,
.retro-btn-medium:active .btn-face {
	transform: translateY(0);
}

.retro-btn-medium[disabled] {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
