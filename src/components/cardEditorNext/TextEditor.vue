<template>
	<div>
		<!-- 原文编辑器 -->
		<div
			class="editor-container text-sm relative w-2/3 mx-auto"
			v-if="isCustom"
		>
			<!-- 按钮组 -->
			<div class="editor-action-buttons">
				<div class="tooltip" data-tip="退出">
					<button class="retro-btn" @click="backToPreview">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<i class="bi bi-box-arrow-left text-lg"></i>
								</div>
							</div>
						</div>
					</button>
				</div>
				<div class="tooltip" data-tip="从URL导入">
					<button class="retro-btn" @click="openImportDialog">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<i class="bi bi-cloud-download text-lg"></i>
								</div>
							</div>
						</div>
					</button>
				</div>
			</div>
			<div
				class="editor-wrapper text-sm rounded shadow-editor"
				style="overflow-y: auto"
			>
				<textarea
					id="editor"
					class="editorjs-container"
					v-model="editorContent"
					placeholder="请在此编辑文本..."
					@paste="handlePaste($event)"
				></textarea>
			</div>
		</div>
		<!-- 添加制作卡片合辑按钮 -->
		<div class="flex justify-center mt-6">
			<button class="retro-btn-large" @click="createCollection">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">
							<i class="bi bi-collection-play me-2"></i>
							<span>制作卡片合辑</span>
						</div>
					</div>
				</div>
			</button>
		</div>

		<!-- 在 components 中添加引用 -->
		<ImportDialog ref="importDialogRef" @confirm="handleImportConfirm" />
	</div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { showToast } from "@/components/common/toast.js";
import { useRoute, useRouter } from "vue-router";
import ImportDialog from "@/components/cardEditorNext/ImportDialog.vue";

const route = useRoute();
const router = useRouter();
const editor = ref(null);
const totalDialogues = ref(0); // 总对话数

const currentDialogue = ref({}); // 当前对话
const currentKnowledge = ref(new Map()); // 当前知识点
const scriptJson = ref(null);

const isSaved = ref(false);

const editorContent = ref("");

const isCustom = ref(false);

const importDialogRef = ref(null);

const emit = defineEmits([
	"update:modelValue",
	"create-collection",
	"back-to-preview",
]);

const openImportDialog = () => {
	importDialogRef.value?.openDialog();
};

const handleImportConfirm = async (importData) => {
	const { content, type, mode } = importData;

	// 根据导入类型和模式处理数据
	let newBlocks = [];

	if (type === "scene") {
		// 按场景导入
		content.scenes.forEach((scene, sceneIndex) => {
			// 添加场景标题
			newBlocks.push({
				type: "paragraph",
				data: {
					text: `# Header`,
				},
			});

			// 添加场景内容
			scene.forEach((paragraph) => {
				newBlocks.push({
					type: "paragraph",
					data: {
						text: paragraph,
					},
				});
			});
		});
	} else {
		// 按段落导入
		newBlocks.push({
			type: "paragraph",
			data: {
				text: `# Header`,
			},
		});

		// 添加场景内容
		content.paragraphs.forEach((paragraph) => {
			newBlocks.push({
				type: "paragraph",
				data: {
					text: paragraph,
				},
			});
		});
	}

	if (mode === "replace") {
		// 替换模式：清空现有内容
		await editor.value.clear();
		await editor.value.render({ blocks: newBlocks });
	} else {
		// 追加模式：获取现有内容后追加
		const currentContent = await editor.value.save();
		const updatedBlocks = [...currentContent.blocks, ...newBlocks];
		await editor.value.render({ blocks: updatedBlocks });
	}

	showToast({ message: "导入成功", type: "success" });
};

onMounted(async () => {
	if (route.query.mode === "edit") {
		getDefaultJson();
		getDefaultKnowledge();
	}
});

// 添加粘贴事件监听
const handlePaste = (event) => {
	const clipboardData = event.clipboardData;
	const pastedData = clipboardData.getData("text/plain");

	// 处理空行：两个或两个以上空行变成1个，1个空行保留
	const processedData = pastedData.replace(/\n{2,}/g, "\n");

	// 阻止默认粘贴，但在这里手动插入处理后的内容
	event.preventDefault();
	document.execCommand("insertText", false, processedData);
};

const backToPreview = () => {
	const courseId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const sign = route.query.sign;
	const mode = route.query?.mode;
	if (mode === "edit" && !isSaved.value) {
		router.replace("/collections/" + courseId);
		return;
	}
	router.replace({
		path: `/collections/${courseId}/${season}/${episode}`,
		query: {
			sign: sign,
		},
	});
};

const createCollection = async () => {
	try {
		// 获取文本内容并按空行分割成场景
		const textContent = editorContent.value;
		const scenes = textContent.split(/\n\s*\n/).filter((scene) => scene.trim());

		// 处理每个场景
		const blocks = [];
		scenes.forEach((scene, sceneIndex) => {
			// 将场景按行分割
			const lines = scene.split("\n").filter((line) => line.trim());

			// 检查第一行是否为标题（以#开头）
			if (lines.length > 0) {
				if (lines[0].startsWith("#")) {
					// 使用现有标题
					blocks.push({
						id: `title_${sceneIndex}`,
						type: "paragraph",
						data: {
							text: lines[0],
						},
					});
					// 处理剩余行
					lines.slice(1).forEach((line, lineIndex) => {
						blocks.push({
							id: `block_${sceneIndex}_${lineIndex}`,
							type: "paragraph",
							data: {
								text: line,
							},
						});
					});
				} else {
					// 添加空标题
					blocks.push({
						id: `title_${sceneIndex}`,
						type: "paragraph",
						data: {
							text: "# Default Title",
						},
					});
					// 处理所有行
					lines.forEach((line, lineIndex) => {
						blocks.push({
							id: `block_${sceneIndex}_${lineIndex}`,
							type: "paragraph",
							data: {
								text: line,
							},
						});
					});
				}
			}
		});

		// 触发事件，将数据传递给父组件
		emit("create-collection", blocks);
	} catch (error) {
		console.error("制作卡片合辑失败:", error);
		showToast({ message: "制作失败，请重试", type: "error" });
	}
};

const getDefaultJson = () => {
	const season = route.params.season;
	const episode = route.params.episode;
	const defaultData = [
		{
			id: "Scene1",
			season: season,
			episode: episode,
			title: "Default Card Title",
			text: [],
			text_zh: [],
		},
	];
	scriptJson.value = {
		scenes: [
			{
				id: season + "-" + episode,
				title: episode,
				dialogues: defaultData,
			},
		],
	};
	currentDialogue.value = defaultData[0];
	totalDialogues.value = defaultData[0].length;
	isCustom.value = true;
};

const getDefaultKnowledge = () => {
	currentKnowledge.value = new Map();
};
</script>
<style scoped>
.retro-btn {
	position: relative;
	width: 36px;
	height: 36px;
	border: none;
	background: none;
	cursor: pointer;
}

.retro-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 6px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 6px;
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
	border-radius: 6px;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 按钮交互效果 */
.retro-btn:hover:not(:disabled) .btn-face {
	background-color: white;
}

.retro-btn:active:not(:disabled) .btn-edge,
.retro-btn:active:not(:disabled) .btn-face {
	transform: translateY(0);
}

.editor-wrapper {
	height: 100%;
	overflow-y: auto;
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
}

.editor-wrapper::-webkit-scrollbar {
	display: none; /* Chrome, Safari and Opera */
}

.retro-btn-large {
	position: relative;
	height: 42px;
	border: none;
	background: none;
	cursor: pointer;
	padding: 0 24px;
	width: 300px;
}

.retro-btn-large .btn-face {
	padding: 0 24px;
	font-size: 16px;
}

.retro-btn-large .btn-face i {
	font-size: 18px;
}

/* 编辑器容器 */
.editor-container {
	position: relative;
	text-align: left;
	height: calc(100vh - 230px);
	border: 3px solid #333;
	border-radius: 12px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
	overflow: visible;
}

.editorjs-container {
	padding: 2rem;
	min-height: 100%;
	width: 100%;
	height: 100%;
	border: none;
	outline: none;
	resize: none;
	font-family: inherit;
	line-height: 2.5;
	background: transparent;
}

.editor-action-buttons {
	position: absolute;
	left: -80px;
	top: 20px;
	display: flex;
	flex-direction: column;
	gap: 15px;
	z-index: 100;
	background-color: rgba(255, 255, 255, 0.8);
	padding: 12px;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(5px);
}
</style>
