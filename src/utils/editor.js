/**
 * 转义正则表达式特殊字符
 * @param {string} string 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
export function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 根据场景文本长度计算应该生成的知识点数量
 * @param {number} wordCount - 文本中的单词数量
 * @returns {number} - 应该生成的知识点数量
 */
export const calculateMaxPhrasesForScene = (wordCount) => {
	// 每100个单词提取5个知识点
	return Math.ceil((wordCount / 100) * 5);
};

/**
 * 根据文本长度计算合适的知识点数量
 * @param {string} text - 需要分析的文本
 * @returns {number} - 应该生成的知识点数量
 */
export const calculateMaxPhrases = (text) => {
	// 计算单词数量（按空格分割）
	const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
	// 根据单词数量动态计算关键词数量
	if (wordCount <= 25) {
		return 1;
	} else if (wordCount <= 50) {
		return 2;
	} else if (wordCount <= 100) {
		return 3;
	} else if (wordCount <= 200) {
		return 4;
	} else {
		return 5;
	}
};

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
	const processedWords = new Set(); // 追踪已处理的知识点

	knowledgeItems.forEach((item) => {
		// 获取原始知识点关键词
		const originalWord = item.word;

		// 如果这个知识点已经被处理过，跳过
		if (processedWords.has(originalWord.toLowerCase())) {
			return;
		}

		// 不区分大小写的匹配
		const textLower = text.toLowerCase();
		const searchTextLower = originalWord.toLowerCase();

		if (textLower.includes(searchTextLower)) {
			// 使用正则表达式，但只替换第一次出现的位置
			const regex = new RegExp(escapeRegExp(originalWord), "i");
			highlightedText = highlightedText.replace(regex, (match) => {
				processedWords.add(searchTextLower); // 标记该知识点已处理
				return `<mark class="pink">${match}</mark>`;
			});
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
	block.displayText = block.text;

	// 收集该场景的所有知识点
	const matchedKnowledge = [];

	// 从知识点Map中筛选出当前场景的知识点
	if (knowledgeMap && knowledgeMap.size > 0) {
		Array.from(knowledgeMap.values()).forEach((knowledge) => {
			if (knowledge.scenes && knowledge.scenes.has(sceneId)) {
				// 不再预先筛选，将所有该场景的知识点都添加到匹配列表中
				matchedKnowledge.push(knowledge);
			}
		});
	}

	// 直接使用 highlightKnowledgeInText 函数处理高亮
	if (matchedKnowledge.length > 0) {
		// 按照知识点长度排序，先处理较长的知识点，避免部分匹配问题
		matchedKnowledge.sort((a, b) => b.word.length - a.word.length);
		block.displayText = highlightKnowledgeInText(block.text, matchedKnowledge);
	}

	return block;
}
