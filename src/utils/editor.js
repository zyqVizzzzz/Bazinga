export const existingBoldWords = new Set();

export const initEditorBlocks = (dialogueData) => {
	const blocks = [];

	// 添加标题
	blocks.push({ type: "paragraph", data: { text: `# ${dialogueData.title}` } });
	blocks.push({ type: "paragraph", data: { text: "\u200B" } }); // 空行

	// 添加 text 和 text_zh 内容
	dialogueData.text.forEach((textItem, index) => {
		let [character, dialogue] = textItem;

		// 检查是否包含 "narration"
		if (character && character.includes("narration")) {
			character = ""; // 移除 "narration"
			dialogue = `<i>${dialogue}</i>`; // 用 <i> 标签包裹内容
		}

		blocks.push({
			type: "paragraph",
			data: {
				text: character ? `[${character}] ${dialogue}` : dialogue,
			},
		});

		const textZhItem = dialogueData.text_zh[index];
		if (textZhItem) {
			let [characterZh, dialogueZh] = textZhItem;

			// 检查是否包含 "narration"
			if (characterZh && characterZh.includes("narration")) {
				characterZh = ""; // 移除 "narration"
				dialogueZh = `<i>${dialogueZh}</i>`; // 用 <i> 标签包裹内容
			}

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

// 标记知识点单词
export const boldKnowledgeWords = async (knowledges = [], editorInstance) => {
	const content = await editorInstance.save();
	const newBlocks = content.blocks.map((block) => {
		if (block.type === "paragraph" && block.data.text.trim()) {
			knowledges.forEach(({ word }) => {
				const regExp = new RegExp(`(${word})`, "gi");
				block.data.text = block.data.text.replace(regExp, `<b>${word}</b>`);
			});
		}
		return block;
	});
	editorInstance.render({ blocks: newBlocks });
};

/**
 * 提取并清洗 <b> 标签中的文本。
 * @param {string} text - 要处理的文本
 * @returns {Array<string>} - 返回清洗后的加粗项数组
 */
export function extractBoldWords(text) {
	const boldMatches = text.match(/<b>(.*?)<\/b>/g);
	if (!boldMatches) return [];

	// 清除标签并返回纯文本的加粗项
	return boldMatches.map((boldTag) =>
		boldTag.replace(/<\/?[^>]+(>|$)/g, "").toLowerCase()
	);
}

/**
 * 更新 knowledges 列表中新增的加粗项。
 * @param {Array<string>} newBoldWords - 新增的加粗单词列表
 * @param {Array<Object>} knowledges - 知识点列表
 */
export function addBoldWordsToKnowledge(newBoldWords, knowledges) {
	newBoldWords.forEach((boldText) => {
		knowledges.push({
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
		existingBoldWords.add(boldText);
	});
}

/**
 * 检查文本中的加粗项，并更新 knowledges 列表和 existingBoldWords 集合。
 * @param {Object} content - 编辑器内容
 * @param {Array<Object>} knowledges - 知识点列表
 */
export function checkBoldText(content, knowledges) {
	let hasBoldText = false;
	let latestBoldText = "";
	const currentBoldWords = new Set();

	content.blocks.forEach((block) => {
		if (block.type === "paragraph") {
			const cleanBoldWords = extractBoldWords(block.data.text).filter(
				(word) => !existingBoldWords.has(word)
			);

			// 添加新加粗项到 knowledges
			if (cleanBoldWords.length) {
				hasBoldText = true;
				latestBoldText = cleanBoldWords.join(" ");
				addBoldWordsToKnowledge(cleanBoldWords, knowledges);
			}

			// 将当前块中的所有加粗项添加到 currentBoldWords 集合
			extractBoldWords(block.data.text).forEach((cleanWord) =>
				currentBoldWords.add(cleanWord)
			);
		}
	});

	// 检查并移除取消加粗的单词
	existingBoldWords.forEach((word) => {
		if (!currentBoldWords.has(word)) {
			const index = knowledges.findIndex(
				(item) => item.word.toLowerCase() === word
			);
			if (index !== -1) knowledges.splice(index, 1);
			existingBoldWords.delete(word);
		}
	});

	if (hasBoldText) {
		console.log("新增加粗文本:", latestBoldText);
	}
}

/**
 * 处理编辑器保存的数据，生成 outputDialogue 格式的输出
 * @param {Object} savedData - Editor.js 保存的数据
 * @param {Object} knowledges - 知识点数组
 * @param {Object} route - 路由信息
 * @param {Number} currentDialogueIndex - 当前对话索引
 * @returns {Object} - 生成的对话输出数据
 */
export function processDialogueData(
	savedData,
	knowledges,
	route,
	currentDialogueIndex
) {
	const outputDialogue = {
		id: "scene" + currentDialogueIndex,
		season: route.params.season,
		episode: route.params.episode,
		title: "",
		img: "",
		text: [],
		text_zh: [],
		knowledge: knowledges,
	};

	let titleFound = false;
	const lines = [];

	// 处理标题和内容行
	savedData.blocks.forEach((block) => {
		let lineText = block.data.text;

		// 移除所有零宽空格字符和 <b> 标签
		lineText = lineText
			.replace(/\u200B/g, "")
			.replace(/<\/?b>/g, "")
			.trim();

		// 设置标题
		if (lineText.startsWith("#") && !titleFound) {
			outputDialogue.title = lineText.replace(/^#/, "").trim();
			titleFound = true;
		} else {
			// 保留所有行，包括空行
			lines.push(lineText);
		}
	});

	// 将内容行按空行分割成多个组
	const groups = [];
	let currentGroup = [];

	lines.forEach((line) => {
		if (line.trim() === "") {
			if (currentGroup.length > 0) {
				groups.push([...currentGroup]);
				currentGroup = [];
			}
		} else {
			currentGroup.push(line);
		}
	});

	// 添加最后一个组
	if (currentGroup.length > 0) {
		groups.push([...currentGroup]);
	}

	// 处理每个组内容并进行配对
	groups.forEach((group) => {
		for (let i = 0; i < group.length; i += 2) {
			let englishLine = group[i] || "";
			let chineseLine = group[i + 1] || "";

			// 处理英文行
			let { speaker: englishSpeaker, text: englishText } =
				parseDialogueLine(englishLine);

			// 处理中文行
			let { speaker: chineseSpeaker, text: chineseText } =
				parseDialogueLine(chineseLine);

			// 添加到输出数组
			outputDialogue.text.push([englishSpeaker, englishText]);
			outputDialogue.text_zh.push([chineseSpeaker, chineseText]);
		}
	});

	return outputDialogue;
}

/**
 * 解析对话行，提取角色名和对话内容
 * @param {string} line - 单行对话文本
 * @returns {Object} - 包含角色名和对话文本的对象
 */
function parseDialogueLine(line) {
	let speaker = "";
	let text = line;

	// 移除零宽空格和 <i> 标签
	text = text
		.replace(/\u200B/g, "")
		.replace(/<\/?i>/g, "")
		.trim();

	// 检查是否整行被 <i> 标签包裹
	if (
		text.startsWith("<i>") &&
		text.endsWith("</i>") &&
		text.indexOf("<i>", 1) === -1
	) {
		text = text.substring(3, text.length - 4).trim();
		speaker = "narration";
	} else {
		// 检查是否有角色名
		const match = text.match(/^\[(.*?)\]\s*(.*)/);
		if (match) {
			speaker = match[1];
			text = match[2];
		}
	}

	return { speaker, text };
}
