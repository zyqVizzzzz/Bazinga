<template>
	<div class="flex justify-center items-center my-20">
		<div class="card w-full max-w-lg shadow-lg bg-white rounded-lg p-6">
			<h1 class="text-2xl font-semibold text-center mb-4">新增合集</h1>
			<form @submit.prevent="submitNote" class="space-y-4">
				<!-- 中文名 -->
				<div class="form-control">
					<label for="showName" class="label">
						<span class="label-text"
							>合集名<span class="text-red-500">*</span></span
						>
					</label>
					<input
						v-model="noteForm.showName"
						type="text"
						id="showName"
						class="input input-bordered w-full"
						:class="{ 'border-red-500': showError && !noteForm.showName }"
						placeholder="请输入合集名"
					/>
				</div>

				<!-- 英文名 -->
				<div class="form-control">
					<label for="name" class="label">
						<span class="label-text">副标题</span>
					</label>
					<input
						v-model="noteForm.name"
						type="text"
						id="name"
						class="input input-bordered w-full"
						placeholder="请输入副标题"
					/>
				</div>

				<!-- 封面图上传 -->
				<div class="form-control">
					<label for="banner" class="label">
						<span class="label-text">封面图上传</span>
					</label>
					<!-- 预览和上传区域 -->
					<div
						class="upload-area bg-gray-200 flex items-center justify-center rounded-lg cursor-pointer relative"
						@click="triggerFileInput"
					>
						<!-- 如果没有选择图片，显示上传图标和提示文本 -->
						<template v-if="!bannerPreview">
							<div class="text-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-6 mx-auto"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
									/>
								</svg>

								<span class="text-gray-600 text-sm">点击上传封面图</span>
							</div>
						</template>

						<!-- 如果已经选择图片，显示封面图预览 -->
						<template v-else>
							<img
								:src="bannerPreview"
								alt="封面图预览"
								class="absolute inset-0 w-full h-full object-cover rounded-lg"
							/>
						</template>
					</div>

					<!-- 隐藏原始 input 文件上传控件 -->
					<input
						ref="fileInput"
						@change="handleFileUpload"
						type="file"
						id="banner"
						class="hidden"
						accept="image/*"
					/>
				</div>

				<!-- 描述 -->
				<div class="form-control">
					<label for="description" class="label">
						<span class="label-text">描述</span>
					</label>
					<textarea
						v-model="noteForm.description"
						id="description"
						class="textarea textarea-bordered w-full"
						placeholder="请输入描述"
					></textarea>
				</div>

				<!-- 难度 -->
				<div class="form-control">
					<label for="difficulty" class="label">
						<span class="label-text">难度 (1-5)</span>
					</label>
					<input
						v-model="noteForm.difficulty"
						type="range"
						id="difficulty"
						class="range range-primary w-full custom-range"
						min="1"
						max="5"
					/>
					<div class="text-center mt-2 text-sm">
						难度: {{ noteForm.difficulty }}
					</div>
				</div>

				<!-- 难度描述 -->
				<div class="form-control">
					<label for="difficultyDetails" class="label">
						<span class="label-text">难度描述</span>
					</label>
					<textarea
						v-model="noteForm.difficultyDetails"
						id="difficultyDetails"
						class="textarea textarea-bordered w-full"
						placeholder="请输入难度描述"
					></textarea>
				</div>

				<!-- 主题色 -->
				<div class="form-control">
					<label for="theme" class="label">
						<span class="label-text">主题色</span>
					</label>
					<input
						v-model="noteForm.theme"
						@input="updateThemePreview"
						type="color"
						id="theme"
						class="input input-bordered w-full color-picker"
					/>
				</div>

				<!-- 提交按钮 -->
				<div class="flex justify-center">
					<button
						type="submit"
						class="btn w-full mt-6"
						:style="{ backgroundColor: noteForm.theme, color: '#fff' }"
					>
						提交
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";

const router = useRouter();

// 表单数据
const noteForm = ref({
	showName: "",
	description: "",
	difficulty: 3,
	difficultyDetails: "",
	banner: "",
	name: "",
	theme: "#7a81d5",
});

// 即时预览数据
const bannerPreview = ref("");
const showError = ref(false);
const fileInput = ref(null);

// 打开文件上传对话框
const triggerFileInput = () => {
	fileInput.value.click();
};

// 文件上传处理函数
const handleFileUpload = (event) => {
	const file = event.target.files[0];
	if (file) {
		noteForm.value.bannerFile = file; // 存储文件到表单数据

		// 生成本地预览URL
		bannerPreview.value = URL.createObjectURL(file);
	}
};

// 方法：更新封面图预览
const updateBannerPreview = () => {
	bannerPreview.value = noteForm.value.banner;
};

// 方法：更新主题色预览
const updateThemePreview = () => {
	// 在选择主题色时更新按钮的颜色
};

// 提交表单
const submitNote = async () => {
	// 检查必填项是否填写
	showError.value = !noteForm.value.showName;
	if (showError.value) return;

	if (noteForm.value.bannerFile) {
		// 上传封面图
		const bannerUrl = await uploadBanner(noteForm.value.bannerFile);
		noteForm.value.banner = bannerUrl; // 将封面图 URL 添加到表单数据中
	}

	console.log(noteForm.value);

	try {
		await apiClient.post("/catalogs", noteForm.value);
		alert("笔记新增成功！");
		router.push("/all-collections"); // 提交成功后跳转到笔记列表页
	} catch (error) {
		console.error("Failed to create note:", error);
		alert("笔记新增失败，请重试！");
	}
};

const uploadBanner = async (file) => {
	const formData = new FormData();
	formData.append("file", file);

	try {
		const response = await apiClient.post("/catalogs/upload-banner", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data.url; // 返回文件的URL
	} catch (error) {
		console.error("Failed to upload banner:", error);
	}
};
</script>

<style scoped>
/* 主要样式调整通过 DaisyUI 和 Tailwind CSS 完成 */
/* 自定义滑块样式 */
.custom-range {
	-webkit-appearance: none; /* 清除默认样式 */
	appearance: none;
	height: 16px;
	background-color: #fff; /* 滑轨颜色 */
	border-radius: 10px;
}

/* 滑块填充部分的颜色 */
.custom-range::-webkit-slider-runnable-track {
	height: 6px;
	background-color: #ddd;
	border-radius: 4px;
}

.custom-range::-moz-range-track {
	height: 6px;
	background-color: #ddd;
	border-radius: 4px;
}

.custom-range::-ms-track {
	height: 6px;
	background-color: #ddd;
	border-radius: 4px;
}

/* 滑块圆点样式 */
.custom-range::-webkit-slider-thumb {
	-webkit-appearance: none; /* 清除默认样式 */
	appearance: none;
	width: 16px;
	height: 16px;
	background-color: #fff; /* 滑块颜色 */
	border-radius: 50%;
	cursor: pointer;
	transition: background-color 0.2s ease; /* 平滑过渡 */
}

.custom-range::-moz-range-thumb {
	width: 16px;
	height: 16px;
	background-color: #fff;
	border-radius: 50%;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.custom-range::-ms-thumb {
	width: 16px;
	height: 16px;
	background-color: #fff;
	border-radius: 50%;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

/* 悬停和聚焦时滑块圆点的样式 */
.custom-range:hover::-webkit-slider-thumb,
.custom-range:focus::-webkit-slider-thumb {
	background-color: #fff; /* 悬停和聚焦的颜色 */
}

.custom-range:hover::-moz-range-thumb,
.custom-range:focus::-moz-range-thumb {
	background-color: #fff;
}

.custom-range:hover::-ms-thumb,
.custom-range:focus::-ms-thumb {
	background-color: #fff;
}
/* 自定义颜色选择器样式 */
.color-picker {
	appearance: none; /* 移除默认样式 */
	padding: 8px; /* 控制内部的颜色块大小 */
	height: 2.5rem; /* 控制整体高度 */
	border-radius: 6px; /* 圆角样式 */
}

/* 调整颜色块的大小 */
.color-picker::-webkit-color-swatch-wrapper {
	padding: 2px; /* 调整颜色块的内边距，减少颜色块的大小 */
}

.color-picker::-webkit-color-swatch {
	border-radius: 4px; /* 颜色块圆角 */
}
.upload-area {
	width: 100%;
	height: 10rem;
	border: 2px dashed #ddd;
	position: relative;
}

.upload-area:hover {
	background-color: #e2e8f0; /* 鼠标悬停时的背景色 */
}
</style>
