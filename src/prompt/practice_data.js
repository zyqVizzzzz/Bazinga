export const practiceData = {
	conversation_id: `NS20480514`,
	theme: `Daily Life and Technology - Afternoon at Home`,
	dialogues: [
		{
			character: `Jinji`,
			english: `[?]! I've been practicing drums all afternoon.`,
			chinese: `你终于回来了！我练了一整个下午的鼓。`,
			has_exercise: true,
			type: `multiple-choice`,
			options: [
				{
					text: `You're finally home`,
					translation: `你终于回家了`,
					is_correct: true,
				},
				{
					text: `You're already home`,
					translation: `你已经回家了`,
					is_correct: false,
				},
				{
					text: `You've come home`,
					translation: `你回家了`,
					is_correct: false,
				},
			],
			explanation: `"You're finally home"表达了等待已久的心情，带有一丝抱怨和期待已久的释然。"finally"强调了等待的时间。`,
		},
		{
			character: `Muztag`,
			english: `[?] - the place looks like a disaster zone.`,
			chinese: `在这儿都看不出来 - 这地方简直像灾难现场。
`,
			has_exercise: true,
			type: `multiple-choice`,
			options: [
				{
					text: `You can't tell it here`,
					translation: `在这里看不出来`,
					is_correct: false,
				},
				{
					text: `You wouldn't know it around here`,
					translation: `在这里都看不出来`,
					is_correct: true,
				},
				{
					text: `You couldn't see it here`,
					translation: `在这里看不见`,
					is_correct: false,
				},
			],
			explanation: `"You wouldn't know it around here"暗示房间的混乱与Jinji所说的"练习"形成强烈反差。`,
		},
		{
			character: `Jinji`,
			english: `Oh come on, [?] to another with you! Can't you just say 'hi' like a normal person?`,
			chinese: `拜托，你就不能别总是这样那样的！就不能像正常人一样说声"嗨"吗？`,
			has_exercise: true,
			type: `multiple-choice`,
			options: [
				{
					text: `from one thing`,
					translation: `总是这样那样`,
					is_correct: true,
				},
				{
					text: `from this thing`,
					translation: `从这件事`,
					is_correct: false,
				},
				{
					text: `about one thing`,
					translation: `关于一件事`,
					is_correct: false,
				},
			],
			explanation: `"from one thing to another"是一种不耐烦、抱怨的说法。`,
		},
		{
			character: `Muztag`,
			english: `'Normal' is a statistical tyranny invented by mediocre minds. Besides, [?] get some maintenance parts.`,
			chinese: `'正常'是庸人发明的数据暴政。再说了，我正要出门买些维修零件。`,
			has_exercise: true,
			type: `multiple-choice`,
			options: [
				{
					text: `I was planning to`,
					translation: `我正打算`,
					is_correct: false,
				},
				{
					text: `I was heading to`,
					translation: `我正要去`,
					is_correct: false,
				},
				{
					text: `I was just on my way out to`,
					translation: `我正要出门去`,
					is_correct: true,
				},
			],
			explanation: `"I was just on my way out to"既显示了他的目的性，又暗示了他想要避免进一步交谈的意图。`,
		},
		{
			character: "Jinji",
			english:
				"Wait, you're leaving again? But I wanted to show you my new drum solo!",
			chinese: "等等，你又要走？但我想给你展示我的新鼓点！",
			has_exercise: false,
		},
		{
			character: "Muztag",
			english:
				"Let me guess - since those high-frequency vibrations called 'music' haven't fried my circuits yet, they can never stop, right?",
			chinese:
				"让我猜猜 - 既然那些被称之为'音乐'的高频震动还没把我的电路烧坏，那它就永远不能停是吧？",
			has_exercise: false,
		},
		{
			character: "Jinji",
			english:
				"At least I'm passionate about something! Not just sitting around making sarcastic comments all day.",
			chinese: "至少我对某些事有热情！不像某人整天就知道阴阳怪气。",
			has_exercise: false,
		},
		{
			character: "Muztag",
			english:
				"Oh, but actually this is my art form, Jinji. Some paint with colors, I paint with irony.",
			chinese:
				"哦，但实际上这是我的艺术形式，Jinji。有人用颜色作画，我用讽刺作画。",
			has_exercise: false,
		},
	],
};
