<template>
	<div>
		<!-- 原文编辑器 -->
		<div class="editor-container w-4/5 mx-auto relative" v-if="isCustom">
			<!-- 使用指南按钮 -->
			<button
				class="absolute right-[11%] top-[-2rem] flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
				@click="showGuideModal"
			>
				<i class="bi bi-question-circle text-lg"></i>
				<span class="text-sm">使用指南</span>
			</button>
			<div class="editor-wrapper mx-auto text-sm w-4/5 relative">
				<textarea
					id="editor"
					class="editorjs-container"
					v-model="editorContent"
					placeholder="请在此编辑文本..."
					spellcheck="false"
					:disabled="isGenerating"
					@paste="handlePaste($event)"
					@keydown.enter="checkCommand($event)"
					@keydown.esc="handleCancel"
				></textarea>
			</div>
		</div>

		<!-- 使用指南弹窗 -->
		<dialog ref="guideModalRef" class="modal">
			<div class="modal-box guide-modal retro-bw-modal">
				<h2 class="text-xl font-bold text-center mb-4 retro-title">
					文本编辑器使用指南
				</h2>

				<div class="guide-section">
					<h3 class="font-bold mb-2 flex items-center justify-center">
						<i class="bi bi-card-text"></i>
					</h3>
					<div class="structure-guide text-sm">
						<p class="mb-2">
							1. <strong>标题</strong>：使用
							<strong># 标题文本</strong> 创建标题，通过标题划分不同场景/卡片
						</p>
						<p class="mb-2">
							2. <strong>段落</strong>：空行分隔段落，可以让结构更清晰
						</p>
						<p class="mb-2">3. <strong>目前仅支持输入文本</strong></p>
						<div class="example-box">
							<pre class="text-sm">
# 第一个场景
这是第一个场景的内容。

# 第二个场景
新的标题开始了新的场景。
          </pre
							>
						</div>
					</div>
				</div>

				<div class="guide-section">
					<h3 class="font-bold mb-2 flex items-center justify-center">
						<i class="bi bi-keyboard text-lg"></i>
					</h3>

					<div class="command-list text-sm">
						<div class="command-item">
							<span class="command-code"
								>/bazinga/new +
								<span class="enter-hint">
									<i
										class="bi bi-arrow-return-left text-xxs relative top-[1px]"
									></i>
									Enter
								</span></span
							>
							<span class="command-desc">自动生成文章</span>
						</div>
						<!-- <div class="command-item">
							<span class="command-code"
								>/bazinga/article:主题 +
								<span class="enter-hint">
									<i
										class="bi bi-arrow-return-left text-xxs relative top-[1px]"
									></i>
									Enter
								</span></span
							>
							<span class="command-desc">生成指定主题的文章</span>
						</div> -->
						<div class="command-item">
							<span class="command-code"
								>/bazinga/url:链接 +
								<span class="enter-hint">
									<i
										class="bi bi-arrow-return-left text-xxs relative top-[1px]"
									></i>
									Enter
								</span></span
							>
							<span class="command-desc">从URL导入内容</span>
						</div>
						<div class="command-item">
							<span class="command-code text-secondary">
								/bazinga/go +
								<span class="text-secondary enter-hint">
									<i
										class="bi bi-arrow-return-left text-xxs relative top-[1px] text-secondary"
									></i>
									Enter
								</span></span
							>
							<span class="command-desc text-secondary font-bold"
								>确认生成卡片</span
							>
						</div>
					</div>
				</div>

				<div class="divider"></div>

				<div class="guide-section text-sm">
					<!-- <h3 class="font-bold mb-2 flex items-center justify-center">
						<i class="bi bi-lightbulb text-medium"></i>
					</h3> -->
					<ul class="tips-list">
						<li>每个场景是一张卡片</li>
						<li>每个场景/卡片控制在20000字符以内，效果更佳</li>
					</ul>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>关闭</button>
			</form>
		</dialog>
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
const isGenerating = ref(false);

const abortController = ref(null);

const guideModalRef = ref(null); // 指南弹窗引用

// 显示指南弹窗方法
const showGuideModal = () => {
	guideModalRef.value?.showModal();
};

// 取消处理函数
const handleCancel = () => {
	if (isGenerating.value && abortController.value) {
		abortController.value.abort();
		abortController.value = null;
		isGenerating.value = false;
		// 恢复原有内容
		const existingContent = editorContent.value.split("正在生成文章")[0].trim();
		editorContent.value = existingContent || "";
	}
};

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
	if (lastLine.includes("bazinga/new")) {
		event.preventDefault(); // 阻止回车键的默认行为
		// 移除包含命令的最后一行
		editorContent.value = allLines.slice(0, -1).join("\n");
		handleAutoGenerate();
		return;
	}

	if (
		lastLine.includes("bazinga/go") ||
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

	const urlCommandRegex = /bazinga\/url:(https?:\/\/.+)/i;
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
		isGenerating.value = true;
		abortController.value = new AbortController();

		// 保存现有内容
		const existingContent = editorContent.value.split("bazinga/url")[0].trim();
		// 启动加载动画
		startLoadingAnimation("导入");

		const response = await apiClient.post(
			"/scripts/import-url",
			{ url: url },
			{ signal: abortController.value.signal }
		);

		if (response.data.code === 200) {
			const content = response.data.data.content;
			let importedContent = "";
			importedContent += "# Default Title\n\n";

			content.paragraphs.forEach((paragraph) => {
				if (paragraph.trim()) {
					importedContent += paragraph + "\n\n";
				}
			});

			// 将新内容追加到现有内容后
			editorContent.value = existingContent
				? existingContent + "\n\n" + importedContent.trim()
				: importedContent.trim();

			showToast({ message: "内容导入成功", type: "success" });
		} else {
			throw new Error(response.data.message);
		}
	} catch (error) {
		if (error.name === "AbortError") {
			console.log("导入已取消");
			return;
		}
		console.error("导入失败:", error);
		// 保持原有内容，在后面添加错误信息
		const existingContent = editorContent.value.split("正在导入")[0].trim();
		editorContent.value = existingContent ? existingContent + "\n\n" : "";
		showToast({
			message: error.response?.data?.message || "导入失败，请检查URL是否正确",
			type: "error",
		});
	} finally {
		isGenerating.value = false;
		abortController.value = null;
	}
};

// 自动生成文章
const handleAutoGenerate = async () => {
	try {
		isGenerating.value = true;
		abortController.value = new AbortController();

		const allLines = editorContent.value.split("\n");
		const lastLine = allLines[allLines.length - 1].trim();
		let topic = null;
		const topicMatch = lastLine.match(/bazinga\/new(?::(.+))?/);
		if (topicMatch && topicMatch[1]) {
			topic = topicMatch[1].trim();
		}

		// 保存现有内容
		const existingContent = editorContent.value.split("bazinga/new")[0].trim();
		// 启动加载动画
		startLoadingAnimation("生成");

		const response = await apiClient.post(
			"/translation/generate-article",
			{ topic: topic },
			{ signal: abortController.value.signal }
		);

		if (response.data.code === 200) {
			if (response.data.data.error) {
				showToast({ message: response.data.data.error, type: "error" });
				throw new Error();
			}

			if (response.data.data.article) {
				let formattedArticle = "";
				if (!response.data.data.article.trim().startsWith("#")) {
					formattedArticle = `\n\n# ${topic || "Default Title"}\n\n`;
				}
				formattedArticle += response.data.data.article;

				// 将新内容追加到现有内容后
				editorContent.value = existingContent
					? existingContent + formattedArticle
					: formattedArticle.trim();
			}
		} else {
			throw new Error("生成文章失败");
		}
	} catch (error) {
		if (error.name === "AbortError") {
			console.log("生成已取消");
			return;
		}
		// 保持原有内容，在后面添加错误信息
		const existingContent = editorContent.value.split("正在生成文章")[0].trim();
		editorContent.value = existingContent ? existingContent + "\n\n" : "";
	} finally {
		isGenerating.value = false;
		abortController.value = null;
	}
};

onMounted(async () => {
	if (route.query.mode === "edit") {
		getDefaultJson();
		getDefaultKnowledge();
	}
});

// 粘贴内容格式处理
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

// 动态省略号动画函数
const startLoadingAnimation = (type = "生成") => {
	let count = 0;
	const baseContent = editorContent.value
		.split(`bazinga/${type === "生成" ? "new" : "url"}`)[0]
		.trim();
	// 先设置初始文本
	editorContent.value = baseContent
		? `${baseContent}\n\n正在${type}文章\n按 ESC 取消`
		: `正在${type}文章\n按 ESC 取消`;

	const interval = setInterval(() => {
		if (!isGenerating.value) {
			clearInterval(interval);
			return;
		}
		count = (count + 1) % 4;
		// 只更新省略号部分
		const currentContent = editorContent.value;
		const baseText =
			currentContent.split(`正在${type}文章`)[0] + `正在${type}文章`;
		const suffix = "\n按 ESC 取消";
		editorContent.value = baseText + ".".repeat(count) + suffix;
	}, 500);
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
		console.error("制作卡片合集失败:", error);
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

/* 黑白复古风格弹窗 */
.retro-bw-modal {
	max-width: 600px;
	background-color: #f8f8f8;
	border: 3px solid #222;
	border-radius: 8px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.8);
	color: #222;
}

.retro-title {
	font-family: "Courier New", monospace;
	color: #222;
	letter-spacing: 1px;
	border-bottom: 2px solid #222;
	padding-bottom: 8px;
	position: relative;
}

.retro-title::after {
	content: "";
	position: absolute;
	bottom: -5px;
	left: 50%;
	transform: translateX(-50%);
	width: 50%;
	height: 1px;
	background-color: #222;
}

.guide-section {
	margin-bottom: 1rem;
	padding: 1rem;
	background-color: white;
	border: 2px solid #222;
	border-radius: 4px;
	text-align: left;
}

.command-list {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.5rem;
}

.command-item {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	padding: 0.5rem;
	background-color: #f0f0f0;
	border: 1px solid #222;
	border-left: 4px solid #222;
	align-items: center;
}

.command-note {
	font-size: 0.75rem;
	color: #666;
	margin-top: 4px;
	padding-left: 2px;
	font-style: italic;
	width: 100%;
}

.command-code {
	font-weight: bold;
	color: #222;
	/* padding: 2px 6px; */
}
.text-secondary {
	color: var(--secondary-color) !important;
}

.command-desc {
	color: #444;
	font-size: 0.875rem;
	text-align: right;
}

.example-box {
	white-space: pre-wrap;
	background-color: #f0f0f0;
	border: 1px dashed #222;
	padding: 10px;
	margin-top: 10px;
}

pre {
	font-family: "Comic Sans MS", Hannotate SC, "Courier New", Courier, monospace;
}

.tips-list {
	list-style-type: none;
	padding: 0;
}

.tips-list li {
	padding: 5px 5px 5px 20px;
	position: relative;
}

.tips-list li::before {
	content: ">";
	position: absolute;
	left: 5px;
	color: #222;
	font-weight: bold;
}

/* 移除之前的样式 */
.comic-title {
	font-family: "Comic Sans MS", cursive, sans-serif;
	color: #e63946;
	text-shadow: 2px 2px 0 #fff, 3px 3px 0 #333;
	letter-spacing: 1px;
}

.retro-btn-medium {
	position: relative;
	height: 38px;
	border: none;
	background: none;
	cursor: pointer;
	padding: 0 16px;
	width: 150px;
}

.retro-btn-medium .btn-face {
	padding: 0 16px;
	font-size: 14px;
}

.enter-hint {
	display: inline-flex;
	align-items: center;
	margin-left: 4px;
	padding: 1px 4px;
	border: 1px solid #999;
	border-radius: 3px;
	font-size: 0.65rem;
	color: #666;
	background-color: #f8f8f8;
	vertical-align: middle;
}

.enter-hint i {
	margin-right: 4px;
}
</style>
