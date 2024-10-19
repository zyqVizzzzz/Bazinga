<template>
	<div
		class="card bg-white shadow-md border-2 border-black rounded-lg p-4 pt-5 mb-4 h-full"
	>
		<h2
			class="text-2xl pb-2 font-medium text-gray-800 text-left pl-4 flex justify-between items-center"
		>
			<span class="flex items-center"
				>{{ selectedNote.word
				}}<span class="ml-4 relative cursor-pointer" style="top: 3px"
					><VolumeIcon /></span
			></span>
			<!-- 卡片式按钮 -->
			<span class="flex items-center">
				<button
					class="edit-shadow mr-4 text-xs text-secondary bg-white rounded-lg px-4 py-2 transition-all duration-300"
					@click="openEditButton"
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

		<div class="border-b p-4 text-left relative">
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
			class="py-4 px-4 border-b"
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
		<div class="border-b px-4 py-4 mb-4 text-left relative">
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
		<!-- Spelling Card -->
		<!-- <div class="p-4 mt-4">
			<h3 class="text-base font-bold mb-2 text-left">
				<span v-for="(segment, index) in sentenceSegments" :key="index">
					<span v-if="segment.isWord">
						<template v-if="spellingCorrect">
							<strong>{{ selectedNote.word }}</strong>
						</template>
						<template v-else>
							<input
								type="text"
								v-model="spellingInput"
								class="border-b-2 border-gray-300 text-left text-base w-20 focus:outline-none"
								@input="onInputChange"
								ref="inputRef"
							/>
						</template>
					</span>
					<span v-else>{{ segment.text }}</span>
				</span>
			</h3>
			<p v-if="spellingCorrect" class="mb-2 text-gray-600 text-sm text-left">
				{{ selectedNote.example_zh }}
			</p>
		</div> -->
	</div>
	<dialog id="note_blink_modal" class="modal modal-blink modal-white">
		<div class="modal-box flex justify-center items-center">
			<form method="dialog"></form>
			<button
				@click="closeBlinkBox"
				class="btn btn-sm text-secondary btn-circle btn-ghost absolute right-2 top-2"
			>
				✕
			</button>
			<h3 class="text-lg text-secondary font-bold">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="size-20"
				>
					<path
						fill-rule="evenodd"
						d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
						clip-rule="evenodd"
					/>
				</svg>
			</h3>
		</div>
	</dialog>
	<dialog id="note_edit_modal" class="modal modal-edit">
		<div class="modal-box border-black border-4">
			<h3 class="text-lg font-bold mb-4">rushing</h3>
			<form class="space-y-4">
				<!-- 词义 -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">词义：</span>
					</label>
					<input
						type="text"
						placeholder="请输入词义"
						class="input input-bordered w-full text-sm"
						v-model="editModalData.word_zh"
					/>
				</div>

				<!-- 解释 -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">解释：</span>
					</label>
					<input
						type="text"
						placeholder="请输入解释"
						class="input input-bordered w-full text-sm"
						v-model="editModalData.definition_zh"
					/>
				</div>

				<!-- 补充注释 -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">补充注释：</span>
					</label>
					<textarea
						class="textarea textarea-bordered text-sm w-full"
						style="min-height: 150px"
						placeholder="请输入补充注释"
						v-model="editModalData.comment"
					></textarea>
				</div>
			</form>
			<!-- 按钮 -->
			<div class="modal-action space-x-6 justify-center">
				<button
					class="my-4 edit-shadow text-sm text-secondary bg-white rounded-lg px-4 py-2 transition-all duration-300"
					@click="submitEdit"
				>
					保存
				</button>
				<button
					class="my-4 shadow-md text-sm text-gray-500 bg-white rounded-lg px-4 py-2 transition-all duration-300 ml-4 hover:shadow-lg"
					@click="closeEditModal"
				>
					取消
				</button>
			</div>
		</div>
		<!-- 点击背景关闭 -->
		<form method="dialog" class="modal-backdrop">
			<button>关闭</button>
		</form>
	</dialog>
</template>
<script setup>
import { ref, computed, watch, nextTick, toRefs } from "vue";
import VolumeIcon from "../icons/Volume.vue";
import BookmarkIcon from "../icons/Bookmark.vue";
const spellingInput = ref([]); // 初始化拼写输入数组为空
const spellingCorrect = ref(false); // 标记拼写是否正确
const inputRefs = ref([]); // 存储输入框引用
const isFill = ref(false);

const props = defineProps({
	selectedNote: Object,
	isBlinkModal: Boolean,
});

const emit = defineEmits(["on-close-blink", "on-add-point"]);

const { selectedNote, isBlinkModal } = toRefs(props);

const spellingLetters = computed(() =>
	selectedNote.value ? selectedNote.value.word.split("") : []
);

// 将句子分割成数组，替换单词为输入框
const sentenceSegments = computed(() => {
	console.log(selectedNote.value);
	if (selectedNote.value) {
		const parts = selectedNote.value.example.split(
			new RegExp(selectedNote.value.word, "gi")
		);
		const segments = [];

		parts.forEach((part, index) => {
			segments.push({ text: part, isWord: false });
			// 插入目标单词的位置
			if (index < parts.length - 1) {
				segments.push({ isWord: true });
			}
		});

		return segments;
	}
	return [];
});

const togglePoint = () => {
	isFill.value = !isFill.value;
	emit("on-add-point");
};

// 监听 selectedNote 的变化，重置拼写输入框
watch(selectedNote, (newNote) => {
	if (newNote) {
		// 初始化拼写输入框
		spellingInput.value = "";
		spellingCorrect.value = false; // 重置拼写状态
		nextTick(() => {
			inputRef.value?.focus(); // 当生成输入框后，聚焦到输入框
		});
	}
});

watch(isBlinkModal, (newBlink) => {
	if (newBlink) {
		document.getElementById("note_blink_modal").showModal();
	}
});

const closeBlinkBox = () => {
	document.getElementById("note_blink_modal").close();
	emit("on-close-blink");
};

// 拼写检查逻辑
const checkSpelling = () => {
	const userSpelling = spellingInput.value.toLowerCase();
	const correctSpelling = selectedNote.value.word.toLowerCase();

	if (userSpelling === correctSpelling) {
		spellingCorrect.value = true; // 拼写正确
	} else {
		spellingCorrect.value = false; // 拼写错误
	}
};

// 输入时自动检查拼写
const onInputChange = () => {
	checkSpelling(); // 每次输入时检查拼写是否正确
};

const editModalData = ref({
	word_zh: "",
	definition_zh: "",
	comment: "",
});

const openEditButton = () => {
	document.getElementById("note_edit_modal").showModal();
	editModalData.value = {
		word_zh: selectedNote.value.word_zh,
		definition_zh: selectedNote.value.definition_zh,
		comment: selectedNote.value.comment,
	};
	console.log(editModalData.value);
};

const closeEditModal = () => {
	editModalData.value = {
		word_zh: "",
		definition_zh: "",
		comment: "",
	};
	document.getElementById("note_edit_modal").close();
};

const submitEdit = () => {
	Object.assign(selectedNote.value, editModalData.value);
	closeEditModal();
};
</script>
<style scoped>
/* 添加样式控制红色或绿色的边框 */
.border-red-300 {
	border-color: #fc8181; /* 红色，表示错误 */
}

.border-green-300 {
	border-color: #68d391; /* 绿色，表示正确 */
}
.edit-shadow {
	box-shadow: 0 6px 10px rgba(var(--secondary-color-rgb), 0.3);
}
.edit-shadow:hover {
	box-shadow: 0 6px 10px rgba(var(--secondary-color-rgb), 0.6);
}
.modal-blink .modal-box {
	width: 500px;
	height: 500px;
	background-color: var(--secondary-color);
	border: 5px solid #000;
	background-color: #000;
	box-shadow: 10px 10px 20px rgba(var(--secondary-color-rgb), 0.6);
}
</style>
