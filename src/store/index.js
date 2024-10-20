import { defineStore } from "pinia";

export const useNotebookStore = defineStore("notebook", {
	// state 必须是一个函数，返回状态对象
	state: () => ({
		showBlinkbox: false,
	}),
	// getters 类似于计算属性
	getters: {
		doubleCount: (state) => state.count * 2,
	},
	// actions 用于定义方法，包含同步或异步操作
	actions: {
		toggleBlinkBox() {
			this.showBlinkbox = !this.showBlinkbox;
		},
	},
	// persist: true,
});
