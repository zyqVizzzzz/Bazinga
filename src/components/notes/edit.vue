<template>
	<div class="retro-edit-card">
		<!-- 词汇标题区 -->
		<div class="word-header">
			<div class="word-title">
				<span class="word-text">{{ selectedNote.word }}</span>
				<button class="pronunciation-btn">
					<i class="bi bi-volume-down text-3xl"></i>
				</button>
			</div>
			<button class="bookmark-btn" @click="toggleImportantBadge">
				<i
					class="text-xl"
					:class="['bi', selectedNote.isImportant ? 'bi-star-fill' : 'bi-star']"
				></i>
			</button>
		</div>

		<!-- 基本释义 -->
		<div class="content-section">
			<p class="definition-text text-sm mb-2">
				<span v-if="selectedNote.symbols">{{ selectedNote.symbols }}；</span>
				{{ selectedNote.pos }} {{ selectedNote.word_zh }}；
			</p>
			<p class="explanation-text text-sm">{{ selectedNote.definition_zh }}</p>
		</div>

		<!-- 详细解释 -->
		<div class="content-section" v-if="selectedNote.etymology">
			<!-- 词根词缀分析 -->
			<div class="word-analysis">
				<!-- 词根 -->
				<div class="analysis-item">
					<span class="text-primary"
						>[词根 & 词缀分析]
						<span class="text-gray-600 ml-2">{{
							selectedNote.etymology
						}}</span></span
					>
				</div>
			</div>
		</div>

		<!-- 变形 -->
		<div class="content-section" v-if="selectedNote?.system?.wordInflections">
			<div class="inflections-grid">
				<div
					class="inflection-item text-gray-600 mb-2"
					v-for="field in processedFields"
					:key="field.key"
				>
					<span>[{{ field.label }}] : </span>
					<span class="form">{{ field.form }}</span>
				</div>
			</div>
		</div>

		<!-- 例句 -->
		<div class="content-section">
			<div class="example-box">
				<p class="example text-sm">{{ selectedNote.example }}</p>
				<p class="translation text-sm">{{ selectedNote.example_zh }}</p>
			</div>
		</div>

		<!-- 注释编辑区 -->
		<div class="content-section" v-if="selectedNote.comment || showEditModal">
			<div v-if="showEditModal" class="note-edit-area">
				<textarea
					v-model="commentContent"
					class="retro-textarea text-sm"
					placeholder="请输入补充注释"
					rows="4"
				></textarea>
			</div>
			<div v-else class="note-content" v-html="formattedComment"></div>
		</div>

		<!-- 按钮区 -->
		<div class="button-group">
			<!-- <button
				class="retro-btn primary"
				:class="{ 'w-2/3': showEditModal, 'w-full': !showEditModal }"
				@click="toggleEditModal"
			>
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">
							{{ showEditModal ? "提交注释" : "补充注释" }}
						</div>
					</div>
				</div>
			</button> -->

			<button
				v-if="showEditModal"
				class="retro-btn w-1/3"
				@click="cancelEditModal"
			>
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">取消编辑</div>
					</div>
				</div>
			</button>
		</div>
	</div>
</template>
<script setup>
import { ref, toRefs, computed, watch } from "vue";
import { showToast } from "@/components/common/toast.js";
import apiClient from "@/api";

const props = defineProps({
	selectedNote: Object,
});
const { selectedNote } = toRefs(props);

const emit = defineEmits(["on-close-blink", "on-add-point"]);

const commentContent = ref(""); // 初始文本

const showEditModal = ref(false);

const toggleEditModal = async () => {
	if (!showEditModal.value) {
		// 显示编辑模式，并将 <br> 转换为 \n
		showEditModal.value = true;
		if (selectedNote.value.comment) {
			commentContent.value = selectedNote.value.comment.replace(/<br>/g, "\n");
		}
	} else {
		try {
			await updateComment();
			showEditModal.value = false;
		} catch (error) {
			console.error("Failed to update comment:", error);
		}
	}
};

const wordInflections = computed(() => {
	const result = [];
	const inflections = selectedNote.value.system?.wordInflections || {};

	// 获取所有键名
	const keys = Object.keys(inflections);

	// 找出所有不带_zh后缀的基础键名
	const baseKeys = keys.filter((key) => !key.endsWith("_zh"));

	// 处理每个基础键值对
	baseKeys.forEach((baseKey) => {
		const zhKey = `${baseKey}_zh`;

		// 只有当同时存在英文和中文键时才添加
		if (inflections[zhKey]) {
			result.push({
				key: baseKey,
				label: inflections[zhKey], // 中文标签
				form: inflections[baseKey], // 英文内容
			});
		}
	});

	return result;
});

const processedFields = computed(() => {
	const result = [];

	// 获取所有键名
	const inflections = selectedNote.value.system?.wordInflections || {};

	// 获取所有键名
	const keys = Object.keys(inflections);

	// 找出所有不带_zh后缀的基础键名
	const baseKeys = keys.filter((key) => !key.endsWith("_zh"));

	// 处理每个基础键值对
	baseKeys.forEach((baseKey) => {
		const zhKey = `${baseKey}_zh`;

		// 只有当同时存在英文和中文键时才添加
		if (inflections[zhKey]) {
			result.push({
				key: baseKey,
				label: inflections[zhKey], // 中文标签
				form: inflections[baseKey], // 英文内容
			});
		}
	});

	return result;
});

const updateComment = async () => {
	const result = commentContent.value.replace(/\n/g, "<br>");
	const commitObj = { ...selectedNote.value, comment: result };

	const res = await apiClient.put(
		`/lesson-notes/${selectedNote.value.resourceId}`,
		commitObj
	);
	if (res.data.code === 200) {
		return res.data.data;
	} else {
		showToast({ message: res.data.message, type: "error" });
	}
};

const isFill = ref(false);

const toggleImportantBadge = async () => {
	if (!selectedNote.value.isImportant) {
		const importantObj = { ...selectedNote.value, isImportant: true };
		const res = await apiClient.put(
			`/lesson-notes/${selectedNote.value.resourceId}`,
			importantObj
		);
		if (res.data.code === 200) {
			selectedNote.value.isImportant = true;
			emit("on-add-point");
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} else {
		const importantObj = { ...selectedNote.value, isImportant: false };
		const res = await apiClient.put(
			`/lesson-notes/${selectedNote.value.resourceId}`,
			importantObj
		);
		if (res.data.code === 200) {
			selectedNote.value.isImportant = false;
			emit("on-minus-point");
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	}
};

const cancelEditModal = () => {
	showEditModal.value = false;
	if (selectedNote.value.comment) {
		commentContent.value = selectedNote.value.comment.replace(/<br>/g, "\n");
	}
};

// 计算属性：将换行符转换为 p 标签
const formattedComment = computed(() => {
	if (selectedNote.value.comment) {
		return selectedNote.value.comment
			.split("<br>")
			.filter((line) => line.trim() !== "")
			.map((line, index, arr) => {
				const nextLine = arr[index + 1] || "";
				const isDoubleBreak = selectedNote.value.comment.includes(
					`${line}\n\n${nextLine}`
				);
				const paddingClass = isDoubleBreak ? "pb-3" : "pb-1";
				return `<p class="${paddingClass}">${line}</p>`;
			})
			.join("");
	} else {
		return "";
	}
});

watch(
	() => selectedNote.value,
	(newValue) => {
		if (newValue) {
			// isFill.value = newValue.isImportant;
			showEditModal.value = false;
			if (newValue.comment) {
				commentContent.value = newValue.comment.replace(/<br>/g, "\n");
			} else {
				commentContent.value = newValue.comment;
			}
		}
	}
);
</script>
<style scoped>
.retro-edit-card {
	padding: 0.5rem 1rem;
	height: 100%;
	overflow-y: auto;
}

/* 单词标题区 */
.word-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.word-title {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.word-text {
	font-size: 1.2rem;
	font-weight: bold;
	color: #333;
}

.pronunciation-btn,
.bookmark-btn {
	background: none;
	border: none;
	cursor: pointer;
	transition: transform 0.2s;
}

.pronunciation-btn:hover,
.bookmark-btn:hover {
	transform: scale(1.1);
}

/* 内容区域 */
.content-section {
	padding: 1rem 0;
	border-bottom: 1px solid #ddd;
	text-align: left;
}

/* 词根词缀分析 */
.word-analysis {
}

.analysis-item {
	margin-bottom: 0.5rem;
	font-size: 0.875rem;
}

.term {
	color: var(--primary-color);
	font-weight: bold;
}

/* 变形表格 */
.inflections-grid {
	display: grid;
}

.inflection-item {
	font-size: 0.875rem;
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

/* 例句样式 */
.example-box {
	background: rgba(var(--primary-color-rgb), 0.05);
	padding: 0.5rem 1rem 1rem;
	border-radius: 8px;
	border-left: 3px solid var(--primary-color);
	margin-left: -1rem;
}

.example {
	margin: 0.5rem 0;
	color: #333;
}

.translation {
	color: #666;
	font-size: 0.875rem;
}

/* 注释编辑区 */
.retro-textarea {
	width: 100%;
	padding: 0.75rem;
	border: 2px solid #333;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.8);
	font-family: inherit;
	resize: vertical;
	box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.retro-textarea:focus {
	outline: none;
	box-shadow: inset 2px 2px 0 rgba(var(--primary-color-rgb), 0.2);
}

/* 按钮样式 */
.button-group {
	display: flex;
	gap: 1rem;
	margin-top: 1rem;
}

.retro-btn {
	position: relative;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

.btn-shadow {
	position: absolute;
	inset: 0;
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	inset: 0;
	background-color: #888;
	border-radius: 8px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	inset: 0;
	background-color: white;
	border: 2px solid #333;
	border-radius: 8px;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.875rem;
}

.retro-btn:hover .btn-face {
	background-color: white;
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face {
	transform: translateY(0);
}

/* 主按钮变体 */
.retro-btn.primary .btn-face {
	/* color: var(--secondary-color);
	border-color: var(--secondary-color); */
}

/* 装饰效果 */
.retro-edit-card::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 9px;
	pointer-events: none;
}

/* 滚动条样式 */
.retro-edit-card::-webkit-scrollbar {
	width: 8px;
}

.retro-edit-card::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}

.retro-edit-card::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
}

.retro-edit-card::-webkit-scrollbar-thumb:hover {
	background: rgba(0, 0, 0, 0.3);
}
</style>
