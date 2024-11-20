<template>
	<div class="avatar-container relative group">
		<!-- 头像图片 -->
		<img
			:src="props.user.profilePic || '/default-avatar.png'"
			alt="Profile Avatar"
		/>

		<!-- 悬停遮罩层 -->
		<div
			class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
			@click="triggerFileInput"
		>
			<span class="text-white text-sm">更换头像</span>
		</div>

		<!-- 隐藏的文件输入 -->
		<input
			type="file"
			ref="fileInput"
			class="hidden"
			accept="image/*"
			@change="handleFileChange"
		/>

		<!-- 上传中的加载状态 -->
		<div
			v-if="uploading"
			class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50"
		>
			<div
				class="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"
			></div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import apiClient from "@/api";

const props = defineProps({
	user: {
		type: Object,
		required: true,
		default: () => ({
			avatarUrl: "",
		}),
	},
});

const emit = defineEmits(["update:avatarUrl"]);

const fileInput = ref(null);
const uploading = ref(false);

// 触发文件选择
const triggerFileInput = () => {
	fileInput.value?.click();
};

// 处理文件选择
const handleFileChange = async (event) => {
	const input = event.target;
	const file = input.files?.[0];

	if (!file) return;

	// 验证文件类型
	if (!file.type.startsWith("image/")) {
		alert("请选择图片文件");
		return;
	}

	// 验证文件大小 (2MB)
	if (file.size > 2 * 1024 * 1024) {
		alert("图片大小不能超过2MB");
		return;
	}

	try {
		uploading.value = true;
		const formData = new FormData();
		formData.append("file", file);

		const response = await apiClient.post("/users/avatar/upload", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		if (response.data?.data.url) {
			emit("update:avatarUrl", response.data.data.url);
		}
	} catch (error) {
		console.error("上传头像失败:", error);
		alert("上传失败，请重试");
	} finally {
		uploading.value = false;
		// 清空文件输入以允许重复上传同一文件
		if (fileInput.value) {
			fileInput.value.value = "";
		}
	}
};
</script>
<style scoped>
.avatar-container {
	margin-top: 1rem;
	border: 4px solid #000;
	background: #fff;
	overflow: hidden;
}

.avatar-container img {
	width: 100%;
	height: 100%;
	min-width: 236px;
	min-height: 235px;
	object-fit: cover;
	display: block;
}
</style>
