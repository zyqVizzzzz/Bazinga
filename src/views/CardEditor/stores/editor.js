import { defineStore } from "pinia";

export const useEditorStore = defineStore("cardEditor", {
	state: () => ({
		editor: null,
		viewMode: "both",
		isCustom: true,
		rightPanelLoading: false,
		hasUnsavedChanges: false,
		processingEntireScene: false,
	}),

	actions: {
		setEditor(editor) {
			this.editor = editor;
		},

		setViewMode(mode) {
			this.viewMode = mode;
		},

		setRightPanelLoading(loading) {
			this.rightPanelLoading = loading;
		},

		markUnsavedChanges() {
			this.hasUnsavedChanges = true;
		},

		clearUnsavedChanges() {
			this.hasUnsavedChanges = false;
		},
	},
});
