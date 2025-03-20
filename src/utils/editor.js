/**
 * 转义正则表达式特殊字符
 * @param {string} string 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
export function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 高亮文本中的知识点
 * @param {string} text 原始文本
 * @param {Array} knowledgeItems 知识点数组
 * @returns {string} 高亮后的文本
 */
export function highlightKnowledgeInText(text, knowledgeItems) {
	if (!text || !knowledgeItems || knowledgeItems.length === 0) {
		return text;
	}

	let highlightedText = text;

	knowledgeItems.forEach((item) => {
		// 获取原始知识点关键词
		const originalWord = item.word;
		console.log(`尝试匹配知识点: "${originalWord}"`);

		// 不区分大小写的匹配
		const textLower = text.toLowerCase();
		const searchTextLower = originalWord.toLowerCase();

		if (textLower.includes(searchTextLower)) {
			console.log(`找到匹配: "${originalWord}"`);

			// 使用正则表达式进行替换，保留原始大小写
			const regex = new RegExp(escapeRegExp(originalWord), "gi");

			highlightedText = highlightedText.replace(regex, (match) => {
				console.log(`替换匹配文本: "${match}"`);
				return `<mark class="pink">${match}</mark>`;
			});
		} else {
			console.log(`未找到匹配: "${originalWord}"`);
		}
	});

	return highlightedText;
}

/**
 * 应用知识点高亮到块
 * @param {Object} block 文本块对象
 * @param {number} sceneIndex 场景索引
 * @param {Map} knowledgeMap 知识点Map
 * @returns {Object} 更新后的块
 */
export function applyKnowledgeHighlight(block, sceneIndex, knowledgeMap) {
	if (!block || !block.text) return block;

	// 获取场景ID
	const sceneId = `Scene${sceneIndex + 1}`;
	console.log(`应用知识点高亮 - 场景ID: ${sceneId}`);
	console.log(`原始文本: "${block.text}"`);

	// 初始化 displayText 为原始文本
	block.displayText = block.text;

	// 收集该场景的所有知识点
	const matchedKnowledge = [];

	// 从知识点Map中筛选出当前场景的知识点
	if (knowledgeMap && knowledgeMap.size > 0) {
		console.log(`知识点Map大小: ${knowledgeMap.size}`);

		Array.from(knowledgeMap.values()).forEach((knowledge) => {
			console.log(
				`检查知识点: ${knowledge.word}, 场景: ${Array.from(
					knowledge.scenes || []
				).join(", ")}`
			);

			if (knowledge.scenes && knowledge.scenes.has(sceneId)) {
				// 不再预先筛选，将所有该场景的知识点都添加到匹配列表中
				matchedKnowledge.push(knowledge);
				console.log(`添加到匹配列表: ${knowledge.word}`);
			}
		});
	}

	// 直接使用 highlightKnowledgeInText 函数处理高亮
	if (matchedKnowledge.length > 0) {
		console.log(`找到匹配的知识点数量: ${matchedKnowledge.length}`);

		// 按照知识点长度排序，先处理较长的知识点，避免部分匹配问题
		matchedKnowledge.sort((a, b) => b.word.length - a.word.length);
		console.log(
			`排序后的知识点: ${matchedKnowledge.map((k) => k.word).join(", ")}`
		);

		// 直接调用 highlightKnowledgeInText 函数
		const beforeHighlight = block.displayText;
		block.displayText = highlightKnowledgeInText(block.text, matchedKnowledge);

		// 检查是否成功高亮
		const hasChanged = beforeHighlight !== block.displayText;
		console.log(`高亮结果: ${hasChanged ? "成功" : "无变化"}`);
		if (hasChanged) {
			console.log(`高亮后文本: "${block.displayText}"`);
		}
	} else {
		console.log(`没有找到匹配的知识点`);
	}

	return block;
}
