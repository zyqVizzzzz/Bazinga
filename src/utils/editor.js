import EditorJS from "@editorjs/editorjs";

let editorInstance = null; // 全局 editor 实例

// 初始化 EditorJS 实例
export const initializeEditor = async (holderId, blocks, onChangeCallback) => {
	editorInstance = new EditorJS({
		holder: holderId,
		placeholder: "",
		data: { blocks },
		inlineToolbar: ["bold", "italic"],
		onReady: () => {
			boldKnowledgeWords();
		},
		onChange: async () => {
			const content = await editorInstance.save();
			onChangeCallback(content);
		},
	});
	return editorInstance;
};

// 销毁当前 EditorJS 实例
export const destroyEditor = async () => {
	if (editorInstance) {
		await editorInstance.destroy();
		editorInstance = null;
	}
};

export const initEditorBlocks = (dialogueData) => {
	const blocks = [];

	blocks.push({
		type: "paragraph",
		data: {
			text: `# ${dialogueData.title}`,
		},
	});

	blocks.push({
		type: "paragraph",
		data: { text: "\u200B" },
	});

	dialogueData.text.forEach((textItem, index) => {
		const [character, dialogue] = textItem;

		blocks.push({
			type: "paragraph",
			data: {
				text:
					character && character != "narration"
						? `[${character}] ${dialogue}`
						: dialogue,
			},
		});

		const textZhItem = dialogueData.text_zh[index];
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

		blocks.push({
			type: "paragraph",
			data: { text: "\u200B" },
		});
	});

	return blocks;
};
// 标记知识点单词
export const boldKnowledgeWords = async (knowledges = []) => {
	const content = await editorInstance.save();
	const newBlocks = content.blocks.map((block) => {
		if (block.type === "paragraph" && block.data.text.trim() !== "") {
			knowledges.forEach(({ word }) => {
				const regExp = new RegExp(`(${word})`, "gi");
				block.data.text = block.data.text.replace(regExp, `<b>${word}</b>`);
			});
		}
		return block;
	});
	editorInstance.render({ blocks: newBlocks });
};

// 检查并处理加粗文本内容
export const checkBoldText = (
	content,
	existingBoldWords,
	addKnowledgeCallback
) => {
	let hasBoldText = false;
	let latestBoldText = "";

	content.blocks.forEach((block) => {
		if (block.type === "paragraph" && block.data.text.includes("<b>")) {
			const boldMatches = block.data.text.match(/<b>(.*?)<\/b>/g);
			if (boldMatches) {
				const currentBoldText = boldMatches.map((boldTag) =>
					boldTag.replace(/<\/?b>/g, "")
				);
				const newBoldWords = currentBoldText.filter(
					(word) => !existingBoldWords.has(word.toLowerCase())
				);

				if (newBoldWords.length > 0) {
					hasBoldText = true;
					latestBoldText = newBoldWords.join(" ");
					newBoldWords.forEach((boldText) => {
						addKnowledgeCallback(boldText);
						existingBoldWords.add(boldText.toLowerCase());
					});
				}
			}
		}
	});

	return { hasBoldText, latestBoldText };
};
