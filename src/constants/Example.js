export const exampleText = [
	["", "Please start the title with #"],
	[
		"dev",
		"Standard format: English paragraph + Chinese paragraph + blank line = a complete paragraph. The Chinese translation must be close to the English paragraph, otherwise the content of the generated card may be confusing.",
	],
	[
		"",
		"Select the word and select bold in the toolbox, or enter command/ctrl + b to add the word to the word list.",
	],
	[
		"narration",
		"Select the paragraph and select 'Marker' in the toolbox, or enter command/ctrl + i to mark the paragraph as a narration or comment.",
	],
	["Marge", "There's no time. We're late."],
];
export const exampleTextZh = [
	["", "标题请以 # 开头"],
	[
		"",
		"标准格式：英文段落 + 中文段落 + 空行 = 一个完整的段落。中文翻译紧邻英文段落，否则将可能导致生成的卡片内容错乱。",
	],
	[
		"",
		"1. 选中单词，在 toolbox 里选择粗体，或输入 command/Ctrl + b，可以将单词添加到单词列表。",
	],
	[
		"",
		"2. 选中段落，在toolbox里选择 'Marker'，或者输入 command/ctrl + i，可以将该段落标记为旁白或注释。",
	],
	["", "3. 用'[]'标记说话者，标记该段落为对白。"],
];
export const word = {
	from: "knowledges",
	book: "cet-4",
	type: "vocabulary",
	word: "bold",
	definition:
		"A style of text that is darker and thicker than the surrounding text.",
	symbols: "/boʊld/",
	pos: "n.",
	example: "The title is in bold to make it stand out.",
	word_zh: "粗体",
	definition_zh: "一种比周围文本更深更粗的文本样式。",
	example_zh: "标题使用粗体以使其更显眼。",
	system: {
		rootAnalysis: {
			root: "bold",
			meaning: "thick, strong text style",
			meaning_zh: "粗厚的文本样式",
		},
		affixAnalysis: {
			suffix: "",
			suffixMeaning: "",
			suffixMeaning_zh: "",
		},
		wordInflections: {
			baseForm: "bold",
			baseForm_zh: "原型",
			plural: "bolds",
			plural_zh: "复数",
		},
	},
};
