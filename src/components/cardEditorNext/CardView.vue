<template>
	<div class="card-view mx-auto flex gap-4 justify-center items-start w-4/5">
		<div class="editor-container w-4/5">
			<!-- 控制按钮组 -->
			<div class="editor-action-buttons">
				<div class="tooltip" data-tip="退出">
					<button class="retro-btn" @click="handleBack">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<i class="bi bi-box-arrow-left text-lg"></i>
								</div>
							</div>
						</div>
					</button>
				</div>
				<div class="tooltip" data-tip="保存" v-if="isCustom">
					<button class="retro-btn" @click="handleSave(false)">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<i class="bi bi-floppy text-lg"></i>
								</div>
							</div>
						</div>
					</button>
				</div>

				<template v-if="isCustom">
					<div class="border-t border-gray-200"></div>
					<div class="tooltip" data-tip="生成翻译">
						<button
							class="retro-btn"
							@click="handleBatchTranslate"
							:disabled="isLoading"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face">
										<TranslationIcon size="5" :fill="true" />
									</div>
								</div>
							</div>
						</button>
					</div>
					<div class="tooltip" data-tip="生成知识点">
						<button
							class="retro-btn"
							@click="handleBatchGenerateKnowledge"
							:disabled="isLoading"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face">
										<KnowledgeIcon size="5" :fill="true" />
									</div>
								</div>
							</div>
						</button>
					</div>
					<div class="tooltip" data-tip="新增文本内容">
						<button class="retro-btn" @click="handleShowTextEditorModal">
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face">
										<!-- <i class="bi bi-question-circle text-lg"></i> -->
										<SceneIcon size="5" />
									</div>
								</div>
							</div>
						</button>
					</div>
					<div class="tooltip" data-tip="导出文档">
						<button
							class="retro-btn"
							@click="exportToMarkdown"
							:disabled="isLoading"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face">
										<ExportIcon size="5" />
									</div>
								</div>
							</div>
						</button>
					</div>
				</template>

				<!-- <div class="border-t border-gray-200"></div> -->

				<!-- <div class="tooltip" data-tip="操作说明">
					<button class="retro-btn" @click="handleGuideModal">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<GuideIcon size="5" />
								</div>
							</div>
						</div>
					</button>
				</div> -->

				<!-- <div class="tooltip" data-tip="生成播客" v-if="isCustom">
					<button class="retro-btn" @click="handleShowPodcastModal">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<PodcastIcon size="7" />
								</div>
							</div>
						</div>
					</button>
				</div> -->
				<!-- <div class="tooltip" data-tip="已删除内容" v-if="isCustom">
					<button class="retro-btn" @click="handleShowRecycleBin">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<HistoryIcon size="6" />
								</div>
							</div>
						</div>
					</button>
				</div> -->
			</div>
			<div class="editor-wrapper text-sm">
				<div class="decorated-card py-6 px-4">
					<!-- 场景内容显示区 -->
					<div class="scene-content space-y-4">
						<div class="original-text space-y-2">
							<template v-for="(block, index) in currentBlocks" :key="index">
								<!-- 工具栏 -->
								<TextBlockToolbar
									v-if="
										isCustom && selectedBlockIndex === index && !block.isTitle
									"
									:toolbox-position="toolboxPosition"
									:is-narration="block.narration"
									:processing="processingBlockId === block.id"
									@translate="handleTranslate(index)"
									@auto-generate-knowledge="handleGenerateKnowledge(index)"
									@toggle-narration="handleToggleNarration(index)"
									@manual-knowledge="handleShowManualKnowledgeModal(index)"
									@split-scene="handleSplitScene(index)"
									@toggle-speaker="handleToggleSpeaker(index)"
									@delete-block="handleDeleteBlock(index)"
								/>
								<!-- 文本块 -->
								<div
									class="text-sm p-2 rounded hover:bg-gray-50 cursor-pointer text-left"
									:class="{
										'font-bold': block.isTitle,
										'translated-text': block.isTranslated,
										'knowledge-block': block.isKnowledge,
										'text-primary': block.narration,
									}"
									@click="handleBlockClick($event, index, block)"
								>
									<!-- 对话场景使用带说话者的布局 -->
									<div
										v-if="
											block.speaker &&
											!block.isTitle &&
											!block.isTranslated &&
											!block.isKnowledge &&
											!block.narration
										"
										class="flex flex-col gap-1"
									>
										<div
											class="speaker-badge self-start px-1.5 py-0.5 rounded text-xs text-gray-700 bg-gray-200 border border-gray-200"
										>
											{{ block.speaker }}
										</div>
									</div>

									<!-- 标题使用可编辑的 div -->
									<div
										class="title-container relative group"
										v-if="block.isTitle"
									>
										<div
											:contenteditable="isCustom ? true : false"
											@blur="handleTitleEdit($event, index)"
											@keydown.enter.prevent="$event.target.blur()"
											v-html="block.text"
											class="pr-8"
										></div>
										<button
											v-if="isCustom"
											class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
											@click.stop="handleAutoGenerateTitle(index)"
											title="自动生成标题"
										>
											<i
												class="bi bi-magic text-gray-500 hover:text-primary"
											></i>
										</button>
									</div>

									<!-- 普通文本使用简单布局 -->
									<div
										v-else-if="block.isTranslated"
										:contenteditable="isCustom ? true : false"
										@blur="handleTranslationEdit($event, index)"
										@keydown.enter.prevent="$event.target.blur()"
										v-html="block.text"
									></div>
									<div
										v-else
										v-html="
											block.isKnowledge
												? block.text
												: block.displayText || block.text
										"
									></div>
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
			<!-- 全局 Loading -->
			<div
				v-if="isLoading"
				class="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 rounded loading-overlay"
				style="border-radius: 12px; pointer-events: auto"
				@click.stop
			>
				<div class="crt-loading">
					<span class="loading loading-bars"></span>
				</div>
			</div>
			<!-- 场景缩略图列表 -->
			<div class="scene-thumbnails-container w-1/5">
				<div class="scene-thumbnails">
					<draggable
						v-model="scenesWithIds"
						item-key="sceneId"
						handle=".drag-btn"
						:disabled="!isCustom"
						@change="handleScenesDragChange"
						ghost-class="ghost-card"
						chosen-class="dragging-card"
						drag-class="dragging"
						animation="300"
					>
						<template #item="{ element, index }">
							<div class="cartridge-container">
								<div
									class="cartridge"
									:class="{ 'cartridge-active': currentIndex === index }"
									@click="switchScene(index)"
								>
									<!-- 卡带主体 -->
									<div class="cartridge-body">
										<div class="cartridge-label">
											<div
												class="cartridge-title line-clamp-2 text-sm"
												v-if="element.blocks[0]?.text"
											>
												{{ element.blocks[0].text.replace(/^#\s*/, "") }}
											</div>
											<div class="cartridge-number">NO. {{ index + 1 }}</div>
										</div>
									</div>

									<!-- 卡带底部 -->
									<div class="cartridge-pins">
										<!-- 添加操作按钮 -->
										<div v-if="isCustom" class="cartridge-actions">
											<!-- 左侧拖动按钮（摇杆风格） -->
											<button class="action-btn drag-btn" title="拖动场景">
												<i class="bi bi-arrows-move"></i>
											</button>

											<!-- 右侧操作按钮组 -->
											<div class="right-actions">
												<button
													class="action-btn merge-btn"
													@click.stop="handleMergeScenes(index)"
													title="向上合并场景"
												>
													<i class="bi bi-arrow-bar-up"></i>
												</button>
												<button
													class="action-btn delete-btn"
													@click.stop="handleDeleteScene(index)"
													title="删除场景"
												>
													<i class="bi bi-trash"></i>
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</template>
					</draggable>
				</div>
			</div>
		</div>
	</div>

	<!-- 知识点详情模态框 -->
	<KnowledgeDetailModal
		ref="knowledgeModalRef"
		:knowledge="selectedKnowledge"
	/>

	<!-- 手动知识点模态框 -->
	<ManualKnowledgeModal
		ref="manualKnowledgeModalRef"
		:text="selectedBlock?.text || ''"
		@manual-generate-knowledge="handleManualGenerateKnowledge"
	/>

	<PodcastModal
		ref="podcastModalRef"
		:scene-index="currentIndex"
		:knowledge="selectedPodcastKnowledge"
		@update-podcast="handlePodcastUpdate"
	/>

	<DeleteKnowledgeModal
		ref="deleteKnowledgeModalRef"
		@confirm="handleConfirmDelete"
	/>

	<RecycleBinModal
		ref="recycleBinModalRef"
		:deleted-knowledge="deletedKnowledge"
		@restore-knowledge="handleRestoreKnowledge"
	/>

	<SpeakerModal
		ref="speakerModalRef"
		:speakers="filteredSpeakers"
		@update="handleSpeakerUpdate"
		@remove="removeSpeaker"
		@confirm="handleConfirmSpeaker"
	/>

	<GuideModal ref="guideModalRef" />
	<TextEditorModal
		ref="textEditorModalRef"
		:scenes="scenes"
		@update="handleSceneUpdate"
	/>

	<dialog ref="deleteBlockModalRef" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">删除文本块</h3>
			<p class="py-4">确定要删除这个文本块吗？</p>
			<div class="modal-action justify-center">
				<form method="dialog" class="flex gap-2">
					<button
						class="btn btn-sm btn-secondary text-white"
						@click="handleConfirmDeleteBlock"
					>
						确认删除
					</button>
					<button class="btn btn-sm">取消</button>
				</form>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>关闭</button>
		</form>
	</dialog>
</template>

<script setup>
import {
	ref,
	watch,
	computed,
	nextTick,
	onMounted,
	onUnmounted,
	onBeforeUnmount,
} from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

import KnowledgeDetailModal from "./KnowledgeDetailModal.vue";
import TextBlockToolbar from "./TextBlockToolbar.vue";
import ManualKnowledgeModal from "./ManualKnowledgeModal.vue";
import DeleteKnowledgeModal from "./DeleteKnowledgeModal.vue";
import PodcastModal from "./PodcastModal.vue";
import RecycleBinModal from "./RecycleBinModal.vue";
import SpeakerModal from "./SpeakerModal.vue";
import TextEditorModal from "./TextEditorModal.vue";
import GuideModal from "./GuideModal.vue";
import TranslationIcon from "@/components/icons/Translation.vue";
import KnowledgeIcon from "@/components/icons/Knowledge.vue";
import ExportIcon from "@/components/icons/Export.vue";
import GuideIcon from "@/components/icons/Guide.vue";
import SceneIcon from "@/components/icons/Scene.vue";
import { generateTextHash } from "@/utils";
import draggable from "vuedraggable";

const route = useRoute();
const router = useRouter();
const hasUnsavedChanges = ref(false); // 未保存更改标记

const props = defineProps({
	scenes: {
		type: Array,
		required: true,
	},
	from: {
		type: String,
		default: "",
	},
});

const isCustom = ref(false);
const currentIndex = ref(0);
const currentBlocks = ref([]);
const blocksMap = ref(new Map()); // 用于存储和追踪所有文本块

const selectedBlockIndex = ref(null);
const processingBlockId = ref(null);
const toolboxPosition = ref({ top: 0, left: 0 }); // 记录工具栏的位置

const knowledgeModalRef = ref(null);
const selectedKnowledge = ref(null); // 选中的知识点数据 - 查看详情
const manualKnowledgeModalRef = ref(null);
const podcastBlocksMap = ref(new Map()); // 用于存储和追踪所有播客块

const deleteKnowledgeModalRef = ref(null);
const pendingDeleteWord = ref(null); // 待删除知识点
const deletedKnowledge = ref(new Set()); // 添加删除缓存
const deletedPodcasts = ref(new Map()); // 删除的播客数据缓存

const deleteBlockModalRef = ref(null);
const pendingDeleteBlockIndex = ref(null);
const deletedBlocks = ref([]); // 存储已删除的块缓存

const recycleBinModalRef = ref(null); // 已删除内容弹框

const podcastModalRef = ref(null);
const selectedPodcastKnowledge = ref(null);

const speakerModalRef = ref(null);
const speakers = ref(new Set());
const showSpeakerDropdown = ref(false);
const newSpeaker = ref("");

// 翻译
const translatingBlockId = ref(null);
// 知识点
const currentKnowledge = ref(new Map());
const isLoading = ref(false);

const guideModalRef = ref(null);
const textEditorModalRef = ref(null);

// 使用响应式变量代替计算属性
const scenesWithIds = ref([]);

// 监听 props.scenes 变化，更新本地数据
watch(
	() => props.scenes,
	(newScenes) => {
		scenesWithIds.value = newScenes.map((scene, index) => ({
			sceneId: `scene-${index}`,
			blocks: scene,
		}));
	},
	{ immediate: true, deep: true }
);

// 处理场景拖拽变化
const handleScenesDragChange = (evt) => {
	if (evt.moved) {
		const { oldIndex, newIndex } = evt.moved;

		// 更新当前索引
		if (currentIndex.value === oldIndex) {
			currentIndex.value = newIndex;
		} else if (
			currentIndex.value > oldIndex &&
			currentIndex.value <= newIndex
		) {
			currentIndex.value--;
		} else if (
			currentIndex.value < oldIndex &&
			currentIndex.value >= newIndex
		) {
			currentIndex.value++;
		}

		// 提取原始场景数据
		const newScenes = scenesWithIds.value.map((item) => item.blocks);

		// 更新场景数据
		emit("update:scenes", newScenes);

		// 更新当前场景内容
		if (currentIndex.value < newScenes.length) {
			currentBlocks.value = newScenes[currentIndex.value];
		}

		// 标记有未保存的更改
		hasUnsavedChanges.value = true;

		// 显示提示
		showToast({ message: "场景顺序已更新", type: "success" });
	}
};

const handleGuideModal = () => {
	guideModalRef.value?.showModal();
};

const handleShowTextEditorModal = () => {
	textEditorModalRef.value?.showModal();
};

const emit = defineEmits(["back", "update:scenes", "save-success"]);

onMounted(async () => {
	document.addEventListener("click", handleClickOutside);
	document.addEventListener("showKnowledgeDetail", (event) => {
		handleKnowledgeDetail(event.detail);
	});
	document.addEventListener("deleteKnowledge", (event) => {
		pendingDeleteWord.value = event.detail;
		deleteKnowledgeModalRef.value?.showModal();
	});
	document.addEventListener("regenerateKnowledge", handleRegenerateKnowledge);
	document.addEventListener("showPodcastModal", (event) => {
		const knowledgeData =
			typeof event.detail === "string"
				? JSON.parse(event.detail)
				: event.detail;
		handleShowPodcastModal(knowledgeData);
	});
	window.addEventListener("beforeunload", handleBeforeUnload);

	isLoading.value = true;
	try {
		console.log(props.from);
		if (!props.from) {
			await initializeView();
		} else if (props.from === "edit") {
			await handleSave(true);
			await initializeView();
		}
	} finally {
		isLoading.value = false;
	}
});

onUnmounted(() => {
	// 移除点击事件监听器
	document.removeEventListener("click", handleClickOutside);
	document.removeEventListener("showKnowledgeDetail", handleKnowledgeDetail);
	document.removeEventListener("deleteKnowledge", (event) => {
		emit("delete-knowledge", event.detail);
	});
	document.removeEventListener(
		"regenerateKnowledge",
		handleRegenerateKnowledge
	);
	document.removeEventListener("showPodcastModal", handleShowPodcastModal);
});

onBeforeUnmount(() => {
	window.removeEventListener("beforeunload", handleBeforeUnload);
});

// 添加页面刷新提示
const handleBeforeUnload = (e) => {
	if (hasUnsavedChanges.value) {
		e.preventDefault();
		e.returnValue = "";
	}
};

const handleBack = () => {
	const { id: courseId, season, episode } = route.params;
	const { sign } = route.query;

	if (hasUnsavedChanges.value) {
		if (window.confirm("您有未保存的更改，确定要离开吗？")) {
			clearAllStates();
			router.replace({
				path: `/collections/${courseId}/${season}/${episode}`,
				query: { sign },
			});
		}
	} else {
		clearAllStates();
		router.replace({
			path: `/collections/${courseId}/${season}/${episode}`,
			query: { sign },
		});
	}
};

onBeforeRouteLeave((to, from, next) => {
	// 如果有未保存的更改，先确认
	if (hasUnsavedChanges.value) {
		if (!window.confirm("您有未保存的更改，确定要离开吗？")) {
			next(false);
			return;
		}
	}

	// 获取完整的目标路径
	const { id: courseId, season, episode } = route.params;
	const { sign } = route.query;

	// 如果目标路径不是完整的课程路径，重定向到完整路径
	if (!to.fullPath.includes(sign)) {
		next({
			path: `/collections/${courseId}/${season}/${episode}`,
			query: { sign },
		});
		return;
	}

	next();
});

const initializeView = async () => {
	try {
		if (route.query.mode !== "edit") {
			const res = await apiClient.get(`/scripts/episode/${route.query.sign}`);
			if (res.data.code === 200 && res.data.data) {
				const scriptData = res.data.data.scriptData;
				isCustom.value = !res.data.data.isCustom;

				if (scriptData?.scenes?.[0]?.dialogues) {
					// 将对话按场景分组处理
					const scenes = [];
					let currentScene = [];

					const dialogues = scriptData.scenes[0].dialogues;

					dialogues.forEach((dialogue, dialogueIndex) => {
						currentScene = []; // 每个对话开始一个新场景

						// 添加标题块
						if (dialogue.title) {
							currentScene.push({
								id: `title_${dialogueIndex}`,
								text: `# ${dialogue.title}`,
								isTitle: true,
								narration: false,
								isTranslated: false,
							});
						}

						// 处理每组文本
						dialogue.text.forEach((textItem, i) => {
							const [speaker, text] = textItem;
							const blockId = `block_${dialogueIndex}_${i}`;

							// 如果有说话者且不是旁白，添加到说话者集合
							if (speaker && speaker !== "narration") {
								speakers.value.add(speaker);
							}

							// 添加原文块
							currentScene.push({
								id: blockId,
								text: text,
								speaker: speaker,
								isTitle: false,
								narration: speaker === "narration",
								isTranslated: false,
							});

							// 添加翻译块
							if (dialogue.text_zh?.[i]) {
								const [, textZh] = dialogue.text_zh[i];
								if (textZh?.trim()) {
									currentScene.push({
										id: `translation-${blockId}`,
										text: textZh,
										isTitle: false,
										isTranslated: true,
										originalId: blockId,
										originalIndex: blockId,
									});
								}
							}
						});

						// 将当前场景添加到场景列表
						if (currentScene.length > 0) {
							scenes.push(currentScene);
						}
					});

					// 更新场景数据
					emit("update:scenes", scenes);

					// 初始化知识点
					await initKnowledgeDisplay();
					// 初始化播客
					await initPodcasts();

					console.log("Scenes:", scenes);
					console.log("Podcast:", podcastBlocksMap.value);
				}
			}
		} else {
			console.log("from edit mode");
			isCustom.value = true;
			currentIndex.value = 0;
			currentBlocks.value = props.scenes[0];
		}
	} catch (error) {
		console.error("初始化视图失败:", error);
		showToast({ message: "加载数据失败，请重试", type: "error" });
	}
};

// 整个场景生成翻译
const handleBatchTranslate = async () => {
	try {
		isLoading.value = true;

		// 1. 获取当前场景的文本块
		const currentScene = currentBlocks.value;
		if (!currentScene || currentScene.length === 0) {
			showToast({ message: "当前场景没有内容", type: "warning" });
			return;
		}

		// 2. 过滤出需要翻译的文本块(非标题、非翻译、非知识点)
		let blocksToProcess = currentScene.filter(
			(block) => !block.isTitle && !block.isTranslated && !block.isKnowledge
		);

		if (blocksToProcess.length === 0) {
			showToast({ message: "没有需要翻译的内容", type: "warning" });
			return;
		}

		// 3. 批量翻译
		const response = await apiClient.post("/translation/batch", {
			texts: blocksToProcess.map((block) => block.text),
			source: "en",
			target: "zh",
		});

		if (response.data.data.translations) {
			// 为每个原文块处理翻译
			for (const [index, block] of blocksToProcess.entries()) {
				const translationBlock = {
					id: `translation-${block.id}`,
					text: response.data.data.translations[index],
					isTitle: false,
					isTranslated: true,
					originalId: block.id,
					originalIndex: block.id,
				};

				// 查找原文块位置
				const blockIndex = currentBlocks.value.findIndex(
					(b) => b.id === block.id
				);

				if (blockIndex !== -1) {
					// 查找是否已存在对应的翻译块
					const existingTranslationIndex = currentBlocks.value.findIndex(
						(b) =>
							b.isTranslated &&
							(b.originalId === block.id || b.id === `translation-${block.id}`)
					);

					if (existingTranslationIndex !== -1) {
						// 如果存在翻译块，替换它
						currentBlocks.value.splice(
							existingTranslationIndex,
							1,
							translationBlock
						);
					} else {
						// 如果不存在翻译块，在原文后插入
						currentBlocks.value.splice(blockIndex + 1, 0, translationBlock);
					}
				}
			}
		}

		// 更新场景数据
		emit(
			"update:scenes",
			props.scenes.map((scene, index) =>
				index === currentIndex.value ? currentBlocks.value : scene
			)
		);

		hasUnsavedChanges.value = true;
		showToast({ message: "翻译完成", type: "success" });
	} catch (error) {
		console.error("批量翻译失败:", error);
		showToast({ message: "批量翻译失败，请重试", type: "error" });
	} finally {
		isLoading.value = false;
	}
};

const handleBatchGenerateKnowledge = async () => {
	try {
		isLoading.value = true;

		// 1. 获取当前场景的文本块
		const currentScene = currentBlocks.value;
		if (!currentScene || currentScene.length === 0) {
			showToast({ message: "当前场景没有内容", type: "warning" });
			return;
		}

		// 2. 过滤出需要处理的文本块(非标题、非翻译、非知识点)
		let blocksToProcess = currentScene.filter(
			(block) => !block.isTitle && !block.isTranslated && !block.isKnowledge
		);

		if (blocksToProcess.length === 0) {
			showToast({ message: "没有需要处理的内容", type: "warning" });
			return;
		}

		// 3. 生成知识点
		await groupTextByLength(blocksToProcess);
		// await initKnowledgeDisplay();

		// 关闭加载状态
		isLoading.value = false;

		// 4. 更新场景数据
		emit(
			"update:scenes",
			props.scenes.map((scene, index) =>
				index === currentIndex.value ? currentBlocks.value : scene
			)
		);

		hasUnsavedChanges.value = true;
	} catch (error) {
		console.error("生成知识点失败:", error);
		showToast({ message: "生成知识点失败，请重试", type: "error" });
		isLoading.value = false;
	}
};

// 初始化知识点显示
const initKnowledgeDisplay = async () => {
	try {
		if (currentKnowledge.value.size === 0) {
			await initKnowledges();
		}

		props.scenes.forEach((scene, sceneIndex) => {
			const sceneId = `Scene${sceneIndex + 1}`;
			const processedKnowledgeInScene = new Set();

			const sceneBlocks =
				sceneIndex === currentIndex.value ? currentBlocks.value : scene;

			// 收集该场景的知识点
			const matchedKnowledge = Array.from(
				currentKnowledge.value.values()
			).filter((knowledge) => knowledge.scenes.has(sceneId));

			if (matchedKnowledge.length > 0) {
				for (let i = sceneBlocks.length - 1; i >= 0; i--) {
					const block = sceneBlocks[i];
					if (block.isTitle || block.isTranslated || block.isKnowledge)
						continue;

					const blockId = block.id || block.originalIndex;
					if (!blockId) continue;

					// 应用高亮
					applyKnowledgeHighlight(block, sceneIndex, currentKnowledge.value);

					// 检查是否需要插入知识点块
					if (block.displayText?.includes('class="highlight-knowledge"')) {
						const nextIndex = i + 1;
						const hasTranslation =
							nextIndex < sceneBlocks.length &&
							sceneBlocks[nextIndex].isTranslated;
						let insertIndex = hasTranslation ? nextIndex + 1 : nextIndex;

						// 筛选匹配的且未处理的知识点
						const blockMatchedKnowledge = matchedKnowledge.filter(
							(k) =>
								block.text.toLowerCase().includes(k.origin.toLowerCase()) &&
								!processedKnowledgeInScene.has(k.origin)
						);

						if (blockMatchedKnowledge.length > 0) {
							// 为每个匹配的知识点创建并插入知识点块
							blockMatchedKnowledge.forEach((knowledge, kIndex) => {
								processedKnowledgeInScene.add(knowledge.word);

								const knowledgeBlock = {
									id: `knowledge-${blockId}-${kIndex}`,
									text: formatKnowledgeDisplay(
										{
											...knowledge,
											hasPodcast: false, // 传入标记
										},
										`knowledge-${blockId}-${kIndex}`
									),
									isTitle: false,
									isKnowledge: true,
									originalId: blockId,
									knowledgeData: knowledge,
								};

								blocksMap.value.set(knowledgeBlock.id, knowledgeBlock);

								if (sceneIndex === currentIndex.value) {
									currentBlocks.value.splice(insertIndex, 0, knowledgeBlock);
								} else {
									scene.splice(insertIndex, 0, knowledgeBlock);
								}

								// 更新插入位置，使后续知识点插入到当前知识点之后
								insertIndex++;
							});
						}
					}
				}
			}
		});
	} catch (error) {
		console.error("初始化知识点显示失败:", error);
	}
};

// 初始化知识点数据
const initKnowledges = async () => {
	try {
		const response = await apiClient.get(`/knowledge`, {
			params: {
				catalogId: route.params.id,
				lessonId: route.query.sign,
			},
		});

		if (response.data.code === 200) {
			currentKnowledge.value = new Map();

			response.data.data.forEach((scene) => {
				scene.knowledge.forEach((item) => {
					if (!currentKnowledge.value.has(item.word)) {
						currentKnowledge.value.set(item.word, {
							...item,
							scenes: new Set([scene.sceneId]),
						});
					} else {
						const existingKnowledge = currentKnowledge.value.get(item.word);
						existingKnowledge.scenes.add(scene.sceneId);
					}
				});
			});
		}
	} catch (error) {
		console.error("加载知识点失败:", error);
	}
};

const initPodcasts = async () => {
	try {
		// 获取所有播客数据
		const podcastResponse = await apiClient.get(
			`/podcasts/resource/${route.query.sign}`
		);

		// 初始化播客 Map
		podcastBlocksMap.value.clear();

		if (podcastResponse.data.code === 200) {
			// 遍历所有场景
			props.scenes.forEach((scene, sceneIndex) => {
				// 找出场景中的所有知识点块
				scene.forEach((block) => {
					if (block.isKnowledge && block.knowledgeData) {
						// 查找匹配的播客
						const matchedPodcast = podcastResponse.data.data.podcasts.find(
							(podcast) => podcast.knowledge === block.knowledgeData.word
						);

						if (matchedPodcast) {
							// 使用知识点块 ID 作为 key
							podcastBlocksMap.value.set(block.id, {
								audioPath: matchedPodcast.audioPath,
								script: matchedPodcast.script,
								chineseScript: matchedPodcast.chineseScript,
								sceneIndex: sceneIndex,
								knowledge: matchedPodcast.knowledge,
							});

							// 更新知识点块的显示
							block.text = formatKnowledgeDisplay(
								{
									...block.knowledgeData,
									hasPodcast: true,
								},
								block.id
							);
						}
					}
				});
			});
		}
	} catch (error) {
		console.error("初始化播客数据失败:", error);
	}
};

// 添加请求队列控制器
const requestQueue = {
	queue: [],
	processing: false,
	maxConcurrent: 2, // 最大并发数

	async process() {
		if (this.processing || this.queue.length === 0) return;

		this.processing = true;
		while (this.queue.length > 0) {
			const batch = this.queue.splice(0, this.maxConcurrent);
			await Promise.all(batch.map((request) => request()));
		}
		this.processing = false;
	},

	add(request) {
		this.queue.push(request);
		this.process();
	},
};

const selectedBlock = computed(() =>
	selectedBlockIndex.value !== null
		? currentBlocks.value[selectedBlockIndex.value]
		: null
);

// 添加处理函数
const handleShowManualKnowledgeModal = (index) => {
	selectedBlockIndex.value = index;
	manualKnowledgeModalRef.value?.showModal();
};

// 处理确认删除
const handleConfirmDelete = () => {
	if (pendingDeleteWord.value) {
		// 1. 获取完整的知识点数据
		const knowledgeData = currentKnowledge.value.get(pendingDeleteWord.value);
		if (!knowledgeData) return;

		// 2. 添加到删除缓存
		deletedKnowledge.value.add({
			word: pendingDeleteWord.value,
			data: knowledgeData,
			timestamp: new Date().toISOString(),
			blocks: [], // 用于存储相关的知识点块
		});

		// 3. 从当前场景中移除相关的知识点块
		const knowledgeBlockIndexes = [];
		currentBlocks.value.forEach((block, index) => {
			if (
				block.isKnowledge &&
				block.knowledgeData?.word === pendingDeleteWord.value
			) {
				// 保存知识点块到删除缓存中
				deletedKnowledge.value.forEach((item) => {
					if (item.word === pendingDeleteWord.value) {
						item.blocks.push({ ...block });
					}
				});
				knowledgeBlockIndexes.unshift(index);

				// 检查并保存相关的播客数据
				if (podcastBlocksMap.value.has(block.id)) {
					const podcastData = podcastBlocksMap.value.get(block.id);
					deletedPodcasts.value.set(block.id, {
						...podcastData,
						timestamp: new Date().toISOString(),
						knowledgeWord: pendingDeleteWord.value,
					});
					// 从当前播客映射中删除
					podcastBlocksMap.value.delete(block.id);
				}
			}
		});

		// 4. 删除知识点块
		knowledgeBlockIndexes.forEach((index) => {
			currentBlocks.value.splice(index, 1);
		});

		// 5. 移除原文中的高亮
		currentBlocks.value.forEach((block) => {
			if (!block.isKnowledge && block.displayText) {
				const regex = new RegExp(
					`<mark class="highlight-knowledge">(${pendingDeleteWord.value})</mark>`,
					"gi"
				);
				block.displayText = block.displayText.replace(regex, "$1");
			}
		});

		// 6. 从当前知识点集合中移除
		currentKnowledge.value.delete(pendingDeleteWord.value);

		// 7. 更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, index) =>
				index === currentIndex.value ? currentBlocks.value : scene
			)
		);

		hasUnsavedChanges.value = true;

		// 8. 清空待删除词
		pendingDeleteWord.value = null;
	}
};

const handleShowRecycleBin = () => {
	recycleBinModalRef.value?.showModal();
};

const handleRestoreKnowledge = (item) => {
	// 1. 恢复知识点数据到当前知识点集合
	currentKnowledge.value.set(item.word, item.data);

	// 2. 恢复知识点块到原来的场景
	const targetScene = props.scenes[currentIndex.value];
	if (targetScene) {
		item.blocks.forEach((block) => {
			// 找到原文块
			const originalBlock = targetScene.find(
				(b) =>
					!b.isKnowledge &&
					!b.isTranslated &&
					b.text.toLowerCase().includes(item.word.toLowerCase())
			);

			if (originalBlock) {
				// 找到原文块和其对应的翻译块
				const blockIndex = targetScene.findIndex(
					(b) => b.id === originalBlock.id
				);
				const translationIndex = targetScene.findIndex(
					(b) =>
						b.isTranslated &&
						(b.originalId === originalBlock.id ||
							b.id === `translation-${originalBlock.id}`)
				);

				// 确定插入位置：如果有翻译块，插入到翻译块后面；否则插入到原文块后面
				const insertIndex =
					translationIndex !== -1 ? translationIndex + 1 : blockIndex + 1;

				// 插入知识点块
				targetScene.splice(insertIndex, 0, block);

				// 恢复原文的高亮，但保留已有的高亮
				const displayText = originalBlock.displayText || originalBlock.text;

				// 检查当前单词是否已经被高亮
				const wordRegex = new RegExp(
					`<mark class="highlight-knowledge">(${item.word})</mark>`,
					"gi"
				);
				const plainWordRegex = new RegExp(item.word, "gi");

				// 如果单词已经被高亮，则不需要再次高亮
				if (!wordRegex.test(displayText)) {
					// 如果单词没有被高亮，则添加高亮
					originalBlock.displayText = displayText.replace(
						plainWordRegex,
						`<mark class="highlight-knowledge">$&</mark>`
					);
				}
			}
		});

		// 如果是当前场景，更新 currentBlocks
		if (currentIndex.value === currentIndex.value) {
			currentBlocks.value = targetScene;
		}

		// 更新场景
		emit("update:scenes", [...props.scenes]);
	}

	// 3. 从删除缓存中移除
	deletedKnowledge.value.delete(item);

	showToast({ message: "知识点已恢复", type: "success" });
};

const handleShowPodcastModal = async (knowledge) => {
	console.log(knowledge);
	try {
		if (knowledge.word) {
			// 在 podcastBlocksMap 中查找匹配的播客
			const matchedPodcast = Array.from(podcastBlocksMap.value.values()).find(
				(podcast) => podcast.knowledge === knowledge.word
			);

			if (matchedPodcast) {
				// 如果找到匹配的播客，使用现有数据
				selectedPodcastKnowledge.value = {
					...knowledge,
					blockId: knowledge?.blockId,
					existingPodcast: {
						audioPath: matchedPodcast.audioPath,
						script: matchedPodcast.script,
						chineseScript: matchedPodcast.chineseScript,
					},
				};
			} else {
				// 如果没有找到，使用原始知识点数据
				selectedPodcastKnowledge.value = {
					...knowledge,
					blockId: knowledge?.blockId,
				};
			}
		}
		console.log(selectedPodcastKnowledge.value);
		podcastModalRef.value?.showModal();
	} catch (error) {
		console.error("打开播客模态框失败:", error);
		showToast({ message: "打开播客模态框失败，请重试", type: "error" });
	}
};

const handlePodcastUpdate = (podcastData) => {
	hasUnsavedChanges.value = true;
	const blockId = selectedPodcastKnowledge.value?.blockId;
	if (blockId) {
		podcastBlocksMap.value.set(blockId, podcastData);

		// 更新知识点块的显示
		const blockIndex = currentBlocks.value.findIndex(
			(block) => block.id === blockId
		);
		if (blockIndex !== -1) {
			const block = currentBlocks.value[blockIndex];
			block.text = formatKnowledgeDisplay(
				{
					...block.knowledgeData,
					hasPodcast: true,
				},
				block.id
			);
		}
	}
};

// 添加删除处理函数
const handleDeleteBlock = (index) => {
	pendingDeleteBlockIndex.value = index;
	deleteBlockModalRef.value?.showModal();
};

const handleConfirmDeleteBlock = () => {
	if (pendingDeleteBlockIndex.value !== null) {
		const index = pendingDeleteBlockIndex.value;
		const block = currentBlocks.value[index];
		const blockId = block.id || block.originalIndex;

		const indexesToDelete = [];
		const blocksToDelete = []; // 存储要删除的块
		indexesToDelete.push(index); // 找出所有需要删除的关联块的索引
		blocksToDelete.push(block); // 添加原文本块

		// 查找关联的翻译块和知识点块
		currentBlocks.value.forEach((b, i) => {
			// 查找翻译块
			if (
				b.isTranslated &&
				(b.originalId === blockId || b.id === `translation-${blockId}`)
			) {
				indexesToDelete.push(i);
				blocksToDelete.push(b);
			}
			// 查找知识点块
			if (b.isKnowledge && b.id?.startsWith(`knowledge-${blockId}`)) {
				indexesToDelete.push(i);
				blocksToDelete.push(b);
			}
		});

		// 从大到小排序索引，以便从后向前删除
		indexesToDelete.sort((a, b) => b - a);

		// 删除所有相关块
		indexesToDelete.forEach((i) => {
			currentBlocks.value.splice(i, 1);
		});

		// 将删除的块添加到删除列表
		deletedBlocks.value.push({
			timestamp: new Date().toISOString(),
			sceneIndex: currentIndex.value,
			blocks: blocksToDelete,
		});

		// 更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, sceneIndex) =>
				sceneIndex === currentIndex.value ? currentBlocks.value : scene
			)
		);

		// 重置状态
		selectedBlockIndex.value = null;
		pendingDeleteBlockIndex.value = null;

		showToast({ message: "删除成功", type: "success" });
	}
};

// 添加导出 Markdown 方法
const exportToMarkdown = async () => {
	try {
		isLoading.value = true;
		// 生成 Markdown 内容，遍历所有场景
		let markdownContent = "";

		console.log(props.scenes);

		props.scenes.forEach((scene, sceneIndex) => {
			// 添加场景标题
			markdownContent += `## ${
				scene[0]?.isTitle
					? scene[0].text.replace(/^#\s*/, "")
					: `Scene ${sceneIndex + 1}`
			}\n\n`;

			// 获取当前场景的块
			const sceneBlocks =
				sceneIndex === currentIndex.value ? currentBlocks.value : scene;
			console.log(sceneBlocks);

			// 遍历场景中的所有块
			sceneBlocks.forEach((block) => {
				if (block.isTitle) return;

				// 处理说话者和原文
				if (!block.isTranslated && !block.isKnowledge) {
					const speakerText = block.speaker ? `[**${block.speaker}**] ` : "";
					const cleanText = (block.displayText || block.text || "")
						.replace(/<mark[^>]*>(.*?)<\/mark>/g, "**`$1`**")
						.replace(/<[^>]+>/g, "");
					console.log(speakerText, cleanText);
					markdownContent += `${speakerText}${cleanText}\n\n`;
				}

				// 处理翻译
				if (block.isTranslated) {
					const cleanText = (block.displayText || block.text || "").replace(
						/<[^>]+>/g,
						""
					);
					markdownContent += `*${cleanText}*\n\n`;

					// 检查下一个块是否为知识点
					const nextBlock = sceneBlocks[sceneBlocks.indexOf(block) + 1];

					// 如果下一个块不是知识点，或者这是最后一个块，直接添加分隔线
					if (!nextBlock || !nextBlock.isKnowledge) {
						markdownContent += "---\n\n";
					}
				}

				// 处理知识点
				if (block.isKnowledge) {
					const cleanText = (block.displayText || block.text || "")
						.replace(/<[^>]+>/g, "")
						.split("\n")
						.filter((line) => line.trim())
						.map((line) => line.trim());

					if (cleanText.length >= 2) {
						const [word, translation] = cleanText;
						const knowledge = Array.from(currentKnowledge.value.values()).find(
							(k) => (k && k.word === word) || (k && k.word_zh === translation)
						);

						if (knowledge) {
							// 添加空值检查
							const synonyms = knowledge.synonyms || "";
							markdownContent += `> 💡 **${knowledge.word}** ｜ ${
								knowledge.word_zh || ""
							}
> 📝 **解释**：${knowledge.definition_zh || ""}
> 💫 **例句**：${knowledge.example || ""} / ${knowledge.example_zh || ""}
> 🎯 **同义词**：${synonyms
								.split("|")
								.filter(Boolean)
								.map((s, i) => `${i + 1}/ ${s.trim()}`)
								.join(" ")}\n\n---\n\n`;
						} else {
							markdownContent += `> 💡 ${word || ""} - ${
								translation || ""
							}\n\n---\n\n`;
						}
					}
				}
			});

			// 在场景之间添加额外的分隔
			if (sceneIndex < props.scenes.length - 1) {
				markdownContent += "\n\n";
			}
		});

		// 创建 Blob
		const blob = new Blob([markdownContent], { type: "text/markdown" });

		// 创建下载链接
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `全部场景_${Date.now()}.md`;

		// 触发下载
		document.body.appendChild(link);
		link.click();

		// 清理
		window.URL.revokeObjectURL(url);
		document.body.removeChild(link);

		showToast({ message: "Markdown导出成功", type: "success" });
	} catch (error) {
		console.error("Markdown导出失败:", error);
		showToast({ message: "Markdown导出失败，请重试", type: "error" });
	} finally {
		isLoading.value = false;
	}
};

const groupTextByLength = async (blocks) => {
	const groups = [];
	let currentGroup = [];
	let currentLength = 0;
	// 获取已存在的知识点
	const existingPhrases = Array.from(currentKnowledge.value.values())
		.map((k) => k.origin)
		.filter(Boolean); // 过滤掉可能的空值

	// 过滤出原文内容
	const originalBlocks = blocks.filter(
		(block) =>
			!block.isTitle &&
			!block.isTranslated &&
			!block.isKnowledge &&
			!block.narration
	);

	// 计算总字符数
	const totalChars = originalBlocks.reduce(
		(sum, block) => sum + (block.text?.length || 0),
		0
	);

	// 统计当前场景已有的知识点数量和分布
	const existingKnowledgeStats = analyzeExistingKnowledge(currentBlocks.value);

	// 根据总字符数和已有知识点情况确定分组大小和知识点密度
	const { groupSize, knowledgeDensity } = calculateDynamicParameters(
		totalChars,
		existingKnowledgeStats
	);

	// 分组处理
	originalBlocks.forEach((block) => {
		const text = block.text || "";
		const textLength = text.length;

		if (currentGroup.length === 0) {
			currentGroup.push(block);
			currentLength = textLength;
		} else {
			if (currentLength >= groupSize) {
				groups.push([...currentGroup]);
				currentGroup = [block];
				currentLength = textLength;
			} else {
				currentGroup.push(block);
				currentLength += textLength;
			}
		}
	});

	if (currentGroup.length > 0) {
		groups.push(currentGroup);
	}

	let hasGeneratedPhrases = false; // 检查是否所有组都没有生成知识点
	// 为每组文本生成知识点
	for (const group of groups) {
		try {
			const originalTexts = group
				.filter(
					(block) => !block.isTitle && !block.isTranslated && !block.isKnowledge
				)
				.map((block) => block.text)
				.join("\n");

			if (!originalTexts) continue;

			const textLength = originalTexts.length;
			const maxPhrases = Math.ceil(textLength / knowledgeDensity);

			// 移除所有中文字符和中文标点
			const removeChinese = (text) => {
				return text
					.replace(/[\u4e00-\u9fa5，。！？、：；""''“”（）【】《》…—]/g, "")
					.replace(/\s+/g, " ")
					.trim();
			};

			// 处理文本，移除中文
			const processedText = removeChinese(originalTexts);

			// 如果处理后文本为空，跳过当前循环
			if (!processedText) {
				continue;
			}

			// 1. 提取关键词
			const phrasesResponse = await apiClient.post(
				"/translation/extract-key-phrases",
				{
					text: processedText,
					options: {
						maxPhrases: Math.max(1, Math.min(maxPhrases, 8)),
						existingPhrases,
					},
				}
			);

			if (phrasesResponse.data.data.phrases.length > 0) {
				hasGeneratedPhrases = true; // 有生成知识点时设置标记
			} else {
				continue;
			}

			// 2. 生成知识点
			const knowledgeResponse = await apiClient.post(
				"/translation/generate-knowledge-batch",
				{
					words: phrasesResponse.data.data.phrases,
				}
			);

			if (!knowledgeResponse.data.data) continue;

			// 3. 处理每个原文块
			group.forEach((block) => {
				if (block.isTitle || block.isTranslated || block.isKnowledge) return;

				const blockText = block.text.toLowerCase();
				const matchedKnowledges = knowledgeResponse.data.data.filter((k) => {
					// 检查是否已存在该知识点
					const exists = Array.from(currentKnowledge.value.values()).some(
						(existing) =>
							existing.word === k.word || existing.origin === k.origin
					);
					return !exists && blockText.includes(k.origin.toLowerCase());
				});

				if (matchedKnowledges.length === 0) return;

				// 获取现有知识点数量作为起始索引
				const startKnowledgeCount = currentBlocks.value.filter(
					(b) => b.isKnowledge && b.id.startsWith(`knowledge_${block.id}_`)
				).length;

				// 高亮原文中的所有知识点
				console.log(matchedKnowledges);
				let displayText = block.displayText || block.text;
				matchedKnowledges.forEach((knowledge, kIndex) => {
					// 添加到知识点集合
					const sceneId = `Scene${currentIndex.value + 1}`;
					knowledge.scenes = new Set([sceneId]);
					currentKnowledge.value.set(knowledge.word, knowledge);

					// 检查是否已经存在高亮
					const highlightRegex = new RegExp(
						`<mark class="highlight-knowledge">${knowledge.origin}</mark>|<mark class="highlight-knowledge">${knowledge.word}</mark>`,
						"gi"
					);

					if (!highlightRegex.test(displayText)) {
						// 如果没有高亮，添加新的高亮
						const originRegex = new RegExp(knowledge.origin, "gi");
						if (displayText.match(originRegex)) {
							displayText = displayText.replace(
								originRegex,
								`<mark class="highlight-knowledge">${knowledge.origin}</mark>`
							);
						} else {
							const wordRegex = new RegExp(knowledge.word, "gi");
							if (displayText.match(wordRegex)) {
								knowledge.origin = knowledge.word;
								displayText = displayText.replace(
									wordRegex,
									`<mark class="highlight-knowledge">${knowledge.word}</mark>`
								);
							}
						}
					}

					// 创建知识点块
					const knowledgeBlock = {
						id: `knowledge_${block.id}_${startKnowledgeCount + kIndex}`,
						text: formatKnowledgeDisplay(
							knowledge,
							`knowledge_${block.id}_${startKnowledgeCount + kIndex}`
						),
						isTitle: false,
						isKnowledge: true,
						narration: false,
						isTranslated: false,
						knowledgeData: knowledge,
					};

					// 查找插入位置
					const blockId = block.id || block.originalIndex;
					const translationId = `translation-${blockId}`;
					const translationIndex = currentBlocks.value.findIndex(
						(b) => b.id === translationId || b.originalIndex === translationId
					);

					const lastKnowledgeIndex = [...currentBlocks.value]
						.reverse()
						.findIndex(
							(b) => b.isKnowledge && b.id.startsWith(`knowledge_${block.id}_`)
						);

					const insertIndex =
						lastKnowledgeIndex !== -1
							? currentBlocks.value.length - lastKnowledgeIndex
							: translationIndex >= 0
							? translationIndex + 1
							: currentBlocks.value.findIndex((b) => b.id === block.id) + 1;

					// 插入知识点块
					currentBlocks.value.splice(insertIndex, 0, knowledgeBlock);
				});

				// 更新原文块的显示文本
				block.displayText = displayText;
			});
		} catch (error) {
			console.error("处理知识点失败:", error);
		}
	}

	// 在所有组处理完后检查是否有生成知识点
	if (!hasGeneratedPhrases) {
		showToast({
			message: "已达到当前文本的知识点生成上限，您可以尝试手动选择知识点",
			type: "warning",
		});
	}

	return groups;
};

// 分析现有知识点的分布情况
const analyzeExistingKnowledge = (blocks) => {
	const stats = {
		totalKnowledge: 0, // 总知识点数量
		knowledgeBlocks: [], // 知识点块的位置
		averageDistance: 0, // 知识点之间的平均字符距离
		densityByRegion: new Map(), // 不同区域的知识点密度
	};

	let lastKnowledgePosition = 0;
	let totalTextLength = 0;
	let distances = [];

	blocks.forEach((block, index) => {
		if (block.isKnowledge) {
			stats.totalKnowledge++;
			stats.knowledgeBlocks.push(index);

			// 计算与上一个知识点的距离
			if (lastKnowledgePosition > 0) {
				const distance = totalTextLength - lastKnowledgePosition;
				distances.push(distance);
			}
			lastKnowledgePosition = totalTextLength;
		} else if (!block.isTitle && !block.isTranslated) {
			totalTextLength += block.text.length;
		}
	});

	// 计算平均距离
	if (distances.length > 0) {
		stats.averageDistance =
			distances.reduce((a, b) => a + b, 0) / distances.length;
	}

	// 计算区域密度（将文本分为3个区域）
	const regionSize = totalTextLength / 3;
	let currentRegion = 0;
	let regionKnowledgeCount = 0;
	let accumulatedLength = 0;

	blocks.forEach((block) => {
		if (!block.isTitle && !block.isTranslated) {
			accumulatedLength += block.text.length;
			if (block.isKnowledge) {
				regionKnowledgeCount++;
			}

			if (accumulatedLength >= (currentRegion + 1) * regionSize) {
				stats.densityByRegion.set(currentRegion, regionKnowledgeCount);
				currentRegion++;
				regionKnowledgeCount = 0;
			}
		}
	});

	return stats;
};

// 计算动态参数
const calculateDynamicParameters = (totalChars, stats) => {
	let baseGroupSize, baseKnowledgeDensity;

	// 基础配置（与原来相同）
	if (totalChars <= 4800) {
		baseGroupSize = 800;
		baseKnowledgeDensity = 150;
	} else if (totalChars <= 9600) {
		baseGroupSize = 1600;
		baseKnowledgeDensity = 200;
	} else {
		baseGroupSize = 2400;
		baseKnowledgeDensity = 300;
	}

	// 根据已有知识点密度调整参数
	const adjustmentFactor = calculateAdjustmentFactor(stats);

	return {
		groupSize: Math.round(baseGroupSize * adjustmentFactor.groupSizeFactor),
		knowledgeDensity: Math.round(
			baseKnowledgeDensity * adjustmentFactor.densityFactor
		),
	};
};

// 计算调整因子
const calculateAdjustmentFactor = (stats) => {
	let groupSizeFactor = 1;
	let densityFactor = 1;

	// 1. 根据已有知识点数量调整
	if (stats.totalKnowledge > 0) {
		// 知识点数量越多，分组尺寸越大（降低生成频率）
		groupSizeFactor = 1 + stats.totalKnowledge / 10; // 每10个知识点增加一倍分组大小

		// 知识点数量越多，密度要求越低（避免过度生成）
		densityFactor = 1 + stats.totalKnowledge / 20; // 每20个知识点降低一倍密度
	}

	// 2. 根据知识点分布均匀性调整
	const regionDensities = Array.from(stats.densityByRegion.values());
	const densityVariance = calculateVariance(regionDensities);

	// 分布不均匀时，倾向于在低密度区域生成更多知识点
	if (densityVariance > 2) {
		densityFactor *= 0.8; // 降低密度要求，允许生成更多知识点
	}

	// 3. 确保调整因子在合理范围内
	groupSizeFactor = Math.max(1, Math.min(groupSizeFactor, 3));
	densityFactor = Math.max(0.5, Math.min(densityFactor, 2));

	return { groupSizeFactor, densityFactor };
};

// 计算方差（用于评估分布均匀性）
const calculateVariance = (numbers) => {
	const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
	const variance =
		numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
	return Math.sqrt(variance);
};

const switchScene = async (index) => {
	currentIndex.value = index;
	currentBlocks.value = props.scenes[index];
	await updateCurrentSceneKnowledge();
};

const clearAllStates = () => {
	currentIndex.value = 0;
	currentBlocks.value = [];
	selectedBlockIndex.value = null;
	currentKnowledge.value.clear();
	podcastBlocksMap.value.clear();
	deletedKnowledge.value.clear();
	deletedPodcasts.value.clear();
	hasUnsavedChanges.value = false;
};

const handleSave = async (isFirst = false) => {
	try {
		// 处理场景数据
		const processedData = processSceneData();

		// 构建要上传的数据
		const updatedJson = {
			scenes: [
				{
					dialogues: processedData,
				},
			],
		};

		// 上传脚本数据
		const uploadSuccess = await uploadScripts(updatedJson);
		// 保存知识点数据
		const knowledgeSuccess = await saveAllKnowledge();
		// 保存播客数据
		const podcastSuccess = await saveAllPodcasts();

		if (uploadSuccess && knowledgeSuccess && podcastSuccess) {
			// 重置未保存标记
			hasUnsavedChanges.value = false;
			emit("save-success"); // 触发保存成功事件
			!isFirst && showToast({ message: "保存成功", type: "success" });
		} else {
			showToast({ message: "保存失败，请重试", type: "error" });
		}
	} catch (error) {
		showToast({ message: "保存失败，请重试", type: "error" });
	}
};

// 处理场景数据
const processSceneData = () => {
	const outputDialogues = [];

	// 确保有场景数据
	if (!props.scenes || props.scenes.length === 0) {
		console.warn("没有场景数据可处理");
		return outputDialogues;
	}

	// 遍历所有场景
	props.scenes.forEach((scene, sceneIndex) => {
		// 创建新场景对象
		const dialogue = {
			id: `Scene${sceneIndex + 1}`,
			title: scene[0]?.isTitle
				? scene[0].text.replace(/^#\s*/, "")
				: `Scene${sceneIndex + 1}`,
			img: "",
			text: [],
			text_zh: [],
		};

		// 处理场景内的文本块
		for (let i = 0; i < scene.length; i++) {
			const block = scene[i];

			// 跳过标题、知识点和翻译块
			if (block.isTitle || block.isKnowledge || block.isTranslated) continue;

			// 清除原文中的高亮标记
			let cleanText = block.text;
			cleanText = cleanText.replace(
				/<mark class="highlight-knowledge">(.*?)<\/mark>/g,
				"$1"
			);

			// 检查是否有对应的翻译块
			const blockId = block.id || block.originalIndex;
			const translationId = `translation-${blockId}`;
			const translationBlock = scene.find(
				(b) =>
					b.id === translationId || (b.isTranslated && b.originalId === blockId)
			);

			// 处理原文
			if (block.narration) {
				dialogue.text.push(["narration", cleanText]);
			} else {
				dialogue.text.push([block.speaker || "", cleanText]);
			}

			// 如果有翻译，添加翻译；否则添加空翻译
			if (translationBlock) {
				// 解析翻译文本，提取说话者和内容
				const translatedText = translationBlock.text;
				dialogue.text_zh.push(["", translatedText]);
			} else {
				dialogue.text_zh.push(["", ""]);
			}
		}

		// 只有当场景有内容时才添加到输出
		if (dialogue.text.length > 0) {
			outputDialogues.push(dialogue);
		}
	});

	return outputDialogues;
};

// 上传脚本数据
const uploadScripts = async (jsonData) => {
	try {
		// 这里需要从路由或props中获取catalogId和episodeId
		// 暂时使用固定值，实际使用时需要替换
		const catalogId = route.params.id; // 例如：route.params.id
		const episodeId = route.query.sign; // 例如：route.query.sign

		const response = await apiClient.post(
			`/scripts/${catalogId}/episode/${episodeId}`,
			{
				scriptData: jsonData,
			}
		);

		if (response.data.code === 200) {
			// 清除本地进度缓存
			// clearLocalProgressByCatalogId(catalogId);
			return true; // 保存成功返回 true
		} else {
			console.error("上传脚本失败:", response.data);
			return false; // 保存失败返回 false
		}
	} catch (error) {
		console.error("上传脚本出错:", error);
		return false; // 发生错误返回 false
	}
};

// 处理标题编辑
const handleTitleEdit = (event, index) => {
	const newText = event.target.innerText;
	const oldText = currentBlocks.value[index].text;

	// 确保标题以 # 开头
	const formattedText = newText.startsWith("#") ? newText : `# ${newText}`;

	// 只有当文本确实发生变化时才更新
	if (formattedText !== oldText) {
		currentBlocks.value[index].text = formattedText;

		// 通知父组件更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, sceneIndex) =>
				sceneIndex === currentIndex.value ? currentBlocks.value : scene
			)
		);

		hasUnsavedChanges.value = true; // 标记未保存更改
	}
};

// 解析对话行
function parseDialogueLine(line, tag) {
	let speaker = "";
	let text = line.trim();

	if (tag === "zh") {
		text = text.replace(/<\/?[^>]+(>|$)/g, "");
	} else {
		if (/^<i>.*<\/i>$/.test(text)) {
			text = text.slice(3, -4).trim();
			speaker = "narration";
		} else {
			const match = text.match(/^\[([^\[\]]*)\]\s*(.*)/);
			if (match) {
				speaker = match[1].replace(/\[.*?\]/g, "").trim();
				text = match[2].trim();
			}
		}
	}

	return { speaker, text };
}

// 保存知识点
const saveAllKnowledge = async () => {
	try {
		// 按场景ID重组知识点数据
		const sceneKnowledgeMap = new Map();

		// 遍历所有场景，收集知识点
		props.scenes.forEach((scene, index) => {
			const sceneId = `Scene${index + 1}`;
			const knowledgeBlocks = scene.filter((block) => block.isKnowledge);

			if (knowledgeBlocks.length > 0) {
				if (!sceneKnowledgeMap.has(sceneId)) {
					sceneKnowledgeMap.set(sceneId, []);
				}

				// 从知识点块中提取数据
				knowledgeBlocks.forEach((block) => {
					// 解析知识点文本，提取数据
					const knowledgeData = parseKnowledgeBlock(block.text);
					if (knowledgeData) {
						sceneKnowledgeMap.get(sceneId).push(knowledgeData);
					}
				});
			}
		});

		// 准备批量保存的数据
		const items = [];
		const processedData = processSceneData();

		processedData.forEach((dialogue) => {
			const sceneId = dialogue.id;
			const sceneKnowledge = sceneKnowledgeMap.get(sceneId) || [];

			const item = {
				sceneId: sceneId,
			};

			if (sceneKnowledge.length > 0) {
				item.knowledge = sceneKnowledge;
			}

			items.push(item);
		});

		const bulkData = {
			catalogId: route.params.id,
			lessonId: route.query.sign,
			items: items,
		};

		// 调用批量保存接口
		const response = await apiClient.post("/knowledge/bulk", bulkData);

		return response.data.code === 200 && true;
	} catch (error) {
		console.error("保存知识点失败:", error);
		return false;
	}
};

const saveAllPodcasts = async () => {
	try {
		const podcastsToSave = [];
		podcastBlocksMap.value.forEach((podcastData, blockId) => {
			podcastsToSave.push({
				knowledge: podcastData.knowledge,
				script: podcastData.script,
				audioPath: podcastData.audioPath,
				chineseScript: podcastData.chineseScript,
				sceneId: `${podcastData.sceneIndex + 1}`,
				resourceId: route.query.sign,
			});
		});

		if (podcastsToSave.length > 0) {
			const response = await apiClient.post("/podcasts/batch-save", {
				resourceId: route.query.sign,
				podcasts: podcastsToSave,
			});
			return response.data.code === 200;
		}
		return true; // 如果没有播客需要保存，也算成功
	} catch (error) {
		console.error("保存播客失败:", error);
		return false;
	}
};

// 解析知识点块
const parseKnowledgeBlock = (htmlText) => {
	try {
		// 创建一个临时的 DOM 元素来解析 HTML
		const div = document.createElement("div");
		div.innerHTML = htmlText;

		// 提取显示的数据
		const wordElement = div.querySelector(".font-bold");
		const translationElement = div.querySelector(".text-gray-600");
		const definitionElement = div.querySelector(".text-gray-600.text-sm");

		if (!wordElement || !translationElement || !definitionElement) {
			return null;
		}

		// 从 data 属性中获取完整的知识点数据
		const knowledgeData = {
			word: wordElement.textContent.trim(),
			origin: wordElement.dataset.origin || wordElement.textContent.trim(), // 保存原文
			word_zh: translationElement.textContent.trim(),
			synonyms: wordElement.dataset.synonyms || "",
			definition_zh: definitionElement.textContent.trim(),
			example: wordElement.dataset.example || "",
			example_zh: wordElement.dataset.exampleZh || "",
			note: wordElement.dataset.note || "",
		};

		return knowledgeData;
	} catch (error) {
		console.error("解析知识点块失败:", error);
		return null;
	}
};

// 添加更新当前场景知识点的方法
const updateCurrentSceneKnowledge = async () => {
	if (currentBlocks.value.length > 0) {
		const sceneIndex = currentIndex.value;
		const sceneId = `Scene${sceneIndex + 1}`;

		// 重新应用知识点高亮和块
		for (let i = currentBlocks.value.length - 1; i >= 0; i--) {
			const block = currentBlocks.value[i];
			if (block.isTitle || block.isTranslated || block.isKnowledge) continue;

			// 应用高亮
			applyKnowledgeHighlight(block, sceneIndex, currentKnowledge.value);
		}
	}
};

// 添加显示知识点详情的处理函数
const handleKnowledgeDetail = (knowledge) => {
	selectedKnowledge.value = knowledge;
	knowledgeModalRef.value?.showModal();
};

// 重新生成知识点
const handleRegenerateKnowledge = async (event) => {
	const word = event.detail;
	if (!word) return;

	try {
		isLoading.value = true;
		// 获取当前知识点数据
		const oldKnowledge = currentKnowledge.value.get(word);
		if (!oldKnowledge) return;

		// 重新生成知识点
		const response = await apiClient.post("/translation/generate", {
			word: oldKnowledge.word + "/" + oldKnowledge.origin,
		});

		if (response.data.code === 200) {
			const newKnowledgeData = response.data.data;
			// 保持原有的场景信息
			newKnowledgeData.scenes = oldKnowledge.scenes;

			// 更新知识点集合
			currentKnowledge.value.set(word, newKnowledgeData);

			// 更新知识点块的显示
			currentBlocks.value.forEach((block, index) => {
				if (block.isKnowledge && block.knowledgeData?.word === word) {
					currentBlocks.value[index].text = formatKnowledgeDisplay(
						newKnowledgeData,
						block.id
					);
					currentBlocks.value[index].knowledgeData = newKnowledgeData;
				}
			});

			// 更新场景
			emit(
				"update:scenes",
				props.scenes.map((scene, index) =>
					index === currentIndex.value ? currentBlocks.value : scene
				)
			);

			hasUnsavedChanges.value = true;

			showToast({ message: "知识点重新生成成功", type: "success" });
		}
	} catch (error) {
		console.error("重新生成知识点失败:", error);
		showToast({ message: "重新生成知识点失败，请重试", type: "error" });
	} finally {
		isLoading.value = false;
	}
};

// 事件处理函数
const handleBlockClick = (event, index, block) => {
	// 阻止事件冒泡，避免触发 handleClickOutside
	event.stopPropagation();

	// 如果点击的是非文本行（标题、翻译、知识点），隐藏工具栏
	if (block.isTitle || block.isTranslated || block.isKnowledge) {
		selectedBlockIndex.value = null;
		return;
	}

	// 如果点击的是当前选中的块，则隐藏工具栏
	if (selectedBlockIndex.value === index) {
		selectedBlockIndex.value = null;
		return;
	}

	// 点击新的文本行或重新显示工具栏
	selectedBlockIndex.value = index;
	updateToolboxPosition(index);
};

// 点击外部隐藏工具栏
const handleClickOutside = (event) => {
	if (event.target.closest(".modal")) {
		return;
	}
	// 如果工具栏没有显示，不需要处理
	if (selectedBlockIndex.value === null) return;

	// 检查点击是否在工具栏内部
	const isClickOnToolbox = event.target.closest(".text-toolbox");
	const isClickOnModal = event.target.closest("#manual_knowledge_modal");
	const isClickOnOverlay = event.target.closest(".loading-overlay");
	if (isClickOnToolbox || isClickOnModal || isClickOnOverlay || isLoading.value)
		return;

	// 点击在其他区域，隐藏工具栏
	selectedBlockIndex.value = null;
};

// 添加计算工具栏位置的方法
const updateToolboxPosition = (index) => {
	nextTick(() => {
		const blocks = document.querySelectorAll(".text-sm.p-2.rounded");
		const block = blocks[index];
		if (block) {
			const rect = block.getBoundingClientRect();
			const editorWrapper = document.querySelector(".editor-wrapper");
			const editorRect = editorWrapper.getBoundingClientRect();

			// 获取编辑器的滚动位置
			const scrollTop = editorWrapper.scrollTop;

			toolboxPosition.value = {
				// 加上滚动距离来修正位置
				top: rect.top - editorRect.top + scrollTop - 10,
				left: "1",
			};
		}
	});
};

const handleTranslate = async (index) => {
	const block = currentBlocks.value[index];
	if (!block || block.isTranslated) return;

	try {
		isLoading.value = true;
		// 确保块有ID
		const blockId = block.id || block.originalIndex;
		if (!blockId) {
			console.error("无法翻译：块没有ID");
			return;
		}

		translatingBlockId.value = blockId;

		// 检查是否已有翻译块
		const translationId = `translation-${blockId}`;
		const hasExistingTranslation = currentBlocks.value.some(
			(b) => b.id === translationId || b.originalIndex === translationId
		);

		const response = await apiClient.post("/translation", {
			text: block.text,
			source: "en",
			target: "zh",
		});

		if (response.data.code !== 200 || !response.data.data.translatedText) {
			showToast({ message: "翻译失败，请重试", type: "error" });
			return;
		}

		const translatedText = response.data.data.translatedText;

		// 创建翻译块
		const translationBlock = {
			id: translationId,
			text: translatedText,
			isTitle: false,
			isTranslated: true,
			originalId: blockId,
			originalIndex: blockId,
		};

		// 如果已有翻译块，则更新内容；否则插入新的翻译块
		if (hasExistingTranslation) {
			const existingIndex = currentBlocks.value.findIndex(
				(b) => b.id === translationId || b.originalIndex === translationId
			);
			if (existingIndex >= 0) {
				currentBlocks.value[existingIndex].text = translatedText;
			}
		} else {
			// 在当前块后插入翻译文本
			currentBlocks.value.splice(index + 1, 0, translationBlock);
		}

		hasUnsavedChanges.value = true;

		// 通知父组件更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, sceneIndex) =>
				sceneIndex === currentIndex.value ? currentBlocks.value : scene
			)
		);

		// showToast({ message: "翻译成功", type: "success" });
	} catch (error) {
		console.error("Translation failed:", error);
		showToast({ message: "翻译失败，请重试", type: "error" });
	} finally {
		translatingBlockId.value = null;
		isLoading.value = false;
	}
};

// 提取知识点
const extractKeyPhrases = async (text, existingPhrases = []) => {
	const textLength = text.length;
	const existingCount = existingPhrases.length;

	// 移除所有中文字符和中文标点
	const removeChinese = (text) => {
		return text
			.replace(/[\u4e00-\u9fa5，。！？、：；""''（）【】《》…—]/g, "")
			.replace(/\s+/g, " ")
			.trim();
	};

	// 处理文本，移除中文
	const processedText = removeChinese(text);

	// 如果处理后文本为空，直接返回
	if (!processedText) {
		showToast({
			message: "无法提取知识点：文本中没有英文内容",
			type: "warning",
		});
		return null;
	}

	// 根据文本长度计算最大知识点数量
	let maxPhrases;
	if (textLength < 500) {
		// 小于500字符，每100字符1个知识点，最多5个
		if (existingCount >= 5) {
			showToast({
				message: "已达到当前文本的知识点生成上限，您可以尝试手动选择知识点",
				type: "warning",
			});
			return null;
		}
		// 计算应该生成的知识点数量
		const baseCount = Math.max(1, Math.ceil(textLength / 100));
		maxPhrases = Math.min(5 - existingCount, baseCount);
	} else {
		// 大于等于500字符
		// 计算当前文本应该生成的总知识点数量：基础5个，每超出200字符加1个，最多8个
		const baseCount = 5 + Math.floor((textLength - 500) / 200);
		const totalPhrases = Math.min(8, baseCount);

		if (existingCount >= totalPhrases) {
			showToast({
				message: "已达到当前文本的知识点生成上限，您可以尝试手动选择知识点",
				type: "warning",
			});
			return null;
		}

		maxPhrases = totalPhrases - existingCount;
	}

	if (maxPhrases <= 0) {
		showToast({
			message: "已达到当前文本的知识点生成上限，您可以尝试手动选择知识点",
			type: "warning",
		});
		return null;
	}

	try {
		const response = await apiClient.post("/translation/extract-key-phrases", {
			text: processedText,
			options: { maxPhrases, existingPhrases },
		});

		if (response.data.code === 200 && response.data.data.phrases?.length > 0) {
			return response.data.data.phrases;
		}
		return null;
	} catch (error) {
		console.error("提取关键词失败:", error);
		throw error;
	}
};

// 生成知识点
const generateKnowledge = async (phrases) => {
	try {
		const response = await apiClient.post(
			"/translation/generate-knowledge-batch",
			{
				words: phrases,
			}
		);

		if (response.data.code === 200) {
			console.log(response.data.data);
			return response.data.data;
		}
		return null;
	} catch (error) {
		console.error("生成知识点失败:", error);
		throw error;
	}
};

// 格式化知识点显示
const formatKnowledgeDisplay = (knowledgeData, blockId) => {
	// 创建一个新的对象，只包含需要的数据
	const safeData = {
		word: knowledgeData.word,
		word_zh: knowledgeData.word_zh,
		origin: knowledgeData.origin,
		synonyms: knowledgeData.synonyms || "",
		example: knowledgeData.example || "",
		example_zh: knowledgeData.example_zh || "",
		note: knowledgeData.note || "",
		definition_zh: knowledgeData.definition_zh,
		blockId: blockId,
	};

	// 转义特殊字符
	const safeJsonString = JSON.stringify(safeData)
		.replace(/'/g, "\\'")
		.replace(/"/g, "&quot;");
	return `<div class="knowledge-item p-1">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span
          class="font-bold"
          data-origin="${safeData.origin}"
          data-synonyms="${safeData.synonyms}"
          data-example="${safeData.example}"
          data-example-zh="${safeData.example_zh}"
          data-note="${safeData.note}"
					data-block-id="${safeData.blockId}"
        >${safeData.word}</span>
        <span class="text-gray-600">${safeData.word_zh}</span>
      </div>
      <div class="flex items-center gap-1">
				${
					isCustom.value
						? `
            <button class="knowledge-btn knowledge-regenerate-btn transition-colors" onclick="document.dispatchEvent(new CustomEvent('regenerateKnowledge', { detail: '${safeData.word}' }))">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            `
						: ""
				}

        <button class="knowledge-btn knowledge-detail-btn transition-colors" onclick="document.dispatchEvent(new CustomEvent('showKnowledgeDetail', { detail: JSON.parse('${safeJsonString}') }))">
          <i class="bi bi-journal-text"></i>
        </button>
				${
					isCustom.value
						? `<button class="knowledge-btn knowledge-detail-btn transition-colors" onclick="document.dispatchEvent(new CustomEvent('showPodcastModal', { detail: '${safeJsonString}' }))">
        <svg style="width:1.35rem" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          ${
						knowledgeData.hasPodcast
							? `<path d="M422.4 601.6m-217.6 0a217.6 217.6 0 1 0 435.2 0 217.6 217.6 0 1 0-435.2 0Z" fill="#e8447a"></path>`
							: ""
					}
          <path d="M499.2 179.2C315.392 179.2 166.4 328.192 166.4 512S315.392 844.8 499.2 844.8s332.8-148.992 332.8-332.8S683.008 179.2 499.2 179.2z m0 51.2c155.52 0 281.6 126.08 281.6 281.6s-126.08 281.6-281.6 281.6S217.6 667.52 217.6 512 343.68 230.4 499.2 230.4z" fill="#222222"></path>
          <path d="M643.264 569.4592l-153.216 87.5392a51.2 51.2 0 0 1-76.5952-44.4544V437.4528a51.2 51.2 0 0 1 76.608-44.4544l153.2032 87.552a51.2 51.2 0 0 1 0 88.9088zM464.64 612.544l153.216-87.552-153.216-87.5392v175.0912zM838.4 793.6a25.6 25.6 0 0 1 1.92 51.136L838.4 844.8h-320a25.6 25.6 0 0 1-1.92-51.136L518.4 793.6h320z" fill="#222222"></path>
        </svg>
      </button>`
						: ""
				}
        ${
					isCustom.value
						? `
          <button class="knowledge-btn knowledge-delete-btn hover:text-secondary transition-colors" onclick="document.dispatchEvent(new CustomEvent('deleteKnowledge', { detail: '${safeData.word}' }))">
            <i class="bi bi-trash"></i>
          </button>
        `
						: ""
				}
      </div>
    </div>
    <div class="text-gray-600 text-sm mt-1">${knowledgeData.definition_zh}</div>
  </div>`;
};

// 为文本块应用知识点高亮
const applyKnowledgeHighlight = (block, sceneIndex, knowledgeMap) => {
	let text = block.text;

	// 遍历所有知识点，应用高亮
	Array.from(knowledgeMap.values()).forEach((knowledge) => {
		if (knowledge.scenes.has(`Scene${sceneIndex + 1}`)) {
			// 先尝试用 origin 匹配
			const originRegex = new RegExp(knowledge.origin, "gi");
			if (block.text.match(originRegex)) {
				text = text.replace(
					originRegex,
					`<mark class="highlight-knowledge">${knowledge.origin}</mark>`
				);
			} else {
				// 如果 origin 没有匹配到，尝试用 word 匹配
				const wordRegex = new RegExp(knowledge.word, "gi");
				if (block.text.match(wordRegex)) {
					// 如果 word 匹配到了，更新 knowledge.origin
					knowledge.origin = knowledge.word;
					text = text.replace(
						wordRegex,
						`<mark class="highlight-knowledge">${knowledge.word}</mark>`
					);
				}
			}
		}
	});

	block.displayText = text;
};

const handleGenerateKnowledge = async (index) => {
	const block = currentBlocks.value[index];
	if (!block) return;

	try {
		isLoading.value = true;
		processingBlockId.value = block.id;
		const existingKnowledges = Array.from(currentKnowledge.value.values())
			.filter((k) => block.text.toLowerCase().includes(k.origin.toLowerCase()))
			.map((k) => k.word);

		// 1. 提取关键词
		const phrases = await extractKeyPhrases(block.text, existingKnowledges);
		if (!phrases || phrases.length === 0) {
			return;
		}

		// 2. 生成知识点
		const knowledgeDataArray = await generateKnowledge(phrases);
		if (!knowledgeDataArray || knowledgeDataArray.length === 0) {
			showToast({ message: "生成知识点失败", type: "warning" });
			return;
		}

		const sceneId = `Scene${currentIndex.value + 1}`;
		let displayText = block.displayText || block.text;

		// 获取现有知识点数量作为起始索引
		const startKnowledgeCount = currentBlocks.value.filter(
			(b) => b.isKnowledge && b.id.startsWith(`knowledge_${block.id}_`)
		).length;

		// 3. 处理每个知识点
		knowledgeDataArray.forEach((knowledgeData, arrayIndex) => {
			// 添加到知识点集合
			knowledgeData.scenes = new Set([sceneId]);
			currentKnowledge.value.set(knowledgeData.word, knowledgeData);

			// 创建知识点块
			const knowledgeBlock = {
				id: `knowledge_${block.id}_${startKnowledgeCount + arrayIndex}`,
				text: formatKnowledgeDisplay(
					knowledgeData,
					`knowledge_${block.id}_${startKnowledgeCount + arrayIndex}`
				),
				isTitle: false,
				isKnowledge: true,
				narration: false,
				isTranslated: false,
				knowledgeData: knowledgeData,
			};

			// 查找插入位置
			const blockId = block.id || block.originalIndex;
			const translationId = `translation-${blockId}`;
			const translationIndex = currentBlocks.value.findIndex(
				(b) => b.id === translationId || b.originalIndex === translationId
			);

			// 找到最后一个相关的知识点块的位置
			const lastKnowledgeIndex = [...currentBlocks.value]
				.reverse()
				.findIndex(
					(b) => b.isKnowledge && b.id.startsWith(`knowledge_${block.id}_`)
				);

			const insertIndex =
				lastKnowledgeIndex !== -1
					? currentBlocks.value.length - lastKnowledgeIndex
					: translationIndex >= 0
					? translationIndex + 1
					: index + 1;

			// 插入知识点块
			currentBlocks.value.splice(insertIndex, 0, knowledgeBlock);

			// 高亮原文中的知识点
			const originRegex = new RegExp(knowledgeData.origin, "gi");
			if (displayText.match(originRegex)) {
				displayText = displayText.replace(
					originRegex,
					`<mark class="highlight-knowledge">${knowledgeData.origin}</mark>`
				);
			} else {
				const wordRegex = new RegExp(knowledgeData.word, "gi");
				if (displayText.match(wordRegex)) {
					knowledgeData.origin = knowledgeData.word;
					displayText = displayText.replace(
						wordRegex,
						`<mark class="highlight-knowledge">${knowledgeData.word}</mark>`
					);
				}
			}
		});

		// 更新块的显示文本
		block.displayText = displayText;

		// 更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, sceneIndex) =>
				sceneIndex === currentIndex.value ? currentBlocks.value : scene
			)
		);

		hasUnsavedChanges.value = true;
		showToast({ message: "知识点生成成功", type: "success" });
	} catch (error) {
		console.error("处理知识点失败:", error);
		showToast({ message: "处理知识点失败，请重试", type: "error" });
	} finally {
		processingBlockId.value = null;
		isLoading.value = false;
	}
};

const handleManualGenerateKnowledge = async (selectedTexts) => {
	const block = selectedBlock.value;
	if (!block) return;

	try {
		isLoading.value = true;
		processingBlockId.value = block.id;

		// 过滤掉已存在的知识点文本
		const existingKnowledgeBlocks = currentBlocks.value.filter((b) => {
			return b.isKnowledge && b.id.startsWith(`knowledge-${block.id}`);
		});

		const filteredTexts = selectedTexts.filter((text) => {
			const lowerText = text.toLowerCase();
			return !existingKnowledgeBlocks.some((block) => {
				const knowledge = block.knowledgeData;
				const lowerWord = knowledge.word.toLowerCase();
				const lowerOrigin = knowledge.origin.toLowerCase();
				return (
					lowerText.includes(lowerWord) ||
					lowerWord.includes(lowerText) ||
					lowerText.includes(lowerOrigin) ||
					lowerOrigin.includes(lowerText)
				);
			});
		});

		if (filteredTexts.length === 0) {
			showToast({ message: "所选知识点已存在", type: "warning" });
			return;
		}

		const formattedTexts = filteredTexts.map((text) => `${text}/${text}`);
		console.log(formattedTexts);
		// 并行处理所有选中的文本
		const knowledgeResults = await apiClient.post(
			"/translation/generate-knowledge-batch",
			{
				words: formattedTexts,
			}
		);

		if (knowledgeResults.data.code !== 200) {
			showToast({ message: "生成知识点失败", type: "warning" });
			return;
		}

		// 过滤掉生成失败的结果
		const validKnowledgeData = knowledgeResults.data.data;

		// 处理所有成功生成的知识点
		const sceneId = `Scene${currentIndex.value + 1}`;
		let displayText = block.displayText || block.text;

		validKnowledgeData.forEach((knowledgeData, index) => {
			console.log(knowledgeData);
			// 添加到知识点集合
			knowledgeData.scenes = new Set([sceneId]);
			currentKnowledge.value.set(knowledgeData.word, knowledgeData);

			// 创建知识点块
			const existingKnowledgeCount = currentBlocks.value.filter(
				(b) => b.isKnowledge && b.id.startsWith(`knowledge_${block.id}_`)
			).length;

			const knowledgeBlock = {
				id: `knowledge_${block.id}_${existingKnowledgeCount + index}`,
				text: formatKnowledgeDisplay(
					knowledgeData,
					`knowledge_${block.id}_${existingKnowledgeCount + index}`
				),
				isTitle: false,
				isKnowledge: true,
				narration: false,
				isTranslated: false,
				knowledgeData: knowledgeData,
			};

			// 查找插入位置
			const blockId = block.id || block.originalIndex;
			const translationId = `translation-${blockId}`;
			const translationIndex = currentBlocks.value.findIndex(
				(b) => b.id === translationId || b.originalIndex === translationId
			);

			const lastKnowledgeIndex = [...currentBlocks.value]
				.reverse()
				.findIndex(
					(b) => b.isKnowledge && b.id.startsWith(`knowledge_${block.id}_`)
				);

			const insertIndex =
				lastKnowledgeIndex !== -1
					? currentBlocks.value.length - lastKnowledgeIndex
					: translationIndex >= 0
					? translationIndex + 1
					: block.index + 1;

			// 插入知识点块
			currentBlocks.value.splice(insertIndex, 0, knowledgeBlock);

			// 高亮原文中的知识点
			const originRegex = new RegExp(knowledgeData.origin, "gi");
			if (displayText.match(originRegex)) {
				displayText = displayText.replace(
					originRegex,
					`<mark class="highlight-knowledge">${knowledgeData.origin}</mark>`
				);
			} else {
				const wordRegex = new RegExp(knowledgeData.word, "gi");
				if (displayText.match(wordRegex)) {
					knowledgeData.origin = knowledgeData.word;
					displayText = displayText.replace(
						wordRegex,
						`<mark class="highlight-knowledge">${knowledgeData.word}</mark>`
					);
				}
			}
		});

		block.displayText = displayText;

		hasUnsavedChanges.value = true;

		// 更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, sceneIndex) =>
				sceneIndex === currentIndex.value ? currentBlocks.value : scene
			)
		);

		showToast({ message: "知识点生成成功", type: "success" });
	} catch (error) {
		console.error("生成知识点失败:", error);
		showToast({ message: "生成知识点失败，请重试", type: "error" });
	} finally {
		processingBlockId.value = null;
		isLoading.value = false;
	}
};

const handleToggleNarration = (index) => {
	const block = currentBlocks.value[index];
	if (!block || block.isTitle || block.isTranslated || block.isKnowledge)
		return;

	console.log(block);

	// 切换 narration 状态
	block.narration = !block.narration;

	if (!block.narration && block.speaker) {
		block.speaker = "";
	}

	// 更新场景数据
	emit(
		"update:scenes",
		props.scenes.map((scene, sceneIndex) =>
			sceneIndex === currentIndex.value ? currentBlocks.value : scene
		)
	);

	hasUnsavedChanges.value = true;
};

// 分割场景
const handleSplitScene = (index) => {
	// 1. 获取当前场景并分割
	const currentScene = [...currentBlocks.value];
	const firstPart = currentScene.slice(0, index);
	const secondPart = currentScene.slice(index);
	const newSceneNumber = currentIndex.value + 1;

	// 2. 更新已删除知识点的场景索引和块ID
	deletedKnowledge.value.forEach((item) => {
		// 如果知识点属于被分割的场景，检查是否应该移动到新场景
		if (item.sceneIndex === currentIndex.value) {
			// 检查知识点是否在第二部分中
			const isInSecondPart = secondPart.some((block) =>
				block.text?.toLowerCase().includes(item.word.toLowerCase())
			);
			if (isInSecondPart) {
				item.sceneIndex = newSceneNumber;
			}
		}
		// 更新块ID
		item.blocks = item.blocks.map((block) => {
			const idMatch = block.id.match(/knowledge[_-]block_(\d+)_(\d+)/);
			if (idMatch) {
				const blockSceneIndex = parseInt(idMatch[1]);
				if (blockSceneIndex > currentIndex.value) {
					return {
						...block,
						id: block.id.replace(
							`block_${blockSceneIndex}_`,
							`block_${blockSceneIndex + 1}_`
						),
					};
				}
			}
			return block;
		});
	});

	// 3. 为新场景添加标题
	const newSceneTitle = {
		id: `title_${newSceneNumber}`,
		text: `# New Scene`,
		isTitle: true,
	};
	secondPart.unshift(newSceneTitle);

	// 4. 更新第二个场景中所有块的ID
	let currentBlockIndex = 0;
	for (let i = 0; i < secondPart.length; i++) {
		const block = secondPart[i];
		if (block.isTitle) continue;

		if (!block.isTranslated && !block.isKnowledge) {
			// 更新原文块ID
			const oldId = block.id;
			block.id = `block_${newSceneNumber}_${currentBlockIndex}`;

			// 更新翻译块ID
			const translationBlock = secondPart.find(
				(b) =>
					b.isTranslated &&
					(b.originalId === oldId || b.id === `translation-${oldId}`)
			);
			if (translationBlock) {
				translationBlock.id = `translation-block_${newSceneNumber}_${currentBlockIndex}`;
				translationBlock.originalId = block.id;
			}

			// 更新知识点块ID和播客数据
			const knowledgeBlocks = secondPart.filter(
				(b) => b.isKnowledge && b.id.startsWith(`knowledge-${oldId}`)
			);
			knowledgeBlocks.forEach((kb, kIndex) => {
				const oldKnowledgeId = kb.id;
				const newKnowledgeId = `knowledge-block_${newSceneNumber}_${currentBlockIndex}-${kIndex}`;

				// 更新知识点块ID
				kb.id = newKnowledgeId;
				kb.originalId = block.id;

				// 更新播客数据
				if (podcastBlocksMap.value.has(oldKnowledgeId)) {
					const podcastData = podcastBlocksMap.value.get(oldKnowledgeId);
					podcastData.sceneIndex = newSceneNumber;
					podcastBlocksMap.value.delete(oldKnowledgeId);
					podcastBlocksMap.value.set(newKnowledgeId, podcastData);
				}
			});

			currentBlockIndex++;
		}
	}

	// 5. 更新场景数据
	const updatedScenes = [...props.scenes];
	updatedScenes[currentIndex.value] = firstPart;
	updatedScenes.splice(currentIndex.value + 1, 0, secondPart);

	// 6. 更新后续场景的编号和ID
	for (let i = currentIndex.value + 2; i < updatedScenes.length; i++) {
		const scene = updatedScenes[i];
		const sceneNumber = i;

		// 更新场景标题
		const sceneTitle = scene.find((block) => block.isTitle);
		if (sceneTitle) {
			sceneTitle.id = `title_${sceneNumber}`;
		}

		// 更新场景中所有块的ID
		let blockIndex = 0;
		scene.forEach((block) => {
			if (block.isTitle) return;

			if (!block.isTranslated && !block.isKnowledge) {
				const oldId = block.id;
				block.id = `block_${sceneNumber}_${blockIndex}`;

				// 更新翻译块
				const translationBlock = scene.find(
					(b) =>
						b.isTranslated &&
						(b.originalId === oldId || b.id === `translation-${oldId}`)
				);
				if (translationBlock) {
					translationBlock.id = `translation-block_${sceneNumber}_${blockIndex}`;
					translationBlock.originalId = block.id;
				}

				// 更新知识点块
				const knowledgeBlocks = scene.filter(
					(b) => b.isKnowledge && b.id.startsWith(`knowledge-${oldId}`)
				);
				knowledgeBlocks.forEach((kb, kIndex) => {
					kb.id = `knowledge-block_${sceneNumber}_${blockIndex}-${kIndex}`;
					kb.originalId = block.id;
				});

				blockIndex++;
			}
		});
	}

	// 7. 更新状态和UI
	emit("update:scenes", updatedScenes);
	currentIndex.value = newSceneNumber;
	currentBlocks.value = secondPart;
	selectedBlockIndex.value = null;
	hasUnsavedChanges.value = true;

	showToast({ message: "场景分割成功", type: "success" });
};

const isMerging = ref(false);
// 合并场景
const handleMergeScenes = async (index) => {
	console.log(index);
	isMerging.value = true;

	// 添加动画类到要合并的卡带（当前点击的卡带）
	const cartridgeElement = document.querySelectorAll(".cartridge")[index];
	if (cartridgeElement) {
		cartridgeElement.classList.add("cartridge-merging");
	}

	// 等待动画完成后再执行合并
	await new Promise((resolve) => setTimeout(resolve, 800));

	// 获取要合并的两个场景（当前点击的场景和它的上一个场景）
	const targetIndex = index - 1; // 目标场景索引（上一个场景）
	const upperScene = [...props.scenes[targetIndex]];
	const lowerScene = [...props.scenes[index]]; // 当前点击的场景

	// 获取上面场景中最后一个非标题块的索引
	let lastUpperBlockIndex = 0;
	upperScene.forEach((block) => {
		if (!block.isTitle && !block.isTranslated && !block.isKnowledge) {
			lastUpperBlockIndex++;
		}
	});

	// 更新下面场景中所有块的 ID
	let blockIndex = lastUpperBlockIndex;
	lowerScene.forEach((block) => {
		if (block.isTitle) return;

		if (!block.isTranslated && !block.isKnowledge) {
			// 更新原文块 ID
			const oldId = block.id;
			block.id = `block_${targetIndex}_${blockIndex}`;

			// 更新翻译块
			const translationBlock = lowerScene.find(
				(b) =>
					b.isTranslated &&
					(b.originalId === oldId || b.id === `translation-${oldId}`)
			);
			if (translationBlock) {
				translationBlock.id = `translation-block_${targetIndex}_${blockIndex}`;
				translationBlock.originalId = block.id;
			}

			// 更新知识点块和相关的播客数据
			const knowledgeBlocks = lowerScene.filter(
				(b) => b.isKnowledge && b.id.startsWith(`knowledge-${oldId}`)
			);
			knowledgeBlocks.forEach((kb, kIndex) => {
				const oldKnowledgeId = kb.id;
				// 直接使用原始的 kIndex，不加上 upperKnowledgeCount
				const newKnowledgeId = `knowledge-block_${targetIndex}_${blockIndex}-${kIndex}`;

				// 更新知识点块ID
				kb.id = newKnowledgeId;
				kb.originalId = block.id;

				// 更新播客数据
				if (podcastBlocksMap.value.has(oldKnowledgeId)) {
					const podcastData = podcastBlocksMap.value.get(oldKnowledgeId);
					podcastData.sceneIndex = targetIndex;
					podcastBlocksMap.value.delete(oldKnowledgeId);
					podcastBlocksMap.value.set(newKnowledgeId, podcastData);
				}
			});

			blockIndex++;
		}
	});

	// 移除下面场景的标题块
	const mergedScene = [
		...upperScene,
		...lowerScene.filter((block) => !block.isTitle),
	];

	// 更新场景数据
	const updatedScenes = [...props.scenes];
	updatedScenes[targetIndex] = mergedScene;
	updatedScenes.splice(index, 1);

	// 更新后续场景的编号和块ID
	for (let i = targetIndex + 1; i < updatedScenes.length; i++) {
		const scene = updatedScenes[i];
		const sceneNumber = i;
		let blockIndex = 0;

		// 更新场景标题
		const sceneTitle = scene.find((block) => block.isTitle);
		if (sceneTitle) {
			sceneTitle.id = `title_${sceneNumber}`;
		}

		// 更新场景中所有块的 ID
		scene.forEach((block) => {
			if (block.isTitle) return;

			if (!block.isTranslated && !block.isKnowledge) {
				// 更新原文块 ID
				const oldId = block.id;
				block.id = `block_${sceneNumber}_${blockIndex}`;

				// 更新翻译块
				const translationBlock = scene.find(
					(b) =>
						b.isTranslated &&
						(b.originalId === oldId || b.id === `translation-${oldId}`)
				);
				if (translationBlock) {
					translationBlock.id = `translation-block_${sceneNumber}_${blockIndex}`;
					translationBlock.originalId = block.id;
				}

				// 更新知识点块和相关的播客数据
				const knowledgeBlocks = scene.filter(
					(b) => b.isKnowledge && b.id.startsWith(`knowledge-${oldId}`)
				);
				knowledgeBlocks.forEach((kb, kIndex) => {
					const oldKnowledgeId = kb.id;
					const newKnowledgeId = `knowledge-block_${sceneNumber}_${blockIndex}-${kIndex}`;

					// 更新知识点块ID
					kb.id = newKnowledgeId;
					kb.originalId = block.id;

					// 更新播客数据
					if (podcastBlocksMap.value.has(oldKnowledgeId)) {
						const podcastData = podcastBlocksMap.value.get(oldKnowledgeId);
						// 更新场景索引
						podcastData.sceneIndex = sceneNumber;
						// 使用新的知识点块ID作为key
						podcastBlocksMap.value.delete(oldKnowledgeId);
						podcastBlocksMap.value.set(newKnowledgeId, podcastData);
					}
				});

				blockIndex++;
			}
		});
	}

	// 发送更新事件
	emit("update:scenes", updatedScenes);

	// 更新当前场景索引 - 始终切换到合并后的场景（目标场景）
	currentIndex.value = targetIndex;

	// 更新当前显示的场景内容
	currentBlocks.value = updatedScenes[currentIndex.value];

	isMerging.value = false;
	hasUnsavedChanges.value = true;
	showToast({ message: "场景合并成功", type: "success" });
};

// 在现有的方法后添加场景删除功能
const handleDeleteScene = async (index) => {
	// 检查是否只剩下一个场景，不允许删除最后一个场景
	if (props.scenes.length <= 1) {
		showToast({ message: "无法删除唯一的场景", type: "warning" });
		return;
	}

	// 确认删除
	if (!confirm(`确定要删除第 ${index + 1} 个场景吗？此操作不可撤销。`)) {
		return;
	}

	// 获取要删除的场景
	const sceneToDelete = props.scenes[index];

	// 创建更新后的场景数组
	const updatedScenes = [...props.scenes];
	updatedScenes.splice(index, 1);

	// 更新后续场景的编号和ID
	for (let i = index; i < updatedScenes.length; i++) {
		const scene = updatedScenes[i];
		const sceneNumber = i;
		let blockIndex = 0;

		// 更新场景标题
		const sceneTitle = scene.find((block) => block.isTitle);
		if (sceneTitle) {
			sceneTitle.id = `title_${sceneNumber}`;
		}

		// 更新场景中所有块的ID
		scene.forEach((block) => {
			if (block.isTitle) return;

			if (!block.isTranslated && !block.isKnowledge) {
				// 更新原文块ID
				const oldId = block.id;
				block.id = `block_${sceneNumber}_${blockIndex}`;

				// 更新翻译块
				const translationBlock = scene.find(
					(b) =>
						b.isTranslated &&
						(b.originalId === oldId || b.id === `translation-${oldId}`)
				);
				if (translationBlock) {
					translationBlock.id = `translation-block_${sceneNumber}_${blockIndex}`;
					translationBlock.originalId = block.id;
				}

				// 更新知识点块和相关的播客数据
				const knowledgeBlocks = scene.filter(
					(b) => b.isKnowledge && b.id.startsWith(`knowledge-${oldId}`)
				);
				knowledgeBlocks.forEach((kb, kIndex) => {
					const oldKnowledgeId = kb.id;
					const newKnowledgeId = `knowledge-block_${sceneNumber}_${blockIndex}-${kIndex}`;

					// 更新知识点块ID
					kb.id = newKnowledgeId;
					kb.originalId = block.id;

					// 更新播客数据
					if (podcastBlocksMap.value.has(oldKnowledgeId)) {
						const podcastData = podcastBlocksMap.value.get(oldKnowledgeId);
						// 更新场景索引
						podcastData.sceneIndex = sceneNumber;
						// 使用新的知识点块ID作为key
						podcastBlocksMap.value.delete(oldKnowledgeId);
						podcastBlocksMap.value.set(newKnowledgeId, podcastData);
					}
				});

				blockIndex++;
			}
		});
	}

	// 发送更新事件
	emit("update:scenes", updatedScenes);

	// 更新当前场景索引
	if (currentIndex.value === index) {
		// 如果删除的是当前场景，切换到前一个场景或第一个场景
		currentIndex.value = index > 0 ? index - 1 : 0;
	} else if (currentIndex.value > index) {
		// 如果删除的场景在当前场景之前，当前索引减1
		currentIndex.value--;
	}

	// 更新当前显示的场景内容
	currentBlocks.value = updatedScenes[currentIndex.value];

	hasUnsavedChanges.value = true;
	showToast({ message: "场景删除成功", type: "success" });
};

const handleAutoGenerateTitle = async (index) => {
	try {
		isLoading.value = true;

		// 获取当前场景的所有非标题文本
		const sceneText = currentBlocks.value
			.filter(
				(block) => !block.isTitle && !block.isTranslated && !block.isKnowledge
			)
			.map((block) => block.text)
			.join("\n")
			.slice(0, 1000); // 限制文本长度

		// 调用 API 生成标题
		const response = await apiClient.post("/translation/generate-title", {
			text: sceneText,
		});

		if (response.data.code === 200) {
			// 更新标题
			const newTitle = response.data.data.title;
			currentBlocks.value[index].text = `# ${newTitle}`;

			// 更新场景
			emit(
				"update:scenes",
				props.scenes.map((scene, sceneIndex) =>
					sceneIndex === currentIndex.value ? currentBlocks.value : scene
				)
			);

			hasUnsavedChanges.value = true;

			showToast({ message: "标题生成成功", type: "success" });
		}
	} catch (error) {
		console.error("生成标题失败:", error);
		showToast({ message: "生成标题失败，请重试", type: "error" });
	} finally {
		isLoading.value = false;
	}
};

watch(
	() => props.scenes,
	async (newScenes) => {
		if (newScenes.length > 0) {
			// 只在初始化时设置当前场景
			if (currentIndex.value === null) {
				currentIndex.value = 0;
			}
			// 更新当前场景的内容
			currentBlocks.value = newScenes[currentIndex.value];

			// 只在手动更新场景时重新初始化知识点
			if (!route.query.sign) {
				await initKnowledgeDisplay();
			}
		}
	},
	{ immediate: false } // 初始化在 initializeView 中处理
);

const handleTranslationEdit = (event, index) => {
	const newText = event.target.innerText.trim();
	const oldText = currentBlocks.value[index].text;

	// 只有当文本确实发生变化时才进行更新
	if (newText !== oldText) {
		if (newText === "") {
			// 删除空的翻译行
			currentBlocks.value.splice(index, 1);
		} else {
			// 更新翻译文本
			currentBlocks.value[index].text = newText;
		}

		// 标记有未保存的更改
		hasUnsavedChanges.value = true;

		// 通知父组件更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, sceneIndex) =>
				sceneIndex === currentIndex.value ? currentBlocks.value : scene
			)
		);
	}
};

// 处理打开说话者选择弹窗
const handleToggleSpeaker = (index) => {
	// 先设置选中的块索引
	selectedBlockIndex.value = index;
	showSpeakerDropdown.value = true;

	// 如果当前块已有说话者，预填充
	if (currentBlocks.value[index].speaker) {
		newSpeaker.value = currentBlocks.value[index].speaker;
	} else {
		newSpeaker.value = "";
	}

	nextTick(() => {
		speakerModalRef.value?.showModal();
	});
};

// 添加新的处理函数
const handleSpeakerUpdate = (speaker) => {
	speakers.value.add(speaker);
};

// 新增确认按钮处理函数
const handleConfirmSpeaker = (speaker) => {
	if (selectedBlockIndex.value === null) return;

	const block = currentBlocks.value[selectedBlockIndex.value];
	if (speaker) {
		// 添加到说话者集合
		speakers.value.add(speaker);
		// 更新块的说话者
		block.speaker = speaker;
	} else {
		// 输入为空时，删除说话者属性
		delete block.speaker;
	}
	// 更新场景数据
	emit(
		"update:scenes",
		props.scenes.map((scene, index) =>
			index === currentIndex.value ? currentBlocks.value : scene
		)
	);

	hasUnsavedChanges.value = true;

	// 关闭模态框
	speakerModalRef.value?.close();
};

// 移除说话者
const removeSpeaker = (speaker) => {
	speakers.value.delete(speaker);
	localStorage.setItem("speakers", JSON.stringify(Array.from(speakers.value)));
};

// 计算过滤后的说话者列表
const filteredSpeakers = computed(() => {
	return Array.from(speakers.value);
});

const handleSceneUpdate = (updatedScenes) => {
	hasUnsavedChanges.value = true;
	emit("update:scenes", updatedScenes); // 向上传递更新事件
};
</script>

<style scoped>
.editor-container {
	position: relative;
	text-align: left;
	height: calc(100vh - 150px);
	border: 3px solid #333;
	border-radius: 12px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
	overflow: visible;
}

.editor-wrapper {
	position: relative; /* 确保定位上下文正确 */
	height: 100%;
	overflow-y: auto;
	border-radius: 12px;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.editor-wrapper::-webkit-scrollbar {
	display: none;
}

.card-view {
	position: relative;
	height: fit-content;
}

.decorated-card {
	background: white;
	border-radius: 0.75rem;
}

/* 场景缩略图样式 */
.scene-thumbnails-container {
	position: absolute;
	top: -3px;
	right: -180px;
}

.scene-thumbnails {
	width: 100%;
	max-height: calc(100vh - 150px);
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	padding: 0.5rem;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(5px);
}

.scene-thumbnail {
	padding: 0.5rem;
	border: 1px solid #ddd;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s;
	background: white;
	min-height: 100px;
}

.scene-thumbnail:hover {
	border-color: #999;
	transform: translateX(-4px);
}

.scene-thumbnail.active {
	border-color: #333;
	background: #f8f8f8;
}

.thumbnail-content {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.thumbnail-title {
	font-size: 14px;
	font-weight: 800;
	line-height: 1.4;
	min-height: 2.8em;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.thumbnail-preview {
	font-size: 0.75rem;
	color: #666;
	line-height: 1.4;
	max-height: 2.8em;
	overflow: hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.editor-action-buttons {
	position: absolute;
	left: -80px;
	top: 20px;
	display: flex;
	flex-direction: column;
	pointer-events: auto;
	gap: 20px;
	z-index: 100;
	background-color: rgba(255, 255, 255, 0.8);
	padding: 12px;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(5px);
}

.retro-btn {
	position: relative;
	width: 36px;
	height: 36px;
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
}

/* 按钮交互效果 */
.retro-btn:hover:not(:disabled) .btn-face {
	background-color: white;
}

.retro-btn:active:not(:disabled) .btn-edge,
.retro-btn:active:not(:disabled) .btn-face {
	transform: translateY(0);
}

.translated-text {
	color: #4b5563;
	font-style: italic;
	background-color: #f8fafc;
	margin-top: -0.5rem !important; /* 添加负的上边距，使翻译文本向上移动 */
	padding-top: 0.25rem; /* 添加上内边距，保持文本不会太靠近原文 */
}

.original-text
	.text-sm.p-2.rounded:not(.translated-text):not(.knowledge-block) {
	margin-bottom: 0.25rem; /* 减小原文块的下边距 */
}

.knowledge-block {
	cursor: default;
	background-color: rgba(var(--milk-color-rgb), 0.5);
	border-radius: 0.5rem;
	margin: 0.75rem 0;
	border-left: 3px solid rgba(var(--secondary-color-rgb), 1);
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

[contenteditable="true"] {
	outline: none; /* 移除点击时的边框 */
	border: none; /* 移除默认边框 */
	padding: 2px; /* 保持一些内边距以提升可读性 */
}

[contenteditable="true"]:focus {
	outline: none; /* 移除聚焦时的边框 */
}

.interactive-text {
	cursor: default;
}

.word-span {
	padding: 2px 4px;
	border-radius: 4px;
	transition: all 0.2s ease;
	display: inline-block;
}

.word-highlight {
	background-color: rgba(246, 243, 59, 1);
	/* color: rgb(246, 239, 22); */
}

.loading-overlay {
	overflow: hidden;
	opacity: 0;
	animation: fade-in 0.3s ease forwards;
	z-index: 1000; /* 添加较高的 z-index */
	pointer-events: none;
}
.loading-overlay::before,
.loading-overlay::after {
	pointer-events: none; /* 不接收鼠标事件 */
}

.loading-overlay::before {
	content: " ";
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
	background-size: 100% 4px;
	pointer-events: none;
	animation: flicker 0.3s infinite;
}

.loading-overlay::after {
	content: "01010101";
	position: absolute;
	top: -10%;
	left: 0;
	width: 100%;
	height: 120%;
	writing-mode: vertical-rl;
	text-orientation: upright;
	background: linear-gradient(
		180deg,
		transparent 0%,
		rgba(var(--primary-color-rgb), 0.05) 25%,
		rgba(var(--secondary-color-rgb), 0.05) 75%,
		transparent 100%
	);
	background-size: 100% 200%;
	color: rgba(var(--secondary-color-rgb), 0.1);
	font-family: monospace;
	font-size: 10px;
	letter-spacing: 2px;
	line-height: 12px;
	animation: matrix-rain 2s linear infinite;
}

@keyframes fade-in {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.crt-loading {
	position: relative;
	padding: 2rem;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.1);
}

.loading-overlay::before {
	content: " ";
	display: block;
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
	background-size: 100% 4px;
	pointer-events: none;
}

.merge-button-container {
	display: flex;
	justify-content: center;
	margin: -0.5rem 0;
	position: relative;
	z-index: 1;
}

.merge-button {
	background: transparent;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
	color: #c9c9c9;
}

.merge-button:hover {
	color: #333; /* 深色图标 */
	transform: scale(1.1);
}
</style>
<style>
/* 知识点按钮样式 - 全局定义以应用于动态生成的内容 */
.knowledge-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border-radius: 4px;
	background: transparent;
	border: none;
	cursor: pointer;
	margin-left: 4px;
	transition: all 0.2s;
}

.knowledge-btn:hover {
	background-color: rgba(0, 0, 0, 0.05);
}

.knowledge-detail-btn {
	color: #222; /* 蓝色 */
}

.knowledge-delete-btn {
	color: #222; /* 红色 */
}

.knowledge-btn i {
	font-size: 14px;
}

/* 悬浮按钮组样式 */
.fixed-action-buttons {
	position: fixed;
	right: 20px;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	flex-direction: column;
	gap: 15px;
	z-index: 100;
	background-color: rgba(255, 255, 255, 0.8);
	padding: 12px;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(5px);
}

/* 确保tooltip正确显示 */
.fixed-action-buttons .tooltip {
	margin: 5px 0;
}

/* 卡带容器样式 */
.cartridge-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
}

/* 添加合并动画相关样式 */
.cartridge-merging {
	animation: merge-animation 0.8s ease-in-out;
}

@keyframes merge-animation {
	0% {
		transform: translateY(0);
		opacity: 1;
	}
	50% {
		transform: translateY(-40px);
		opacity: 0.5;
	}
	100% {
		transform: translateY(-80px);
		opacity: 0;
	}
}

/* 连接器按钮动画 */
.connector-btn-merging {
	animation: connector-merge 0.8s ease-in-out;
}

@keyframes connector-merge {
	0% {
		transform: translate(-50%, -50%) scale(1);
	}
	50% {
		transform: translate(-50%, -50%) scale(1.2);
		background: #555;
	}
	100% {
		transform: translate(-50%, -50%) scale(1);
	}
}

/* 卡带主体样式 */
.cartridge {
	width: 140px;
	background: #fff;
	border-radius: 4px;
	padding: 8px;
	cursor: pointer;
	position: relative;
	border: 2px solid #eee;
	margin-bottom: 12px;
}

/* 卡带激活状态 */
.cartridge-active {
	background: #f0f0f0;
	border-color: #333;
	box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 卡带顶部纹路 */
.cartridge-ridges {
	display: flex;
	justify-content: space-between;
	padding: 4px 0;
}

.ridge {
	width: 12px;
	height: 3px;
	background: #f0f0f0;
	border-radius: 1px;
}

/* 卡带标签区域 */
.cartridge-label {
	background: #f8f8f8;
	padding: 8px;
	border-radius: 2px;
	margin: 8px 0;
	border: 1px solid #eee;
}

.cartridge-title {
	color: #333;
	margin-bottom: 4px;
}

.cartridge-number {
	color: #666;
	font-size: 0.75rem;
}

/* 激活状态下的文字颜色 */
.cartridge-active .cartridge-label {
	background: #e8e8e8;
	border-color: #ddd;
}

.cartridge-active .cartridge-title {
	color: #333;
}

.cartridge-active .cartridge-number {
	color: #666;
}

.cartridge-active .ridge {
	background: rgba(0, 0, 0, 0.1);
}

.cartridge-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding: 0 8px;
	margin-top: 4px;
	/* 移除透明度和过渡效果，让按钮始终显示 */
	opacity: 1;
}

.right-actions {
	display: flex;
	gap: 8px;
	transform: rotate(5deg); /* 添加整体旋转角度 */
	margin-top: 2px; /* 微调位置 */
}

/* 添加手柄轮廓效果 */
.right-actions::before {
	content: "";
	position: absolute;
	top: -2px;
	left: -2px;
	right: -2px;
	bottom: -2px;
	background-color: #f6f6f6;
	border-radius: 14px;
	z-index: -1;
	box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
}

/* 添加手柄纹理效果 */
.right-actions::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(
		135deg,
		transparent 0%,
		rgba(255, 255, 255, 0.1) 50%,
		transparent 100%
	);
	border-radius: 12px;
	z-index: -1;
}

.action-btn {
	width: 18px;
	height: 18px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 10px;
	/* 复古游戏手柄按钮风格 */
	background-color: #f8f8f8;
	/* border: 1px solid #999; */
	box-shadow: inset 0 -2px 0 #999, 0 1px 2px rgba(0, 0, 0, 0.2);
	transition: all 0.1s ease;
}

.action-btn:hover {
	transform: translateY(1px);
	box-shadow: inset 0 -1px 0 #999, 0 0 1px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
	transform: translateY(2px);
	box-shadow: none;
}

/* 拖动按钮样式（摇杆风格） */
.drag-btn {
	background-color: #f8f8f8;
	border-color: #f8f8f8;
	color: #333;
	box-shadow: inset 0 -2px 0 #acacac, 0 1px 2px rgba(0, 0, 0, 0.1);
	width: 24px;
	height: 24px;
	font-size: 12px;
	position: relative;
	left: -2px;
}

.drag-btn:hover {
	box-shadow: inset 0 -1px 0 #acacac, 0 0 1px rgba(0, 0, 0, 0.1);
}

.drag-btn:active {
	transform: translateY(2px) rotate(15deg);
	box-shadow: none;
}

.merge-btn {
	transform: rotate(-3deg);
	color: #333;
}

.merge-btn:hover {
	color: white;
	background-color: color-mix(in srgb, var(--primary-color), #fff 10%);
	box-shadow: inset 0 -1px 0 var(--primary-color-dark, color-mix(in srgb, var(--primary-color), #000
						20%)),
		0 0 1px rgba(0, 0, 0, 0.2);
}

.delete-btn {
	transform: rotate(-3deg);
	color: #333;
}

.delete-btn:hover {
	color: white;
	background-color: #e25555;
	box-shadow: inset 0 -1px 0 #d23a3a, 0 0 1px rgba(0, 0, 0, 0.2);
}

/* 连接器样式 */
.cartridge-connector {
	width: 2px;
	/* height: 24px; */
	/* background: rgba(0, 0, 0, 0.1); */
	position: relative;
	margin: 8px 0;
}

.connector-btn {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: #fff;
	color: #666;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid #eee;
	transition: all 0.2s ease;
}

.connector-btn:hover {
	background: #f8f8f8;
	border-color: #ddd;
	transform: translate(-50%, -50%) scale(1.1);
}

/* 拖动时的样式 */
.ghost-card {
	opacity: 0.5;
	background: rgba(var(--primary-color-rgb), 0.4);
	border: 2px dashed var(--primary-color);
	border-radius: 8px;
}

.dragging-card {
	z-index: 100;
}

.dragging {
	transform: rotate(2deg);
	box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* 拖动按钮悬停效果 */
.drag-btn {
	cursor: grab;
	transition: all 0.2s;
}

.drag-btn:hover {
	color: var(--primary-color);
	transform: scale(1.1);
}

.drag-btn:active {
	cursor: grabbing;
}

/* 拖动时的过渡动画 */
.cartridge-container {
	transition: transform 0.2s ease, opacity 0.2s ease;
}
</style>
