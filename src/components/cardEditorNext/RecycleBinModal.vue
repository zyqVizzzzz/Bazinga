<template>
	<dialog ref="recycleBinModalRef" class="modal">
		<div class="modal-box max-w-3xl h-[500px] p-4 overflow-hidden bg-base-200">
			<div class="flex gap-4 w-full h-full">
				<!-- 左侧导航栏 -->
				<div class="w-4/12 overflow-y-auto h-full">
					<div class="p-4 rounded-md bg-line text-sm text-left min-h-full">
						<div class="space-y-2">
							<div
								v-for="(tab, key) in tabs"
								:key="key"
								class="p-2 bg-white/30 rounded cursor-pointer relative"
								:class="{
									'selected-knowledge': currentTab === key,
									'hover:bg-white/70': currentTab !== key,
								}"
								@click="currentTab = key"
							>
								<div class="font-medium flex items-center">
									<i :class="tab.icon" class="mr-2"></i>
									{{ tab.label }}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 右侧内容区 -->
				<div class="w-8/12 flex flex-col h-full">
					<div class="flex-1 overflow-y-auto">
						<!-- 知识点列表 -->
						<div v-show="currentTab === 'knowledge'" class="space-y-2">
							<div
								v-for="item in Array.from(deletedKnowledge)"
								:key="item.word"
								class="p-3 rounded-lg cursor-pointer relative group"
								style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)"
							>
								<div class="text-sm">{{ item.word }}</div>
								<button
									class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
									@click="handleRestoreKnowledge(item)"
								>
									<div class="retro-btn-xs">
										<div class="btn-shadow">
											<div class="btn-edge">
												<div class="btn-face">恢复</div>
											</div>
										</div>
									</div>
								</button>
							</div>
							<div
								v-if="!deletedKnowledge.size"
								class="text-gray-500 text-center py-4 text-sm mt-4"
							>
								暂无删除的知识点
							</div>
						</div>

						<!-- 文本块列表 -->
						<div v-show="currentTab === 'blocks'" class="space-y-2">
							<div
								v-for="(item, index) in deletedBlocks"
								:key="index"
								class="p-3 rounded-lg cursor-pointer relative group"
								style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1)"
							>
								<div class="text-sm truncate">
									{{ item.blocks[0]?.text || "无内容" }}
								</div>
								<div class="text-xs text-gray-600 mt-1">
									{{ new Date(item.timestamp).toLocaleString() }}
								</div>
								<button
									class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
									@click="handleRestoreBlocks(index)"
								>
									<div class="retro-btn-xs">
										<div class="btn-shadow">
											<div class="btn-edge">
												<div class="btn-face">恢复</div>
											</div>
										</div>
									</div>
								</button>
							</div>
							<div
								v-if="!deletedBlocks.length"
								class="text-gray-500 text-center py-4 text-sm mt-4"
							>
								暂无删除的文本块
							</div>
						</div>
					</div>
				</div>
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

const props = defineProps({
	deletedKnowledge: {
		type: Set,
		required: true,
	},
	deletedBlocks: {
		type: Array,
		required: true,
	},
});

const emit = defineEmits(["restore-knowledge", "restore-blocks"]);

const recycleBinModalRef = ref(null);
const currentTab = ref("knowledge");

const tabs = {
	knowledge: {
		label: "已删除知识点",
		icon: "bi bi-book",
	},
	blocks: {
		label: "已删除文本块",
		icon: "bi bi-file-text",
	},
};

const showModal = () => {
	recycleBinModalRef.value?.showModal();
};

const handleRestoreKnowledge = (word) => {
	emit("restore-knowledge", word);
};

const handleRestoreBlocks = (index) => {
	emit("restore-blocks", index);
};

defineExpose({
	showModal,
});
</script>

<style scoped>
/* 基础样式 */
.modal-box {
	background: var(--milk-color);
	border: none;
	box-shadow: 0 0 0 2px #333;
}

.selected-knowledge {
	background-color: rgba(255, 255, 255, 0.8) !important;
	border: 2px solid #333 !important;
	/* box-shadow: 2px 2px 0 #333 !important; */
	transform: translate(-1px, -1px) !important;
}

.selected-knowledge:active {
	transform: translate(0, 0) !important;
	box-shadow: 0 0 0 #333 !important;
}

/* 按钮样式 */
.retro-btn {
	display: inline-block;
}

.retro-btn .btn-shadow {
	padding: 2px;
	background: #000;
	border-radius: 6px;
}

.retro-btn .btn-edge {
	padding: 2px;
	background: #fff;
	border-radius: 5px;
}

.retro-btn .btn-face {
	padding: 8px 16px;
	background: #fff;
	border-radius: 4px;
	font-size: 14px;
	transition: all 0.2s;
}

.retro-btn:hover .btn-face {
	background: #f0f0f0;
}

/* 小按钮样式 */
.retro-btn-xs {
	display: inline-block;
}

.retro-btn-xs .btn-shadow {
	padding: 2px;
	background: #000;
	border-radius: 4px;
}

.retro-btn-xs .btn-edge {
	padding: 2px;
	background: #fff;
	border-radius: 3px;
}

.retro-btn-xs .btn-face {
	padding: 2px 12px;
	font-size: 12px;
	background: #fff;
	border-radius: 2px;
	transition: all 0.2s;
}

.retro-btn-xs:hover .btn-face {
	background: #f0f0f0;
}

.retro-btn-xs:active .btn-shadow {
	padding: 1px;
}

.retro-btn-xs:active .btn-edge {
	padding: 1px;
}

/* 文本选择效果 */
::selection {
	background: rgba(79, 70, 229, 0.2);
}
</style>
