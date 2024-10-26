import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
	state: () => ({
		progressList: JSON.parse(localStorage.getItem("userProgressList")) || [],
	}),
	actions: {
		// 保存进度到 Store 和 LocalStorage
		saveProgress(course, season, episode, page) {
			// 检查当前课程的进度是否存在，存在则更新，否则新增
			const existingProgress = this.progressList.find(
				(p) => p.course === course
			);

			if (existingProgress) {
				existingProgress.season = season;
				existingProgress.episode = episode;
				existingProgress.page = page;
			} else {
				this.progressList.push({ course, season, episode, page });
			}

			// 更新到 LocalStorage 中
			localStorage.setItem(
				"userProgressList",
				JSON.stringify(this.progressList)
			);
		},
		// 同步 Store 和 LocalStorage 中的数据
		syncProgressList() {
			const savedProgressList = JSON.parse(
				localStorage.getItem("userProgressList")
			);
			if (savedProgressList) {
				this.progressList = savedProgressList;
			}
		},
		// 提交到服务器
		async submitProgress() {
			try {
				// await axios.post("/api/submitProgressList", this.progressList);
			} catch (error) {
				console.error("Failed to submit progress:", error);
			}
		},
	},
});

export const useLoginStore = defineStore("login", {
	state: () => ({
		isLogin: false,
	}),
	actions: {
		setLoginState(bool) {
			this.isLogin = bool;
		},
	},
	persist: true,
});

export const useLessonStore = defineStore("lesson", {
	state: () => ({
		isListenMode: false,
		voicesList: {},
	}),
	actions: {
		setListenMode() {
			this.isListenMode = !this.isListenMode;
		},
		setVoicesList(voices) {
			this.voicesList = voices;
		},
	},
});

export const useNotebookStore = defineStore("notebook", {
	state: () => ({
		showBlinkbox: false,
		currentActiveNote: {},
	}),
	actions: {
		toggleBlinkBox() {
			this.showBlinkbox = !this.showBlinkbox;
		},
		setCurrentActiveNote(note) {
			this.currentActiveNote = note;
		},
	},
	// persist: true,
});
