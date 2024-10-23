<template>
	<div class="card relative rounded-lg p-4 pt-5 mb-4 h-full">
		<h2
			class="text-2xl pb-2 font-medium text-gray-800 text-left pl-4 flex justify-between items-center"
		>
			<span class="flex items-center"
				>{{ selectedNote.word
				}}<span class="ml-4 relative cursor-pointer" style="top: 3px"
					><VolumeIcon /></span
			></span>
			<span class="flex items-center">
				<button
					class="edit-shadow bg-paper mr-4 text-xs text-secondary rounded-lg px-4 py-2 transition-all duration-300"
					style="border: none"
					@click="toggleEditModal"
				>
					编辑
				</button>
				<span
					class="text-secondary cursor-pointer transition-all mr-1 duration-300 relative"
					@click="togglePoint"
					style="top: 1px"
					><BookmarkIcon :solid="true" :fill="isFill" size="5"
				/></span>
			</span>
		</h2>

		<div class="border-b border-gray-300 p-4 text-left relative">
			<p class="text-sm flex items-center">
				<span class="mr-2">{{ selectedNote.symbols }}；</span
				>{{ selectedNote.pos }} {{ selectedNote.word_zh }}；
			</p>
		</div>
		<div
			v-if="
				selectedNote.system?.rootAnalysis.root ||
				selectedNote.system?.affixAnalysis.suffix ||
				selectedNote.system?.affixAnalysis.prefix
			"
			class="py-4 px-4 border-b border-gray-300"
		>
			<p class="text-gray-600 mb-4 font-bold text-left">
				<span class="font-normal text-sm">{{
					selectedNote.definition_zh
				}}</span>
			</p>
			<div class="mb-4">
				<!-- 词根 -->
				<div
					v-if="selectedNote.system.rootAnalysis.root"
					class="text-gray-600 mb-1 text-left"
				>
					<p class="font-bold text-sm">
						<span>[词根] </span
						>{{ selectedNote.system.rootAnalysis.root }}：<span
							class="font-normal"
							>{{ selectedNote.system.rootAnalysis.meaning_zh }}</span
						>
					</p>
				</div>
				<!-- 前缀 -->
				<p
					v-if="selectedNote.system.affixAnalysis.prefix"
					class="text-gray-600 mb-2 font-bold"
				>
					{{ selectedNote.system.affixAnalysis.prefix }} -
					{{ selectedNote.system.affixAnalysis.prefixMeaning_zh }}
				</p>

				<!-- 后缀 -->
				<div
					v-if="selectedNote.system.affixAnalysis.suffix"
					class="text-gray-600 mb-2 text-left"
				>
					<p class="mb-1 font-bold">
						<span class="text-sm">[后缀] </span>-{{
							selectedNote.system.affixAnalysis.suffix
						}}：<span class="font-normal text-sm">{{
							selectedNote.system.affixAnalysis.suffixMeaning_zh
						}}</span>
					</p>
				</div>
			</div>
			<div>
				<p class="text-gray-600 mb-1 font-bold text-left">
					<span class="font-black text-sm">[例句]：</span>
				</p>
				<p class="text-gray-600 mb-1 font-bold text-left">
					<span class="font-normal text-sm">{{ selectedNote.example }}</span>
				</p>
				<p class="text-gray-600 mb-1 font-bold text-left">
					<span class="font-normal text-sm">{{ selectedNote.example_zh }}</span>
				</p>
			</div>
		</div>
		<div class="border-b border-gray-300 px-4 py-4 text-left relative">
			<p class="text-gray-600 mb-2 text-sm text-left">
				<span class="font-bold"
					>{{ selectedNote.system?.wordInflections.baseForm_zh }} - </span
				><span>{{ selectedNote.system?.wordInflections.baseForm }}</span>
			</p>
			<p class="text-gray-600 mb-2 text-sm text-left">
				<span class="font-bold"
					>{{
						selectedNote.system?.wordInflections.presentParticiple_zh
					}}
					- </span
				><span>{{
					selectedNote.system?.wordInflections.presentParticiple
				}}</span>
			</p>
			<p class="text-gray-600 mb-2 text-sm text-left">
				<span class="font-bold"
					>{{ selectedNote.system?.wordInflections.pastTense_zh }} - </span
				><span>{{ selectedNote.system?.wordInflections.pastTense }}</span>
			</p>
			<p class="text-gray-600 mb-2 text-sm text-left">
				<span class="font-bold"
					>{{ selectedNote.system?.wordInflections.pastParticiple_zh }} - </span
				><span>{{ selectedNote.system?.wordInflections.pastParticiple }}</span>
			</p>
		</div>
		<!-- <div class="border-b px-4 py-4 mb-4 text-left relative">
			<p class="text-gray-600 mb-2 text-sm text-left font-bold">注释</p>
		</div> -->
	</div>
	<EditBoxModal
		:showModal="showEditModal"
		:currentNote="selectedNote"
		@on-edit-modal-close="toggleEditModal"
		@on-edit-modal-submit="onEditModalSubmit"
	/>
</template>
<script setup>
import { ref, toRefs } from "vue";
import VolumeIcon from "../icons/Volume.vue";
import BookmarkIcon from "../icons/Bookmark.vue";
import EditBoxModal from "./editbox.vue";

const props = defineProps({
	selectedNote: Object,
});
const { selectedNote } = toRefs(props);

const emit = defineEmits(["on-close-blink", "on-add-point"]);

const isFill = ref(false);
const togglePoint = () => {
	isFill.value = !isFill.value;
	emit("on-add-point");
};

const showEditModal = ref(false);
const toggleEditModal = () => {
	showEditModal.value = !showEditModal.value;
};
const onEditModalSubmit = (result) => {
	selectedNote.value = result;
};
</script>
<style scoped>
.edit-shadow {
	box-shadow: 0 6px 10px rgba(var(--secondary-color-rgb), 0.3);
}
.edit-shadow:hover {
	box-shadow: 0 6px 10px rgba(var(--secondary-color-rgb), 0.6);
}
</style>
