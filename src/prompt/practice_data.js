export const practiceData = {
	conversation_id: `NS20480512`,
	theme: `Band Practice`,
	dialogues: [
		{
			character: `Kai`,
			english: `Jinji, ready for band practice? [?] from the bridge.`,
			chinese: `Jinji，准备好排练了吗？从过渡段开始。`,
			has_exercise: true,
			type: `multiple-choice`,
			options: [
				{
					text: `Start it`,
					translation: `开始`,
					is_correct: false,
				},
				{
					text: `Take it`,
					translation: `接着`,
					is_correct: true,
				},
				{
					text: `Do it`,
					translation: `做`,
					is_correct: false,
				},
			],
			explanation: `"take it" 在音乐排练中是常用的表达，表示让某人开始或接续演奏。`,
		},
		{
			character: `Jinji`,
			english: `Sure! Though I've been a bit [?] lately. My mind's been... elsewhere.`,
			chinese: `好啊！虽然我最近有点走调。我的心思在...别处。`,
			has_exercise: true,
			type: `multiple-choice`,
			options: [
				{
					text: `distracted`,
					translation: `心不在焉`,
					is_correct: false,
				},
				{
					text: `off-key`,
					translation: `走调`,
					is_correct: true,
				},
				{
					text: `off-beat`,
					translation: `节奏不对`,
					is_correct: false,
				},
			],
			explanation: `"off-key" 字面意思是音调不准确，在这里既表达了音乐上的不协调，也暗示了她此时的心理状态。`,
		},
		{
			character: `Kai`,
			english: `I noticed. You've been looking at me more than your drums.`,
			chinese: `我注意到了。你看我的时间比看鼓多。`,
			has_exercise: false,
		},
		{
			character: `Jinji`,
			english: `Oh no, am I that obvious? This will [?] as my most embarrassing moment.`,
			chinese: `啊，这么明显吗？这将成为我人生中最尴尬的时刻。`,
			has_exercise: true,
			type: `multiple-choice`,
			options: [
				{
					text: `go down in history`,
					translation: `载入史册`,
					is_correct: true,
				},
				{
					text: `be remembered`,
					translation: `被记住`,
					is_correct: false,
				},
				{
					text: `remain forever`,
					translation: `永远留存`,
					is_correct: false,
				},
			],
			explanation: `"go down in history" 通常用于描述重大或难忘的事件。这里 Jinji 幽默地用这个略显夸张的表达来形容自己的尴尬时刻。`,
		},
		{
			character: `Kai`,
			english: `Actually, I find it... cute. Muztag always says you're the most romantic drummer in the world.`,
			chinese: `其实，我觉得...很可爱。Muztag 总是说你是世界上最有浪漫气息的鼓手。`,
			has_exercise: false,
		},
		{
			character: `Jinji`,
			english: `Wait... you've been talking to Muz about me?`,
			chinese: `等等...你一直在和 Muz 聊我的事？`,
			has_exercise: false,
		},
		{
			character: `Kai`,
			english: `...and now I finally understand what he meant.`,
			chinese: `...现在我终于明白他是什么意思了。`,
			has_exercise: false,
		},
		{
			character: `Jinji`,
			english: `I... I think I need to sit down for a moment.`,
			chinese: `我...我觉得我需要坐一会儿。`,
			has_exercise: false,
		},
	],
};
