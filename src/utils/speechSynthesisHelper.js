// speechSynthesisHelper.js
export const getVoicesList = () => {
	return new Promise((resolve) => {
		const synth = window.speechSynthesis;

		// speechSynthesis.getVoices() 可能异步加载，所以我们用 setTimeout 确保数据加载完成
		const voicesCheckInterval = setInterval(() => {
			const voices = synth.getVoices();

			if (voices.length !== 0) {
				clearInterval(voicesCheckInterval);

				// 获取 lang 为 en-US 的所有条目
				const filteredVoices = voices.filter((voice) => voice.lang === "en-US");

				// 获取 name 为 Google US English、Samantha、Nicky 的条目，按顺序加入 voicesList
				const priorityVoices = ["Google US English", "Samantha", "Nicky"];
				const orderedVoices = priorityVoices
					.map((name) =>
						filteredVoices.find((voice) => voice.name.includes(name))
					)
					.filter(Boolean); // 过滤掉可能找不到的条目

				resolve(orderedVoices);
			}
		}, 100); // 定时器检查是否加载完成
	});
};
