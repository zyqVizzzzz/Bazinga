<template>
	<div
		class="editor-toolbar flex items-center justify-between px-4 py-2 border-b border-gray-200"
	>
		<div class="flex items-center gap-3">
			<button
				class="ghost-btn"
				@click="$emit('toggle-view')"
				:title="viewMode === 'both' ? '切换视图' : '返回分屏模式'"
			>
				<i
					class="bi"
					:class="{
						'bi-layout-split': viewMode === 'both',
						'bi-layout-text-window': viewMode === 'editor',
						'bi-layout-text-sidebar': viewMode === 'card',
					}"
				></i>
			</button>
		</div>

		<div class="flex items-center gap-3">
			<button
				class="ghost-btn"
				@click="$emit('save')"
				:disabled="!hasUnsavedChanges"
			>
				<i class="bi bi-save"></i>
				保存
			</button>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	viewMode: {
		type: String,
		default: "both",
	},
	hasUnsavedChanges: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["toggle-view", "save"]);
</script>
