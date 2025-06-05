<template>
	<div
		class="retro-episode-card"
		:class="{
			'edit-mode': isEditMode,
			[`layout-${layout}`]: true,
		}"
	>
		<div class="card-shadow">
			<div class="card-edge">
				<div class="card-face">
					<!-- 编辑模式下的拖拽手柄 -->
					<div v-if="isEditMode" class="absolute top-2 left-2 z-10">
						<div class="drag-handle cursor-move">
							<i class="bi bi-grip-vertical"></i>
						</div>
					</div>

					<!-- 标题区域 -->
					<div class="title-container" @click="handleClick">
						<template v-if="!isEditing">
							<div class="ep-number" v-show="!isEditing">
								EP.{{ episode.ep }}
							</div>
							<div :class="isEditMode ? 'tooltip' : ''" data-tip="点击编辑标题">
								<div class="main-title">
									{{ episode.epName || `New Episode` }}
								</div>
							</div>
						</template>

						<!-- 编辑状态 -->
						<input
							v-if="isEditing"
							v-model="editingTitle"
							@blur="saveTitle"
							@keyup.enter="saveTitle"
							maxlength="50"
							class="title-input"
							ref="titleInput"
							placeholder="请输入标题（最多50字）"
						/>
					</div>

					<!-- 编辑模式下的控制按钮 -->
					<div v-if="isEditMode" class="absolute top-[-10px] right-[-10px]">
						<button
							class="retro-btn-tiny close"
							@click="$emit('delete', episode)"
						>
							<i class="bi bi-x"></i>
						</button>
					</div>
					<div v-if="isEditMode" class="absolute bottom-[-10px] left-[-10px]">
						<button
							class="retro-btn-tiny move"
							@click.stop="$emit('move', episode)"
							title="移动到其他合集"
						>
							<i class="bi bi-shuffle text-xs"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
	episode: {
		type: Object,
		required: true,
	},
	isEditMode: {
		type: Boolean,
		default: false,
	},
	layout: {
		type: String,
		required: true,
	},
});

const emit = defineEmits(["click", "delete", "update"]);

const isEditing = ref(false);
const editingTitle = ref("");
const titleInput = ref(null);

const handleClick = () => {
	if (props.isEditMode) {
		isEditing.value = true;
		editingTitle.value = props.episode.epName;
		// 等待 DOM 更新后聚焦输入框
		setTimeout(() => {
			titleInput.value?.focus();
		}, 0);
	} else {
		emit("click", props.episode);
	}
};

const saveTitle = () => {
	if (editingTitle.value.trim() !== props.episode.epName) {
		emit("update", { ...props.episode, epName: editingTitle.value.trim() });
	}
	isEditing.value = false;
};
</script>

<style scoped>
.retro-episode-card {
	position: relative;
	aspect-ratio: 4/3;
	min-height: 120px;
	cursor: pointer;
	transition: transform 0.3s;
	width: 100%;
}

.card-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 12px;
	transform: translateY(4px);
}

.card-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(102, 102, 102, 0.5);
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.1s;
}

.card-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: white;
	border: 3px solid #333;
	border-radius: 12px;
	transform: translateY(-4px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 只在非编辑模式下显示悬停效果 */
.retro-episode-card:not(.edit-mode):hover {
	transform: translateY(-2px);
}

.retro-episode-card:not(.edit-mode):active .card-edge,
.retro-episode-card:not(.edit-mode):active .card-face {
	transform: translateY(-2px);
}

.retro-toggle {
	display: flex;
	align-items: center;
	padding: 4px 12px;
	background: rgba(255, 255, 255, 0.9);
	border: 2px solid #333;
	border-radius: 20px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.edit-mode .card-face {
	background-color: rgba(255, 255, 255, 0.95);
	border-style: dashed;
}

.ghost {
	opacity: 0.5;
	background: #c8ebfb;
}

.edit-mode {
	cursor: move;
}

.drag-handle {
	position: absolute;
	top: 0px;
	left: 0px;
	color: #666;
}

.episode-controls {
	position: absolute;
	top: 5px;
	right: 8px;
	display: flex;
	gap: 0.5rem;
}

.retro-btn-tiny {
	width: 24px;
	height: 24px;
	padding: 0;
	border-radius: 50%;
	background: white;
	border: 2px solid #333;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.retro-btn-tiny.close:hover {
	background-color: var(--secondary-color);
	color: #fff;
}

.retro-btn-tiny.move:hover {
	background-color: var(--primary-color);
	color: #fff;
}

.retro-input {
	border: 2px solid #333;
	border-radius: 4px;
	padding: 2px 8px;
	font-size: 0.875rem;
	background: white;
	width: 100%;
}

/* 标题容器基础样式 */
.title-container {
	position: absolute;
	inset: 0;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

/* EP 编号基础样式 */
.ep-number {
	font-size: 0.75rem;
	font-weight: bold;
	color: #666;
	font-family: "monospace";
	flex-shrink: 0;
}

/* 主标题基础样式 */
.main-title {
	font-size: 1rem;
	font-weight: bold;
	line-height: 1.2;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	cursor: pointer;
	flex-grow: 1;
}

/* 布局变体 4：分裂式布局 */
.layout-4 .title-container {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.5rem;
	padding: 1.5rem;
	transform: perspective(500px) rotateX(10deg);
}

.layout-4 .ep-number {
	font-size: 0.875rem;
	border-bottom: 2px solid #333;
	padding-bottom: 0.25rem;
	text-align: right;
	align-self: flex-end; /* 使其在水平方向靠右 */
}

.layout-4 .main-title {
	font-size: 0.875rem;
	text-align: left;
	letter-spacing: 0.05em;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

/* 通用悬停效果 */
.retro-episode-card:not(.edit-mode):hover .card-face {
	transition: all 0.3s ease;
	transform: translateY(-6px);
}

/* 卡片悬停效果 */
.retro-episode-card:not(.edit-mode):hover {
	transform: translateY(-4px);
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

/* 编辑模式样式 */
.edit-mode .card-face {
	background-color: rgba(255, 255, 255, 0.95);
	border-style: dashed;
}

.title-input {
	width: 100%;
	height: 100%;
	padding: 0.5rem;
	border: none;
	background: transparent;
	font-size: 0.875rem;
	font-weight: bold;
	text-align: center;
	outline: none;
	border-bottom: 2px dashed #333;
}

.editing .card-face {
	background-color: rgba(255, 255, 255, 0.98);
}

.editing .title-container {
	transform: none !important;
	padding: 1rem;
}
@media (max-width: 768px) {
	.retro-episode-card {
		min-height: 100px;
	}

	.main-title {
		font-size: 0.875rem;
		-webkit-line-clamp: 2;
	}

	.card-face {
		border-width: 2px;
	}
}
</style>
