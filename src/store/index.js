import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
	state: () => ({
		progressList: [],
	}),
	actions: {
		saveProgress(course, season, episode, page) {
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
		},
		initProgress(arr) {
			this.progressList = arr;
		},
	},
	persist: true,
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
