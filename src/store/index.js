import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
	state: () => ({
		progressList: [],
	}),
	actions: {
		saveProgress(course, season, episode, page, sign) {
			const existingProgress = this.progressList.find(
				(p) => p.course === course
			);

			if (existingProgress) {
				existingProgress.season = season;
				existingProgress.episode = episode;
				existingProgress.page = page;
				existingProgress.sign = sign;
			} else {
				this.progressList.push({
					course,
					season,
					episode,
					page,
					sign,
				});
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
		userInfo: {},
	}),
	actions: {
		setLoginState(bool) {
			this.isLogin = bool;
		},
		setUserInfo(user) {
			this.userInfo = user;
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
