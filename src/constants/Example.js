export const exampleText = [
	["", "1. Card Title."],
	["", "2. Format."],
	["", "3. Save."],
	["", "4. Knowledge."],
	["", "5. Narration/Comment."],
	["", "6. Translate."],
	["Marge", "There's no time. We're late."],
	["", "7. Generator."],
];
export const exampleTextZh = [
	["", "每张卡片的标题请以 # 开头"],
	[
		"",
		"标准格式：英文段落 + 中文段落 + 空行 = 一个完整的段落。中文翻译紧邻英文段落",
	],
	[
		"",
		"点击左侧「保存」按钮，或输入 Command/Ctrl + s，完成保存。同时，编辑器有自动保存功能。",
	],
	[
		"",
		"选中单词，选择粗体，或输入 Command/Ctrl + b，可将选中部分加入右侧知识点列表",
	],
	[
		"",
		"选中段落，选择斜体，或输入 Command/ctrl + i，可以将该段落标记为旁白或注释",
	],
	["", "选中段落，选择翻译，完成翻译"],
	["", "用'[]'标记说话者，标记该段落为对白"],
	["", "点击左侧「生成器」按钮，试试自动生成知识点、播客、情景剧等功能..."],
];
export const word = {
	from: "knowledges",
	book: "cet-4",
	type: "vocabulary",
	word: "bold",
	origin: "bold",
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
