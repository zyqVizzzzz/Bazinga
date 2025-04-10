<template>
	<dialog ref="modalRef" class="modal">
		<div class="modal-box max-w-5xl min-h-[600px] p-0">
			<div class="editor-wrapper text-sm h-full text-left">
				<div class="decorated-card pt-6 px-4 min-h-[600px]">
					<div class="content-area flex flex-col h-full">
						<div class="scenes-list-area py-4">
							<draggable
								:model-value="scenes"
								@update:model-value="handleDragUpdate"
								item-key="sceneIndex"
								handle=".handle"
								class="space-y-2"
							>
								<template #item="{ element: scene, index: sceneIndex }">
									<div class="scene-wrapper hover:bg-gray-50 rounded-md p-2">
										<!-- 添加场景标题和展开/收起按钮 -->
										<div
											class="scene-header flex items-center gap-2 group pr-2"
										>
											<!-- 拖动图标 -->
											<i
												class="bi bi-grip-vertical opacity-0 group-hover:opacity-100 transition-opacity cursor-move handle relative"
											></i>

											<!-- 标题 -->
											<h3
												class="text-sm font-bold flex-grow"
												@click.stop="toggleScene(sceneIndex)"
											>
												<!-- <span class="text-sm font-normal text-gray-700"> -->
												{{
													scene[0]?.text?.replace(/^#\s*/, "") || "未命名场景"
												}}
												<!-- </span> -->
											</h3>
											<!-- 合并按钮 -->
											<i
												v-if="sceneIndex > 0"
												class="bi bi-arrow-up-square text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer px-2 py-1 hover:bg-blue-50 rounded"
												@click.stop="mergeSceneUp(sceneIndex)"
												title="向上合并场景"
											></i>
											<i
												class="bi bi-trash text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer px-2 py-1 hover:bg-red-50 rounded"
												@click.stop="deleteScene(sceneIndex)"
											></i>
										</div>

										<!-- 场景内容，添加展开/收起控制 -->
										<div
											class="scene-content space-y-2 mt-2"
											v-show="sceneStates[sceneIndex]"
										>
											<template
												v-for="(block, blockIndex) in scene"
												:key="blockIndex"
											>
												<div
													v-if="
														!block.isTranslated &&
														!block.isKnowledge &&
														!block.isTitle
													"
													class="text-block px-5 py-2 hover:bg-gray-100 rounded"
												>
													<div
														class="text-content"
														v-html="block.displayText || block.text"
													></div>
												</div>
											</template>
										</div>
									</div>
								</template>
							</draggable>
						</div>

						<!-- 添加新场景区域 -->
						<div class="new-scene-area pt-6 flex-1 flex flex-col">
							<div class="flex border-2 border-gray-700 flex-1">
								<textarea
									v-model="newSceneContent"
									placeholder="在此输入新场景内容..."
									class="editorjs-container"
									@paste="handlePaste($event)"
								></textarea>
								<div
									class="w-[80px] flex items-center justify-center cursor-pointer add-scene-btn"
									@click="handleAddScene"
									:class="{
										'add-scene-btn-disabled': !newSceneContent.trim(),
									}"
								>
									<div class="add-btn-inner">
										<i class="bi bi-plus text-2xl"></i>
									</div>
								</div>
							</div>

							<div class="flex justify-end mt-4">
								<form method="dialog">
									<button class="retro-btn w-[80px] h-10">
										<div class="btn-shadow">
											<div class="btn-edge">
												<div class="btn-face">取消</div>
											</div>
										</div>
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { showToast } from "@/components/common/toast.js";
import draggable from "vuedraggable";

const props = defineProps({
	scenes: {
		type: Array,
		required: true,
	},
});

const modalRef = ref(null);
// 添加场景状态管理
const sceneStates = ref([]);

const emit = defineEmits(["update"]);

// 新场景表单数据
const newSceneTitle = ref("");
const newSceneContent = ref("");

// 初始化场景状态
onMounted(() => {
	sceneStates.value = props.scenes.map(() => false); // 默认全部展开
});

const handlePaste = (event) => {
	const clipboardData = event.clipboardData;
	const pastedData = clipboardData.getData("text/plain");
	const processedData = pastedData.replace(/\n{2,}/g, "\n");
	event.preventDefault();
	document.execCommand("insertText", false, processedData);
};

const handleDragUpdate = (updatedList) => {
	emit("update", updatedList);

	// 更新场景状态
	const newStates = [...sceneStates.value];
	sceneStates.value = updatedList.map((_, index) => newStates[index] || false);
};

// 修改 handleAddScene 函数
const handleAddScene = () => {
	if (!newSceneContent.value.trim()) return;

	const lines = newSceneContent.value.split("\n").filter((line) => line.trim());
	if (lines.length === 0) return;

	const newScene = [];
	const sceneIndex = props.scenes.length;

	// 检查第一行是否为标题（以#开头）
	if (lines[0].startsWith("#")) {
		newScene.push({
			id: `title_${sceneIndex}`,
			text: lines[0],
			isTitle: true,
			narration: false,
			isTranslated: false,
		});
		// 处理剩余行
		lines.slice(1).forEach((line, index) => {
			if (line.trim()) {
				newScene.push({
					id: `block_${sceneIndex}_${index}`,
					text: line,
					isTitle: false,
					narration: false,
					isTranslated: false,
				});
			}
		});
	} else {
		newScene.push({
			id: `title_${sceneIndex}`,
			text: `# Default Title`,
			isTitle: true,
			narration: false,
			isTranslated: false,
		});
		// 处理所有行
		lines.forEach((line, index) => {
			if (line.trim()) {
				newScene.push({
					id: `block_${sceneIndex}_${index}`,
					text: line,
					isTitle: false,
					narration: false,
					isTranslated: false,
				});
			}
		});
	}

	const updatedScenes = [...props.scenes, newScene];
	emit("update", updatedScenes); // 发送 update 事件和更新后的场景数据

	// 更新所有场景的状态
	sceneStates.value = updatedScenes.map((_, index) => {
		if (index < props.scenes.length) {
			return sceneStates.value[index];
		}
		return true;
	});

	newSceneContent.value = "";
	showToast({ message: "场景添加成功", type: "success" });
};

// 切换场景展开/收起状态
const toggleScene = (index) => {
	sceneStates.value[index] = !sceneStates.value[index];
};

// 删除场景
const deleteScene = (index) => {
	if (confirm("确定要删除这个场景吗？")) {
		const updatedScenes = [...props.scenes];
		updatedScenes.splice(index, 1);
		emit("update", updatedScenes);

		// 更新场景状态
		sceneStates.value.splice(index, 1);

		showToast({ message: "场景删除成功", type: "success" });
	}
};

// 向上合并场景
const mergeSceneUp = (index) => {
	if (index <= 0) return; // 第一个场景不能向上合并

	if (confirm("确定要将此场景合并到上一个场景吗？")) {
		const updatedScenes = [...props.scenes];
		const currentScene = updatedScenes[index];
		const previousScene = updatedScenes[index - 1];

		// 过滤掉当前场景的标题块，只保留内容块
		const contentBlocks = currentScene.filter((block) => !block.isTitle);

		// 将内容块添加到上一个场景
		previousScene.push(...contentBlocks);

		// 从场景列表中移除当前场景
		updatedScenes.splice(index, 1);

		// 更新场景
		emit("update", updatedScenes);

		// 更新场景状态
		sceneStates.value.splice(index, 1);

		showToast({ message: "场景合并成功", type: "success" });
	}
};

const showModal = () => {
	modalRef.value?.showModal();
	// 自动滚动到输入区域
	setTimeout(() => {
		const textarea = document.querySelector(".editorjs-container");
		textarea?.scrollIntoView({ behavior: "smooth", block: "center" });
	}, 100);
};

const hideModal = () => {
	modalRef.value?.close();
};

defineExpose({
	showModal,
	hideModal,
});
</script>

<style scoped>
.modal {
	max-width: 1280px;
	margin: 0 auto;
	padding: 2rem;
}
.modal-box {
	background: var(--base-100);
	background: #fff;
	width: 64%;
	height: calc(100vh - 150px);
	position: relative;
	top: 0.25rem;
	border: 3px solid #333;
	border-radius: 12px;
	/* box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2); */
	overflow: visible;
}

.decorated-card {
	background: var(--base-100);
	border: 2px solid var(--primary-content);
	box-shadow: 4px 4px 0 var(--primary-content);
	border-radius: 12px;
	position: relative;
	overflow-y: auto;
	height: 100%;
}

.content-area {
	padding: 1rem;
}

.text-block {
	position: relative;
}

.text-content :deep(mark.highlight-knowledge) {
	background-color: rgba(212, 35, 122, 0.1);
	color: var(--primary);
}
/* 添加新样式 */
.scene-header {
	transition: all 0.2s ease;
}

.scene-header:hover {
	color: var(--primary);
}

.scene-content {
	transition: all 0.3s ease;
}

.new-scene-area {
	background: rgba(255, 255, 255, 0.8);
	padding: 1rem 0;
	display: flex;
	flex-direction: column;
	height: 100%;
}

.space-y-4 {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.editorjs-container {
	padding: 1rem;
	width: 100%;
	border: none;
	outline: none;
	resize: none;
	font-family: inherit;
	line-height: 2;
	background: transparent;
	flex: 1;
	min-height: 400px;
}

.content-area {
	padding: 1rem;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.editor-wrapper {
	overflow: visible;
	overflow-y: auto;

	border-radius: 12px;
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
	background: #fff;
}

.editor-wrapper::-webkit-scrollbar {
	display: none; /* Chrome, Safari and Opera */
}
.scene-wrapper {
	transition: background-color 0.2s ease;
}

.scene-header {
	cursor: pointer;
	user-select: none;
}

/* 拖动时的样式 */
.sortable-ghost {
	opacity: 0.5;
	background: var(--primary-content);
}

.sortable-drag {
	opacity: 0.9;
}

/* 场景列表区域样式 */
.scenes-list-area {
	background: rgba(255, 255, 255, 0.8);
	transition: all 0.3s ease;
	scrollbar-width: thin;
}

.scenes-list-area::-webkit-scrollbar {
	width: 6px;
}

.scenes-list-area::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 10px;
}

.scenes-list-area::-webkit-scrollbar-thumb {
	background: #888;
	border-radius: 10px;
}

.scenes-list-area::-webkit-scrollbar-thumb:hover {
	background: #555;
}

.scene-wrapper {
	transition: all 0.2s ease;
	border-left: 3px solid transparent;
}

.scene-wrapper:hover {
	border-left-color: var(--primary-content, #333);
}

/* 添加场景按钮样式 */
.add-scene-btn {
	background-color: var(--primary-content, #333);
	border-left: 2px solid var(--primary-content, #333);
	transition: all 0.2s ease;
	position: relative;
	overflow: hidden;
}

.add-scene-btn::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.1);
	transform: translateX(-100%);
	transition: transform 0.3s ease;
}

.add-scene-btn:hover::before {
	transform: translateX(0);
}

.add-scene-btn i {
	color: white;
	transition: transform 0.2s ease;
}

.add-scene-btn:hover i {
	transform: scale(1.2);
}

.add-scene-btn:active i {
	transform: scale(0.9);
}

.add-scene-btn-disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.add-scene-btn-disabled:hover::before {
	transform: translateX(-100%);
}

.add-scene-btn-disabled:hover i,
.add-scene-btn-disabled:active i {
	transform: scale(1);
}

.add-btn-inner {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	position: relative;
	z-index: 1;
}
</style>
