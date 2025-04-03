export class SceneManager {
	constructor(scenes, sceneStructure, blocksMap) {
		this.scenes = scenes;
		this.sceneStructure = sceneStructure;
		this.blocksMap = blocksMap;
	}

	createScene(title, index) {
		const scene = {
			index,
			title,
			blockIds: [],
			blocks: [],
		};
		this.scenes.push(scene);
		this.sceneStructure.push({
			index,
			title,
			blockIds: [],
		});
		return scene;
	}

	updateSceneStructure(sceneIndex, blockIds) {
		if (this.sceneStructure[sceneIndex]) {
			this.sceneStructure[sceneIndex].blockIds = blockIds;
			this.rebuildSceneBlocks(sceneIndex);
		}
	}

	rebuildSceneBlocks(sceneIndex) {
		const scene = this.scenes[sceneIndex];
		if (!scene) return;

		const newBlocks = [];
		scene.blockIds.forEach((blockId) => {
			const block = this.blocksMap.get(blockId);
			if (block) {
				newBlocks.push(block);

				// 添加关联的翻译和知识点块
				const translationId = `translation-${blockId}`;
				const knowledgeId = `knowledge-${blockId}`;

				const translationBlock = this.blocksMap.get(translationId);
				if (translationBlock) newBlocks.push(translationBlock);

				const knowledgeBlock = this.blocksMap.get(knowledgeId);
				if (knowledgeBlock) newBlocks.push(knowledgeBlock);
			}
		});

		scene.blocks = newBlocks;
		return newBlocks;
	}
}
