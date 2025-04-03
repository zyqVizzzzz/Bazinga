<template>
	<div class="card-view">
		<div class="toolbox-container border border-gray-100 shadow-xl rounded-xl">
			<div class="relative w-full max-w-2xl mx-auto">
				<div class="decorated-card py-6 px-4">
					<!-- 标题区域 -->
					<div class="flex items-center justify-between space-x-2 mx-2 mb-4">
						<div class="scene-title text-base font-medium text-left text-xl">
							{{ currentScene?.title }}
						</div>
						<div class="flex items-center gap-4">
							<!-- 工具按钮组 -->
							<div class="tooltip" data-tip="一键翻译" v-if="isCustom">
								<button
									class="ghost-btn w-8 h-8"
									@click="$emit('translate-scene')"
									:disabled="translating"
								>
									<span
										v-if="translating"
										class="loading loading-spinner loading-xs"
									></span>
									<TranslationIcon v-else />
								</button>
							</div>
							<!-- 场景选择器 -->
							<select
								v-model="selectedSceneIndex"
								class="select select-sm select-bordered w-32"
								@change="handleSceneChange"
							>
								<option
									v-for="(scene, index) in scenes"
									:key="index"
									:value="index"
								>
									卡片 {{ index + 1 }}
								</option>
							</select>
						</div>
					</div>

					<!-- 内容区域 -->
					<div class="scene-content space-y-4">
						<template v-for="(block, index) in currentBlocks" :key="block.id">
							<BlockItem
								:block="block"
								:selected="selectedBlockIndex === index"
								@click="handleBlockClick(index, block)"
							/>
						</template>
					</div>
				</div>
			</div>
		</div>
		<!-- 添加工具栏 -->
		<BlockToolbar
			v-if="selectedBlockIndex !== null"
			:is-narration="false"
			:speakers="speakers"
			:loading="false"
			class="fixed bottom-4 left-1/2 transform -translate-x-1/2"
			@translate="handleTranslate"
			@generate-knowledge="handleGenerateKnowledge"
			@toggle-narration="handleToggleNarration"
			@select-speaker="handleSelectSpeaker"
		/>
	</div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed } from "vue";
import BlockItem from "./BlockItem.vue";
import TranslationIcon from "@/components/icons/Translation.vue";
import BlockToolbar from "../Editor/BlockToolbar.vue";

const props = defineProps({
	scenes: {
		type: Array,
		default: () => [],
	},
	currentScene: {
		type: Object,
		default: null,
	},
	currentBlocks: {
		type: Array,
		default: () => [],
	},
	isCustom: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits([
	"scene-change",
	"block-click",
	"translate-scene",
	"translate-block",
	"generate-knowledge",
	"toggle-narration",
	"select-speaker",
]);

const selectedSceneIndex = ref(0);
const selectedBlockIndex = ref(null);
const translating = ref(false);
const speakers = ref([]); // 添加 speakers 数据

// 添加工具栏处理方法
const handleTranslate = () => {
	emit("translate-block", selectedBlockIndex.value);
};

const handleGenerateKnowledge = () => {
	emit("generate-knowledge", selectedBlockIndex.value);
};

const handleToggleNarration = () => {
	emit("toggle-narration", selectedBlockIndex.value);
};

const handleSelectSpeaker = (speaker) => {
	emit("select-speaker", selectedBlockIndex.value, speaker);
};

// 监听场景变化
watch(
	() => props.currentScene,
	(newScene) => {
		if (newScene) {
			selectedSceneIndex.value = newScene.index;
		}
	},
	{ immediate: true }
);

// 监听场景数组变化
watch(
	() => props.scenes,
	(newScenes) => {
		if (newScenes.length > 0 && !props.currentScene) {
			emit("scene-change", 0);
		}
	},
	{ immediate: true }
);

// 添加计算属性
const hasContent = computed(() => {
	return props.currentBlocks && props.currentBlocks.length > 0;
});

// 添加错误处理
const handleSceneChange = () => {
	try {
		emit("scene-change", selectedSceneIndex.value);
	} catch (error) {
		console.error("场景切换失败:", error);
	}
};

// 添加块点击处理
const handleBlockClick = (index, block) => {
	try {
		selectedBlockIndex.value = index;
		emit("block-click", index, block);
	} catch (error) {
		console.error("块点击处理失败:", error);
	}
};
</script>

<style scoped>
.card-view {
	height: 100%;
	overflow-y: auto;
}

.decorated-card {
	background: white;
}

.ghost-btn {
	@apply flex items-center justify-center;
	@apply hover:bg-gray-100 rounded-lg transition-colors;
	@apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.scene-content {
	min-height: 200px;
}

/* 添加滚动条样式 */
.card-view::-webkit-scrollbar {
	width: 6px;
}

.card-view::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 3px;
}

.card-view::-webkit-scrollbar-thumb {
	background: #888;
	border-radius: 3px;
}

.card-view::-webkit-scrollbar-thumb:hover {
	background: #555;
}
</style>
