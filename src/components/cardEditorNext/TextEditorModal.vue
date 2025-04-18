<template>
	<dialog ref="modalRef" class="modal">
		<div class="modal-box max-w-5xl min-h-[600px] p-0">
			<!-- 添加右上角关闭按钮 -->

			<div
				class="absolute right-3 top-3 flex items-center gap-2"
				style="z-index: 100"
			>
				<!-- 使用说明按钮 -->
				<button
					class="btn btn-sm btn-circle btn-ghost"
					@click.prevent="toggleGuide"
				>
					<i class="bi bi-question-circle"></i>
				</button>

				<!-- 关闭按钮 -->
				<form method="dialog">
					<button class="btn btn-sm btn-circle btn-ghost">
						<i class="bi bi-x-lg"></i>
					</button>
				</form>
			</div>

			<div class="editor-wrapper text-sm h-full text-left">
				<div class="decorated-card px-4 min-h-[600px]">
					<div class="content-area flex flex-col h-full">
						<!-- 添加新场景区域 -->

						<div class="new-scene-area flex-1 flex flex-col">
							<textarea
								v-model="newSceneContent"
								placeholder="在此输入新场景内容..."
								class="editorjs-container"
								@paste="handlePaste($event)"
								@keydown.enter="checkCommand($event)"
							></textarea>
						</div>

						<div
							v-if="showGuidePanel"
							class="guide-panel p-4 border-t-2 border-gray-200"
						>
							<div class="command-list text-sm space-y-2">
								<div class="command-item">
									<span class="command-code">/bazinga/new</span>
									<span class="command-desc ml-2 text-gray-600"
										>自动生成文章</span
									>
								</div>
								<div class="command-item">
									<span class="command-code">/bazinga/url:{url}</span>
									<span class="command-desc ml-2 text-gray-600"
										>从URL导入内容</span
									>
								</div>
								<div class="command-item">
									<span class="command-code">/bazinga/go</span>
									<span class="command-desc ml-2 text-gray-600"
										>确认生成卡片</span
									>
								</div>
								<div class="command-item">
									<span class="command-code">/bazinga/go:{number}</span>
									<span class="command-desc ml-2 text-gray-600"
										>确认生成卡片并插入到指定位置</span
									>
								</div>
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
import apiClient from "@/api";

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
const newSceneContent = ref("");

// 添加导入状态变量
const importing = ref(false);

// 添加确认状态变量
const waitingForConfirmation = ref(false);

const isReconfirming = ref(false);

const insertScenePosition = ref(-1); // 默认为-1，表示插入到最后

// 添加指南面板显示状态
const showGuidePanel = ref(false);

// 切换指南面板显示状态
const toggleGuide = () => {
	showGuidePanel.value = !showGuidePanel.value;
};

// 初始化场景状态

onMounted(() => {
	sceneStates.value = props.scenes.map(() => false); // 默认全部展开
});

// 添加命令检查功能

const checkCommand = (event) => {
	// 获取文本内容并按行分割

	const allLines = newSceneContent.value.split("\n");

	// 获取最后一行文本并去除首尾空格

	const lastLine = allLines[allLines.length - 1].trim();

	// 检查最后一行是否为命令

	if (lastLine.includes("bazinga/new")) {
		console.log("ddd");
		event.preventDefault(); // 阻止回车键的默认行为

		// 移除包含命令的最后一行
		newSceneContent.value = allLines.slice(0, -1).join("\n");
		handleAutoGenerate();
		return;
	}

	// 检查是否为场景插入命令

	const lfgCommandRegex = /bazinga\/go(?:\/(\d+))?/i;
	const lfgMatch = lastLine.match(lfgCommandRegex);

	if (
		lastLine.includes("bazinga/go") ||
		lastLine.includes("bazinga/lfg") ||
		lastLine.includes("bazinga/omg") ||
		lastLine.includes("bazinga/wtf")
	) {
		event.preventDefault();

		// 移除包含命令的最后一行

		newSceneContent.value = allLines.slice(0, -1).join("\n");

		// 如果是 bazinga/lfg/数字 格式，提取插入位置

		let insertPosition = -1; // 默认为-1，表示插入到最后

		if (lfgMatch && lfgMatch[1]) {
			insertPosition = parseInt(lfgMatch[1]);
		}

		// 添加确认提示，如果有内容则添加换行符

		const trimmedContent = newSceneContent.value.trim();

		if (trimmedContent) {
			newSceneContent.value =
				trimmedContent +
				`\n\n即将添加场景${
					insertPosition >= 0 ? `到位置 ${insertPosition}` : ""
				}，请确认文本内容无误，输入 yes 继续，输入 no 取消：\n\n`;
		} else {
			newSceneContent.value = `即将添加场景${
				insertPosition >= 0 ? `到位置 ${insertPosition}` : ""
			}，请确认文本内容无误，输入 yes 继续，输入 no 取消：\n\n`;
		}

		// 设置确认状态并保存插入位置

		waitingForConfirmation.value = true;

		// 保存插入位置到一个新的 ref 变量

		insertScenePosition.value = insertPosition;

		return;
	}

	// 处理确认响应

	if (waitingForConfirmation.value) {
		event.preventDefault();

		// 获取用户响应

		const response = lastLine.trim().toLowerCase();

		// 根据是否是重新确认，选择不同的分割文本

		let contentWithoutConfirmation;

		if (isReconfirming.value) {
			contentWithoutConfirmation =
				newSceneContent.value.split("请输入 yes 或 no：")[0];

			isReconfirming.value = false; // 重置重新确认标志
		} else {
			contentWithoutConfirmation = newSceneContent.value.split(
				/即将添加场景(?:到位置 \d+)?，请确认文本内容无误，输入 yes 继续，输入 no 取消：/
			)[0];
		}

		if (response === "yes" || response === "y") {
			// 用户确认继续

			newSceneContent.value = contentWithoutConfirmation;

			handleAddScene(insertScenePosition.value);
		} else if (response === "no" || response === "n") {
			// 用户取消操作

			newSceneContent.value = contentWithoutConfirmation;
		} else {
			// 无效响应，保持确认状态

			newSceneContent.value =
				contentWithoutConfirmation + "请输入 yes 或 no：\n\n";

			// 保持确认状态，但设置重新确认标志

			isReconfirming.value = true;

			return;
		}

		// 重置确认状态

		waitingForConfirmation.value = false;

		return;
	}

	const urlCommandRegex = /bazinga\/url:(https?:\/\/.+)/i;

	const match = lastLine.match(urlCommandRegex);

	if (match) {
		event.preventDefault();

		// 移除包含命令的最后一行

		newSceneContent.value = allLines.slice(0, -1).join("\n");

		const url = match[1];

		importFromUrl(url);

		return;
	}
};

// 从URL导入内容

const importFromUrl = async (url) => {
	if (!url || importing.value) return;

	try {
		// 显示加载中提示

		importing.value = true;

		showToast({ message: "正在导入内容...", type: "info" });

		const response = await apiClient.post("/scripts/import-url", {
			url: url,
		});

		if (response.data.code === 200) {
			const content = response.data.data.content;

			// 处理导入的内容

			let importedContent = "";

			// 添加标题

			importedContent += "# 导入的内容\n\n";

			// 添加段落，保持段落间距

			content.paragraphs.forEach((paragraph) => {
				if (paragraph.trim()) {
					// 只添加非空段落

					importedContent += paragraph + "\n\n"; // 使用两个换行符增加段间距
				}
			});

			// 设置到编辑器

			newSceneContent.value = importedContent.trim();

			showToast({ message: "内容导入成功", type: "success" });
		} else {
			showToast({ message: response.data.message, type: "error" });
		}
	} catch (error) {
		console.error("导入失败:", error);

		showToast({
			message: error.response?.data?.message || "导入失败，请检查URL是否正确",

			type: "error",
		});
	} finally {
		importing.value = false;
	}
};

// 添加自动生成方法

const handleAutoGenerate = async () => {
	try {
		showToast({ message: "正在生成文章...", type: "info" });

		// 获取命令中可能包含的主题信息
		const allLines = newSceneContent.value.split("\n");
		const lastLine = allLines[allLines.length - 1].trim();

		let topic = null;
		const topicMatch = lastLine.match(/bazinga\/new(?::(.+))?/);
		if (topicMatch && topicMatch[1]) {
			topic = topicMatch[1].trim();
		}

		// 清空当前输入的命令
		newSceneContent.value = "";

		// 调用后端API生成文章
		const response = await apiClient.post("/translation/generate-article", {
			topic: topic,
		});

		if (response.data.code === 200) {
			if (response.data.data.error) {
				showToast({ message: response.data.data.error, type: "error" });
				return;
			}

			if (response.data.data.article) {
				let formattedArticle = "";
				if (!response.data.data.article.trim().startsWith("#")) {
					formattedArticle = `# ${topic || "Default Title"}\n\n`;
				}
				formattedArticle += response.data.data.article;

				// 直接设置到 newSceneContent
				newSceneContent.value = formattedArticle.trim();
			}
		} else {
			throw new Error("生成文章失败");
		}
	} catch (error) {
		console.error("自动生成文章失败:", error);
		newSceneContent.value = `# 自动生成的文章\n\n很抱歉，无法从服务器获取文章内容。请稍后再试。`;
		showToast({ message: "生成失败，请重试", type: "error" });
	}
};

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

const handleAddScene = (position = -1) => {
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

	// 创建更新后的场景数组

	const updatedScenes = [...props.scenes];

	// 根据位置插入新场景

	if (position === 0) {
		// 插入到最开始

		updatedScenes.unshift(newScene);
	} else if (position > 0 && position < updatedScenes.length) {
		// 插入到指定位置

		updatedScenes.splice(position, 0, newScene);
	} else {
		// 插入到最后（默认行为）或位置无效

		updatedScenes.push(newScene);
	}

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

const showModal = () => {
	modalRef.value?.showModal();
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

.text-content :deep(mark.highlight-knowledge) {
	background-color: rgba(212, 35, 122, 0.1);

	color: var(--primary);
}

.scene-content {
	transition: all 0.3s ease;
}

.new-scene-area {
	background: rgba(255, 255, 255, 0.8);

	padding: 2rem 0;

	display: flex;

	flex-direction: column;

	height: 100%;
}

.editorjs-container {
	padding: 0;

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

.command-code {
	font-family: monospace;
	background: #f5f5f5;
	padding: 2px 6px;
	border-radius: 4px;
}
</style>
