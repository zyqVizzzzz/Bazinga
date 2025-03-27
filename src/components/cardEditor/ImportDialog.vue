<template>
	<dialog id="import_dialog" class="modal">
		<div class="modal-box w-11/12 max-w-2xl">
			<h3 class="font-bold text-lg mb-4">输入网址</h3>

			<!-- URL输入区域 -->
			<div class="form-control w-full max-w-4xl mx-auto">
				<div class="relative w-full">
					<input
						v-model="url"
						type="url"
						placeholder="请输入网页地址..."
						class="input input-bordered w-full pr-24"
						:disabled="importing"
					/>
					<button
						class="btn absolute right-0 top-0 bottom-0 rounded-l-none"
						@click="importContent"
						:disabled="importing || !url"
					>
						<span
							v-if="importing"
							class="loading loading-spinner loading-xs"
						></span>
						<span>导入</span>
					</button>
				</div>
			</div>
			<div class="text-xs text-gray-500 mt-2">
				注：由于网页结构、网络差异等，部分网站可能无法正确导入内容。建议导入后检查预览内容是否完整。
			</div>

			<!-- 导入预览区域 -->
			<div v-if="content" class="mt-4 space-y-4">
				<!-- 统计信息 -->
				<div
					class="stats stats-vertical lg:stats-horizontal shadow w-full text-sm"
				>
					<div class="stat py-2">
						<div class="stat-title text-xs">总字数</div>
						<div class="stat-value text-base">{{ content.totalLength }}</div>
					</div>
					<div class="stat py-2">
						<div class="stat-title text-xs">段落数</div>
						<div class="stat-value text-base">{{ content.paragraphCount }}</div>
					</div>
					<div class="stat py-2">
						<div class="stat-title text-xs">场景数（自动划分）</div>
						<div
							class="stat-value text-base flex items-center justify-center gap-2"
						>
							{{ content.scenes?.length || 0 }}
							<span class="text-xs text-gray-400">AI优化</span>
						</div>
					</div>
				</div>

				<!-- 预览内容 -->
				<div class="bg-base-100 rounded-lg border p-4 max-h-96 overflow-y-auto">
					<h4 class="font-bold mb-2">内容预览:</h4>
					<div class="space-y-2 text-sm">
						<div
							v-for="(paragraph, index) in content.paragraphs"
							:key="index"
							class="text-left"
						>
							{{ paragraph }}
						</div>
					</div>
				</div>
			</div>

			<div v-if="content" class="mt-4 space-y-2">
				<!-- 导入选项 -->
				<div class="flex flex-col p-2 bg-base-200 rounded-lg">
					<div class="flex items-center gap-4">
						<div class="form-control">
							<label class="label cursor-pointer gap-2">
								<input
									type="radio"
									name="importType"
									class="radio radio-sm"
									value="scene"
									v-model="importType"
								/>
								<span class="label-text">按场景导入</span>
							</label>
						</div>
						<div class="form-control">
							<label class="label cursor-pointer gap-2">
								<input
									type="radio"
									name="importType"
									class="radio radio-sm"
									value="paragraph"
									v-model="importType"
								/>
								<span class="label-text">全部导入</span>
							</label>
						</div>
					</div>

					<!-- <div class="flex items-center gap-4">
						<div class="form-control">
							<label class="label cursor-pointer gap-2">
								<input
									type="radio"
									name="importMode"
									class="radio radio-sm"
									value="append"
									v-model="importMode"
								/>
								<span class="label-text">追加到末尾</span>
							</label>
						</div>
						<div class="form-control">
							<label class="label cursor-pointer gap-2">
								<input
									type="radio"
									name="importMode"
									class="radio radio-sm"
									value="replace"
									v-model="importMode"
								/>
								<span class="label-text">替换现有内容</span>
							</label>
						</div>
					</div> -->
				</div>
			</div>

			<!-- 按钮区域 -->
			<div class="modal-action flex justify-center">
				<form method="dialog" class="flex gap-2">
					<button
						v-if="content"
						class="btn btn-primary btn-sm"
						@click="confirmImport"
						:disabled="importing"
					>
						确认导入
					</button>
					<button class="btn btn-sm">取消</button>
				</form>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>关闭</button>
		</form>
	</dialog>
</template>

<script setup>
import { ref } from "vue";
import { showToast } from "@/components/common/toast.js";
import apiClient from "@/api";

const url = ref("");
const importing = ref(false);
const content = ref(null);
const importType = ref("scene"); // 导入类型：scene 或 paragraph
const importMode = ref("replace"); // 导入模式：replace 或 append

const importContent = async () => {
	if (!url.value || importing.value) return;

	try {
		importing.value = true;
		const response = await apiClient.post("/scripts/import-url", {
			url: url.value,
		});

		if (response.data.code === 200) {
			content.value = response.data.data.content;
			showToast({ message: "内容获取成功", type: "success" });
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
		importing.value = false;
	}
};

const confirmImport = () => {
	const importData = {
		content: content.value,
		type: importType.value,
		mode: importMode.value,
	};

	// 发送数据到父组件
	emit("confirm", importData);

	// 重置状态
	content.value = null;
	url.value = "";

	// 关闭弹窗
	document.getElementById("import_dialog").close();
};

// 提供打开方法给父组件
const openDialog = () => {
	document.getElementById("import_dialog").showModal();
};

const emit = defineEmits(["confirm"]);

defineExpose({
	openDialog,
});
</script>
