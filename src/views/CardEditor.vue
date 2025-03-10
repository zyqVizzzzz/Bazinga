<template>
	<div class="container w-full mx-auto my-10 p-4">
		<div class="flex editor-box">
			<div
				class="optionbox-container option-group flex-col justify-between space-y-4"
			>
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

				<div class="tooltip" data-tip="保存">
					<button class="retro-btn" @click="saveDialogue(true)">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<i class="bi bi-floppy text-lg"></i>
								</div>
							</div>
						</div>
					</button>
				</div>

				<div class="tooltip" data-tip="智能工作台">
					<button
						class="retro-btn"
						@click="openKnowledgeModal"
						:disabled="generateAllLoading"
					>
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<i v-if="!generateAllLoading" class="bi bi-magic text-lg"></i>
									<span
										v-else
										class="loading loading-spinner loading-xs"
									></span>
								</div>
							</div>
						</div>
					</button>
				</div>
			</div>
			<div class="editor-container text-sm mt-4 relative">
				<div class="text-sm rounded shadow-editor" style="overflow-y: auto">
					<div id="editor" class="editorjs-container"></div>
				</div>
			</div>
			<div
				class="toolbox-container w-2/5 mt-4 border border-gray-100 shadow-xl rounded-xl shadow-knowledge"
			>
				<!-- 顶部装饰条 -->
				<div
					class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20"
				></div>

				<div class="relative w-full max-w-2xl mx-auto">
					<div class="relative">
						<div class="decorated-card py-6 px-4">
							<div
								v-if="!isEditing"
								class="flex items-center justify-between space-x-2 ml-3 mb-2 text-lg font-bold gradient-to-r from-primary to-secondary"
							>
								知识点
							</div>

							<!-- 编辑表单 -->
							<div
								v-if="isEditing"
								class="text-gray-800 text-sm mb-2 text-left relative group"
							>
								<div
									class="mb-4 font-bold text-base text-left flex justify-between pl-1"
								>
									<span class="transition-opacity duration-200">
										{{ editedFields.origin }}
										<div class="tooltip" data-tip="自动生成知识点">
											<button
												@click="generateKnowledge(editedFields.origin)"
												class="btn btn-ghost btn-xs text-secondary text-sm"
											>
												<!-- 自动生成知识点 -->
												<i v-if="!generateLoading" class="bi bi-lightning"></i>
												<span
													v-else
													class="loading loading-spinner loading-xs"
												></span>
											</button>
										</div>
									</span>
								</div>
								<div class="mb-2">
									<label for="word" class="text-xs pb-1 ml-1 block"
										>知识点:</label
									>
									<input
										type="text"
										v-model="editedFields.word"
										id="word"
										placeholder="请输入知识点"
										class="input input-bordered input-sm w-full max-w-xs"
									/>
								</div>
								<div class="mb-2">
									<label for="word_zh" class="text-xs pb-1 ml-1 block"
										>释义:</label
									>
									<input
										type="text"
										v-model="editedFields.word_zh"
										id="word_zh"
										placeholder="请输入中文释义"
										class="input input-bordered input-sm w-full max-w-xs"
									/>
								</div>
								<div class="mb-2">
									<label for="definition_zh" class="text-xs pb-1 ml-1 block"
										>详细释义:</label
									>
									<textarea
										v-model="editedFields.definition_zh"
										id="definition_zh"
										placeholder="请输入详细释义"
										class="textarea textarea-bordered w-full p-2"
									></textarea>
								</div>

								<div class="mb-2">
									<label for="synonyms" class="text-xs pb-1 ml-1 block"
										>近义词/句:</label
									>
									<textarea
										v-model="editedFields.synonyms"
										id="synonyms"
										placeholder="请输入近义词"
										class="textarea textarea-bordered w-full max-w-xs p-2"
									></textarea>
								</div>

								<div class="flex flex-col mb-2">
									<label for="note" class="text-xs pb-1 ml-1 block"
										>扩展信息:</label
									>
									<div class="flex items-center space-x-2">
										<textarea
											v-model="editedFields.note"
											id="note"
											placeholder="请输入词根词缀分析"
											class="textarea textarea-bordered w-full p-2"
										></textarea>
									</div>
								</div>
								<div class="mb-2">
									<label for="type" class="text-xs pb-1 ml-1 block"
										>例句:</label
									>
									<textarea
										v-model="editedFields.example"
										id="example"
										placeholder="请输入例句"
										class="textarea textarea-bordered w-full max-w-xs p-2"
									></textarea>
								</div>
								<div class="mb-2">
									<textarea
										v-model="editedFields.example_zh"
										id="example_zh"
										placeholder="请输入例句释义"
										class="textarea textarea-bordered w-full p-2"
									></textarea>
								</div>

								<div class="flex justify-end space-x-2 mt-6">
									<button
										@click="saveKnowledge"
										class="btn btn-sm btn-secondary text-white"
									>
										保存
									</button>
									<button @click="cancelEdit" class="btn btn-sm btn-ghost">
										取消
									</button>
								</div>
							</div>
							<!-- 编辑表单结束 -->

							<!-- 知识点列表 -->
							<div v-else>
								<div
									v-for="(item, index) in Array.from(currentKnowledge.values())"
									:key="item.word"
									class="group relative p-2 py-1 rounded-lg hover:bg-gray-50/70 transition-all duration-200"
								>
									<div
										class="flex items-center justify-between cursor-pointer"
										@click="startEditing(item)"
									>
										<div class="flex-1 text-left">
											<span class="font-medium text-sm">{{ item.word }}</span>
										</div>

										<!-- 操作按钮 -->
										<div class="transition-opacity duration-200">
											<button
												@click="startEditing(item)"
												class="btn btn-ghost btn-xs"
											>
												<i
													class="bi bi-pencil-square text-secondary text-sm"
												></i>
											</button>
										</div>
									</div>
								</div>

								<!-- 空状态 -->
								<div
									v-if="currentKnowledge.size === 0"
									class="text-gray-500 text-sm my-8 text-center flex flex-col items-center space-y-2"
								>
									<i class="bi bi-inbox text-3xl text-gray-300"></i>
									<span>暂无词汇</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<KnowledgeGenerator
			v-if="editor"
			ref="knowledgeGeneratorRef"
			:editor="editor"
			:currentKnowledge="currentKnowledge"
			:shouldTranslate="shouldTranslate"
			:boldKnowledgeWords="boldKnowledgeWords"
			@update:currentKnowledge="currentKnowledge = $event"
		/>
	</div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { showToast } from "@/components/common/toast.js";
import EditorJS from "@editorjs/editorjs";
import apiClient from "@/api";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/store";
import { exampleText, exampleTextZh } from "@/constants/Example.js";
import { TranslateTool } from "../utils/translateTool";
import KnowledgeGenerator from "@/components/cardEditor/KnowledgeGenerator.vue";

const route = useRoute();
const router = useRouter();
const editor = ref(null);
const totalDialogues = ref(0); // 总对话数
const isEditing = ref(false); // 当前正在编辑的索引
const editedFields = ref({});

const currentDialogueIndex = ref(0); // 当前对话索引
const currentDialogue = ref({}); // 当前对话
const currentKnowledge = ref(new Map()); // 当前知识点
const scriptJson = ref(null);

const existingBoldWords = new Set();

const generateLoading = ref(false); // 生成单个知识点状态变量
const knowledgeGeneratorRef = ref(null); // 知识点生成器引用

const generateAllLoading = ref(false);
const isSaved = ref(false);

// 添加自动保存状态变量
const autoSaving = ref(false);
const lastSavedTime = ref(null);

// 在组件setup最开始就定义这个函数
const preventDefaultEnter = (event) => {
	if (
		event.key === "Enter" &&
		!event.shiftKey &&
		!event.ctrlKey &&
		!event.altKey
	) {
		event.preventDefault();
		event.stopPropagation();
	}
};

// 初始化 editorjs
const initEditorJS = async () => {
	if (!scriptJson.value) return;
	console.log("Initializing EditorJS...");
	const blocks = await initEditorBlocks(scriptJson.value);

	editor.value = new EditorJS({
		holder: "editor",
		placeholder: "",
		data: { blocks },
		tools: {
			translate: {
				class: TranslateTool,
				config: {
					onAction: handleInlineToolAction,
				},
				inlineToolbar: true,
			},
		},
		inlineToolbar: ["bold", "italic", "translate"],
		onReady: () => {
			boldKnowledgeWords(currentKnowledge.value, editor.value);
			const editorElement = document.getElementById("editor");
			if (editorElement) {
				editorElement.addEventListener("keydown", handleEnterKey, {
					capture: true,
				});
			}
		},
		onChange: async () => {
			const content = await editor.value.save();
			checkBoldText(content, currentKnowledge.value);
		},
		// 添加默认配置确保空行可编辑
		defaultBlock: "paragraph",
		minHeight: 0,
	});
};

const handleInlineToolAction = async ({ type, text, blockIndex }) => {
	if (type !== "translate") return;

	// 使用你现有的翻译逻辑
	const separator = " ||| ";

	try {
		// 获取编辑器内容
		const savedData = await editor.value.save();
		const blocks = savedData.blocks;

		// 只翻译选中的文本
		if (shouldTranslate(text)) {
			const cleanedText = cleanText(text);

			const response = await apiClient.post("/translation", {
				text: cleanedText,
				source: "en",
				target: "zh",
			});

			const translatedText = response.data.data.translatedText;

			// 在当前块后插入翻译
			const newBlocks = [...blocks];
			newBlocks.splice(blockIndex + 1, 0, {
				type: "paragraph",
				data: {
					text: translatedText,
				},
			});

			// 处理连续空行
			const processedBlocks = removeConsecutiveEmptyLines(newBlocks);

			// 更新编辑器内容
			await editor.value.render({
				blocks: processedBlocks,
			});
		}
	} catch (error) {
		console.error("Translation failed:", error);
	}
};

// 初始化知识点
const initKnowledges = async () => {
	try {
		const response = await apiClient.get(`/knowledge`, {
			params: {
				catalogId: route.params.id,
				lessonId: route.query.sign,
			},
		});

		if (response.data.code === 200) {
			// 初始化 Map
			currentKnowledge.value = new Map();

			// 处理每个场景的知识点
			response.data.data.forEach((scene) => {
				scene.knowledge.forEach((item) => {
					const existingKnowledge = currentKnowledge.value.get(item.word);

					if (!existingKnowledge) {
						// 创建新的知识点对象，添加场景信息
						currentKnowledge.value.set(item.word, {
							...item,
							scenes: new Set([scene.sceneId]),
						});
					} else {
						// 更新现有知识点的场景集合
						existingKnowledge.scenes.add(scene.sceneId);
					}
				});
			});
		}
	} catch (error) {
		console.error(error);
	}
};

const initDialogues = async () => {
	try {
		const res = await apiClient.get(`/scripts/episode/${route.query.sign}`);
		if (res.data.code === 200 && res.data.data) {
			scriptJson.value = res.data.data.scriptData;
			currentDialogue.value =
				res.data.data.scriptData.scenes[0].dialogues[
					currentDialogueIndex.value
				];
			totalDialogues.value =
				res.data.data.scriptData.scenes[0].dialogues.length;
		} else {
			throw new Error("课程信息不完整或未找到");
		}
	} catch (err) {}
};

const generateKnowledge = async (word) => {
	generateLoading.value = true;
	try {
		const res = await apiClient.post("/knowledge/generate", {
			word,
		});
		if (res.data.code === 200) {
			generateLoading.value = false;
			editedFields.value.type = res.data.data.type;
			editedFields.value.word_zh = res.data.data.word_zh;
			editedFields.value.note = res.data.data.note;
			editedFields.value.definition_zh =
				res.data.data.word_zh + "；" + res.data.data.definition_zh;
			editedFields.value.example = res.data.data.example;
			editedFields.value.example_zh = res.data.data.example_zh;
			editedFields.value.synonyms = res.data.data.synonyms;
		} else {
			generateLoading.value = false;
		}
	} catch (err) {
		showToast({ message: "网络错误，请重试！", type: "warning" });
		generateLoading.value = false;
	}
};

// 添加打开模态框的方法
const openKnowledgeModal = async () => {
	try {
		generateAllLoading.value = true;
		await knowledgeGeneratorRef.value.openModal();
	} finally {
		generateAllLoading.value = false;
	}
};

onMounted(async () => {
	const editorElement = document.getElementById("editor");
	if (editorElement) {
		editorElement.addEventListener("keydown", preventDefaultEnter, {
			capture: true,
		});
	}

	// 添加全局快捷键监听
	document.addEventListener("keydown", handleKeyboardShortcuts);

	if (route.query.mode === "edit") {
		getDefaultJson();
		getDefaultKnowledge();
	} else {
		await initDialogues(); // 先初始化对话数据
		await initKnowledges(); // 再初始化知识点数据
	}
	initEditorJS(); // 最后初始化编辑器
});

onBeforeUnmount(() => {
	// 移除事件监听
	const editorElement = document.getElementById("editor");
	if (editorElement) {
		editorElement.removeEventListener("keydown", preventDefaultEnter, {
			capture: true,
		});
	}

	// 移除全局快捷键监听
	document.removeEventListener("keydown", handleKeyboardShortcuts);
});

// 快捷键处理函数
const handleKeyboardShortcuts = (event) => {
	// 检测 Ctrl+S 或 Cmd+S
	if ((event.ctrlKey || event.metaKey) && event.key === "s") {
		event.preventDefault(); // 阻止浏览器默认的保存行为
		saveDialogue(true); // 调用保存函数，传入 true 表示用户手动保存
	}
};

// 文本检测函数：中文字符比例小于 10% 则翻译
const shouldTranslate = (text) => {
	const totalChars = text.length;
	const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
	const chinesePercentage = (chineseChars / totalChars) * 100;
	return chinesePercentage <= 10; // 中文比例低于10%
};

const cleanText = (text) => {
	let cleanedText = text.replace(/<\/?[^>]+(>|$)/g, "");
	cleanedText = cleanedText.replace(/\[[^\]]*\]/g, "");
	return cleanedText.trim();
};

const removeConsecutiveEmptyLines = (blocks) => {
	return blocks.filter((block, index, arr) => {
		const currentIsEmpty = !block.data.text
			.replace(/[\u200B-\u200D\uFEFF]/g, "")
			.trim();
		const prevIsEmpty =
			index > 0 &&
			!arr[index - 1].data.text.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();

		// 保留非空行，或者是第一个空行
		return !currentIsEmpty || !prevIsEmpty;
	});
};

const cancelEdit = () => {
	isEditing.value = false;
	editedFields.value = {};
};

const saveDialogue = async (isCustom = false) => {
	const savedData = await editor.value.save();
	const outputDialogues = processDialogueData(savedData, route);

	if (outputDialogues.length > 0) {
		const updatedJson = {
			...scriptJson.value,
			scenes: [
				{
					...scriptJson.value.scenes[0],
					dialogues: outputDialogues,
				},
			],
		};

		await uploadScripts(updatedJson, isCustom);
		scriptJson.value = updatedJson;

		// 保存所有对话的知识点
		if (currentKnowledge.value.size > 0) {
			// 传递isCustom参数，表示是否为用户手动保存
			await saveAllKnowledge(isCustom);
		}
	}
};

const uploadScripts = async (jsonData, isCustom = false) => {
	const catalogId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	try {
		const response = await apiClient.post(
			`/scripts/${catalogId}/${season}/${episode}`,
			{
				scriptData: jsonData,
			}
		);
		if (response.data.code === 200) {
			if (isCustom) {
				isSaved.value = true;
				clearLocalProgressByCatalogId(catalogId);
				showToast({ message: "保存成功", type: "success" });
			}
		} else {
			showToast({ message: "保存失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: error, type: "error" });
	}
};

const clearLocalProgressByCatalogId = (catalogId) => {
	try {
		const appStore = useAppStore();

		// 过滤掉指定 catalogId 的进度
		const updatedProgress = appStore.progressList.filter(
			(item) => item.course !== catalogId
		);

		// 更新 store
		appStore.initProgress(updatedProgress);
	} catch (error) {
		console.error("Failed to clear local progress:", error);
	}
};

const backToPreview = () => {
	const courseId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const sign = route.query.sign;
	const mode = route.query?.mode;
	console.log(isSaved.value, mode);
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

const getDefaultJson = () => {
	const season = route.params.season;
	const episode = route.params.episode;
	const defaultData = [
		{
			id: "Scene1",
			season: season,
			episode: episode,
			title: "卡片编辑器使用说明",
			img: "",
			text: exampleText,
			text_zh: exampleTextZh,
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
};

const getDefaultKnowledge = () => {
	currentKnowledge.value = new Map();
};

// 编辑区域
const startEditing = (item) => {
	isEditing.value = true;
	// 由于 item 仍然包含所有必要的字段，只是多了一个 scenes 字段
	// 创建一个新对象，排除 scenes 字段
	const { scenes, ...itemWithoutScenes } = item;

	editedFields.value = {
		origin: itemWithoutScenes.origin,
		word: itemWithoutScenes.word,
		word_zh: itemWithoutScenes.word_zh,
		example: itemWithoutScenes.example,
		example_zh: itemWithoutScenes.example_zh,
		type: itemWithoutScenes.type,
		definition_zh: itemWithoutScenes.definition_zh,
		note: itemWithoutScenes.note,
		synonyms: itemWithoutScenes.synonyms,
	};
};

function addBoldWordsToKnowledge(newBoldWords, currentSceneId) {
	newBoldWords.forEach((boldText) => {
		const existingKnowledge = currentKnowledge.value.get(boldText);

		if (!existingKnowledge) {
			// 创建新的知识点
			currentKnowledge.value.set(boldText, {
				origin: boldText,
				from: "knowledges",
				word: boldText,
				definition: "",
				definition_zh: "",
				example: "",
				example_zh: "",
				type: "daily_expression",
				word_zh: "",
				synonyms: "",
				scenes: new Set([currentSceneId]),
			});
			existingBoldWords.add(boldText.toLowerCase());
		} else {
			// 更新现有知识点的场景列表
			existingKnowledge.scenes.add(currentSceneId);
		}
	});
}

function checkBoldText(content) {
	console.log("Original content:", content);
	let currentSceneId = null;
	const currentBoldWordsByScene = new Map();
	const updatedKnowledge = new Map();
	let knowledgeChanged = false;

	// 首先通过扫描找出所有场景标题的位置和对应的场景ID
	const titleIndices = content.blocks
		.map((block, index) => ({ text: block.data.text, index }))
		.filter(({ text }) => text.startsWith("#"))
		.map(({ index }, sceneNum) => ({
			index,
			sceneId: `Scene${sceneNum + 1}`,
		}));

	// 扫描文档，按场景收集加粗的单词
	content.blocks.forEach((block, blockIndex) => {
		// 找出当前块属于哪个场景
		const currentScene = titleIndices.find((title, index) => {
			const nextTitle = titleIndices[index + 1];
			return (
				blockIndex >= title.index &&
				(!nextTitle || blockIndex < nextTitle.index)
			);
		});

		if (currentScene) {
			currentSceneId = currentScene.sceneId;
			if (!currentBoldWordsByScene.has(currentSceneId)) {
				currentBoldWordsByScene.set(currentSceneId, new Set());
			}
		}

		// 如果是标题行，跳过加粗词收集
		if (block.data.text.startsWith("#")) {
			return;
		}

		// 在场景内且是段落时，收集加粗单词
		if (
			currentSceneId &&
			block.type === "paragraph" &&
			block.data.text.trim()
		) {
			const boldWords = extractBoldWords(block.data.text);
			console.log("Found bold words:", boldWords, "in scene:", currentSceneId);
			boldWords.forEach((word) => {
				currentBoldWordsByScene.get(currentSceneId).add(word);
			});
		}
	});

	console.log("Words by scene:", currentBoldWordsByScene);

	// 保留现有知识点的其他信息
	currentKnowledge.value.forEach((knowledge, word) => {
		const updatedKnowledgeItem = {
			...knowledge,
			scenes: new Set(), // 重置场景集合
		};
		updatedKnowledge.set(word, updatedKnowledgeItem);
	});

	// 更新知识点的场景关联
	for (const [sceneId, sceneWords] of currentBoldWordsByScene.entries()) {
		sceneWords.forEach((word) => {
			if (updatedKnowledge.has(word)) {
				// 更新现有知识点的场景
				updatedKnowledge.get(word).scenes.add(sceneId);
			} else {
				// 添加新的知识点
				addBoldWordsToKnowledge([word], sceneId);
				knowledgeChanged = true;
				// 将新添加的知识点复制到updatedKnowledge中
				const newKnowledge = currentKnowledge.value.get(word);
				if (newKnowledge) {
					updatedKnowledge.set(word, newKnowledge);
				}
			}
		});
	}

	// 删除没有场景关联的知识点
	for (const [word, knowledge] of updatedKnowledge.entries()) {
		if (knowledge.scenes.size === 0) {
			updatedKnowledge.delete(word);
			existingBoldWords.delete(word.toLowerCase());
			knowledgeChanged = true;
		}
	}

	console.log("Final updated knowledge:", updatedKnowledge);

	// 更新知识点集合
	const oldSize = currentKnowledge.value.size;
	currentKnowledge.value = updatedKnowledge;

	// 如果知识点发生变化，自动保存
	if (knowledgeChanged || oldSize !== updatedKnowledge.size) {
		autoSaveAllKnowledge();
	}
}

function extractBoldWords(text) {
	const boldMatches = text.match(/<b>(.*?)<\/b>/g);
	if (!boldMatches) return [];

	// 清除标签并返回纯文本的加粗项，移除首尾空格
	return boldMatches.map((boldTag) =>
		boldTag.replace(/<\/?[^>]+(>|$)/g, "").trim()
	);
}

// 临时保存单个知识点
const saveKnowledge = async () => {
	try {
		// 获取原始单词，用于在 Map 中查找和更新
		const originalWord = editedFields.value.origin;

		// 获取原始知识点的场景信息
		const originalScenes =
			currentKnowledge.value.get(originalWord)?.scenes || new Set();

		// 创建更新后的知识点对象
		const updatedKnowledge = {
			origin: editedFields.value.origin,
			word: editedFields.value.word,
			word_zh: editedFields.value.word_zh,
			example: editedFields.value.example,
			example_zh: editedFields.value.example_zh,
			type: editedFields.value.type,
			definition_zh: editedFields.value.definition_zh,
			note: editedFields.value.note,
			synonyms: editedFields.value.synonyms,
			// 保持原有的场景关联
			scenes: originalScenes,
		};

		// 如果单词被修改了，需要删除旧的记录
		if (originalWord !== editedFields.value.word) {
			currentKnowledge.value.delete(originalWord);
			existingBoldWords.delete(originalWord.toLowerCase());
		}

		// 更新 Map 中的知识点
		currentKnowledge.value.set(editedFields.value.word, updatedKnowledge);
		existingBoldWords.add(editedFields.value.word.toLowerCase());

		// 退出编辑模式
		isEditing.value = false;

		// 更新编辑器中的加粗效果
		if (editor.value) {
			boldKnowledgeWords(
				Array.from(currentKnowledge.value.values()),
				editor.value
			);
		}
		console.log("1");
		// 自动保存所有知识点
		await autoSaveAllKnowledge();
		console.log("2");

		// showToast({ message: "知识点已更新", type: "success" });
	} catch (error) {
		showToast({ message: "知识点更新失败", type: "error" });
	}
};

const autoSaveAllKnowledge = async () => {
	if (autoSaving.value) return; // 防止重复保存

	try {
		autoSaving.value = true;

		// 按场景ID重组知识点数据
		const sceneKnowledgeMap = new Map();

		// 遍历所有知识点，按场景分组
		Array.from(currentKnowledge.value.values()).forEach((knowledge) => {
			// 确保我们有一个scenes集合
			if (knowledge.scenes) {
				knowledge.scenes.forEach((sceneId) => {
					if (!sceneKnowledgeMap.has(sceneId)) {
						sceneKnowledgeMap.set(sceneId, []);
					}
					// 创建知识点副本，排除scenes属性
					const { scenes, ...knowledgeData } = knowledge;
					sceneKnowledgeMap.get(sceneId).push(knowledgeData);
				});
			}
		});

		// 准备批量保存的数据，格式与后端接口匹配
		const bulkData = {
			catalogId: route.params.id,
			lessonId: route.query.sign,
			items: scriptJson.value.scenes[0].dialogues.map((dialogue) => ({
				sceneId: dialogue.id,
				// 只在有知识点时才包含knowledge字段
				...(sceneKnowledgeMap.get(dialogue.id)?.length > 0 && {
					knowledge: sceneKnowledgeMap.get(dialogue.id),
				}),
				// 保持原有practice字段不变
				...(dialogue.practice && { practice: dialogue.practice }),
			})),
		};

		// 调用现有的批量保存接口
		const response = await apiClient.post("/knowledge/bulk", bulkData);

		if (response.data.code === 200) {
			lastSavedTime.value = new Date();
			// 静默保存，不显示提示
			// showToast({ message: "卡片已自动保存", type: "success" });

			// 更新编辑器内容
			await saveDialogue(false);
		}
	} catch (error) {
		console.error("自动保存失败:", error);
		// 静默失败，不显示提示
		// showToast({
		//   message: error.response?.data?.message || "自动保存失败",
		//   type: "error",
		// });
	} finally {
		autoSaving.value = false;
	}
};

// 保存所有知识点的方法
const saveAllKnowledge = async (isCustom = false) => {
	try {
		await autoSaveAllKnowledge();

		// 只有在用户手动保存时才显示提示
		if (isCustom) {
			showToast({ message: "卡片保存成功", type: "success" });
		}

		// 刷新知识点数据
		await initKnowledges();
	} catch (error) {
		console.error("Failed to save knowledge:", error);

		// 错误提示也只在用户手动保存时显示
		if (isCustom) {
			showToast({
				message: error.response?.data?.message || "卡片保存失败",
				type: "error",
			});
		}
	}
};

// 处理回车键
const handleEnterKey = async (e) => {
	if (e.key === "Enter" && !e.shiftKey) {
		e.preventDefault();

		const selection = window.getSelection();
		const currentElement = selection.focusNode;
		const currentBlock =
			currentElement.nodeType === 3
				? currentElement.parentElement.closest(".ce-block")
				: currentElement.closest(".ce-block");

		if (!currentBlock) return;

		// 获取当前块的索引
		const editorBlocks = Array.from(document.querySelectorAll(".ce-block"));
		const currentBlockIndex = editorBlocks.indexOf(currentBlock);

		// 使用 API 直接插入新块
		await editor.value.blocks.insert(
			"paragraph",
			{
				text: "\u200B",
			},
			{},
			currentBlockIndex + 1,
			true // focus 参数设为 true，这样会自动聚焦到新块
		);

		// 如果自动聚焦没有生效，我们再手动设置
		setTimeout(() => {
			const targetBlock = document.querySelector(
				`.ce-block:nth-child(${currentBlockIndex + 2}) .ce-paragraph`
			);

			if (
				targetBlock &&
				(!targetBlock.textContent || targetBlock.textContent === "\u200B")
			) {
				// 确保块有内容
				if (!targetBlock.firstChild) {
					targetBlock.appendChild(document.createTextNode("\u200B"));
				}

				// 设置光标
				const range = document.createRange();
				const sel = window.getSelection();

				range.setStart(targetBlock.firstChild, 0);
				range.collapse(true);

				sel.removeAllRanges();
				sel.addRange(range);

				// 平滑滚动到新位置
				targetBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
			}
		}, 10);
	}
};

// 保存时的处理逻辑
function processDialogueData(savedData, route) {
	const outputDialogues = [];
	let currentDialogue = null;
	let currentPair = [];

	// 获取所有场景标题的位置
	const titleBlocks = savedData.blocks
		.map((block, index) => ({ text: block.data.text, index }))
		.filter(({ text }) => text.startsWith("#"));

	// 为每个场景处理内容
	titleBlocks.forEach((titleBlock, sceneIndex) => {
		const nextTitleBlock = titleBlocks[sceneIndex + 1];
		const sceneEndIndex = nextTitleBlock
			? nextTitleBlock.index
			: savedData.blocks.length;
		const sceneBlocks = savedData.blocks.slice(titleBlock.index, sceneEndIndex);

		// 创建新场景
		currentDialogue = {
			id: `Scene${sceneIndex + 1}`,
			season: route.params.season,
			episode: route.params.episode,
			title: sceneBlocks[0].data.text
				.replace(/^#\s*/, "")
				.replace(/<\/?b>/g, "")
				.trim(),
			img: "",
			text: [],
			text_zh: [],
		};

		// 处理场景内的对话
		let currentPair = [];
		sceneBlocks.slice(1).forEach((block) => {
			// 跳过标题块
			const line = block.data.text;
			const isEmptyLine = !line.replace(/\u200B/g, "").trim();

			if (isEmptyLine) {
				if (currentPair.length > 0) {
					processPair(currentPair, currentDialogue);
					currentPair = [];
				}
			} else {
				currentPair.push(line);
				if (currentPair.length === 2) {
					processPair(currentPair, currentDialogue);
					currentPair = [];
				}
			}
		});

		// 处理最后一对未处理的对话
		if (currentPair.length > 0) {
			processPair(currentPair, currentDialogue);
		}

		outputDialogues.push(currentDialogue);
	});

	return outputDialogues;
}

function processPair(pair, dialogue) {
	if (pair.length === 1) {
		// 单行，作为英文处理，添加空中文
		const englishLine = parseDialogueLine(pair[0], "en");
		dialogue.text.push([englishLine.speaker, englishLine.text]);
		dialogue.text_zh.push(["", ""]);
	} else if (pair.length === 2) {
		// 双行，第一行为英文，第二行为中文
		const englishLine = parseDialogueLine(pair[0], "en");
		const chineseLine = parseDialogueLine(pair[1], "zh");
		dialogue.text.push([englishLine.speaker, englishLine.text]);
		dialogue.text_zh.push([chineseLine.speaker, chineseLine.text]);
	}
}

// 标记知识点单词，仅加粗每个知识点单词的全局第一个匹配项
const boldKnowledgeWords = async (knowledges = [], editorInstance) => {
	const content = await editorInstance.save();
	let currentSceneId = null;
	const sceneKnowledgeMap = new Map();
	const sceneBoldedWords = new Set();

	knowledges.forEach((knowledge) => {
		if (knowledge.scenes) {
			knowledge.scenes.forEach((sceneId) => {
				if (!sceneKnowledgeMap.has(sceneId)) {
					sceneKnowledgeMap.set(sceneId, new Set());
				}
				sceneKnowledgeMap.get(sceneId).add(knowledge.word);
			});
		}
	});

	// 先找出所有场景标题，并建立映射关系
	const titleIndices = content.blocks
		.map((block, index) => ({ text: block.data.text, index }))
		.filter(({ text }) => text.startsWith("#"))
		.map(({ index }, sceneNum) => ({
			index,
			sceneId: `Scene${sceneNum + 1}`,
		}));

	const newBlocks = content.blocks.map((block, blockIndex) => {
		// 查找当前块属于哪个场景
		const currentScene = titleIndices.find((title, index) => {
			const nextTitle = titleIndices[index + 1];
			return (
				blockIndex >= title.index &&
				(!nextTitle || blockIndex < nextTitle.index)
			);
		});

		if (currentScene) {
			currentSceneId = currentScene.sceneId;
		}

		// 如果是标题行，移除加粗标签并返回
		if (block.data.text.startsWith("#")) {
			block.data.text = block.data.text.replace(/<\/?b>/g, "");
			return block;
		}

		// 处理普通内容行
		if (
			block.type === "paragraph" &&
			block.data.text.trim() &&
			currentSceneId
		) {
			const sceneKnowledge = sceneKnowledgeMap.get(currentSceneId);

			if (sceneKnowledge) {
				let text = block.data.text.replace(/<\/?b>/g, "");

				sceneKnowledge.forEach((word) => {
					if (!sceneBoldedWords.has(word)) {
						const regExp = new RegExp(`\\b${word}\\b`, "i");
						const match = text.match(regExp);

						if (match) {
							text = text.replace(regExp, `<b>${match[0]}</b>`);
							sceneBoldedWords.add(word);
						}
					}
				});

				block.data.text = text;
			}
		}
		return block;
	});

	await editorInstance.render({ blocks: newBlocks });
};

// 初始化编辑器数据时还原段落分隔
const initEditorBlocks = (scriptData) => {
	const blocks = [];
	const dialogues = scriptData.scenes[0].dialogues;

	dialogues.forEach((dialogue, dialogueIndex) => {
		// 添加标题
		blocks.push({
			type: "paragraph",
			data: { text: `# ${dialogue.title}` },
		});

		// 标题后添加一个空行
		blocks.push({
			type: "paragraph",
			data: { text: "\u200B" },
		});

		// 处理每组文本
		for (let i = 0; i < dialogue.text.length; i++) {
			const [speaker, text] = dialogue.text[i];
			const [speakerZh, textZh] = dialogue.text_zh[i];

			// 添加英文行
			blocks.push({
				type: "paragraph",
				data: {
					text:
						speaker === "narration"
							? `<i>${text}</i>`
							: speaker
							? `[${speaker}] ${text}`
							: text,
				},
			});

			// 添加中文行
			blocks.push({
				type: "paragraph",
				data: {
					text:
						speakerZh === "narration"
							? `<i>${textZh}</i>`
							: speakerZh
							? `[${speakerZh}] ${textZh}`
							: textZh || "", // 如果没有中文内容，用空字符串
				},
			});

			// 只在每组英文+中文后添加一个空行
			blocks.push({
				type: "paragraph",
				data: { text: "\u200B" },
			});
		}

		// 只在对话之间添加一个空行（不需要额外的空行，因为每组后已经有一个空行）
		if (dialogueIndex < dialogues.length - 1) {
			blocks.push({
				type: "paragraph",
				data: { text: "\u200B" },
			});
		}
	});

	return blocks;
};

// 更新 parseDialogueLine 函数来保留文本中的 # 符号
function parseDialogueLine(line, tag) {
	let speaker = "";
	let text = line.trim();

	// 如果是 "zh" 标记，则去除所有标签
	if (tag === "zh") {
		text = text.replace(/<\/?[^>]+(>|$)/g, ""); // 移除所有 HTML 标签
	} else {
		// 检查是否整行被 <i> 标签包裹
		if (/^<i>.*<\/i>$/.test(text)) {
			text = text.slice(3, -4).trim(); // 去掉开头的 <i> 和结尾的 </i>
			speaker = "narration";
		} else {
			// 检查是否有角色名，使用正则表达式匹配最外层的 `[]` 并忽略内层 `[]`
			const match = text.match(/^\[([^\[\]]*)\]\s*(.*)/);
			if (match) {
				speaker = match[1].replace(/\[.*?\]/g, "").trim(); // 移除内部 `[]`
				text = match[2].trim();
			}
		}
	}

	return { speaker, text };
}

watch(
	() => currentKnowledge.value.size,
	async (newSize, oldSize) => {
		if (newSize !== oldSize && oldSize > 0) {
			// 知识点数量变化时自动保存
			await autoSaveAllKnowledge();
		}
	}
);
</script>
<style scoped>
.editor-box {
	position: relative;
	gap: 2rem;
}

/* 选项按钮容器 */
.optionbox-container {
	margin-top: 5%;
	position: sticky;
	top: 10%;
	right: 0;
	height: 10vh;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

/* 复古按钮样式 */
/* .optionbox-container button {
	position: relative;
	width: 3rem;
	height: 3rem;
	border: 2px solid #333;
	background: white;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
} */

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

/* .optionbox-container button:hover {
	transform: translate(2px, 2px);
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.optionbox-container button:active {
	transform: translate(4px, 4px);
	box-shadow: none;
} */

/* 编辑器容器 */
.editor-container {
	width: 100%;
	text-align: left;
	min-height: 500px;
	border: 3px solid #333;
	border-radius: 12px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
}

.editorjs-container {
	padding: 2rem;
	min-height: 500px;
	background-size: 100% 24px;
}

/* 工具箱容器 */
.toolbox-container {
	margin-top: 20px;
	position: sticky;
	top: 5%;
	right: 0;
	height: calc(100vh - 200px);
	overflow-y: auto;
	border: 3px solid #333;
	border-radius: 12px;
	background: white;
	box-shadow: -3px 3px 0 rgba(0, 0, 0, 0.2);
}

/* 工具箱装饰 */
.decorated-card {
	position: relative;
	overflow: hidden;
}

/* 知识点列表样式 */
.group {
	border: 2px solid transparent;
	transition: all 0.3s;
}

/* 滚动条样式 */
.toolbox-container::-webkit-scrollbar {
	width: 8px;
}

.toolbox-container::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}

.toolbox-container::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
}

.toolbox-container::-webkit-scrollbar-thumb:hover {
	background: rgba(0, 0, 0, 0.3);
}

/* 空状态样式 */
.text-gray-500 {
	position: relative;
	padding: 2rem;
	border: 2px dashed #ccc;
	border-radius: 8px;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 10px,
		rgba(0, 0, 0, 0.02) 10px,
		rgba(0, 0, 0, 0.02) 20px
	);
}

.text-gray-500 i {
	font-size: 2.5rem;
	margin-bottom: 0.5rem;
}

/* 顶部装饰条 */
.bg-gradient-to-r {
	height: 4px;
	background: repeating-linear-gradient(
		90deg,
		rgba(var(--primary-color-rgb), 0.3),
		rgba(var(--secondary-color-rgb), 0.3) 20px,
		rgba(var(--primary-color-rgb), 0.3) 40px
	);
}

/* 按钮悬停效果 */
.btn-ghost:hover {
	background: rgba(var(--secondary-color-rgb), 0.1);
	transform: translateY(-1px);
}
</style>
