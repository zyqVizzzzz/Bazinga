import { defineStore } from "pinia";

export const useScenesStore = defineStore("scenes", {
	state: () => ({
		scenes: [],
		currentSceneIndex: 0,
		currentScene: null,
		currentSceneBlocks: [],
		blocksMap: new Map(),
		sceneStructure: [],
		speakers: new Set(),
		selectedBlock: null,
	}),

	actions: {
		// 初始化方法
		initStore(scenes = []) {
			this.scenes = scenes;
			this.currentSceneIndex = 0;
			this.currentScene = scenes[0] || null;
			this.currentSceneBlocks = scenes[0]?.blocks || [];
			this.blocksMap = new Map();
			this.selectedBlock = null;
		},
		updateScene(sceneData) {
			const { index, blocks } = sceneData;
			if (index === this.currentSceneIndex) {
				this.currentSceneBlocks = blocks;
				this.currentScene = this.scenes[index];
			}
		},

		addBlock(block) {
			this.blocksMap.set(block.id, block);
		},

		updateBlock(blockId, updates) {
			const block = this.blocksMap.get(blockId);
			if (block) {
				Object.assign(block, updates);
			}
		},

		addSpeaker(speaker) {
			this.speakers.add(speaker);
			localStorage.setItem(
				"cardEditorSpeakers",
				JSON.stringify(Array.from(this.speakers))
			);
		},

		removeSpeaker(speaker) {
			this.speakers.delete(speaker);
			localStorage.setItem(
				"cardEditorSpeakers",
				JSON.stringify(Array.from(this.speakers))
			);
		},

		setSelectedBlock(block) {
			this.selectedBlock = block;
		},

		clearSelectedBlock() {
			this.selectedBlock = null;
		},

		async loadScenes() {
			try {
				// 从本地存储或API加载场景数据
				const savedScenes = localStorage.getItem("scenes");
				if (savedScenes) {
					const parsedScenes = JSON.parse(savedScenes);
					this.scenes = parsedScenes;
					return parsedScenes;
				}
				return [];
			} catch (error) {
				console.error("加载场景数据失败:", error);
				throw error;
			}
		},

		async saveScenes({ content, scenes }) {
			try {
				// 保存到本地存储或API
				localStorage.setItem("scenes", JSON.stringify(scenes));
				localStorage.setItem("content", JSON.stringify(content));
			} catch (error) {
				console.error("保存场景数据失败:", error);
				throw error;
			}
		},
	},
});
