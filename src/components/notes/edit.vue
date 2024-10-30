<template>
	<div class="card relative rounded-lg p-4 pt-5 mb-4 h-full bg-grid-paper">
		<!-- 词汇 -->
		<h2
			class="text-2xl pb-2 font-medium text-gray-800 text-left pl-4 flex justify-between items-center"
		>
			<span class="flex items-center"
				>{{ selectedNote.word
				}}<span class="ml-4 relative cursor-pointer" style="top: 3px"
					><VolumeIcon /></span
			></span>
			<span class="flex items-center">
				<span
					class="text-secondary cursor-pointer transition-all mr-1 duration-300 relative"
					@click="toggleImportantBadge"
					style="top: 1px"
					><BookmarkIcon
						:solid="true"
						:fill="selectedNote.isImportant"
						size="5"
				/></span>
			</span>
		</h2>
		<!-- 释义 -->
		<div class="border-b border-gray-300 px-4 pt-2 pb-4 text-left relative">
			<p class="text-sm flex items-center">
				<span class="mr-2" v-if="selectedNote.symbols"
					>{{ selectedNote.symbols }}；</span
				>{{ selectedNote.pos }} {{ selectedNote.word_zh }}；
			</p>
		</div>
		<!-- 词根/词缀、解释 -->
		<div class="py-4 px-4 border-b border-gray-300">
			<p class="text-gray-600 mb-2 font-bold text-left">
				<span class="font-normal text-sm">{{
					selectedNote.definition_zh
				}}</span>
			</p>
			<div
				class="mb-2"
				v-if="
					selectedNote.system?.rootAnalysis.root ||
					selectedNote.system?.affixAnalysis.suffix ||
					selectedNote.system?.affixAnalysis.prefix
				"
			>
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
				<div
					v-if="selectedNote.system.affixAnalysis.prefix"
					class="text-gray-600 mb-2 text-left"
				>
					<p class="mb-1 font-bold">
						<span class="text-sm">[前缀] </span
						>{{ selectedNote.system.affixAnalysis.prefix }}-：<span
							class="font-normal text-sm"
							>{{ selectedNote.system.affixAnalysis.prefixMeaning_zh }}</span
						>
					</p>
				</div>

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
		</div>
		<!-- 变形 -->
		<div
			class="border-b border-gray-300 px-4 py-4 text-left relative"
			v-if="selectedNote.system && selectedNote.system.wordInflections"
		>
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
		<!-- 例句 -->
		<div class="p-4 border-b">
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
		<!-- 注释 -->
		<div
			class="border-b px-4 pt-4 mb-2 text-left relative"
			v-if="selectedNote.comment || showEditModal"
		>
			<div v-if="showEditModal">
				<textarea
					class="text-gray-600 text-sm mt-2 mb-4 text-left font-bold border border-gray-300 p-2 rounded w-full"
					v-model="commentContent"
					placeholder="请输入补充注释"
					rows="4"
				></textarea>
			</div>
			<div class="mb-4 text-sm text-gray-600" v-else>
				<div v-html="formattedComment"></div>
			</div>
		</div>
		<!-- 补充注释 / 提交注释按钮 -->
		<div class="flex justify-between w-full space-x-2">
			<button
				:class="showEditModal ? 'w-2/3' : 'w-full'"
				class="edit-shadow mt-4 text-xs text-secondary rounded-lg px-4 py-2"
				@click="toggleEditModal"
			>
				{{ showEditModal ? "提交注释" : "补充注释" }}
			</button>
			<button
				v-if="showEditModal"
				class="cancel-shadow mt-4 text-xs text-gray-600 rounded-lg px-4 py-2 w-1/3"
				style="border: none; background: white"
				@click="cancelEditModal"
			>
				取消编辑
			</button>
		</div>
	</div>
</template>
<script setup>
import { ref, toRefs, computed, watch } from "vue";
import VolumeIcon from "../icons/Volume.vue";
import BookmarkIcon from "../icons/Bookmark.vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const props = defineProps({
	selectedNote: Object,
});
const { selectedNote } = toRefs(props);

const emit = defineEmits(["on-close-blink", "on-add-point"]);

const commentContent = ref(""); // 初始文本

const showEditModal = ref(false);

const toggleEditModal = async () => {
	if (!showEditModal.value) {
		// 显示编辑模式，并将 <br> 转换为 \n
		showEditModal.value = true;
		if (selectedNote.value.comment) {
			commentContent.value = selectedNote.value.comment.replace(/<br>/g, "\n");
		}
	} else {
		try {
			await updateComment();
			showEditModal.value = false;
		} catch (error) {
			console.error("Failed to update comment:", error);
		}
	}
};

const updateComment = async () => {
	const result = commentContent.value.replace(/\n/g, "<br>");
	const commitObj = { ...selectedNote.value, comment: result };

	const res = await apiClient.put(
		`/lesson-notes/${selectedNote.value.resourceId}`,
		commitObj
	);
	if (res.data.code === 200) {
		return res.data.data;
	} else {
		showToast({ message: res.data.message, type: "error" });
	}
};

const isFill = ref(false);

const toggleImportantBadge = async () => {
	if (!selectedNote.value.isImportant) {
		const importantObj = { ...selectedNote.value, isImportant: true };
		const res = await apiClient.put(
			`/lesson-notes/${selectedNote.value.resourceId}`,
			importantObj
		);
		if (res.data.code === 200) {
			selectedNote.value.isImportant = true;
			emit("on-add-point");
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} else {
		const importantObj = { ...selectedNote.value, isImportant: false };
		const res = await apiClient.put(
			`/lesson-notes/${selectedNote.value.resourceId}`,
			importantObj
		);
		if (res.data.code === 200) {
			selectedNote.value.isImportant = false;
			emit("on-minus-point");
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	}
};

const cancelEditModal = () => {
	showEditModal.value = false;
	if (selectedNote.value.comment) {
		commentContent.value = selectedNote.value.comment.replace(/<br>/g, "\n");
	}
};

// 计算属性：将换行符转换为 p 标签
const formattedComment = computed(() => {
	if (selectedNote.value.comment) {
		return selectedNote.value.comment
			.split("<br>")
			.filter((line) => line.trim() !== "")
			.map((line, index, arr) => {
				const nextLine = arr[index + 1] || "";
				const isDoubleBreak = selectedNote.value.comment.includes(
					`${line}\n\n${nextLine}`
				);
				const paddingClass = isDoubleBreak ? "pb-3" : "pb-1";
				return `<p class="${paddingClass}">${line}</p>`;
			})
			.join("");
	} else {
		return "";
	}
});

watch(
	() => selectedNote.value,
	(newValue) => {
		if (newValue) {
			// isFill.value = newValue.isImportant;
			showEditModal.value = false;
			if (newValue.comment) {
				commentContent.value = newValue.comment.replace(/<br>/g, "\n");
			} else {
				commentContent.value = newValue.comment;
			}
		}
	}
);
</script>
<style scoped>
.edit-shadow {
	box-shadow: 0 6px 10px rgba(var(--secondary-color-rgb), 0.3);
	border: none;
	background: white;
}
.edit-shadow:hover {
	box-shadow: 0 6px 10px rgba(var(--secondary-color-rgb), 0.6);
}
.cancel-shadow {
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
	border: none;
	background: white;
}
.bg-grid-paper {
	background-color: transparent;
	background-image: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0.03) 1px,
			transparent 1px
		),
		linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
	background-size: 15px 15px; /* 网格间距 */
}
</style>
