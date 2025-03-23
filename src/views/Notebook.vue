<template>
	<div class="flex flex-col w-full p-6 relative">
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
	</div>
</template>

<script setup>
import { ref } from "vue";
import BookCard from "@/components/notes/book.vue";
import EditCard from "@/components/notes/edit.vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const selectedNote = ref(null);
const searchNote = ref({});
const searchIndex = ref(0);
const isImportantMode = ref(false);
const refreshTrigger = ref(0);

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
			showToast({ message: "生成成功", type: "success" });
		} else {
			showToast({ message: res.data.message || "保存失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "保存失败", type: "error" });
		console.error("Error saving generated card:", error);
	}
};

// 删除处理方法
const onDeleteNote = () => {
	selectedNote.value = null; // 清空选中的笔记
	refreshTrigger.value++; // 触发刷新
};

const selectNote = (note) => (selectedNote.value = note); // 选中笔记并展示在 edit 区域
</script>

<style scoped>
.notebook-section,
.edit-section {
	height: calc(100vh - 280px);
	min-height: 730px;
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
}

/* 滚动条样式 */
.notebook-content::-webkit-scrollbar,
.edit-face::-webkit-scrollbar {
	width: 8px;
}

.notebook-content::-webkit-scrollbar-track,
.edit-face::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}

.notebook-content::-webkit-scrollbar-thumb,
.edit-face::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
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
