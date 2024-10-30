<template>
	<!-- 动态编辑区域 -->

	<div class="flex editor-box">
		<div class="editor-container p-4 text-sm mt-4 relative">
			<div
				class="option-group flex justify-between space-x-4 absolute"
				style="left: 20px; top: -40px"
			>
				<button
					@click="backToPreview"
					class="btn btn-sm text-white btn-primary"
				>
					返回预览
				</button>
			</div>

			<div
				class="option-group flex justify-between space-x-4 absolute"
				style="right: 20px; top: -40px"
			>
				<div class="tooltip" data-tip="新增空白卡片">
					<button
						@click="createNewCard"
						class="btn btn-sm text-white btn-primary border-none"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-4"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 4.5v15m7.5-7.5h-15"
							/>
						</svg>
					</button>
				</div>
				<div class="tooltip" data-tip="删除当前卡片">
					<button
						@click="deleteCurrentCard"
						class="btn btn-sm text-white border-none bg-red-500 hover:bg-red-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-4"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
							/>
						</svg>
					</button>
				</div>
			</div>
			<div
				class="editor-container p-4 w-3/5 text-sm -mt-4 bg-white rounded shadow-lg shadow-editor"
				style="height: 540px; overflow-y: auto"
			>
				<!-- Markdown 编辑器 -->
				<div id="editorjs" class="editorjs-container"></div>
			</div>
			<!-- 分页按钮 -->
			<div class="flex justify-between mt-4">
				<button
					@click="switchDialogue('previous')"
					:disabled="currentDialogueIndex === 0"
					class="btn btn-primary btn-sm text-white"
				>
					上一页
				</button>
				<div class="space-x-4">
					<button
						@click="saveDialogue(true)"
						class="btn btn-sm text-white btn-primary"
					>
						保存更改
					</button>
				</div>
				<button
					@click="switchDialogue('next')"
					:disabled="currentDialogueIndex === totalDialogues - 1"
					class="btn btn-primary btn-sm text-white"
				>
					下一页
				</button>
			</div>
		</div>

		<div class="toolbox-container w-2/5 mt-4">
			<div
				class="card w-full bg-white rounded p-4 text-center shadow-lg shadow-knowledge"
			>
				<h3 v-if="!isEditing" class="text-lg font-semibold">知识点</h3>
				<!-- 检查当前项是否处于编辑状态 -->
				<div
					v-if="isEditing"
					class="text-gray-800 text-sm my-2 text-left cursor-pointer relative group"
				>
					<!-- 编辑表单 -->
					<div class="text-center mb-2 font-bold text-base">
						{{ editedFields.word }}
					</div>
					<!-- 词性选择 -->
					<!-- 中文释义输入 -->
					<div class="flex items-center justify-between space-x-2 mb-2">
						<div>
							<select
								v-model="editedFields.pos"
								id="pos"
								class="select select-bordered select-sm w-full max-w-xs"
							>
								<option value="">词性</option>
								<option value="n.">n.</option>
								<option value="v.">v.</option>
								<option value="adj.">adj.</option>
								<option value="adv.">adv.</option>
								<option value="excl.">excl.</option>
								<option value="phr.">phr.</option>
								<!-- 根据需要添加更多词性选项 -->
							</select>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.word_zh"
								id="word_zh"
								placeholder="请输入中文释义"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="mb-2">
						<input
							type="text"
							v-model="editedFields.definition_zh"
							id="definition_zh"
							placeholder="请输入详细释义"
							class="input input-bordered input-sm w-full max-w-xs"
						/>
					</div>
					<div class="mb-2">
						<select
							v-model="editedFields.type"
							id="type"
							class="select select-bordered select-sm w-full max-w-xs"
						>
							<option value="">请选择类型</option>
							<option value="vocabulary">词汇</option>
							<option value="phrase">短语</option>
							<option value="daily expression">日常用语</option>
							<!-- 根据需要添加更多词性选项 -->
						</select>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div>
							<input
								type="text"
								v-model="editedFields.system.affixAnalysis.prefix"
								id="prefix"
								placeholder="前缀"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.rootAnalysis.root"
								id="root"
								placeholder="词根"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.affixAnalysis.suffix"
								id="suffix"
								placeholder="后缀"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div>
							<input
								type="text"
								v-model="editedFields.system.affixAnalysis.prefixMeaning"
								id="prefixMeaning"
								placeholder="前缀"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.rootAnalysis.rootMeaning"
								id="rootMeaning"
								placeholder="词根"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.affixAnalysis.suffixMeaning"
								id="suffixMeaning"
								placeholder="后缀"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="mb-2">
						<textarea
							v-model="editedFields.example"
							id="example"
							placeholder="请输入例句"
							class="textarea textarea-bordered w-full max-w-xs p-2"
						></textarea>
					</div>
					<div class="mb-2">
						<textarea
							v-model="editedFields.example_zh"
							id="example_zh"
							placeholder="请输入例句释义"
							class="textarea textarea-bordered w-full p-2"
						></textarea>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div class="w-1/3">
							<input
								type="text"
								v-model="editedFields.system.wordInflections.baseForm_zh"
								id="baseForm_zh"
								placeholder="原型"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.wordInflections.baseForm"
								id="baseForm"
								placeholder="原型"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div class="w-1/3">
							<input
								type="text"
								v-model="
									editedFields.system.wordInflections.presentParticiple_zh
								"
								id="presentParticiple_zh"
								placeholder="现在分词"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.wordInflections.presentParticiple"
								id="presentParticiple"
								placeholder="现在分词"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div class="w-1/3">
							<input
								type="text"
								v-model="editedFields.system.wordInflections.pastTense_zh"
								id="pastTense_zh"
								placeholder="过去式"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.wordInflections.pastTense"
								id="pastTense"
								placeholder="过去式"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex items-center space-x-2 mb-2">
						<div class="w-1/3">
							<input
								type="text"
								v-model="
									editedFields.system.wordInflections.presentParticiple_zh
								"
								id="presentParticiple_zh"
								placeholder="现在分词"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
						<div>
							<input
								type="text"
								v-model="editedFields.system.wordInflections.presentParticiple"
								id="presentParticiple"
								placeholder="现在分词"
								class="input input-bordered input-sm w-full max-w-xs"
							/>
						</div>
					</div>
					<div class="flex justify-end mt-4 space-x-2">
						<button
							@click="saveKnowledge(index)"
							class="text-secondary text-sm"
						>
							保存
						</button>
						<button @click="cancelEdit" class="text-gray-500 text-sm">
							取消
						</button>
					</div>
				</div>
				<div v-if="!isEditing">
					<div
						v-for="(item, index) in knowledges"
						:key="index"
						class="text-gray-800 text-sm my-2 text-left cursor-pointer relative group"
					>
						{{ index + 1 }}. <span>{{ item.word }}</span>
						<span
							class="edit-icon text-secondary text-xs absolute right-0"
							@click="startEditing(item)"
						>
							编辑
						</span>
					</div>
					<div
						v-if="!knowledges.length"
						class="text-gray-800 text-sm my-8 text-center cursor-pointer relative group"
					>
						暂无词汇
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import apiClient from "@/api";
import { useRoute, useRouter } from "vue-router";
import EditorJS from "@editorjs/editorjs";
import { getDefinitions } from "@/utils/decompose.js";
import {
	initEditorBlocks,
	boldKnowledgeWords,
	checkBoldText,
	existingBoldWords,
	processDialogueData,
} from "@/utils/editor.js";
import { exampleText, exampleTextZh } from "@/constants/Example.js";
import { showToast } from "@/components/common/toast.js";

const route = useRoute();
const router = useRouter();
const season = route.params.season;
const episode = route.params.episode;

const defaultJson = ref({
	scenes: [
		{
			id: `${season}-${episode}`,
			title: episode,
			dialogues: [
				{
					id: "Scene1",
					season: season,
					episode: episode,
					title: "使用说明",
					img: "",
					text: exampleText,
					text_zh: exampleTextZh,
					knowledge: [],
				},
			],
		},
	],
});

const editor = ref(null);
const currentDialogueIndex = ref(0); // 当前对话索引
const totalDialogues = ref(0); // 总对话数
const knowledges = ref([]); // 知识点列表
const isEditing = ref(false); // 当前正在编辑的索引
const editedFields = ref({});
// 当前对话内容
const currentDialogue = computed(
	() => defaultJson.value.scenes[0].dialogues[currentDialogueIndex.value]
);

// 加载默认 JSON 并更新对话数
const fetchDefaultJson = async () => {
	if (route.query.script) {
		const scriptUrl = route.query.script;
		const response = await fetch(scriptUrl);
		if (response.ok) {
			const res = await response.json();
			return res.scriptData;
		} else {
			throw new Error("课程信息不完整或未找到");
		}
	}
};

// 初始化 editorjs 实例
const initEditorJS = async () => {
	const blocks = await initEditorWithDialogueData();
	editor.value = new EditorJS({
		holder: "editorjs",
		placeholder: "",
		data: { blocks },
		inlineToolbar: ["bold", "italic"],
		onReady: () => boldKnowledgeWords(knowledges.value, editor.value), // 将知识点中的单词加粗
		onChange: async () => {
			const content = await editor.value.save();
			checkBoldText(content, knowledges.value);
		},
	});
};

// 初始化编辑器中的对话数据
const initEditorWithDialogueData = async () => {
	console.log(currentDialogue.value);
	const dialogueData = currentDialogue.value;
	if (!dialogueData) {
		return [];
	}
	// 同步初始化知识点数据
	initKnowledgesData();
	return initEditorBlocks(dialogueData);
};

// 初始化知识点数据，同时初始化默认加粗项
const initKnowledgesData = () => {
	knowledges.value = currentDialogue.value.knowledge;
	knowledges.value.forEach((item) => {
		existingBoldWords.add(item.word.toLowerCase());
	});
};

onMounted(async () => {
	const scriptData = await fetchDefaultJson();
	if (scriptData) {
		defaultJson.value = scriptData;
		totalDialogues.value = scriptData.scenes[0].dialogues.length;
	}

	initEditorJS();
});

onBeforeUnmount(() => editor.value && editor.value.destroy());

// 切换对话
const switchDialogue = async (direction) => {
	if (
		(direction === "next" &&
			currentDialogueIndex.value < totalDialogues.value - 1) ||
		(direction === "previous" && currentDialogueIndex.value > 0)
	) {
		currentDialogueIndex.value += direction === "next" ? 1 : -1;
		// 销毁当前 EditorJS 实例
		if (editor.value) {
			await editor.value.destroy();
			editor.value = null; // 确保实例完全销毁
		}
		initEditorJS();
	}
};

// 上传脚本数据
const scriptUrl = ref("");
const saveDialogue = async (isCustom = false) => {
	const savedData = await editor.value.save();
	const outputDialogue = processDialogueData(
		savedData,
		knowledges.value,
		route,
		currentDialogueIndex.value
	);
	defaultJson.value.scenes[0].dialogues[currentDialogueIndex.value] =
		outputDialogue;

	uploadScripts(defaultJson.value, isCustom);
};

const uploadScripts = async (jsonData, isCustom = false) => {
	const catalogId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	try {
		const response = await apiClient.post(
			`/scripts/${catalogId}/${season}/${episode}`,
			{
				scriptData: jsonData,
			}
		);
		if (response.data.code === 200) {
			scriptUrl.value = response.data.data.message;
			if (isCustom) {
				showToast({ message: "保存成功", type: "success" });
			}
		} else {
			showToast({ message: "保存失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: error, type: "error" });
		console.error("Error uploading script:", error);
	}
};

// 添加一张空白卡片
const createNewCard = async () => {
	await saveDialogue();
	const newCard = {
		id: `Scene${defaultJson.value.scenes[0].dialogues.length + 1}`,
		season: route.params.season,
		episode: route.params.episode,
		title: "新对白卡片",
		img: "",
		text: [],
		text_zh: [],
		knowledge: [],
	};

	// 将新卡片添加到 dialogues 列表中
	defaultJson.value.scenes[0].dialogues.push(newCard);
	totalDialogues.value += 1;
	currentDialogueIndex.value = totalDialogues.value - 1;

	// 重新初始化编辑器内容
	const blocks = await initEditorWithDialogueData();
	editor.value.render({ blocks }); // 使用新数据渲染编辑器
};

// 删除当前对话卡片
const deleteCurrentCard = async () => {
	if (totalDialogues.value <= 1) {
		showToast({ message: "至少需要保留一张对话卡片，无法删除", type: "error" });
		return;
	}
	defaultJson.value.scenes[0].dialogues.splice(currentDialogueIndex.value, 1);
	totalDialogues.value -= 1;

	if (currentDialogueIndex.value >= totalDialogues.value) {
		currentDialogueIndex.value = totalDialogues.value - 1;
	}
	uploadScripts(defaultJson.value);

	const blocks = await initEditorWithDialogueData();
	editor.value.render({ blocks });
};

// 编辑区域
const startEditing = (item) => {
	isEditing.value = true;
	editedFields.value = {
		word: item.word,
		pos: item.pos,
		word_zh: item.word_zh,
		example: item.example,
		example_zh: item.example_zh,
		type: item.type,
		definition_zh: item.definition_zh,
	};
	const { prefix, prefixMeaning, suffix, suffixMeaning, root, rootMeaning } =
		getDefinitions(item.word);
	Object.assign(editedFields.value, {
		system: {
			affixAnalysis: { prefix, prefixMeaning, suffix, suffixMeaning },
			rootAnalysis: { root, rootMeaning },
			wordInflections: {
				baseForm: item.baseForm,
				baseForm_zh: "原型",
				presentParticiple: item.presentParticiple,
				pastParticiple_zh: "过去分词",
				pastTense: item.pastTense,
				pastTense_zh: "过去式",
				presentParticiple: item.presentParticiple,
				presentParticiple_zh: "现在分词",
			},
		},
	});
};

const saveKnowledge = (index) => {
	knowledges.value[index] = {
		...knowledges.value[index],
		...editedFields.value,
	};
	cancelEdit();
};

const cancelEdit = () => {
	isEditing.value = false;
	editedFields.value = editFieldsInit;
};

const backToPreview = () => {
	router.replace({
		path: route.path,
		query: {
			...route.query,
			mode: "preview",
			script: route.query.script || scriptUrl.value,
		},
	});
};
</script>

<style scoped>
.upload-placeholder {
	border: 2px dashed #ddd;
	height: 100%;
	width: 100%;
}

.upload-placeholder:hover {
	background-color: #e2e8f0; /* 鼠标悬停时的背景色 */
}

.editor-container {
	width: 100%;
	text-align: left;
	min-height: 500px;
}
.shadow-editor {
	box-shadow: 0 4px 8px rgba(var(--primary-color-rgb), 0.3); /* 红色阴影 */
}
.shadow-knowledge {
	box-shadow: 0 4px 8px rgba(var(--secondary-color-rgb), 0.3); /* 红色阴影 */
}
/* 悬停时显示编辑图标 */
.edit-icon {
	right: 0px;
}
</style>
