<template>
	<dialog ref="modalRef" id="manual_knowledge_modal" class="modal">
		<div
			class="modal-box border-2 border-gray-800"
			style="background-color: var(--milk-color)"
		>
			<div class="flex items-center gap-2">
				<!-- <h3 class="font-bold text-lg text-secondary">选择知识点</h3> -->
			</div>
			<div class="pt-2 pb-2">
				<div
					class="text-sm text-gray-700 text-left interactive-text"
					@mousemove="handleTextHover"
					@mouseleave="hoveredWordIndex = null"
					ref="textContainer"
				>
					<template v-for="(word, index) in words" :key="index">
						<span
							class="word-span"
							:class="{
								'word-highlight': hoveredWordIndex === index,
								'word-selected': selectedIndices.includes(index),
							}"
							@click="handleWordClick(index)"
							>{{ word }}</span
						>
					</template>
				</div>
			</div>

			<div class="py-2 border-t min-h-[80px] flex items-center">
				<div
					v-if="knowledgeGroups.length === 0"
					class="text-gray-500 text-sm flex items-center"
				>
					<i class="bi bi-info-circle mr-2"></i>
					点击文本中的单词或短语来选择知识点
				</div>
				<div v-else class="w-full flex flex-wrap gap-2">
					<div
						v-for="(group, groupIndex) in knowledgeGroups"
						:key="groupIndex"
						class="flex mr-2 relative"
					>
						<span
							class="text-secondary text-sm font-bold px-2 py-1 rounded-md bg-secondary/10"
							>{{ group.join(" ") }}</span
						>
						<button
							class="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs"
							@click.stop="removeGroup(groupIndex)"
						>
							<i class="bi bi-x"></i>
						</button>
					</div>
				</div>
			</div>

			<div class="modal-action justify-center">
				<!-- <div class="flex justify-end"> -->
				<button
					v-if="knowledgeGroups.length > 0"
					class="btn btn-sm btn-secondary text-white"
					@click="confirmKnowledge"
				>
					生成知识点
				</button>
				<!-- </div> -->
				<form method="dialog">
					<button class="btn btn-sm">关闭</button>
				</form>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>关闭</button>
		</form>
	</dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
	text: {
		type: String,
		required: true,
	},
});

const modalRef = ref(null);
const textContainer = ref(null);
const hoveredWordIndex = ref(null);

const selectedIndices = ref([]);

const emit = defineEmits(["select-knowledge", "generate-knowledge"]);

const isPunctuation = (word) => {
	return !/[a-zA-Z]/.test(word);
};

const words = computed(() => {
	if (!props.text) return [];

	return props.text.split(/\s+/).flatMap((word) => {
		// 使用正则匹配标点符号，保留标点符号
		return word.split(/([,.!?:;])/g).filter((part) => part.length > 0);
	});
});

const handleTextHover = (event) => {
	const container = textContainer.value;
	if (!container) return;

	const rect = container.getBoundingClientRect();
	const mouseX = event.clientX;
	const mouseY = event.clientY;

	// 检查鼠标是否在容器内
	if (
		mouseX < rect.left ||
		mouseX > rect.right ||
		mouseY < rect.top ||
		mouseY > rect.bottom
	) {
		hoveredWordIndex.value = null;
		return;
	}

	const wordElements = container.getElementsByClassName("word-span");
	hoveredWordIndex.value = null;

	Array.from(wordElements).forEach((element, index) => {
		if (isPunctuation(words.value[index])) return;

		const wordRect = element.getBoundingClientRect();
		if (
			mouseX >= wordRect.left &&
			mouseX <= wordRect.right &&
			mouseY >= wordRect.top &&
			mouseY <= wordRect.bottom
		) {
			hoveredWordIndex.value = index;
		}
	});
};

const handleWordClick = (index) => {
	if (isPunctuation(words.value[index])) return;

	if (selectedIndices.value.includes(index)) {
		selectedIndices.value = selectedIndices.value.filter((i) => i !== index);
	} else {
		selectedIndices.value.push(index);
	}
};

const removeGroup = (groupIndex) => {
	const sortedIndices = [...selectedIndices.value].sort((a, b) => a - b);
	let startIndex = 0;
	let currentGroup = 0;
	let groupSize = 0;

	// 遍历找到目标组的起始位置和大小
	for (let i = 0; i < sortedIndices.length; i++) {
		if (i === 0 || sortedIndices[i] === sortedIndices[i - 1] + 1) {
			// 当前组继续
			groupSize++;
		} else {
			// 新组开始
			if (currentGroup === groupIndex) {
				break;
			}
			startIndex += groupSize;
			groupSize = 1;
			currentGroup++;
		}
	}

	// 删除对应组的所有索引
	selectedIndices.value = [
		...sortedIndices.slice(0, startIndex),
		...sortedIndices.slice(startIndex + groupSize),
	];
};

const clearSelection = () => {
	selectedIndices.value = [];
};

// const selectedIndices = ref([]);
const knowledgeGroups = computed(() => {
	// 按照索引排序
	const sortedIndices = [...selectedIndices.value].sort((a, b) => a - b);
	const groups = [];
	let currentGroup = [];

	sortedIndices.forEach((index, i) => {
		if (i === 0 || index === sortedIndices[i - 1] + 1) {
			// 连续的索引，添加到当前组
			currentGroup.push(words.value[index]);
		} else {
			// 不连续，创建新组
			if (currentGroup.length > 0) {
				groups.push([...currentGroup]);
			}
			currentGroup = [words.value[index]];
		}
	});

	// 添加最后一组
	if (currentGroup.length > 0) {
		groups.push(currentGroup);
	}

	return groups;
});

const confirmKnowledge = () => {
	if (knowledgeGroups.value.length > 0) {
		const selectedKnowledge = knowledgeGroups.value.map((group) =>
			group.join(" ")
		);
		emit("generate-knowledge", selectedKnowledge);
		clearSelection();
		modalRef.value?.close();
	}
};

defineExpose({
	showModal() {
		modalRef.value?.showModal();
	},
});
</script>

<style scoped>
.interactive-text {
	cursor: pointer;
}

.word-span {
	padding: 2px 4px;
	border-radius: 4px;
	transition: all 0.2s ease;
	display: inline-block;
}

.word-highlight {
	background-color: rgba(var(--secondary-color-rgb), 0.1);
	color: var(--secondary-color);
}

.word-selected {
	background-color: rgba(var(--secondary-color-rgb), 0.1);
	color: var(--secondary-color);
}
</style>
