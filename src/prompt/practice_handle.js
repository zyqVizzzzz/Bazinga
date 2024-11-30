function extractEnglishContent(dialogueArray) {
	return dialogueArray
		.filter((item) => item.english) // 只处理有english字段的项目
		.map((item) => item.english);
}

// 使用示例:
const dialogue = [
	{
		character: "Jinji",
		english:
			"Muz, guess what? I might be getting a pay raise at the café next month!",
		chinese: "Muz，你猜怎么着？下个月我在咖啡馆可能要加薪了！",
		has_exercise: false,
	},
	{
		character: "Muztag",
		english: "Another pittance for your semiskilled labor.",
		chinese: "又是一点微薄的半熟练工资。",
		has_exercise: true,
		english_blank: "Another pittance for your _____ labor.",
		exercise: {
			type: "multiple-choice",
			question: "Fill in the blank with the correct word.",
			hint_en:
				"This word describes workers who have some but not complete training in their job.",
			hint_cn: "这个词形容工人接受过一些培训但还未完全熟练的状态。",
			options: [
				{
					text: "skilled",
					translation: "熟练的",
					is_correct: false,
					explanation: "This means fully trained and experienced.",
					explanation_zh: "这意味着完全训练有素且经验丰富。",
				},
				{
					text: "semiskilled",
					translation: "半熟练的",
					is_correct: true,
					explanation:
						"This correctly describes workers with some training but not fully skilled.",
					explanation_zh: "这正确描述了接受过一些培训但尚未完全熟练的工人。",
				},
				{
					text: "unskilled",
					translation: "无技能的",
					is_correct: false,
					explanation: "This means having no special training or skills.",
					explanation_zh: "这表示没有特殊培训或技能。",
				},
			],
		},
	},
	{
		character: "Jinji",
		english:
			"I'm proud to keep working during my school days. It teaches me responsibility!",
		chinese: "我很自豪能在上学期间继续工作。这让我学会负责任！",
		has_exercise: true,
		english_blank:
			"I'm _____ to _____ my school days. It teaches me responsibility!",
		exercise: {
			type: "multiple-choice",
			question: "Fill in the blanks with the correct phrases.",
			hint_en:
				"The first blank is about feeling good about oneself, the second is about continuing an activity during a period.",
			hint_cn:
				"第一个空是关于对自己感到良好，第二个空是关于在一段时间内继续某项活动。",
			options: [
				{
					text: "happy / work in",
					translation: "高兴 / 在...工作",
					is_correct: false,
					explanation:
						"This combination doesn't capture the sense of pride and continuous work.",
					explanation_zh: "这个组合没有表达出自豪感和持续工作的意思。",
				},
				{
					text: "glad / studying during",
					translation: "开心 / 在...期间学习",
					is_correct: false,
					explanation:
						"This doesn't match the intended meaning of being proud and continuing work.",
					explanation_zh: "这不符合表达自豪和继续工作的意思。",
				},
				{
					text: "proud / keep working during",
					translation: "自豪 / 在...期间继续工作",
					is_correct: true,
					explanation:
						"This correctly expresses feeling proud and continuing to work through school.",
					explanation_zh: "这正确表达了感到自豪和在上学期间继续工作的意思。",
				},
			],
		},
	},
	{
		character: "Muztag",
		english:
			"One more thing, little Jinji - don't forget your physics homework while chasing those meaningless pay raises.",
		chinese:
			"还有一件事，小Jinji - 别为了追求那些无意义的加薪而忘记你的物理作业。",
		has_exercise: true,
		english_blank:
			"_____, little Jinji - don't forget your physics homework while chasing those meaningless _____.",
		exercise: {
			type: "multiple-choice",
			question: "Fill in the blanks with the correct phrases.",
			hint_en:
				"The first blank is a phrase used to add information, the second refers to salary increases.",
			hint_cn: "第一个空是用来添加信息的短语，第二个空指薪资增长。",
			options: [
				{
					text: "By the way / salary increases",
					translation: "顺便说一下 / 薪资增长",
					is_correct: false,
					explanation:
						"While similar in meaning, this isn't the exact phrase used in the dialogue.",
					explanation_zh: "虽然意思相似，但这不是对话中使用的确切短语。",
				},
				{
					text: "One more thing / pay raises",
					translation: "还有一件事 / 加薪",
					is_correct: true,
					explanation:
						"This matches the natural flow of adding a final point and correctly names salary increases.",
					explanation_zh:
						"这符合添加最后一点的自然流程，并正确地表达了加薪的意思。",
				},
				{
					text: "Also / wage increases",
					translation: "另外 / 工资上涨",
					is_correct: false,
					explanation:
						"These terms are too formal and don't match the casual tone of the conversation.",
					explanation_zh: "这些术语太正式，不符合对话的随意语气。",
				},
			],
		},
	},
	{
		character: "Jinji",
		english: "Here we go again, Sensei. Stop lecturing me.",
		chinese: "又来了，老师。停止说教。",
		has_exercise: false,
	},
];

const englishContent = extractEnglishContent(dialogue);
console.log(englishContent);
