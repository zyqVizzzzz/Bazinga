export class KnowledgeManager {
	constructor(knowledgeMap, processedWords) {
		this.knowledgeMap = knowledgeMap;
		this.processedWords = processedWords;
	}

	addKnowledge(knowledge, sceneId) {
		if (!this.knowledgeMap.has(knowledge.word)) {
			this.knowledgeMap.set(knowledge.word, {
				...knowledge,
				scenes: new Set([sceneId]),
			});
		} else {
			const existingKnowledge = this.knowledgeMap.get(knowledge.word);
			existingKnowledge.scenes.add(sceneId);
		}
	}

	highlightKnowledgeInText(text, sceneId) {
		let displayText = text;
		const sceneKnowledge = Array.from(this.knowledgeMap.values())
			.filter((k) => k.scenes.has(sceneId))
			.sort((a, b) => b.word.length - a.word.length);

		sceneKnowledge.forEach((knowledge) => {
			if (!this.processedWords.has(knowledge.word)) {
				const regex = new RegExp(knowledge.word, "gi");
				displayText = displayText.replace(
					regex,
					(match) => `<mark class="pink">${match}</mark>`
				);
				this.processedWords.add(knowledge.word);
			}
		});

		return displayText;
	}

	resetHighlights() {
		this.processedWords.clear();
	}
}
