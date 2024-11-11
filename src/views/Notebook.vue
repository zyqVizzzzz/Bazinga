<template>
	<div class="flex flex-col w-full p-6 relative">
		<!-- 工具箱区域 -->
		<div class="w-full toolbox mb-6 h-[58px]" style="z-index: 100">
			<div class="retro-card">
				<div class="card-face">
					<Toolbox
						@on-search-word="onSearchWord"
						@on-important-mode="onImportantMode"
						:flashState="flashState"
					/>
				</div>
			</div>
		</div>

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
										:minusPoint="minusPoint"
										:isImportantMode="isImportantMode"
										:searchIndex="searchIndex"
										:searchWord="searchNote"
										:selectedNote="selectedNote"
										@on-select-note="selectNote"
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
								<EditCard
									v-if="selectedNote"
									:selectedNote="selectedNote"
									@on-add-point="onAddPoint"
									@on-minus-point="onMinusPoint"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<BlinkBoxCard />
	</div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import BlinkBoxCard from "@/components/notes/blinkbox.vue";
import Toolbox from "@/components/notes/toolbox.vue";
import BookCard from "@/components/notes/book.vue";
import EditCard from "@/components/notes/edit.vue";
import apiClient from "@/api";
import { useNotebookStore } from "@/store/index";
import { showToast } from "@/components/common/toast.js";

const notebookStore = useNotebookStore();
const selectedNote = ref(null);
const searchNote = ref({});
const flashState = ref(0);
const searchIndex = ref(0);
const isImportantMode = ref(false);
const minusPoint = ref(0);

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

const onImportantMode = async () => {
	isImportantMode.value = !isImportantMode.value;
};

const selectNote = (note) => (selectedNote.value = note); // 选中笔记并展示在 edit 区域
const onAddPoint = () => flashState.value++;
const showBlinkbox = computed(() => notebookStore.showBlinkbox);

const onMinusPoint = () => {
	minusPoint.value++;
};
// 控制单词盲盒的显示和隐藏
watch(showBlinkbox, (newValue) => {
	const binkModalDom = document.getElementById("note_blink_modal");
	newValue ? binkModalDom.showModal() : binkModalDom.close();
});
</script>

<style scoped>
/* 基础容器样式 */
.notebook-section,
.edit-section {
	height: calc(100vh - 280px);
	min-height: 730px;
}

/* 复古卡片基础样式 */
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
	background-color: #888;
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

/* 笔记本特殊样式 */
.notebook-face {
	display: flex;
	background-color: #fff;
	overflow: hidden;
	background-image: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0.03) 1px,
			transparent 1px
		),
		linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
	background-size: 15px 15px;
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

/* 编辑区网格纸效果 */
.edit-face {
	background-color: white;
	background-image: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0.03) 1px,
			transparent 1px
		),
		linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
	background-size: 15px 15px;
	padding: 1rem;
	overflow-y: auto;
}

/* 装饰性细节 */
.card-face::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.02) 2px,
		rgba(0, 0, 0, 0.02) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}

/* 光泽效果 */
.card-face::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 40%;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
	border-radius: 9px 9px 0 0;
	pointer-events: none;
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
</style>
