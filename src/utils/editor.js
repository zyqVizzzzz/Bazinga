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

// 标记知识点单词，仅加粗每个知识点单词的全局第一个匹配项
export const boldKnowledgeWords = async (knowledges = [], editorInstance) => {
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
		// 判断是否为中文行：含有中文字符即认为是中文行
		if (/[^\x00-\x7F]/.test(block.data.text)) {
			// 如果是中文行，跳过处理
			return;
		}

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
 * @returns {Object|null} - 生成的对话输出数据或返回 null 表示提交失败
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
	console.log(savedData.blocks);
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
			let { speaker: englishSpeaker, text: englishText } = parseDialogueLine(
				englishLine,
				"en"
			);

			// 处理中文行
			let { speaker: chineseSpeaker, text: chineseText } = parseDialogueLine(
				chineseLine,
				"zh"
			);

			// 添加到输出数组
			outputDialogue.text.push([englishSpeaker, englishText]);
			outputDialogue.text_zh.push([chineseSpeaker, chineseText]);
		}
	});
	console.log(outputDialogue);
	return outputDialogue;
}

/**
 * 验证格式是否符合两行段落 + 一行空行 或 一行段落 + 一行空行的结构
 * @param {Array} lines - 处理后的行数据
 * @returns {Boolean} - 是否符合格式
 */
function validateFormat(lines) {
	let count = 0;
	let started = false; // 用于标记是否已经遇到第一个有内容的段落

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		if (line === "") {
			// 如果当前行为空行，并且已经开始计数
			if (started && count !== 1 && count !== 2) {
				return false; // 不符合一行或两行段落 + 一行空行的结构
			}
			// 如果当前行为空且已开始计数，则重置计数器
			if (started) {
				count = 0;
			}
		} else {
			// 如果是第一个有内容的段落，标记已开始
			if (!started) {
				started = true;
			}
			// 计数器加一
			count++;
		}
	}

	// 检查最后一组是否符合格式
	return count === 0 || count === 1 || count === 2;
}

/**
 * 解析对话行，提取角色名和对话内容
 * @param {string} line - 单行对话文本
 * @returns {Object} - 包含角色名和对话文本的对象
 */
function parseDialogueLine(line, tag) {
	let speaker = "";
	let text = line.replace(/\u200B/g, "").trim();

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
