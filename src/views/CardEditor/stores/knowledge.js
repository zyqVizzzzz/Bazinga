import { defineStore } from "pinia";

export const useKnowledgeStore = defineStore("knowledge", {
	state: () => ({
		currentKnowledge: new Map(),
		processedWords: new Set(),
		selectedKnowledge: null,
		translatingBlockId: null,
		generatingKnowledgeBlockId: null,
	}),

	actions: {
		addKnowledge(knowledge) {
			if (!this.currentKnowledge.has(knowledge.word)) {
				this.currentKnowledge.set(knowledge.word, {
					...knowledge,
					scenes: new Set([knowledge.sceneId]),
				});
			} else {
				const existingKnowledge = this.currentKnowledge.get(knowledge.word);
				existingKnowledge.scenes.add(knowledge.sceneId);
			}
		},

		removeKnowledge(word) {
			this.currentKnowledge.delete(word);
			this.processedWords.delete(word);
		},

		resetProcessedWords() {
			this.processedWords.clear();
		},

		setSelectedKnowledge(knowledge) {
			this.selectedKnowledge = knowledge;
		},

		setTranslatingBlock(blockId) {
			this.translatingBlockId = blockId;
		},

		setGeneratingKnowledgeBlock(blockId) {
			this.generatingKnowledgeBlockId = blockId;
		},
	},
});
