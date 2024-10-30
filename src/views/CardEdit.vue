<template>
	<!-- 动态编辑区域 -->
	<div class="flex editor-box">
		<div class="editor-container p-4 text-sm -mt-4">
			<div
				class="editor-container p-4 w-3/5 text-sm -mt-4 bg-white rounded shadow-lg shadow-editor"
				style="height: 540px; overflow-y: auto"
			>
				<!-- Markdown 编辑器 -->
				<div id="editorjs" class="editorjs-container"></div>
			</div>
			<!-- 分页按钮 -->
			<div class="flex justify-between mt-4">
				<button
					@click="switchDialogue('previous')"
					:disabled="currentDialogueIndex === 0"
					class="btn btn-primary btn-sm text-white"
				>
					上一页
				</button>
				<div class="space-x-4">
					<button
						@click="saveDialogue"
						class="btn btn-sm text-white btn-primary"
					>
						生成卡片
					</button>
					<button
						@click="backToPreview"
						class="btn btn-sm text-white btn-primary"
					>
						返回预览
					</button>
				</div>
				<button
					@click="switchDialogue('next')"
					:disabled="currentDialogueIndex === totalDialogues - 1"
					class="btn btn-primary btn-sm text-white"
				>
					下一页
				</button>
			</div>
		</div>

		<div class="toolbox-container w-2/5 -mt-4">
			<div
				class="card w-full bg-white rounded p-4 text-center shadow-lg shadow-knowledge"
			>
				<h3 v-if="!isEditing" class="text-lg font-semibold">知识点</h3>
				<!-- 检查当前项是否处于编辑状态 -->
				<div
					v-if="isEditing"
					class="text-gray-800 text-sm my-2 text-left cursor-pointer relative group"
				>
					<!-- 编辑表单 -->
					<div class="text-center mb-2 font-bold text-base">
						{{ editedFields.word }}
					</div>
					<!-- 词性选择 -->
					<!-- 中文释义输入 -->
					<div class="flex items-center justify-between space-x-2 mb-2">
						<div>
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
						<input
							type="text"
							v-model="editedFields.definition_zh"
							id="definition_zh"
							placeholder="请输入详细释义"
							class="input input-bordered input-sm w-full max-w-xs"
						/>
					</div>
					<div class="mb-2">
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
					<div class="flex items-center space-x-2 mb-2">
						<div>
							<input
								type="text"
								v-model="editedFields.system.affixAnalysis.prefix"
								id="prefix"
								placeholder="前缀"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.rootAnalysis.root"
								id="root"
								placeholder="词根"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.affixAnalysis.suffix"
								id="suffix"
								placeholder="后缀"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div>
							<input
								type="text"
								v-model="editedFields.system.affixAnalysis.prefixMeaning"
								id="prefixMeaning"
								placeholder="前缀"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.rootAnalysis.rootMeaning"
								id="rootMeaning"
								placeholder="词根"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
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
					<div class="flex items-center space-x-2 mb-2">
						<div class="w-1/3">
							<input
								type="text"
								v-model="editedFields.system.wordInflections.baseForm_zh"
								id="baseForm_zh"
								placeholder="原型"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.wordInflections.baseForm"
								id="baseForm"
								placeholder="原型"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div class="w-1/3">
							<input
								type="text"
								v-model="
									editedFields.system.wordInflections.presentParticiple_zh
								"
								id="presentParticiple_zh"
								placeholder="现在分词"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.wordInflections.presentParticiple"
								id="presentParticiple"
								placeholder="现在分词"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div class="w-1/3">
							<input
								type="text"
								v-model="editedFields.system.wordInflections.pastTense_zh"
								id="pastTense_zh"
								placeholder="过去式"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.wordInflections.pastTense"
								id="pastTense"
								placeholder="过去式"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div class="w-1/3">
							<input
								type="text"
								v-model="
									editedFields.system.wordInflections.presentParticiple_zh
								"
								id="presentParticiple_zh"
								placeholder="现在分词"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.wordInflections.presentParticiple"
								id="presentParticiple"
								placeholder="现在分词"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex justify-end mt-4 space-x-2">
						<button
							@click="saveKnowledge(index)"
							class="text-secondary text-sm"
						>
							保存
						</button>
						<button @click="cancelEdit" class="text-gray-500 text-sm">
							取消
						</button>
					</div>
				</div>
				<div
					v-else
					v-for="(item, index) in knowledges"
					:key="index"
					class="text-gray-800 text-sm my-2 text-left cursor-pointer relative group"
				>
					{{ index + 1 }}. <span>{{ item.word }}</span>
					<span
						class="edit-icon text-secondary text-xs absolute right-0"
						@click="startEditing(index, item)"
					>
						编辑
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import apiClient from "@/api";
import { useRoute, useRouter } from "vue-router";
import EditorJS from "@editorjs/editorjs";
import { getDefinitions } from "@/utils/decompose.js";

const handleTranslate = async () => {
	const result = await apiClient.post("/translation", { text: "hello world" });
	if (result.statusCode === 200) {
		console.log("Translated text:", result.translatedText);
	} else {
		console.error(result.errorMessage);
	}
};

const route = useRoute();
const router = useRouter();

const editor = ref(null);
const currentDialogueIndex = ref(0); // 当前对话索引
const totalDialogues = ref(0); // 总对话数
const knowledges = ref([]); // 知识点列表
const existingBoldWords = new Set(); // 保存已存在的加粗单词

const defaultJson = ref({
	scenes: [
		{
			id: `${route.params.season}-${route.params.episode}`,
			title: route.params.episode,
			dialogues: [
				{
					id: "Scene1",
					season: route.params.season,
					episode: route.params.episode,
					title: "示例标题",
					img: "",
					text: [
						[
							"narration",
							"The Simpsons are rushing to the school auditorium...",
						],
						["Marge", "Ooh! Careful, Homer!"],
						["Homer", "There's no time. We're late."],
					],
					text_zh: [
						["narration", "辛普森一家匆忙赶往学校礼堂观看孩子们的表演..."],
						["", "哦！小心点，荷马！"],
						["", "没时间了，我们迟到了。"],
					],
					knowledge: [
						{
							from: "knowledges",
							book: "cet-4",
							type: "vocabulary",
							word: "rushing",
							definition: "Moving or doing something quickly due to urgency.",
						},
					],
				},
			],
		},
	],
});
const editFieldsInit = {
	word: "",
	pos: "",
	word_zh: "",
	example: "",
	example_zh: "",
	type: "",
	definition_zh: "",
};
const isEditing = ref(false); // 当前正在编辑的索引
const editedFields = ref(editFieldsInit);

const startEditing = (index, item) => {
	isEditing.value = true;
	editedFields.value = {
		word: item.word,
		pos: item.pos,
		word_zh: item.word_zh,
		example: item.example,
		example_zh: item.example_zh,
		type: item.type,
		definition_zh: item.definition_zh,
	};
	const { prefix, prefixMeaning, suffix, suffixMeaning, root, rootMeaning } =
		getDefinitions(item.word);
	Object.assign(editedFields.value, {
		system: {
			affixAnalysis: { prefix, prefixMeaning, suffix, suffixMeaning },
			rootAnalysis: { root, rootMeaning },
			wordInflections: {
				baseForm: item.baseForm,
				baseForm_zh: "原型",
				presentParticiple: item.presentParticiple,
				pastParticiple_zh: "过去分词",
				pastTense: item.pastTense,
				pastTense_zh: "过去式",
				presentParticiple: item.presentParticiple,
				presentParticiple_zh: "现在分词",
			},
		},
	});
};

const saveKnowledge = (index) => {
	knowledges.value[index] = {
		...knowledges.value[index],
		...editedFields.value,
	};
	console.log(knowledges.value[index]);
	cancelEdit();
};

const cancelEdit = () => {
	isEditing.value = false;
	editedFields.value = editFieldsInit;
};

// 当前对话内容
const currentDialogue = computed(
	() => defaultJson.value.scenes[0].dialogues[currentDialogueIndex.value]
);

// 加载默认 JSON 并更新对话数
const fetchDefaultJson = async () => {
	if (route.query.script) {
		const scriptUrl = route.query.script;
		const response = await fetch(scriptUrl);
		if (response.ok) {
			const res = await response.json();
			defaultJson.value = res.scriptData;
			totalDialogues.value = defaultJson.value.scenes[0].dialogues.length;
		} else {
			throw new Error("课程信息不完整或未找到");
		}
	}
};

// 初始化编辑器中的对话数据
const initEditorWithDialogueData = async () => {
	const blocks = [];
	const dialogueData = currentDialogue.value;
	initKnowledgesData();

	// 添加标题
	blocks.push({ type: "paragraph", data: { text: `# ${dialogueData.title}` } });
	blocks.push({ type: "paragraph", data: { text: "\u200B" } }); // 空行

	// 添加 text 和 text_zh 内容
	dialogueData.text.forEach((textItem, index) => {
		const [character, dialogue] = textItem;
		blocks.push({
			type: "paragraph",
			data: {
				text: character ? `[${character}] ${dialogue}` : dialogue,
			},
		});
		const textZhItem = dialogueData.text_zh[index];
		if (textZhItem) {
			const [characterZh, dialogueZh] = textZhItem;
			blocks.push({
				type: "paragraph",
				data: {
					text: characterZh ? `[${characterZh}] ${dialogueZh}` : dialogueZh,
				},
			});
		}
		blocks.push({ type: "paragraph", data: { text: "\u200B" } }); // 空行
	});
	return blocks;
};

// 初始化知识点数据
const initKnowledgesData = () => {
	knowledges.value = currentDialogue.value.knowledge;
	initializeDefaultBoldWords();
};

// 将知识点中的单词加粗
const boldKnowledgeWords = async (editorInstance) => {
	const content = await editorInstance.save();
	const newBlocks = content.blocks.map((block) => {
		if (block.type === "paragraph" && block.data.text.trim()) {
			knowledges.value.forEach(({ word }) => {
				const regExp = new RegExp(`(${word})`, "gi");
				block.data.text = block.data.text.replace(regExp, `<b>${word}</b>`);
			});
		}
		return block;
	});
	editorInstance.render({ blocks: newBlocks });
};

// 初始化默认加粗项
const initializeDefaultBoldWords = () => {
	currentDialogue.value.knowledge.forEach((item) => {
		existingBoldWords.add(item.word.toLowerCase());
	});
};

// 检查新增加粗的单词并更新
const checkBoldText = (content) => {
	let hasBoldText = false;
	let latestBoldText = "";
	const currentBoldWords = new Set(); // 存储当前文本中的加粗项

	content.blocks.forEach((block) => {
		if (block.type === "paragraph") {
			// 提取所有 <b> 标签内容并排除其他标签的影响
			const boldMatches = block.data.text.match(/<b>(.*?)<\/b>/g);
			if (boldMatches) {
				const cleanBoldWords = boldMatches
					.map((boldTag) =>
						// 移除所有标签，保留纯净的文本
						boldTag.replace(/<\/?[^>]+(>|$)/g, "")
					)
					.filter(
						(word) => !existingBoldWords.has(word.toLowerCase()) // 过滤已存在的加粗项
					);

				// 添加新加粗项
				if (cleanBoldWords.length) {
					hasBoldText = true;
					latestBoldText = cleanBoldWords.join(" ");
					cleanBoldWords.forEach((boldText) => {
						knowledges.value.push({
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
								rootAnalysis: { root: "watch", meaning: "", meaning_zh: "" },
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
						});
						existingBoldWords.add(boldText.toLowerCase());
					});
				}

				// 将当前块的加粗项添加到 currentBoldWords 中
				boldMatches.forEach((boldTag) => {
					const cleanWord = boldTag
						.replace(/<\/?[^>]+(>|$)/g, "")
						.toLowerCase();
					currentBoldWords.add(cleanWord);
				});
			}
		}
	});

	// 检查哪些加粗项被移除
	existingBoldWords.forEach((word) => {
		if (!currentBoldWords.has(word)) {
			// 从 knowledges 列表中移除取消加粗的项
			const index = knowledges.value.findIndex(
				(item) => item.word.toLowerCase() === word
			);
			if (index !== -1) {
				knowledges.value.splice(index, 1);
			}
			// 从 existingBoldWords 中移除
			existingBoldWords.delete(word);
		}
	});

	if (hasBoldText) {
		console.log("新增加粗文本:", latestBoldText);
	}
};

// 切换对话
const switchDialogue = async (direction) => {
	if (
		(direction === "next" &&
			currentDialogueIndex.value < totalDialogues.value - 1) ||
		(direction === "previous" && currentDialogueIndex.value > 0)
	) {
		currentDialogueIndex.value += direction === "next" ? 1 : -1;

		// 销毁当前 EditorJS 实例
		if (editor.value) {
			await editor.value.destroy();
			editor.value = null; // 确保实例完全销毁
		}

		// 初始化新的 EditorJS 实例
		const blocks = await initEditorWithDialogueData();
		editor.value = new EditorJS({
			holder: "editorjs",
			placeholder: "",
			data: {
				blocks,
			},
			inlineToolbar: ["bold", "italic"], // 只允许加粗和倾斜
			onReady: () => {
				boldKnowledgeWords(editor.value); // 每次重新初始化时标记知识点单词
			},
			onChange: async () => {
				const content = await editor.value.save();
				checkBoldText(content);
			},
		});
	}
};

const saveDialogue = async () => {
	const savedData = await editor.value.save();
	const outputJson = {
		scenes: [
			{
				id: `${route.params.season}-${route.params.episode}`,
				title: route.params.episode,
				dialogues: [
					{
						id: "scene" + currentDialogueIndex.value,
						season: route.params.season,
						episode: route.params.episode,
						title: savedData.blocks
							.find((block) => block.data.text.startsWith("#"))
							.data.text.replace(/^#/, "")
							.trim(),
						img: currentDialogue.value.img,
						text: [],
						text_zh: [],
						knowledge: knowledges.value,
					},
				],
			},
		],
	};

	let isEnglishLine = true;
	let tempText = [];
	let tempTextZh = [];

	savedData.blocks.forEach((block) => {
		let lineText = block.data.text.trim().replace(/<\/?b>/g, "");
		if (!lineText.startsWith("#") && lineText !== "\u200B") {
			const match = lineText.match(/^\[(.*?)\]\s*(.*)/);
			const character = match ? match[1] : "";
			const dialogue = match ? match[2] : lineText;

			if (isEnglishLine) {
				tempText = [character, dialogue];
			} else {
				tempTextZh = [character, dialogue];
				outputJson.scenes[0].dialogues[0].text.push(tempText);
				outputJson.scenes[0].dialogues[0].text_zh.push(tempTextZh);
				tempText = [];
				tempTextZh = [];
			}
			isEnglishLine = !isEnglishLine;
		}
	});

	// 如果剩余未成对的行，填充空项
	if (tempText.length && !tempTextZh.length)
		outputJson.scenes[0].dialogues[0].text.push(tempText);
	if (tempTextZh.length && !tempText.length)
		outputJson.scenes[0].dialogues[0].text_zh.push(tempTextZh);

	submitSceneData(outputJson);
};

// 提交数据
const submitSceneData = (jsonData) => {
	const catalogId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	uploadScript(catalogId, season, episode, jsonData);
};

// 上传脚本数据
const uploadScript = async (catalogId, season, episode, jsonData) => {
	try {
		const response = await apiClient.post(
			`/scripts/${catalogId}/${season}/${episode}`,
			{
				scriptData: jsonData,
			}
		);
		if (response.status === 200) {
		}
	} catch (error) {
		console.error("Error uploading script:", error);
	}
};

const backToPreview = () => {
	router.replace({
		path: route.path,
		query: { ...route.query, mode: "preview" },
	});
};

onMounted(async () => {
	handleTranslate();

	await fetchDefaultJson();
	const blocks = await initEditorWithDialogueData();

	editor.value = new EditorJS({
		holder: "editorjs",
		placeholder: "",
		data: { blocks },
		inlineToolbar: ["bold", "italic"],
		onReady: () => boldKnowledgeWords(editor.value),
		onChange: async () => checkBoldText(await editor.value.save()),
	});
});

onBeforeUnmount(() => editor.value && editor.value.destroy());
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
