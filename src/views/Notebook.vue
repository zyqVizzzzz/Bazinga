<template>
	<div
		class="flex flex-col w-full p-6 relative"
		:class="{ 'mobile-container': isMobile }"
	>
		<!-- 移动端模式 -->
		<template v-if="isMobile">
			<!-- 目录页面 -->
			<div v-if="!showDetailOnMobile" class="mobile-notebook-list">
				<div class="retro-card h-full">
					<div class="card-shadow">
						<div class="card-edge">
							<div class="card-face notebook-face">
								<div class="notebook-content book-face">
									<BookCard
										:refreshTrigger="refreshTrigger"
										:isImportantMode="isImportantMode"
										:searchIndex="searchIndex"
										:searchWord="searchNote"
										:selectedNote="selectedNote"
										@on-select-note="selectNoteOnMobile"
										@on-search-word="onSearchWord"
										@on-generate-card="onGenerateCard"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 详情页面 -->
			<div
				v-else-if="showDetailOnMobile && selectedNote"
				class="mobile-detail-view"
			>
				<div class="retro-card h-full">
					<div class="card-shadow">
						<div class="card-edge">
							<div class="card-face edit-face">
								<!-- 关闭按钮 -->
								<div class="mobile-header">
									<button class="close-btn" @click="closeMobileDetail">
										<svg
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M15 18L9 12L15 6"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
										返回目录
									</button>
								</div>
								<!-- 详情内容 -->
								<div class="mobile-detail-content">
									<EditCard
										:selectedNote="selectedNote"
										@on-delete-note="onDeleteNoteOnMobile"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>

		<!-- 桌面端模式（原有布局） -->
		<template v-else>
			<!-- 笔记本主体 -->
			<div class="w-full flex gap-6">
				<!-- 笔记列表区域 -->
				<div class="w-1/2 notebook-section">
					<div class="retro-card h-full">
						<div class="card-shadow">
							<div class="card-edge">
								<div class="card-face notebook-face">
									<div class="notebook-spine"></div>
									<div class="notebook-content book-face">
										<BookCard
											:refreshTrigger="refreshTrigger"
											:isImportantMode="isImportantMode"
											:searchIndex="searchIndex"
											:searchWord="searchNote"
											:selectedNote="selectedNote"
											@on-select-note="selectNote"
											@on-search-word="onSearchWord"
											@on-generate-card="onGenerateCard"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 编辑区域 -->
				<div class="w-1/2 edit-section">
					<div class="retro-card h-full">
						<div class="card-shadow">
							<div class="card-edge">
								<div class="card-face edit-face">
									<template v-if="selectedNote">
										<EditCard
											:selectedNote="selectedNote"
											@on-delete-note="onDeleteNote"
										/>
									</template>
									<div v-else class="empty-edit-state">
										<div class="empty-content">
											<p class="empty-text">请选择或搜索一个知识点</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import BookCard from "@/components/notes/book.vue";
import EditCard from "@/components/notes/edit.vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useMobile } from "@/composables/useBreakpoint";

const { isMobile } = useMobile();

const selectedNote = ref(null);
const searchNote = ref({});
const searchIndex = ref(0);
const isImportantMode = ref(false);
const refreshTrigger = ref(0);

// 移动端状态管理
const showDetailOnMobile = ref(false);

// 监听移动端状态变化，确保状态正确
watch(isMobile, (newValue) => {
	if (!newValue) {
		// 切换到桌面端时，重置移动端状态
		showDetailOnMobile.value = false;
	}
});

// 监听选中笔记变化
watch(selectedNote, (newNote) => {
	if (!newNote && isMobile.value) {
		// 如果没有选中笔记且在移动端，确保显示目录
		showDetailOnMobile.value = false;
	}
});

const onSearchWord = async (word) => {
	try {
		const res = await apiClient(`/lesson-notes/user/search?word=${word}`);
		if (res.data.code === 200) {
			searchNote.value = res.data.data.note;
			searchIndex.value = res.data.data.index;
		} else {
			showToast({ message: "未查到单词", type: "error" });
		}
	} catch (error) {
		showToast({ message: error, type: "error" });
	}
};

const onGenerateCard = async (cardData) => {
	try {
		// 保存生成的卡片到数据库
		const res = await apiClient.post(
			"/lesson-notes/user/save-generated",
			cardData
		);

		if (res.data.code === 200) {
			// 获取新生成的笔记
			const newNote = res.data.data.notes[0];
			// 更新选中的笔记
			selectedNote.value = newNote;
			// 设置搜索词，触发 book.vue 中的搜索
			searchNote.value = { word: newNote.word };
			// 移动端自动切换到详情页（仅在用户主动生成卡片时）
			// 注释掉这部分，让用户手动选择是否查看详情
			// if (isMobile.value) {
			// 	showDetailOnMobile.value = true;
			// }
			showToast({ message: "生成成功", type: "success" });
		} else {
			showToast({ message: res.data.message || "保存失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "保存失败", type: "error" });
		console.error("Error saving generated card:", error);
	}
};

// 桌面端删除处理方法
const onDeleteNote = () => {
	selectedNote.value = null; // 清空选中的笔记
	refreshTrigger.value++; // 触发刷新
};

// 移动端删除处理方法
const onDeleteNoteOnMobile = () => {
	selectedNote.value = null; // 清空选中的笔记
	refreshTrigger.value++; // 触发刷新
	showDetailOnMobile.value = false; // 返回目录
};

// 桌面端选中笔记
const selectNote = (note) => {
	selectedNote.value = note;
};

// 移动端选中笔记并切换到详情页
const selectNoteOnMobile = (note) => {
	console.log("选中笔记:", note); // 调试日志
	// 如果 note 为 null 或 undefined，不执行任何操作
	if (!note) {
		console.log("笔记为空，不执行操作");
		return;
	}
	selectedNote.value = note;
	showDetailOnMobile.value = true;
	console.log("切换到详情页:", showDetailOnMobile.value); // 调试日志
};

// 关闭移动端详情页
const closeMobileDetail = () => {
	console.log("关闭详情页"); // 调试日志
	showDetailOnMobile.value = false;
	console.log("当前状态:", showDetailOnMobile.value); // 调试日志
};

// 组件挂载时确保状态正确
onMounted(() => {
	if (isMobile.value && !selectedNote.value) {
		showDetailOnMobile.value = false;
	}
});
</script>

<style scoped>
.notebook-section,
.edit-section {
	height: calc(100vh - 280px);
	min-height: 730px;
}

/* 移动端容器样式 */
.mobile-container {
	padding: 1rem !important;
}

.mobile-notebook-list,
.mobile-detail-view {
	height: calc(100vh - 120px);
	min-height: 600px;
}

/* 移动端头部样式 */
.mobile-header {
	padding: 1rem;
	border-bottom: 1px solid #e5e5e5;
	margin-bottom: 1rem;
}

.close-btn {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.25rem 0.5rem;
	background-color: #f8f9fa;
	border: 2px solid #333;
	border-radius: 6px;
	font-weight: 600;
	font-size: 0.875rem;
	color: #333;
	cursor: pointer;
	transition: all 0.2s ease;
}

.close-btn:hover {
	background-color: #e9ecef;
	transform: translateY(-1px);
}

.close-btn:active {
	transform: translateY(0);
}

.mobile-detail-content {
	flex: 1;
	overflow-y: auto;
	padding: 0 1rem 1rem;
}

.retro-card {
	position: relative;
	width: 100%;
	height: 100%;
}

.card-shadow {
	position: absolute;
	inset: 0;
	background-color: #666;
	border-radius: 12px;
	transform: translateY(4px);
}

.card-edge {
	position: absolute;
	inset: 0;
	background-color: #b3b3b3;
	border-radius: 12px;
	transform: translateY(-4px);
}

.card-face {
	position: absolute;
	inset: 0;
	border: 3px solid #333;
	border-radius: 12px;
	transform: translateY(-4px);
}

.notebook-face {
	display: flex;
	background-color: #fff;
	overflow: hidden;
}

.notebook-spine {
	width: 30px;
	background: repeating-linear-gradient(
		180deg,
		#d4d4d4 0px,
		#d4d4d4 2px,
		#ffffff 2px,
		#ffffff 4px
	);
	border-right: 2px solid #ccc;
	box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.notebook-content {
	flex: 1;
	padding: 1rem;
	overflow-y: auto;
}

/* 网格纸效果 */
.edit-face {
	background-color: white;
	padding: 1rem;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
}

/* 移动端编辑面板调整 */
@media (max-width: 768px) {
	.edit-face {
		padding: 0;
	}

	.notebook-spine {
		width: 20px;
	}

	.notebook-content {
		padding: 0.75rem;
	}
}

/* 滚动条样式 */
.notebook-content::-webkit-scrollbar,
.edit-face::-webkit-scrollbar,
.mobile-detail-content::-webkit-scrollbar {
	width: 8px;
}

.notebook-content::-webkit-scrollbar-track,
.edit-face::-webkit-scrollbar-track,
.mobile-detail-content::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}

.notebook-content::-webkit-scrollbar-thumb,
.edit-face::-webkit-scrollbar-thumb,
.mobile-detail-content::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
}

.notebook-content::-webkit-scrollbar-thumb:hover,
.edit-face::-webkit-scrollbar-thumb:hover,
.mobile-detail-content::-webkit-scrollbar-thumb:hover {
	background: rgba(0, 0, 0, 0.3);
}

.empty-edit-state {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #666;
}

.empty-content {
	text-align: center;
	padding: 2rem;
}

.empty-icon {
	margin-bottom: 1rem;
	opacity: 0.5;
}

.empty-text {
	font-size: 1rem;
	color: #888;
}
</style>
