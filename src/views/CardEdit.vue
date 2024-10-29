<template>
	<!-- 动态编辑区域 -->
	<div class="flex space-x-4">
		<div
			class="editor-container p-4 w-4/6 text-sm mt-4 bg-white rounded shadow-lg"
		>
			<!-- Markdown 编辑器 -->
			<div id="editorjs" class="editorjs-container"></div>
		</div>
		<div class="toolbox-container w-2/6">
			<div class="card w-full bg-white rounded p-4 text-center shadow-lg">
				<h3 class="text-lg font-semibold">知识点</h3>

				<!-- 遍历展示 Knowledge 字段中的所有 word -->
				<div
					v-for="(item, index) in knowledges"
					:key="index"
					class="text-gray-800 text-sm my-2 text-left cursor-pointer relative group"
				>
					{{ index + 1 }}. <span>{{ item.word }}</span>

					<!-- 编辑图标 -->
					<span
						class="edit-icon text-blue-500 text-xs absolute right-0"
						@click="editKnowledge(item)"
					>
						编辑
					</span>
				</div>
			</div>
			<button @click="saveDialogue" class="mt-4 btn text-white btn-primary">
				保存原文
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import apiClient from "@/api";
import { useRoute, useRouter } from "vue-router";
import EditorJS from "@editorjs/editorjs";
import CustomItalic from "@/utils/CustomItalic";

const route = useRoute();
const router = useRouter();
const dialogueText = ref(""); // 保存台词的内容

const showDialogueEditor = ref(true);
const editor = ref(null);

const defaultJson = ref({
	scenes: [
		{
			id: route.params.season + "-" + route.params.episode,
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
							"The Simpsons are rushing to the school auditorium to watch their kids' performance. Homer is driving a bit recklessly.",
						],
						["Marge", "Ooh! Careful, Homer!"],
						["Homer", "There's no time. We're late."],
					],
					text_zh: [
						[
							"narration",
							"1. 标题 - 用 # 来标记。2. 选中单词 - 选择 Marker，标记知识点。3. 选中段落 - 加粗，标记该段落为补充性的段落。4. 英文原文和中文翻译保持在相邻行。",
						],
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
							symbols: "/ˈrʌʃɪŋ/",
							pos: "v.",
							example: "They were rushing to catch the train.",
							word_zh: "匆忙",
							definition_zh: "因为紧急情况而快速行动。",
							example_zh: "他们匆忙赶火车。",
							system: {
								rootAnalysis: {
									root: "rush",
									meaning: "move swiftly",
									meaning_zh: "迅速移动",
								},
								affixAnalysis: {
									suffix: "ing",
									suffixMeaning:
										"present participle, indicating an ongoing action",
									suffixMeaning_zh: "现在分词，表示正在进行的动作",
								},
								wordInflections: {
									baseForm: "rush",
									baseForm_zh: "原型",
									presentParticiple: "rushing",
									presentParticiple_zh: "现在分词",
									pastTense: "rushed",
									pastTense_zh: "过去式",
									pastParticiple: "rushed",
									pastParticiple_zh: "过去分词",
								},
							},
						},
					],
				},
			],
		},
	],
});

const knowledges = ref([]);

const fetchDefaultJson = async () => {
	if (route.query.script) {
		const scriptUrl = route.query.script;
		const scriptRes = await fetch(scriptUrl);
		if (!scriptRes.ok) {
			throw new Error("课程信息不完整或未找到");
		}
		const res = await scriptRes.json();
		console.log(res);
		defaultJson.value = res.scriptData;
	}
};

const initData = async () => {
	const blocks = [];

	// 将标题作为 Markdown 样式的一级标题
	blocks.push({
		type: "paragraph",
		data: {
			text: `# ${defaultJson.value.scenes[0].dialogues[0].title}`,
		},
	});

	// 添加空行
	blocks.push({
		type: "paragraph",
		data: { text: "\u200B" },
	});

	// 添加 text 和 text_zh 内容
	defaultJson.value.scenes[0].dialogues[0].text.forEach((textItem, index) => {
		const [character, dialogue] = textItem;

		// 原文
		blocks.push({
			type: "paragraph",
			data: {
				text:
					character && character != "narration"
						? `[${character}] ${dialogue}`
						: dialogue, // 如果角色名为空或旁白，仅显示对话内容
			},
		});

		// 中文翻译
		const textZhItem = defaultJson.value.scenes[0].dialogues[0].text_zh[index];
		if (textZhItem) {
			const [characterZh, dialogueZh] = textZhItem;
			blocks.push({
				type: "paragraph",
				data: {
					text:
						characterZh && characterZh != "narration"
							? `[${characterZh}] ${dialogueZh}`
							: dialogueZh,
				},
			});
		}

		// 添加空行
		blocks.push({
			type: "paragraph",
			data: { text: "\u200B" },
		});
	});

	return blocks;
};

const initKnowledgesData = async () => {
	knowledges.value = defaultJson.value.scenes[0].dialogues[0].knowledge;
	// 页面初始化时，调用以添加默认的加粗项
	initializeDefaultBoldWords();
};

// 将知识点中的单词标记
const boldKnowledgeWords = async (editorInstance, knowledgeArray) => {
	const content = await editorInstance.save();
	const newBlocks = content.blocks.map((block) => {
		if (block.type === "paragraph" && block.data.text.trim() !== "") {
			knowledgeArray.forEach(({ word }) => {
				const regExp = new RegExp(`(${word})`, "gi");
				// 使用 <b> 标签确保加粗文本的标记能够被用户取消
				block.data.text = block.data.text.replace(regExp, `<b>${word}</b>`);
			});
		}
		return block;
	});

	editorInstance.render({ blocks: newBlocks });
};

onMounted(async () => {
	await fetchDefaultJson();
	const blocks = await initData();

	// 初始化 Editor.js 实例
	editor.value = new EditorJS({
		holder: "editorjs",
		placeholder: "",
		data: {
			blocks,
		},
		inlineToolbar: ["bold", "italic"], // 只允许加粗和倾斜（倾斜用来标记是否是特殊内容）
		onReady: () => {
			// 标记知识点单词
			const knowledgeArray = defaultJson.value.scenes[0].dialogues[0].knowledge;
			boldKnowledgeWords(editor.value, knowledgeArray);
			initKnowledgesData();
		},
		onChange: async () => {
			const content = await editor.value.save();
			checkBoldText(content);
		},
	});
});

onBeforeUnmount(() => {
	if (editor.value) {
		editor.value.destroy(); // 组件卸载时销毁编辑器实例
	}
});

let boldAdded = false; // 标志变量，用于追踪是否已经有加粗文本
let latestBoldText = ""; // 用于记录最新加粗的内容
const existingBoldWords = new Set(); // 保存已存在的默认加粗内容

// 初始化时，将默认加粗项加入 existingBoldWords
const initializeDefaultBoldWords = () => {
	defaultJson.value.scenes[0].dialogues[0].knowledge.forEach((item) => {
		existingBoldWords.add(item.word.toLowerCase());
	});
};

// 检查是否有新增的加粗文本
const checkBoldText = (content) => {
	let hasBoldText = false;

	content.blocks.forEach((block) => {
		if (block.type === "paragraph" && block.data.text.includes("<b>")) {
			const boldMatches = block.data.text.match(/<b>(.*?)<\/b>/g);
			if (boldMatches) {
				// 获取最新的加粗文本内容
				const currentBoldText = boldMatches.map((boldTag) =>
					boldTag.replace(/<\/?b>/g, "")
				);

				// 过滤掉已存在的默认加粗项，仅保留新增的加粗项
				const newBoldWords = currentBoldText.filter(
					(word) => !existingBoldWords.has(word.toLowerCase())
				);

				// 如果存在新的加粗项
				if (newBoldWords.length > 0) {
					hasBoldText = true;
					latestBoldText = newBoldWords.join(" ");

					// 将新增的加粗项加入 knowledges
					newBoldWords.forEach((boldText) => {
						const newKnowledge = {
							from: "generated",
							book: "custom",
							type: "vocabulary",
							word: boldText,
							definition: "",
							symbols: "",
							pos: "",
							example: "",
							word_zh: "",
							definition_zh: "",
							example_zh: "",
							system: {
								rootAnalysis: {
									root: boldText,
									meaning: "",
									meaning_zh: "",
								},
								affixAnalysis: {
									suffix: "",
									suffixMeaning: "",
									suffixMeaning_zh: "",
								},
								wordInflections: {
									baseForm: boldText,
									baseForm_zh: "原型",
									presentParticiple: "",
									presentParticiple_zh: "现在分词",
									pastTense: "",
									pastTense_zh: "过去式",
									pastParticiple: "",
									pastParticiple_zh: "过去分词",
								},
							},
						};
						knowledges.value.push(newKnowledge);
						existingBoldWords.add(boldText.toLowerCase()); // 将新增的加粗内容添加到已存在的加粗项集合
					});
				}
			}
		}
	});

	// 触发回调，并更新状态
	if (hasBoldText && !boldAdded) {
		boldAdded = true;
		onBoldTextAdded(latestBoldText);
	} else if (!hasBoldText && boldAdded) {
		boldAdded = false;
		latestBoldText = "";
	}
};

// 切换台词编辑区域的显示状态
const toggleDialogueEditor = () => {
	showDialogueEditor.value = !showDialogueEditor.value;
};
const saveDialogue = async () => {
	try {
		const savedData = await editor.value.save(); // 获取编辑器内容

		// 初始化输出结构
		const outputJson = {
			scenes: [
				{
					id: route.params.season + "-" + route.params.episode,
					title: route.params.episode,
					dialogues: [
						{
							id: "Scene1",
							season: route.params.season,
							episode: route.params.episode,
							title: "", // 用于存储标题
							img: defaultJson.value.scenes[0].dialogues[0].img,
							text: [],
							text_zh: [],
							knowledge: knowledges.value, // 直接加入当前的知识点数组
						},
					],
				},
			],
		};

		let isEnglishLine = true; // 标记当前行是否为英文内容
		let hasTitle = false; // 用于确认是否已有标题
		let tempText = []; // 临时存储英文文本
		let tempTextZh = []; // 临时存储中文翻译

		// 遍历编辑器内容，按需填充文本和翻译内容
		savedData.blocks.forEach((block) => {
			if (block.type === "paragraph") {
				let lineText = block.data.text.trim();

				// 移除所有 <b> 标签
				lineText = lineText.replace(/<\/?b>/g, "");

				// 检查是否为标题
				if (lineText.startsWith("#")) {
					// 仅保留第一个标题
					if (!hasTitle) {
						outputJson.scenes[0].dialogues[0].title = lineText
							.replace(/^#/, "")
							.trim();
						hasTitle = true;
					}
				} else if (lineText !== "\u200B") {
					// 排除空行
					let character = ""; // 初始化角色名为空字符串
					let dialogue = lineText;

					// 检查是否有角色名的格式，如 "[Marge]"
					const characterMatch = lineText.match(/^\[(.*?)\]\s*(.*)/);
					if (characterMatch) {
						character = characterMatch[1]; // 提取角色名
						dialogue = characterMatch[2]; // 提取对话内容
					}

					if (isEnglishLine) {
						tempText = [character, dialogue]; // 设置英文行
					} else {
						tempTextZh = [character, dialogue]; // 设置中文行

						// 英文和中文行匹配完成，加入输出内容
						outputJson.scenes[0].dialogues[0].text.push(tempText);
						outputJson.scenes[0].dialogues[0].text_zh.push(tempTextZh);

						// 重置临时存储
						tempText = [];
						tempTextZh = [];
					}
					isEnglishLine = !isEnglishLine; // 切换行状态
				}
			}
		});

		// 如果剩余未成对的行，填充为空行进行匹配
		if (tempText.length && !tempTextZh.length) {
			outputJson.scenes[0].dialogues[0].text.push(tempText);
			outputJson.scenes[0].dialogues[0].text_zh.push(["", ""]);
		} else if (tempTextZh.length && !tempText.length) {
			outputJson.scenes[0].dialogues[0].text.push(["", ""]);
			outputJson.scenes[0].dialogues[0].text_zh.push(tempTextZh);
		}

		console.log("保存的 JSON 格式数据：", outputJson);

		submitSceneData(outputJson);
	} catch (error) {
		console.error("保存 Editor.js 内容时出错：", error);
	}
};

const submitSceneData = (jsonData) => {
	const catalogId = route.params.id;
	const seasonNumber = route.params.season;
	const episodeNumber = route.params.episode;
	uploadScript(catalogId, seasonNumber, episodeNumber, jsonData);
};

const uploadScript = async (
	catalogId,
	seasonNumber,
	episodeNumber,
	jsonData
) => {
	try {
		// 发送请求到后端，上传 JSON 数据
		const response = await apiClient.post(
			"/scripts/" + catalogId + "/" + seasonNumber + "/" + episodeNumber,
			{
				scriptData: jsonData, // 要上传的 JSON 数据
			}
		);

		if (response.status === 200) {
			console.log("Script URL:", response.data.message);
			router
				.replace({
					path: route.path,
					query: {
						...route.query,
						mode: "preview",
					},
				})
				.then(() => {
					// 重新加载组件
					window.location.reload();
				});
		} else {
			console.error("Failed to upload script");
		}
	} catch (error) {
		console.error("Error uploading script:", error);
	}
};

const editKnowledge = (item) => {
	console.log("编辑知识点:", item.word);
};
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
/* 悬停时显示编辑图标 */
.edit-icon {
	right: 0px;
}
</style>
