<template>
	<div
		class="editor-wrapper text-sm rounded shadow-editor"
		style="overflow-y: auto"
	>
		<div id="editor" class="editorjs-container"></div>
	</div>
</template>

<script setup>
import { onMounted, ref, defineProps, defineEmits, computed } from "vue";
import EditorJS from "@editorjs/editorjs";

const props = defineProps({
	initialContent: {
		type: Object,
		default: () => ({ blocks: [] }),
	},
});

const emit = defineEmits(["update:content", "editor-ready"]);
const editor = ref(null);

onMounted(() => {
	initEditor();
});

const initEditor = () => {
	editor.value = new EditorJS({
		holder: "editor",
		placeholder: "请在此编辑文本...",
		data: props.initialContent,
		onChange: async () => {
			const content = await editor.value.save();
			emit("update:content", content);
		},
		onReady: () => {
			emit("editor-ready", editor.value);
		},
	});
};
</script>

<style scoped>
.editor-wrapper {
	min-height: 500px;
	background: white;
}

.editorjs-container {
	padding: 1rem;
}

:deep(.ce-block__content) {
	max-width: none;
	margin: 0;
	padding: 0 1rem;
}

:deep(.ce-toolbar__content) {
	max-width: none;
	margin: 0;
	padding: 0 1rem;
}
</style>
