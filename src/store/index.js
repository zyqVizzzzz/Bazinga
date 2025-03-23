import { defineStore } from "pinia";
import apiClient from "@/api";

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
		closeListenMode() {
			this.isListenMode = false;
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
		noteChangeCounter: 0,
	}),
	actions: {
		toggleBlinkBox() {
			this.showBlinkbox = !this.showBlinkbox;
		},
		setCurrentActiveNote(note) {
			this.currentActiveNote = note;
			this.noteChangeCounter++;
			console.log(this.noteChangeCounter);
		},
	},
	// persist: true,
});

export const useDialogueStore = defineStore("dialogue", {
	state: () => ({
		currentDialogue: null,
		currentKnowledge: null,
	}),
	actions: {
		setCurrentDialogue(dialogue) {
			this.currentDialogue = dialogue;
		},
		setCurrentKnowledge(knowledge) {
			this.currentKnowledge = knowledge;
		},
	},
	persist: true,
});

export const usePointsStore = defineStore("points", {
	state: () => ({
		points: 0,
	}),
	actions: {
		setPoints(points) {
			this.points = points;
		},
		updatePoints(delta) {
			this.points += delta;
		},
		async fetchPoints() {
			try {
				const response = await apiClient.get("/points");
				console.log(response.data.data);
				return response.data.data.points;
			} catch (error) {
				console.error("Failed to fetch points:", error);
				return this.points; // 如果获取失败，返回当前值
			}
		},
	},
	persist: true,
});
