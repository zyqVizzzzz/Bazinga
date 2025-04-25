<template>
	<div class="form-control">
		<label class="retro-label">
			<span class="label-text">封面图</span>
		</label>
		<div class="retro-upload-area" @click="triggerFileInput">
			<template v-if="!previewUrl">
				<div class="upload-content">
					<i class="bi bi-upload text-2xl"></i>
					<span class="mt-2">点击此处上传</span>
				</div>
			</template>
			<template v-else>
				<div class="relative w-full h-full group">
					<img :src="previewUrl" alt="Preview" class="preview-image" />
					<div class="image-overlay">
						<span class="overlay-text">更换图片</span>
					</div>
					<div
						class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<button class="retro-btn-small" @click.stop="openImageEditor">
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face">
										<i class="bi bi-pencil-square"></i>
									</div>
								</div>
							</div>
						</button>
					</div>
				</div>
			</template>
		</div>
		<input
			ref="fileInput"
			@change="handleFileUpload"
			type="file"
			class="hidden"
			accept="image/*"
		/>

		<!-- 修改图片编辑模态框部分 -->
		<dialog ref="imageEditorModal" class="modal">
			<div class="retro-editor">
				<div class="editor-header">
					<h3 class="editor-title">编辑封面图</h3>
					<button class="close-btn" @click.prevent="closeImageEditor">
						<i class="bi bi-x-lg"></i>
					</button>
				</div>

				<div class="editor-content">
					<div
						class="image-container"
						ref="imageEditorWrapper"
						@mousedown="startDrag"
						@touchstart="startDrag"
					>
						<div class="crop-frame"></div>
						<img
							:src="previewUrl"
							ref="editingImage"
							class="editing-image"
							:style="{
								transform: `scale(${imageScale}) translateY(${imageOffsetY}px)`,
							}"
							alt="Editing Preview"
						/>
					</div>
				</div>

				<div class="editor-footer">
					<div class="zoom-control">
						<button class="zoom-btn" @click="decreaseZoom">
							<i class="bi bi-dash-lg"></i>
						</button>
						<input
							v-model="imageScale"
							type="range"
							class="zoom-slider"
							min="1"
							max="2"
							step="0.01"
						/>
						<button class="zoom-btn" @click="increaseZoom">
							<i class="bi bi-plus-lg"></i>
						</button>
					</div>

					<div class="action-buttons">
						<button class="retro-btn-medium" @click.prevent="applyImageChanges">
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face">应用</div>
								</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</dialog>
	</div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
	modelValue: String,
});

const emit = defineEmits(["update:modelValue", "file-selected"]);

// 文件上传相关
const fileInput = ref(null);
const previewUrl = ref("");
const selectedFile = ref(null);

// 图片编辑相关
const imageEditorModal = ref(null);
const imageEditorWrapper = ref(null);
const editingImage = ref(null);
const imageScale = ref(1); // 确保这里是数字类型
const imageOffsetX = ref(0);
const imageOffsetY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const lastOffsetX = ref(0);
const lastOffsetY = ref(0);

const originalFile = ref(null);
const originalPreviewUrl = ref("");

// 监听 modelValue 变化
watch(
	() => imageScale.value,
	(newValue) => {
		imageScale.value = Number(newValue);
	}
);

// 监听 modelValue 变化，用于编辑状态下显示已有图片
watch(
	() => props.modelValue,
	(newValue) => {
		if (newValue && !previewUrl.value) {
			previewUrl.value = newValue;
			originalPreviewUrl.value = newValue;
		}
	},
	{ immediate: true }
);

// 在组件挂载时初始化
onMounted(() => {
	if (props.modelValue) {
		previewUrl.value = props.modelValue;
		originalPreviewUrl.value = props.modelValue;
	}
});

// 增加缩放
const increaseZoom = () => {
	const newScale = Number(imageScale.value) + 0.1;
	imageScale.value = Math.min(newScale, 2);
};

// 减少缩放
const decreaseZoom = () => {
	const newScale = Number(imageScale.value) - 0.1;
	imageScale.value = Math.max(newScale, 0.5);
};

// 触发文件选择
const triggerFileInput = () => {
	fileInput.value.click();
};

// 处理文件上传
const handleFileUpload = (event) => {
	const file = event.target.files[0];
	if (file) {
		selectedFile.value = file;
		originalFile.value = file; // 保存原始文件
		previewUrl.value = URL.createObjectURL(file);
		originalPreviewUrl.value = previewUrl.value; // 保存原始预览URL
		emit("file-selected", file);
	}
};

// 打开图片编辑器
const openImageEditor = (event) => {
	event.preventDefault();
	// 重置编辑状态
	imageScale.value = 1;
	imageOffsetX.value = 0;
	imageOffsetY.value = 0;

	// 使用原始图片URL而不是当前预览URL
	if (originalPreviewUrl.value) {
		previewUrl.value = originalPreviewUrl.value;
	}

	// 打开模态框
	imageEditorModal.value.showModal();

	// 确保图片适应模态框
	setTimeout(() => {
		if (editingImage.value) {
			const cropFrame = imageEditorWrapper.value.querySelector(".crop-frame");
			if (!cropFrame) return;

			const imgNaturalRatio =
				editingImage.value.naturalWidth / editingImage.value.naturalHeight;
			const containerWidth = imageEditorWrapper.value.clientWidth;
			const cropHeight = cropFrame.clientHeight;

			if (imgNaturalRatio > 1) {
				// 横图
				const targetHeight = containerWidth / imgNaturalRatio;
				if (targetHeight < cropHeight) {
					imageScale.value = cropHeight / targetHeight;
				}
			} else {
				// 竖图
				// 计算以容器宽度为基准的缩放比例
				const imgDisplayHeight = containerWidth / imgNaturalRatio;
				// 确保图片高度至少能覆盖裁剪框
				if (imgDisplayHeight < cropHeight) {
					imageScale.value = cropHeight / imgDisplayHeight;
				}
			}
		}
	}, 100);
};

// 关闭图片编辑器
const closeImageEditor = (event) => {
	if (event) event.preventDefault();
	imageEditorModal.value.close();
};

// 应用图片变更
const applyImageChanges = async (event) => {
	// 阻止默认行为
	if (event) event.preventDefault();
	if (originalFile.value && editingImage.value) {
		try {
			// 创建一个 canvas 元素
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			// 获取裁剪框的尺寸和位置
			const cropFrame = imageEditorWrapper.value.querySelector(".crop-frame");
			const cropRect = cropFrame.getBoundingClientRect();
			const imageRect = editingImage.value.getBoundingClientRect();

			// 设置 canvas 尺寸为裁剪框的尺寸
			canvas.width = cropRect.width;
			canvas.height = cropRect.height;

			// 计算裁剪区域在图片上的位置
			const scaleX = editingImage.value.naturalWidth / imageRect.width;
			const scaleY = editingImage.value.naturalHeight / imageRect.height;

			// 在 canvas 上绘制裁剪后的图片
			ctx.drawImage(
				editingImage.value,
				0,
				(cropRect.top - imageRect.top) * scaleY,
				editingImage.value.naturalWidth,
				cropRect.height * scaleY,
				0,
				0,
				canvas.width,
				canvas.height
			);

			// 将 canvas 转换为 Blob
			canvas.toBlob(async (blob) => {
				if (blob) {
					// 创建新的 File 对象
					const newFile = new File([blob], originalFile.value.name, {
						type: originalFile.value.type,
					});

					// 更新预览，但保留原始文件
					selectedFile.value = newFile;
					previewUrl.value = URL.createObjectURL(newFile);

					// 通知父组件
					emit("file-selected", newFile);

					// 关闭模态框
					closeImageEditor();
				}
			}, originalFile.value.type);
		} catch (error) {
			console.error("Failed to process image:", error);
		}
	} else {
		closeImageEditor();
	}
};

// 开始拖动图片
const startDrag = (event) => {
	event.preventDefault();
	isDragging.value = true;

	// 记录起始位置
	if (event.type === "mousedown") {
		startX.value = event.clientX;
		startY.value = event.clientY;
	} else if (event.type === "touchstart") {
		startX.value = event.touches[0].clientX;
		startY.value = event.touches[0].clientY;
	}

	lastOffsetX.value = imageOffsetX.value;
	lastOffsetY.value = imageOffsetY.value;

	// 添加移动和结束事件监听器
	document.addEventListener("mousemove", moveDrag);
	document.addEventListener("touchmove", moveDrag, { passive: false });
	document.addEventListener("mouseup", endDrag);
	document.addEventListener("touchend", endDrag);
};

// 移动图片
const moveDrag = (event) => {
	if (!isDragging.value) return;

	let currentY;
	if (event.type === "mousemove") {
		currentY = event.clientY;
	} else if (event.type === "touchmove") {
		event.preventDefault(); // 防止页面滚动
		currentY = event.touches[0].clientY;
	}

	// 只计算垂直方向的偏移量
	const deltaY = currentY - startY.value;

	// 只更新垂直位置
	imageOffsetY.value = lastOffsetY.value + deltaY;
};

// 结束拖动
const endDrag = () => {
	isDragging.value = false;

	// 移除事件监听器
	document.removeEventListener("mousemove", moveDrag);
	document.removeEventListener("touchmove", moveDrag);
	document.removeEventListener("mouseup", endDrag);
	document.removeEventListener("touchend", endDrag);
};
</script>

<style scoped>
.retro-upload-area {
	position: relative;
	height: 160px;
	background: white;
	border: 2px dashed #333;
	border-radius: 8px;
	cursor: pointer;
	overflow: hidden;
	transition: all 0.3s;
}

.retro-upload-area:hover {
	background: #f0f0f0;
	border-style: solid;
}

.upload-content {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #666;
}

.preview-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.modal {
	padding: 0;
	border: none;
	background: transparent;
	max-width: 90%;
	width: 90%;
	margin: 2rem auto;
	border-radius: 16px;
	overflow: hidden;
}

.modal::backdrop {
	background-color: rgba(0, 0, 0, 0.7);
}

.retro-editor {
	display: flex;
	flex-direction: column;
	background-color: white;
	border: 4px solid #333;
	border-radius: 16px;
	overflow: hidden;
	height: 80vh;
	max-height: 700px;
	width: 600px;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.editor-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 1rem;
	background-color: #f0f0f0;
	color: #333;
	border-bottom: 2px solid #333;
}

.editor-title {
	font-size: 1.2rem;
	font-weight: bold;
	color: #333;
}

.close-btn {
	background: none;
	border: none;
	color: #333;
	font-size: 1.2rem;
	cursor: pointer;
	padding: 0.5rem;
}

.editor-content {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	position: relative;
	background-color: #f8f8f8;
}

.image-container {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	cursor: ns-resize; /* 指示只能上下移动 */
}

.crop-frame {
	position: absolute;
	top: 50%;
	left: 0;
	transform: translateY(-50%);
	width: 100%;
	height: 206px; /* 调整裁剪框高度 */
	border-top: 2px solid #333;
	border-bottom: 2px solid #333;
	box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
	z-index: 10;
	pointer-events: none;
}

.editing-image {
	position: absolute;
	left: 0;
	top: 0%;
	transform-origin: center;
	width: 100%; /* 确保图片宽度占满容器 */
	max-height: none; /* 移除最大高度限制 */
	object-fit: cover; /* 保持宽高比 */
	transition: transform 0.1s ease-out;
}

.editor-footer {
	padding: 1rem;
	background-color: #f0f0f0;
	border-top: 2px solid #333;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.zoom-control {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
}

.zoom-slider {
	flex: 1;
	height: 4px;
	-webkit-appearance: none;
	background: #ccc;
	border-radius: 2px;
	max-width: 300px;
}

.zoom-slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	width: 20px;
	height: 20px;
	background: #333;
	border-radius: 50%;
	cursor: pointer;
}

.zoom-btn {
	width: 36px;
	height: 36px;
	border-radius: 8px;
	background-color: white;
	color: #333;
	border: 2px solid #333;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.zoom-btn:hover {
	background-color: #f0f0f0;
}

.action-buttons {
	display: flex;
	justify-content: center;
	margin-top: 0.5rem;
}

/* 添加中等大小的复古按钮样式 */
.retro-btn-medium {
	position: relative;
	width: 6rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

/* 复古按钮样式 */
.retro-btn-small {
	position: relative;
	width: 2.5rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 8px;
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
	border: 2px solid #333;
	border-radius: 8px;
	color: #333;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
}

.retro-btn-small:hover .btn-face {
	background-color: white;
}

.retro-btn-small:active .btn-edge,
.retro-btn-small:active .btn-face {
	transform: translateY(0);
}

.retro-label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: bold;
	color: #333;
}
.image-overlay {
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s;
}

.retro-upload-area:hover .image-overlay {
	opacity: 1;
}

.overlay-text {
	color: rgb(211, 210, 210);
	font-size: 0.875rem;
	font-weight: 500;
}
</style>
