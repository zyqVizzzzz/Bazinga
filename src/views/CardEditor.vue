<template>
	<!-- 动态编辑区域 -->
	<div class="container mx-auto my-10 p-6">
		<div class="flex editor-box">
			<div class="editor-container p-4 text-sm mt-4 relative">
				<div
					class="option-group flex justify-between space-x-4 absolute"
					style="left: 20px; top: -40px"
				>
					<button
						@click="backToPreview"
						class="btn btn-sm text-white btn-primary"
					>
						返回
					</button>
					<button
						@click="transDialogue"
						class="btn btn-sm text-white btn-primary"
					>
						翻译
					</button>
				</div>

				<div
					class="option-group flex justify-between space-x-4 absolute"
					style="right: 20px; top: -40px"
				>
					<button
						@click="saveDialogue(true)"
						class="btn btn-sm text-white btn-primary"
					>
						保存
					</button>
				</div>
				<div
					class="option-group flex justify-between space-x-4 absolute"
					style="right: 20px; top: -40px"
				></div>
				<div
					class="editor-container p-4 w-3/5 text-sm -mt-4 bg-white rounded shadow-lg shadow-editor"
					style="min-height: 642px; overflow-y: auto"
				>
					<!-- Markdown 编辑器 -->
					<div id="editor" class="editorjs-container"></div>
				</div>
			</div>
			<div class="toolbox-container w-2/5 mt-4">
				<div
					class="card w-full bg-white rounded p-4 text-center shadow-lg shadow-knowledge"
					style="min-height: 642px"
				>
					<h3 v-if="!isEditing" class="text-lg font-semibold">知识点</h3>
					<!-- 检查当前项是否处于编辑状态 -->
					<div
						v-if="isEditing"
						class="text-gray-800 text-sm my-2 text-left cursor-pointer relative group"
					>
						<!-- 编辑表单 -->
						<div class="text-center mb-2 font-bold text-base">
							{{ editedFields.origin }}
						</div>
						<div class="mb-2">
							<label for="word" class="text-xs pb-1 ml-1 block">知识点:</label>
							<input
								type="text"
								v-model="editedFields.word"
								id="word"
								placeholder="请输入知识点"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<!-- 词性选择 -->
						<div class="flex items-center justify-between space-x-2 mb-2">
							<div>
								<label for="pos" class="text-xs pb-1 ml-1 block">词性:</label>
								<select
									v-model="editedFields.pos"
									id="pos"
									class="select select-bordered select-sm w-full max-w-xs"
								>
									<option value="">词性</option>
									<option value="n.">n.</option>
									<option value="v.">v.</option>
									<option value="adj.">adj.</option>
									<option value="adv.">adv.</option>
									<option value="excl.">excl.</option>
									<option value="phr.">phr.</option>
									<!-- 根据需要添加更多词性选项 -->
								</select>
							</div>
							<div>
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
						</div>
						<div class="mb-2">
							<label for="definition_zh" class="text-xs pb-1 ml-1 block"
								>详细释义:</label
							>
							<input
								type="text"
								v-model="editedFields.definition_zh"
								id="definition_zh"
								placeholder="请输入详细释义"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div class="mb-2">
							<label for="type" class="text-xs pb-1 ml-1 block">类型:</label>
							<select
								v-model="editedFields.type"
								id="type"
								class="select select-bordered select-sm w-full max-w-xs"
							>
								<option value="">请选择类型</option>
								<option value="vocabulary">词汇</option>
								<option value="phrase">短语</option>
								<option value="daily expression">日常用语</option>
								<!-- 根据需要添加更多词性选项 -->
							</select>
						</div>
						<div
							class="flex flex-col mb-2"
							v-if="editedFields.type === 'vocabulary'"
						>
							<label for="prefix" class="text-xs pb-1 ml-1 block"
								>词根 & 词缀:
								<span class="text-secondary cursor-pointer">生成</span></label
							>
							<div class="flex items-center space-x-2">
								<input
									type="text"
									v-model="editedFields.system.affixAnalysis.prefix"
									id="prefix"
									placeholder="前缀"
									class="input input-bordered input-sm w-full max-w-xs"
								/>
								<input
									type="text"
									v-model="editedFields.system.rootAnalysis.root"
									id="root"
									placeholder="词根"
									class="input input-bordered input-sm w-full max-w-xs"
								/>
								<input
									type="text"
									v-model="editedFields.system.affixAnalysis.suffix"
									id="suffix"
									placeholder="后缀"
									class="input input-bordered input-sm w-full max-w-xs"
								/>
							</div>
						</div>
						<div
							class="flex flex-col mb-2"
							v-if="editedFields.type === 'vocabulary'"
						>
							<label for="prefix" class="text-xs pb-1 ml-1 block"
								>词根 & 词缀解释:</label
							>
							<div class="flex items-center space-x-2">
								<input
									type="text"
									v-model="editedFields.system.affixAnalysis.prefixMeaning"
									id="prefixMeaning"
									placeholder="前缀"
									class="input input-bordered input-sm w-full max-w-xs"
								/>
								<input
									type="text"
									v-model="editedFields.system.rootAnalysis.rootMeaning"
									id="rootMeaning"
									placeholder="词根"
									class="input input-bordered input-sm w-full max-w-xs"
								/>
								<input
									type="text"
									v-model="editedFields.system.affixAnalysis.suffixMeaning"
									id="suffixMeaning"
									placeholder="后缀"
									class="input input-bordered input-sm w-full max-w-xs"
								/>
							</div>
						</div>
						<div class="mb-2">
							<label for="type" class="text-xs pb-1 ml-1 block">例句:</label>
							<textarea
								v-model="editedFields.example"
								id="example"
								placeholder="请输入例句"
								class="textarea textarea-bordered w-full max-w-xs p-2"
							></textarea>
						</div>
						<div class="mb-2">
							<label for="type" class="text-xs pb-1 ml-1 block"
								>例句释义:</label
							>
							<textarea
								v-model="editedFields.example_zh"
								id="example_zh"
								placeholder="请输入例句释义"
								class="textarea textarea-bordered w-full p-2"
							></textarea>
						</div>
						<div class="flex justify-end mt-4 space-x-2">
							<button @click="saveKnowledge()" class="text-secondary text-sm">
								保存
							</button>
							<button @click="cancelEdit" class="text-gray-500 text-sm">
								取消
							</button>
						</div>
					</div>
					<div v-if="!isEditing">
						<div
							v-for="(item, index) in Array.from(currentKnowledge.values())"
							:key="item.word"
							class="text-gray-800 text-sm my-2 text-left cursor-pointer relative group"
						>
							{{ index + 1 }}. <span>{{ item.word }}</span>
							<span
								class="edit-icon text-secondary text-xs absolute right-0"
								@click="startEditing(item)"
							>
								编辑
							</span>
						</div>
						<div
							v-if="currentKnowledge.size === 0"
							class="text-gray-800 text-sm my-8 text-center cursor-pointer relative group"
						>
							暂无词汇
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { showToast } from "@/components/common/toast.js";
import EditorJS from "@editorjs/editorjs";
import apiClient from "@/api";
import { useRoute, useRouter } from "vue-router";
import { exampleText, exampleTextZh, word } from "@/constants/example.js";
import { getDefinitions } from "@/utils/decompose.js";

const route = useRoute();
const router = useRouter();
const editor = ref(null);
const totalDialogues = ref(0); // 总对话数
const isEditing = ref(false); // 当前正在编辑的索引
const editedFields = ref({});

const currentDialogueIndex = ref(0); // 当前对话索引
const currentDialogue = ref({}); // 当前对话
const currentKnowledge = ref([]); // 当前知识点
const scriptJson = ref(null);

const existingBoldWords = new Set();

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
// EditorJS 配置
const initEditorJS = async () => {
	if (!scriptJson.value) return;
	console.log("Initializing EditorJS...");
	const blocks = await initEditorBlocks(scriptJson.value);

	editor.value = new EditorJS({
		holder: "editor",
		placeholder: "",
		data: { blocks },
		inlineToolbar: ["bold", "italic"],
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

// 初始化知识点
const initKnowledges = async () => {
	console.log(route.params);
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
				(scene.knowledge || []).forEach((item) => {
					if (!currentKnowledge.value.has(item.word)) {
						currentKnowledge.value.set(item.word, {
							...item,
							scenes: new Set([scene.sceneId]), // 记录单词出现的场景
						});
					} else {
						// 如果单词已存在，添加新的场景ID
						currentKnowledge.value.get(item.word).scenes.add(scene.sceneId);
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

onMounted(async () => {
	const editorElement = document.getElementById("editor");
	if (editorElement) {
		editorElement.addEventListener("keydown", preventDefaultEnter, {
			capture: true,
		});
	}
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
	// 记得移除事件监听
	const editorElement = document.getElementById("editor");
	if (editorElement) {
		editorElement.removeEventListener("keydown", preventDefaultEnter, {
			capture: true,
		});
	}
});

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
			await saveAllKnowledge();
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
				showToast({ message: "保存成功", type: "success" });
			}
		} else {
			showToast({ message: "保存失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: error, type: "error" });
	}
};

const backToPreview = () => {
	const courseId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const sign = route.query.sign;
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
	currentKnowledge.value = [];
};

// 编辑区域
const startEditing = (item) => {
	console.log(item);
	isEditing.value = true;
	// 由于 item 仍然包含所有必要的字段，只是多了一个 scenes 字段
	// 创建一个新对象，排除 scenes 字段
	const { scenes, ...itemWithoutScenes } = item;

	editedFields.value = {
		origin: itemWithoutScenes.origin,
		word: itemWithoutScenes.word,
		pos: itemWithoutScenes.pos,
		word_zh: itemWithoutScenes.word_zh,
		example: itemWithoutScenes.example,
		example_zh: itemWithoutScenes.example_zh,
		type: itemWithoutScenes.type,
		definition_zh: itemWithoutScenes.definition_zh,
	};

	const { prefix, prefixMeaning, suffix, suffixMeaning, root, rootMeaning } =
		getDefinitions(itemWithoutScenes.word);

	Object.assign(editedFields.value, {
		system: {
			affixAnalysis: { prefix, prefixMeaning, suffix, suffixMeaning },
			rootAnalysis: { root, rootMeaning },
			wordInflections: {
				baseForm: itemWithoutScenes.baseForm,
				baseForm_zh: "原型",
				presentParticiple: itemWithoutScenes.presentParticiple,
				pastParticiple_zh: "过去分词",
				pastTense: itemWithoutScenes.pastTense,
				pastTense_zh: "过去式",
				presentParticiple: itemWithoutScenes.presentParticiple,
				presentParticiple_zh: "现在分词",
			},
		},
	});
};

function addBoldWordsToKnowledge(newBoldWords, currentSceneId) {
	console.log("addBoldWordsToKnowledge called with:", {
		newBoldWords,
		currentSceneId,
	});

	newBoldWords.forEach((boldText) => {
		const existingKnowledge = currentKnowledge.value.get(boldText);

		if (!existingKnowledge) {
			// 创建新的知识点
			currentKnowledge.value.set(boldText, {
				origin: boldText,
				from: "knowledges",
				word: boldText,
				book: "",
				definition: "",
				definition_zh: "",
				example: "",
				example_zh: "",
				pos: "",
				symbols: "",
				system: {
					affixAnalysis: {
						suffix: "",
						suffixMeaning: "",
						suffixMeaning_zh: "",
						prefix: "",
						prefixMeaning: "",
						prefixMeaning_zh: "",
					},
					rootAnalysis: { root: "", meaning: "", meaning_zh: "" },
					wordInflections: {
						baseForm: "",
						baseForm_zh: "原型",
						presentParticiple: "",
						pastParticiple_zh: "过去分词",
						pastTense: "",
						pastTense_zh: "过去式",
						presentParticiple: "",
						presentParticiple_zh: "现在分词",
					},
				},
				type: "vocabulary",
				word_zh: "",
				scenes: new Set([currentSceneId]), // 添加当前场景ID
			});
			existingBoldWords.add(boldText.toLowerCase());
		} else {
			// 更新现有知识点的场景列表
			existingKnowledge.scenes.add(currentSceneId);
		}
	});
}

function checkBoldText(content) {
	// 用于追踪当前正在处理的场景ID
	let currentSceneId = null;
	const currentBoldWordsByScene = new Map(); // Map<sceneId, Set<word>>

	// 第一遍遍历：确定每个场景的范围和加粗词
	content.blocks.forEach((block) => {
		const line = block.data.text;

		// 检查是否是场景标题（以 # 开头）
		if (line.match(/^#\s+\S/)) {
			// 根据标题位置确定场景ID
			const sceneIndex = content.blocks
				.filter((b) => b.data.text.match(/^#\s+\S/))
				.findIndex((b) => b.data.text === line);
			currentSceneId = `Scene${sceneIndex + 1}`;
			currentBoldWordsByScene.set(currentSceneId, new Set());
		}

		// 如果当前块有加粗文本且我们知道当前场景
		if (currentSceneId && block.type === "paragraph") {
			const boldWords = extractBoldWords(line);
			boldWords.forEach((word) => {
				currentBoldWordsByScene.get(currentSceneId).add(word.toLowerCase());
			});
		}
	});

	// 第二遍遍历：更新知识点的场景关联
	for (const [word, knowledge] of currentKnowledge.value.entries()) {
		// 检查每个场景
		for (const [sceneId, sceneWords] of currentBoldWordsByScene.entries()) {
			if (sceneWords.has(word.toLowerCase())) {
				// 该词在这个场景中被加粗
				knowledge.scenes.add(sceneId);
			} else {
				// 该词在这个场景中没有被加粗
				knowledge.scenes.delete(sceneId);
			}
		}

		// 如果词没有关联任何场景，则删除该词
		if (knowledge.scenes.size === 0) {
			currentKnowledge.value.delete(word);
			existingBoldWords.delete(word.toLowerCase());
		}
	}

	// 添加新的加粗词
	for (const [sceneId, sceneWords] of currentBoldWordsByScene.entries()) {
		const newWords = Array.from(sceneWords).filter(
			(word) =>
				!Array.from(currentKnowledge.value.values()).some(
					(k) => k.word.toLowerCase() === word
				)
		);

		if (newWords.length) {
			addBoldWordsToKnowledge(newWords, sceneId);
		}
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
const saveKnowledge = () => {
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
			pos: editedFields.value.pos,
			word_zh: editedFields.value.word_zh,
			example: editedFields.value.example,
			example_zh: editedFields.value.example_zh,
			type: editedFields.value.type,
			definition_zh: editedFields.value.definition_zh,
			system: {
				affixAnalysis: {
					prefix: editedFields.value.system.affixAnalysis.prefix,
					prefixMeaning: editedFields.value.system.affixAnalysis.prefixMeaning,
					suffix: editedFields.value.system.affixAnalysis.suffix,
					suffixMeaning: editedFields.value.system.affixAnalysis.suffixMeaning,
				},
				rootAnalysis: {
					root: editedFields.value.system.rootAnalysis.root,
					meaning: editedFields.value.system.rootAnalysis.meaning,
				},
				wordInflections: {
					baseForm: editedFields.value.system.wordInflections.baseForm,
					baseForm_zh: "原型",
					presentParticiple:
						editedFields.value.system.wordInflections.presentParticiple,
					pastParticiple_zh: "过去分词",
					pastTense: editedFields.value.system.wordInflections.pastTense,
					pastTense_zh: "过去式",
					presentParticiple:
						editedFields.value.system.wordInflections.presentParticiple,
					presentParticiple_zh: "现在分词",
				},
			},
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

		// 可选：更新编辑器中的加粗效果
		if (editor.value) {
			boldKnowledgeWords(
				Array.from(currentKnowledge.value.values()),
				editor.value
			);
		}

		showToast({ message: "知识点已更新", type: "success" });
	} catch (error) {
		showToast({ message: "知识点更新失败", type: "error" });
	}
};

// 修改保存所有知识点的方法
const saveAllKnowledge = async () => {
	try {
		// 转换知识点数据结构以适应批量保存
		const knowledgeArray = Array.from(currentKnowledge.value.values());

		// 准备批量保存的数据
		const bulkData = {
			catalogId: route.params.id,
			lessonId: route.query.sign,
			items: scriptJson.value.scenes[0].dialogues.map((dialogue) => ({
				sceneId: dialogue.id,
				knowledge: knowledgeArray
					.filter((k) => k.scenes.has(dialogue.id))
					.map(({ scenes, ...item }) => item), // 移除 scenes 字段
			})),
		};

		// 调用批量保存接口
		await apiClient.post("/knowledge/bulk", bulkData);
	} catch (error) {
		showToast({ message: "知识点更新失败", type: "error" });
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
	let currentPair = []; // 当前配对的行
	let lastWasEmpty = false; // 跟踪上一行是否为空

	// 首先清理连续的空行
	const cleanedBlocks = savedData.blocks.filter((block, index, blocks) => {
		const currentLine = block.data.text;
		const isEmptyLine = !currentLine.replace(/\u200B/g, "").trim();

		// 标题行总是保留
		if (currentLine.match(/^#\s+\S/)) {
			return true;
		}

		// 检查前一个块
		const prevBlock = blocks[index - 1];
		const isPrevEmpty =
			prevBlock && !prevBlock.data.text.replace(/\u200B/g, "").trim();

		// 不保留连续的空行，除非是在对话之间（即前面是空行且下一个是标题）
		if (isEmptyLine && isPrevEmpty) {
			const nextBlock = blocks[index + 1];
			if (nextBlock && nextBlock.data.text.match(/^#\s+\S/)) {
				return true; // 保留对话之间的双空行
			}
			return false; // 过滤掉其他连续空行
		}

		return true; // 保留所有其他行
	});
	console.log(cleanedBlocks);
	// 处理清理后的块
	cleanedBlocks.forEach((block) => {
		const line = block.data.text;
		const isEmptyLine = !line.replace(/\u200B/g, "").trim();

		// 处理标题行
		if (line.match(/^#\s+\S/)) {
			// 处理未完成的配对
			if (currentPair.length > 0 && currentDialogue) {
				processPair(currentPair, currentDialogue);
			}

			// 保存当前对话
			if (currentDialogue) {
				outputDialogues.push(currentDialogue);
			}

			// 创建新对话
			currentDialogue = {
				id: `Scene${outputDialogues.length + 1}`,
				season: route.params.season,
				episode: route.params.episode,
				title: line.replace(/^#\s*/, "").trim(),
				img: "",
				text: [],
				text_zh: [],
			};
			currentPair = [];
			lastWasEmpty = false;
		}
		// 处理内容行和空行
		else if (currentDialogue) {
			if (isEmptyLine) {
				// 遇到空行，处理当前配对
				if (currentPair.length > 0) {
					processPair(currentPair, currentDialogue);
					currentPair = [];
				}
			} else {
				// 处理内容行
				currentPair.push(line);
				// 如果积累了两行，立即处理
				if (currentPair.length === 2) {
					processPair(currentPair, currentDialogue);
					currentPair = [];
				}
			}
		}
	});

	// 处理最后可能未处理的配对
	if (currentPair.length > 0 && currentDialogue) {
		processPair(currentPair, currentDialogue);
	}
	if (currentDialogue) {
		outputDialogues.push(currentDialogue);
	}
	console.log(outputDialogues);
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
	console.log(knowledges, editorInstance);
	const content = await editorInstance.save();
	// 创建一个对象来跟踪每个知识点单词的匹配状态
	const matchedWords = new Set();
	const newBlocks = content.blocks.map((block) => {
		if (block.type === "paragraph" && block.data.text.trim()) {
			// 遍历每个知识点，并在整个文本范围内仅加粗首次出现
			knowledges.forEach(({ word }) => {
				// 如果该单词已经加粗过，则跳过
				if (matchedWords.has(word)) return;

				const regExp = new RegExp(`(${word})`, "i"); // 匹配第一个出现的单词（忽略大小写）

				// 替换第一个匹配项后停止
				block.data.text = block.data.text.replace(regExp, (match) => {
					matchedWords.add(word); // 标记该单词已加粗
					return `<b>${match}</b>`; // 仅加粗第一个匹配项
				});
			});
		}
		return block;
	});

	// 渲染编辑器内容
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
</script>
<style scoped>
.upload-placeholder {
	border: 2px dashed #ddd;
	height: 100%;
	width: 100%;
}

.upload-placeholder:hover {
	background-color: #e2e8f0; /* 鼠标悬停时的背景色 */
}

.editor-container {
	width: 100%;
	text-align: left;
	min-height: 500px;
}
.shadow-editor {
	box-shadow: 0 4px 8px rgba(var(--primary-color-rgb), 0.3); /* 红色阴影 */
}
.shadow-knowledge {
	box-shadow: 0 4px 8px rgba(var(--secondary-color-rgb), 0.3); /* 红色阴影 */
}
/* 悬停时显示编辑图标 */
.edit-icon {
	right: 0px;
}
</style>
