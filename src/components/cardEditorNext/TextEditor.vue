<template>
	<div>
		<!-- 原文编辑器 -->
		<div class="editor-container w-4/5 mx-auto relative" v-if="isCustom">
			<div class="editor-wrapper mx-auto text-sm w-4/5">
				<textarea
					id="editor"
					class="editorjs-container"
					v-model="editorContent"
					placeholder="请在此编辑文本..."
					@paste="handlePaste($event)"
					@keydown.enter="checkCommand($event)"
				></textarea>
			</div>
		</div>
		<!-- 添加制作卡片合辑按钮 -->
		<div class="flex justify-center mt-6">
			<button class="retro-btn-large" @click="createCollection">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">
							<span>生成卡片</span>
						</div>
					</div>
				</div>
			</button>
		</div>
	</div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { showToast } from "@/components/common/toast.js";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api";

const route = useRoute();
const router = useRouter();
const totalDialogues = ref(0); // 总对话数

const currentDialogue = ref({}); // 当前对话
const currentKnowledge = ref(new Map()); // 当前知识点
const scriptJson = ref(null);

const editorContent = ref("");
const isCustom = ref(false);
// 添加导入状态变量
const importing = ref(false);

const emit = defineEmits([
	"update:modelValue",
	"create-collection",
	"back-to-preview",
]);

const checkCommand = (event) => {
	const text = editorContent.value.trim();
	if (text === "bazinga:sample") {
		event.preventDefault(); // 阻止回车键的默认行为
		handleAutoGenerate();
	}

	const urlCommandRegex = /^bazinga:url:(https?:\/\/.+)$/i;
	const match = text.match(urlCommandRegex);

	if (match) {
		event.preventDefault(); // 阻止回车键的默认行为
		const url = match[1];
		importFromUrl(url);
	}
};

// 从URL导入内容
const importFromUrl = async (url) => {
	if (!url || importing.value) return;

	try {
		// 清空当前输入的命令
		editorContent.value = "";

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
			editorContent.value = importedContent.trim();

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
		// 清空当前输入的命令
		editorContent.value = "";

		// 显示加载中提示
		showToast({ message: "正在生成文章...", type: "info" });

		// 这里实现自动生成文章的逻辑
		// 示例：生成一个简单的文章结构
		const generatedContent = `# 自动生成的文章标题

## 第一部分

这是自动生成的第一个段落内容。这里可以放置一些介绍性的文字，说明文章的主要内容和目的。

## 第二部分

这是第二个部分的内容。在这里可以展开论述文章的主要观点和论据。

## 第三部分

这是文章的结论部分，总结前面的内容并给出最终的观点或建议。`;

		// 设置生成的内容到编辑器
		editorContent.value = generatedContent;

		showToast({ message: "文章生成成功", type: "success" });
	} catch (error) {
		console.error("自动生成文章失败:", error);
		showToast({ message: "生成失败，请重试", type: "error" });
	}
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

	// 处理空行：保留段落间的空行，但合并多个空行为一个
	const processedData = pastedData
		.replace(/\n{3,}/g, "\n\n") // 三个以上换行符替换为两个（保留段落间距）
		.replace(/([^\n])\n([^\n])/g, "$1 $2"); // 单个换行符替换为空格（减少行间距）

	// 阻止默认粘贴，但在这里手动插入处理后的内容
	event.preventDefault();
	document.execCommand("insertText", false, processedData);
};

const backToPreview = () => {
	const courseId = route.params.id;
	// 新建模式下直接返回列表页
	router.replace(`/collections/${courseId}`);
};

const createCollection = async () => {
	try {
		// 获取文本内容
		const textContent = editorContent.value;

		// 按行分割文本
		const allLines = textContent
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line);

		// 存储所有场景
		const scenes = [];
		let currentScene = [];

		// 遍历所有行，按标题分割场景
		allLines.forEach((line) => {
			// 如果是标题行（以"# "开头，注意井号后有空格）且不是第一行，则开始新场景
			if (line.match(/^#\s/) && currentScene.length > 0) {
				scenes.push([...currentScene]);
				currentScene = [line];
			} else {
				currentScene.push(line);
			}
		});

		// 添加最后一个场景
		if (currentScene.length > 0) {
			scenes.push(currentScene);
		}

		// 处理每个场景
		const blocks = [];
		scenes.forEach((scene, sceneIndex) => {
			// 检查第一行是否为标题（以"# "开头，注意井号后有空格）
			if (scene.length > 0) {
				if (scene[0].match(/^#\s/)) {
					// 使用现有标题
					blocks.push({
						id: `title_${sceneIndex}`,
						type: "paragraph",
						data: {
							text: scene[0],
						},
					});
					// 处理剩余行
					scene.slice(1).forEach((line, lineIndex) => {
						blocks.push({
							id: `block_${sceneIndex}_${lineIndex}`,
							type: "paragraph",
							data: {
								text: line,
							},
						});
					});
				} else {
					// 添加默认标题
					blocks.push({
						id: `title_${sceneIndex}`,
						type: "paragraph",
						data: {
							text: "# Default Title",
						},
					});
					// 处理所有行
					scene.forEach((line, lineIndex) => {
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
	overflow: visible;
	overflow-y: auto;
	border: 3px solid #333;
	border-radius: 12px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
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
	overflow: visible;
	background: transparent;
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
	line-height: 2;
	background: transparent;
}

.editorjs-container::placeholder {
	color: #aaa;
}

.editor-action-buttons {
	position: absolute;
	left: 20px;
	top: 20px;
	display: flex;
	flex-direction: column;
	gap: 15px;
	z-index: 1000;
	background-color: rgba(255, 255, 255, 0.8);
	padding: 12px;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(5px);
}
</style>
