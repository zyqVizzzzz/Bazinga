<template>
	<dialog ref="modalRef" id="manual_knowledge_modal" class="modal">
		<div class="modal-box vintage-modal">
			<h3 class="vintage-title">选择知识点</h3>
			<p class="vintage-subtitle">点击文本中的单词或短语来选择知识点</p>

			<div class="vintage-content">
				<div
					class="text-sm text-left interactive-text"
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

			<div class="vintage-selection">
				<div
					v-if="knowledgeGroups.length === 0"
					class="empty-selection text-sm"
				>
					<i class="bi bi-info-circle mr-2"></i>
					请从上方文本中选择关键词
				</div>
				<div v-else class="selected-groups">
					<div
						v-for="(group, groupIndex) in knowledgeGroups"
						:key="groupIndex"
						class="vintage-tag"
					>
						<span>{{ group.join(" ") }}</span>
						<button
							class="vintage-tag-remove"
							@click.stop="removeGroup(groupIndex)"
						>
							<i class="bi bi-x"></i>
						</button>
					</div>
				</div>
			</div>

			<div class="vintage-actions">
				<button
					v-if="knowledgeGroups.length > 0"
					@click="confirmKnowledge"
					class="retro-btn w-[120px] h-8"
				>
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">生成知识点</div>
						</div>
					</div>
				</button>
				<form method="dialog">
					<!-- <button class="retro-btn w-[80px] h-8">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">关闭</div>
							</div>
						</div>
					</button> -->
				</form>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>关闭</button>
		</form>
	</dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

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

const emit = defineEmits(["select-knowledge", "manual-generate-knowledge"]);

const handleCancel = () => {
	clearSelection();
};

// 同时我们也需要监听对话框的关闭事件
const setupModalListeners = () => {
	if (modalRef.value) {
		modalRef.value.addEventListener("close", clearSelection);
	}
};

// 在组件挂载后设置监听器
onMounted(() => {
	setupModalListeners();
});

// 在组件卸载前移除监听器
onUnmounted(() => {
	if (modalRef.value) {
		modalRef.value.removeEventListener("close", clearSelection);
	}
});

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
		emit("manual-generate-knowledge", selectedKnowledge);
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
.vintage-modal {
	border: 3px solid #000;
	border-radius: 12px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 1);
	padding: 24px;
	position: relative;
	max-width: 600px;
}

.vintage-title {
	font-weight: bold;
	font-size: 20px;
	margin-bottom: 16px;
	text-align: center;
	position: relative;
	color: #000;
}

.vintage-title::after {
	content: "";
	position: absolute;
	bottom: -8px;
	left: 25%;
	right: 25%;
	height: 2px;
	background: #000;
}

.vintage-subtitle {
	text-align: center;
	color: #666;
	font-size: 14px;
	margin-bottom: 20px;
	font-style: italic;
}

.vintage-content {
	border: 2px solid #000;
	border-radius: 8px;
	padding: 16px;
	background: #fff;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
	margin-bottom: 16px;
	max-height: 200px;
	overflow-y: auto;
}

.interactive-text {
	cursor: pointer;
	color: #333;
	line-height: 1.6;
}

.word-span {
	padding: 2px 4px;
	border-radius: 4px;
	transition: all 0.2s ease;
	display: inline-block;
	cursor: pointer;
}

.word-highlight {
	background-color: rgba(var(--secondary-color-rgb), 0.1);
	color: var(--secondary-color);
}

.word-selected {
	background-color: rgba(var(--secondary-color-rgb), 0.2);
	color: var(--secondary-color);
	font-weight: bold;
}

.vintage-selection {
	border: 2px solid #000;
	border-radius: 8px;
	padding: 16px;
	background: #fff;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
	min-height: 80px;
	margin-bottom: 20px;
	display: flex;
	align-items: center;
}

.empty-selection {
	color: #666;
	font-style: italic;
	display: flex;
	align-items: center;
}

.selected-groups {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	width: 100%;
}

.vintage-tag {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	background: rgba(var(--secondary-color-rgb), 0.1);
	border: 2px solid #000;
	border-radius: 20px;
	font-size: 13px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
	transition: all 0.2s;
	color: var(--secondary-color);
	font-weight: bold;
	position: relative;
}

.vintage-tag:hover {
	transform: translateY(-2px);
	box-shadow: 2px 4px 0 rgba(0, 0, 0, 0.1);
}

.vintage-tag-remove {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.1);
	color: #666;
	border: none;
	cursor: pointer;
	transition: all 0.2s;
}

.vintage-tag-remove:hover {
	background: var(--secondary-color);
	color: #fff;
}

.vintage-actions {
	display: flex;
	justify-content: center;
	gap: 16px;
	margin-top: 16px;
}

.retro-btn {
	position: relative;
	border: none;
	background: none;
	cursor: pointer;
}

.retro-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 6px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 6px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	border: 2px solid #333;
	border-radius: 6px;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
}

/* 按钮交互效果 */
.retro-btn:hover:not(:disabled) .btn-face {
	background-color: white;
}

.retro-btn:active:not(:disabled) .btn-edge,
.retro-btn:active:not(:disabled) .btn-face {
	transform: translateY(0);
}
</style>
