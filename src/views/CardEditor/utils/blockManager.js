import { v4 as uuidv4 } from "uuid";

export class BlockManager {
	constructor() {
		this.blocksMap = new Map();
	}

	createBlock(type, content, options = {}) {
		const blockId = options.id || `block-${Date.now()}`;
		const block = {
			id: blockId,
			type,
			text: content,
			...options,
		};
		this.blocksMap.set(blockId, block);
		return block;
	}

	createTranslationBlock(originalBlockId, translatedText) {
		const translationId = `translation-${originalBlockId}`;
		return this.createBlock("translation", translatedText, {
			id: translationId,
			isTranslated: true,
			originalId: originalBlockId,
		});
	}

	createKnowledgeBlock(originalBlockId, knowledgeContent) {
		const knowledgeId = `knowledge-${originalBlockId}`;
		return this.createBlock("knowledge", knowledgeContent, {
			id: knowledgeId,
			isKnowledge: true,
			originalId: originalBlockId,
		});
	}

	updateBlock(blockId, updates) {
		const block = this.blocksMap.get(blockId);
		if (block) {
			Object.assign(block, updates);
			return block;
		}
		return null;
	}

	deleteBlock(blockId) {
		return this.blocksMap.delete(blockId);
	}
}
