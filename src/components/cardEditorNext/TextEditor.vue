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
		<!-- <div class="flex justify-center mt-6">
			<button class="retro-btn-large" @click="createCollection">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">
							<span>生成卡片</span>
						</div>
					</div>
				</div>
			</button>
		</div> -->
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

// bazinga:use 说明书
// bazinga:lfg/omg/wtf 确认
// 提示：是否确认。
// bazinga:article 自动生成(默认为article/medium)
// bazinga:dialogues:easy/medium/hard/insane
// bazinga:url:[url] 导入 url
// bazinga:md/pdf 导入文件

const emit = defineEmits([
	"update:modelValue",
	"create-collection",
	"back-to-preview",
]);

const waitingForConfirmation = ref(false);
const isReconfirming = ref(false); // 重新确认状态标志
const checkCommand = (event) => {
	// 获取文本内容并按行分割
	const allLines = editorContent.value.split("\n");
	// 获取最后一行文本并去除首尾空格
	const lastLine = allLines[allLines.length - 1].trim();

	// 检查最后一行是否为命令
	if (lastLine.includes("bazinga/article")) {
		event.preventDefault(); // 阻止回车键的默认行为
		// 移除包含命令的最后一行
		editorContent.value = allLines.slice(0, -1).join("\n");
		handleAutoGenerate();
		return;
	}

	if (
		lastLine.includes("bazinga/lfg") ||
		lastLine.includes("bazinga/omg") ||
		lastLine.includes("bazinga/wtf")
	) {
		event.preventDefault();
		// 移除包含命令的最后一行
		editorContent.value = allLines.slice(0, -1).join("\n");

		// 添加确认提示，如果有内容则添加换行符
		const trimmedContent = editorContent.value.trim();
		if (trimmedContent) {
			editorContent.value =
				trimmedContent +
				"\n\n即将生成卡片，请确认文本内容无误，输入 yes 继续，输入 no 取消：\n\n";
		} else {
			editorContent.value =
				"即将生成卡片，请确认文本内容无误，输入 yes 继续，输入 no 取消：\n\n";
		}

		// 设置确认状态
		waitingForConfirmation.value = true;
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
				editorContent.value.split("请输入 yes 或 no：")[0];
			isReconfirming.value = false; // 重置重新确认标志
		} else {
			contentWithoutConfirmation = editorContent.value.split(
				"即将生成卡片，请确认文本内容无误，输入 yes 继续，输入 no 取消："
			)[0];
		}

		if (response === "yes" || response === "y") {
			// 用户确认继续
			editorContent.value = contentWithoutConfirmation;

			showRitualAnimation().then((success) => {
				// 只有在动画成功完成时才执行生成操作
				if (success) {
					createCollection();
				}
			});
		} else if (response === "no" || response === "n") {
			// 用户取消操作
			editorContent.value = contentWithoutConfirmation;
		} else {
			// 无效响应，保持确认状态
			editorContent.value =
				contentWithoutConfirmation + "请输入 yes 或 no：\n\n";

			// 保持确认状态，但设置重新确认标志
			isReconfirming.value = true;
			return;
		}

		// 重置确认状态
		waitingForConfirmation.value = false;
		return;
	}

	const urlCommandRegex = /bazinga\/url\/(https?:\/\/.+)/i;
	const match = lastLine.match(urlCommandRegex);

	if (match) {
		event.preventDefault();
		// 移除包含命令的最后一行
		editorContent.value = allLines.slice(0, -1).join("\n");
		const url = match[1];
		importFromUrl(url);
		return;
	}
};

const showRitualAnimation = async () => {
	// 检查内容是否为空
	const trimmedContent = editorContent.value.trim();
	if (!trimmedContent) {
		// 内容为空，显示提示
		editorContent.value = "文本内容为空，请先添加文本再生成卡片。";
		// 等待用户查看提示
		await new Promise((resolve) => setTimeout(resolve, 2000));
		// 清空提示
		editorContent.value = "";
		return Promise.resolve(false);
	}

	const messages = [
		"正在分析文本内容...",
		"正在构建卡片结构...",
		"卡片马上呈现 🚀",
		"Bazinga !!",
	];

	// 清除当前内容末尾的空行
	let content = trimmedContent;

	// 依次显示消息
	for (let i = 0; i < messages.length; i++) {
		// 第一条消息不添加换行符，后续消息添加
		if (i === 0) {
			content += "\n\n" + messages[i];
		} else {
			content += "\n" + messages[i];
		}
		editorContent.value = content;

		// 等待一小段时间
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	// 最后一条消息显示后再等待一会
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// 清除动画消息
	editorContent.value = editorContent.value.split("正在分析文本内容")[0].trim();

	return Promise.resolve(true);
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
		// 显示加载中提示
		showToast({ message: "正在生成文章...", type: "info" });

		// 获取命令中可能包含的主题信息
		const allLines = editorContent.value.split("\n");
		const lastLine = allLines[allLines.length - 1].trim();

		// 检查是否包含主题信息 (bazinga/article:主题)
		let topic = null;
		const topicMatch = lastLine.match(/bazinga\/article(?::(.+))?/);
		if (topicMatch && topicMatch[1]) {
			topic = topicMatch[1].trim();
		}

		// 清空当前输入的命令
		editorContent.value = "";

		// 调用后端API生成文章
		const response = await apiClient.post("/translation/generate-article", {
			topic: topic,
		});

		if (response.data.code === 200 && response.data.data.article) {
			// 添加标题和格式化
			let formattedArticle = "";

			// 如果文章没有以#开头，添加一个标题
			if (!response.data.data.article.trim().startsWith("#")) {
				formattedArticle = `# ${topic || "Default Title"}\n\n`;
			}

			// 添加文章内容
			formattedArticle += response.data.data.article;

			// 设置生成的内容到编辑器
			editorContent.value = formattedArticle;

			showToast({ message: "文章生成成功", type: "success" });
		} else {
			throw new Error("生成文章失败");
		}
	} catch (error) {
		console.error("自动生成文章失败:", error);
		// 恢复一个基本的文章结构，以防API调用失败
		editorContent.value = `# 自动生成的文章

很抱歉，无法从服务器获取文章内容。请稍后再试。`;
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
	height: calc(100vh - 130px);
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
