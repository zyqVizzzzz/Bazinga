<template>
	<div
		class="card-view mx-auto flex gap-4 justify-center items-start w-4/5"
		v-if="viewMode === 'card'"
	>
		<div class="editor-container w-3/4">
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
				<div class="tooltip" data-tip="保存">
					<button class="retro-btn" @click="handleSave">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<i class="bi bi-save text-lg"></i>
								</div>
							</div>
						</div>
					</button>
				</div>
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
									@generate-knowledge="handleGenerateKnowledge(index)"
									@toggle-narration="handleToggleNarration(index)"
									@manual-knowledge="handleShowManualKnowledgeModal(index)"
									@split-scene="handleSplitScene(index)"
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
										<div v-html="block.displayText || block.text"></div>
									</div>

									<!-- 标题使用可编辑的 div -->
									<div
										class="title-container relative group"
										v-if="block.isTitle"
									>
										<div
											contenteditable="true"
											@blur="handleTitleEdit($event, index)"
											@keydown.enter.prevent="$event.target.blur()"
											v-html="block.text"
											class="pr-8"
										></div>
										<button
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
										contenteditable="true"
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
		</div>
		<!-- 场景缩略图列表 -->
		<div class="scene-thumbnails-container w-1/4">
			<div class="scene-thumbnails">
				<template v-for="(scene, index) in scenes" :key="index">
					<!-- 场景缩略图 -->
					<div
						class="scene-thumbnail"
						:class="{ active: currentIndex === index }"
						@click="switchScene(index)"
					>
						<div class="thumbnail-content">
							<div class="thumbnail-title truncate" v-if="scene[0]?.text">
								{{ scene[0].text.replace(/^#\s*/, "") }}
							</div>
							<div class="thumbnail-preview">
								{{ getScenePreview(scene) }}
							</div>
						</div>
					</div>

					<!-- 合并按钮，最后一个场景不显示 -->
					<div v-if="index < scenes.length - 1" class="merge-button-container">
						<button
							class="merge-button"
							@click="handleMergeScenes(index)"
							title="合并场景"
						>
							<i class="bi bi-arrows-collapse"></i>
						</button>
					</div>
				</template>
			</div>
		</div>

		<!-- 全局 Loading -->
		<div
			v-if="isLoading"
			class="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 rounded loading-overlay"
			style="border-radius: 12px"
		>
			<div class="crt-loading">
				<span class="loading loading-bars"></span>
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
		@generate-knowledge="handleManualGenerateKnowledge"
	/>

	<dialog ref="deleteConfirmModalRef" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">删除知识点</h3>
			<p class="py-4">确定要删除这个知识点吗？</p>
			<div class="modal-action justify-center">
				<form method="dialog" class="flex gap-2">
					<button
						class="btn btn-sm btn-secondary text-white"
						@click="handleConfirmDelete"
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
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from "vue";
import KnowledgeDetailModal from "./KnowledgeDetailModal.vue";
import TextBlockToolbar from "./TextBlockToolbar.vue";
import ManualKnowledgeModal from "./ManualKnowledgeModal.vue";

import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const route = useRoute();
const router = useRouter();

const props = defineProps({
	viewMode: {
		type: String,
		required: true,
	},
	scenes: {
		type: Array,
		required: true,
	},
	isCustom: {
		type: Boolean,
		default: false,
	},
});

const currentIndex = ref(0);
const currentBlocks = ref([]);
const blocksMap = ref(new Map()); // 用于存储和追踪所有文本块

const selectedBlockIndex = ref(null);
const justClosedToolbox = ref(false); // 记录是否刚刚关闭工具栏
const processingBlockId = ref(null);
const toolboxPosition = ref({ top: 0, left: 0 }); // 记录工具栏的位置

const knowledgeModalRef = ref(null);
const selectedKnowledge = ref(null); // 选中的知识点数据 - 查看详情
const manualKnowledgeModalRef = ref(null);

const deleteConfirmModalRef = ref(null);
const pendingDeleteWord = ref(null); // 待删除知识点
const deletedKnowledge = ref(new Set()); // 添加删除缓存

// 翻译
const translatingBlockId = ref(null);
// 知识点
const currentKnowledge = ref(new Map());
const autoSaving = ref(false);

const isLoading = ref(false);

const emit = defineEmits(["back", "save", "update:scenes"]);

onMounted(async () => {
	document.addEventListener("click", handleClickOutside);
	document.addEventListener("showKnowledgeDetail", (event) => {
		handleKnowledgeDetail(event.detail);
	});
	document.addEventListener("deleteKnowledge", (event) => {
		pendingDeleteWord.value = event.detail;
		deleteConfirmModalRef.value?.showModal();
	});
	document.addEventListener("regenerateKnowledge", handleRegenerateKnowledge);
	await initializeView();
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
});

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
		// 1. 添加到删除缓存
		deletedKnowledge.value.add(pendingDeleteWord.value);

		// 2. 从当前知识点集合中移除
		currentKnowledge.value.delete(pendingDeleteWord.value);

		// 3. 从当前场景中移除相关的知识点块
		const knowledgeBlockIndexes = [];
		currentBlocks.value.forEach((block, index) => {
			if (
				block.isKnowledge &&
				block.knowledgeData?.word === pendingDeleteWord.value
			) {
				knowledgeBlockIndexes.unshift(index); // 从后往前删除
			}
		});

		knowledgeBlockIndexes.forEach((index) => {
			currentBlocks.value.splice(index, 1);
		});

		// 4. 移除原文中的高亮
		currentBlocks.value.forEach((block) => {
			if (!block.isKnowledge && block.displayText) {
				const regex = new RegExp(
					`<mark class="highlight-knowledge">(${pendingDeleteWord.value})</mark>`,
					"gi"
				);
				block.displayText = block.displayText.replace(regex, "$1");
			}
		});

		// 5. 更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, index) =>
				index === currentIndex.value ? currentBlocks.value : scene
			)
		);

		// 6. 清空待删除词
		pendingDeleteWord.value = null;
	}
};

const groupTextByLength = async (blocks) => {
	const groups = [];
	let currentGroup = [];
	let currentLength = 0;
	const TARGET_LENGTH = 2000;

	// 过滤出原文内容
	const originalBlocks = blocks.filter(
		(block) =>
			!block.isTitle &&
			!block.isTranslated &&
			!block.isKnowledge &&
			!block.narration
	);

	originalBlocks.forEach((block) => {
		const text = block.text || "";
		const textLength = text.length;

		if (currentGroup.length === 0) {
			currentGroup.push(block);
			currentLength = textLength;
		} else {
			if (currentLength > TARGET_LENGTH) {
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

	// 为每组文本生成知识点
	groups.forEach(async (group, groupIndex) => {
		requestQueue.add(async () => {
			try {
				const originalTexts = group
					.filter(
						(block) =>
							!block.isTitle && !block.isTranslated && !block.isKnowledge
					)
					.map((block) => block.text)
					.join("\n");

				if (originalTexts) {
					const textLength = originalTexts.length;
					const maxPhrases = Math.ceil(textLength / 250);

					const phrasesResponse = await apiClient.post(
						"/translation/extract-key-phrases",
						{
							text: originalTexts,
							options: {
								maxPhrases: Math.max(1, Math.min(maxPhrases, 8)),
							},
						}
					);

					if (phrasesResponse.data.data.phrases) {
						// 3. 批量生成知识点
						const knowledgeResponse = await apiClient.post(
							"/translation/generate-knowledge-batch",
							{
								words: phrasesResponse.data.data.phrases,
							}
						);

						if (knowledgeResponse.data.data) {
							// 遍历每个原文块，检查是否包含知识点
							group.forEach((block) => {
								const blockText = block.text.toLowerCase();
								// 修改为查找所有匹配的知识点
								const matchedKnowledges = knowledgeResponse.data.data.filter(
									(k) => blockText.includes(k.origin.toLowerCase())
								);

								if (matchedKnowledges.length > 0) {
									// 高亮原文中的所有知识点
									let displayText = block.text;
									matchedKnowledges.forEach((knowledge) => {
										// 先尝试用 origin 匹配
										const originRegex = new RegExp(knowledge.origin, "gi");
										if (block.text.match(originRegex)) {
											displayText = displayText.replace(
												originRegex,
												`<mark class="highlight-knowledge">${knowledge.origin}</mark>`
											);
										} else {
											// 如果 origin 没有匹配到，尝试用 word 匹配
											const wordRegex = new RegExp(knowledge.word, "gi");
											if (block.text.match(wordRegex)) {
												// 如果 word 匹配到了，更新 knowledge.origin 为 word 的值
												knowledge.origin = knowledge.word;
												displayText = displayText.replace(
													wordRegex,
													`<mark class="highlight-knowledge">${knowledge.word}</mark>`
												);
											}
										}
									});
									block.displayText = displayText;

									// 找到原文块和翻译块的位置
									const blockIndex = currentBlocks.value.findIndex(
										(b) => b.id === block.id
									);
									const translationIndex = currentBlocks.value.findIndex(
										(b) => b.id === `translation-${block.id}`
									);
									const insertIndex =
										translationIndex !== -1
											? translationIndex + 1
											: blockIndex + 1;

									// 为每个匹配的知识点创建知识点块
									matchedKnowledges.forEach((knowledge, kIndex) => {
										const knowledgeBlock = {
											id: `knowledge_${block.id}_${kIndex}`,
											text: formatKnowledgeDisplay(knowledge),
											isTitle: false,
											isKnowledge: true,
											narration: false,
											isTranslated: false,
											knowledgeData: knowledge,
										};

										if (insertIndex !== -1) {
											// 按顺序插入知识点块
											currentBlocks.value.splice(
												insertIndex + kIndex,
												0,
												knowledgeBlock
											);
										}
									});
								}
							});
						}
					}
				}
			} catch (error) {
				console.error(`为第 ${groupIndex + 1} 组生成知识点失败:`, error);
				showToast({
					message: `为第 ${groupIndex + 1} 组生成知识点失败`,
					type: "error",
				});
			}
		});
	});

	return groups;
};

const initializeView = async () => {
	try {
		// 如果有传入的场景数据，直接使用
		if (props.scenes.length > 0 && route.query.mode === "edit") {
			currentIndex.value = 0;
			currentBlocks.value = props.scenes[0];
			// 获取需要翻译的文本
			const blocksToTranslate = currentBlocks.value.filter(
				(block) => !block.isTitle && !block.isTranslated && !block.isKnowledge
			);

			if (blocksToTranslate.length > 0) {
				try {
					const response = await apiClient.post("/translation/batch", {
						texts: blocksToTranslate.map((block) => block.text),
						source: "en",
						target: "zh",
					});

					if (response.data.data.translations) {
						// 为每个原文块添加翻译
						blocksToTranslate.forEach((block, index) => {
							const translationBlock = {
								id: `translation-${block.id}`,
								text: response.data.data.translations[index],
								isTitle: false,
								isTranslated: true,
								originalId: block.id,
								originalIndex: block.id,
							};

							// 在原文块后插入翻译
							const blockIndex = currentBlocks.value.findIndex(
								(b) => b.id === block.id
							);
							if (blockIndex !== -1) {
								currentBlocks.value.splice(blockIndex + 1, 0, translationBlock);
							}
						});

						// 更新场景数据
						emit(
							"update:scenes",
							props.scenes.map((scene, index) =>
								index === currentIndex.value ? currentBlocks.value : scene
							)
						);
					}
				} catch (error) {
					console.error("批量翻译失败:", error);
					showToast({ message: "批量翻译失败，请重试", type: "error" });
				}
			}
			// 创建并打印临时分组结构
			const textGroups = await groupTextByLength(props.scenes[0]);
			console.log(
				"Text groups:",
				textGroups.map((group, index) => ({
					groupIndex: index,
					totalChars: group.reduce(
						(sum, block) => sum + (block.text?.length || 0),
						0
					),
					blocks: group,
				}))
			);
			await initKnowledgeDisplay();
			return;
		}

		if (route.query.sign) {
			const res = await apiClient.get(`/scripts/episode/${route.query.sign}`);
			if (res.data.code === 200 && res.data.data) {
				const scriptData = res.data.data.scriptData;

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
					console.log("Scenes:", scenes);

					// 初始化知识点
					await initKnowledgeDisplay();
				}
			}
		}
	} catch (error) {
		console.error("初始化视图失败:", error);
		showToast({ message: "加载数据失败，请重试", type: "error" });
	}
};

const switchScene = async (index) => {
	currentIndex.value = index;
	currentBlocks.value = props.scenes[index];
	await updateCurrentSceneKnowledge();
};

const handleBack = () => {
	emit("back");
};

const handleSave = async () => {
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
		await saveAllKnowledge();

		if (uploadSuccess) {
			showToast({ message: "保存成功", type: "success" });
		} else {
			showToast({ message: "保存失败，请重试", type: "error" });
		}
	} catch (error) {
		console.error("保存失败:", error);
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
	// 确保标题以 # 开头
	currentBlocks.value[index].text = newText.startsWith("#")
		? newText
		: `# ${newText}`;

	// 通知父组件更新场景
	emit(
		"update:scenes",
		props.scenes.map((scene, sceneIndex) =>
			sceneIndex === currentIndex.value ? currentBlocks.value : scene
		)
	);
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

		if (response.data.code === 200) {
			console.log("知识点保存成功", new Date().toLocaleTimeString());
		}
	} catch (error) {
		console.error("保存知识点失败:", error);
		throw error;
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
					currentBlocks.value[index].text =
						formatKnowledgeDisplay(newKnowledgeData);
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

		// 通知父组件更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, sceneIndex) =>
				sceneIndex === currentIndex.value ? currentBlocks.value : scene
			)
		);

		showToast({ message: "翻译成功", type: "success" });
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
	console.log(existingPhrases);
	try {
		const response = await apiClient.post("/translation/extract-key-phrases", {
			text,
			options: { maxPhrases: 1, existingPhrases },
		});

		if (response.data.code === 200 && response.data.data.phrases?.length > 0) {
			return response.data.data.phrases[0];
		}
		return null;
	} catch (error) {
		console.error("提取关键词失败:", error);
		throw error;
	}
};

// 生成知识点
const generateKnowledge = async (phrase) => {
	try {
		const response = await apiClient.post("/translation/generate", {
			word: phrase,
		});

		if (response.data.code === 200) {
			return response.data.data;
		}
		return null;
	} catch (error) {
		console.error("生成知识点失败:", error);
		throw error;
	}
};

// 格式化知识点显示
const formatKnowledgeDisplay = (knowledgeData) => {
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
        >${safeData.word}</span>
        <span class="text-gray-600">${safeData.word_zh}</span>
      </div>
      <div class="flex items-center gap-1">
				${
					props.isCustom
						? `
            <button class="knowledge-btn knowledge-regenerate-btn hover:text-primary transition-colors" onclick="document.dispatchEvent(new CustomEvent('regenerateKnowledge', { detail: '${safeData.word}' }))">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            `
						: ""
				}
        <button class="knowledge-btn knowledge-detail-btn hover:text-primary transition-colors" onclick="document.dispatchEvent(new CustomEvent('showKnowledgeDetail', { detail: JSON.parse('${safeJsonString}') }))">
          <i class="bi bi-journal-text"></i>
        </button>
        ${
					props.isCustom
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

// 初始化知识点数据
const initKnowledges = async () => {
	try {
		const response = await apiClient.get(`/knowledge`, {
			params: {
				catalogId: route.params.id,
				lessonId: route.query.sign,
			},
		});

		console.log(response.data.data);

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
									text: formatKnowledgeDisplay(knowledge),
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
		const phrase = await extractKeyPhrases(block.text, existingKnowledges);
		if (!phrase) {
			showToast({
				message: "未能提取到知识点",
				type: "warning",
			});
			return;
		}

		// 2. 生成知识点
		const knowledgeData = await generateKnowledge(phrase);
		if (!knowledgeData) {
			showToast({ message: "生成知识点失败", type: "warning" });
			return;
		}

		// 3. 将新知识点添加到 currentKnowledge
		const sceneId = `Scene${currentIndex.value + 1}`;
		knowledgeData.scenes = new Set([sceneId]);
		currentKnowledge.value.set(knowledgeData.word, knowledgeData);

		// 4. 创建知识点块
		const existingKnowledgeCount = currentBlocks.value.filter(
			(b) => b.isKnowledge && b.id.startsWith(`knowledge_${block.id}_`)
		).length;

		const knowledgeBlock = {
			id: `knowledge_${block.id}_${existingKnowledgeCount}`,
			text: formatKnowledgeDisplay(knowledgeData),
			isTitle: false,
			isKnowledge: true,
			narration: false,
			isTranslated: false,
			knowledgeData: knowledgeData,
		};

		// 5. 查找插入位置
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

		// 如果找到了已存在的知识点块，在其后插入；否则在翻译块后插入
		const insertIndex =
			lastKnowledgeIndex !== -1
				? currentBlocks.value.length - lastKnowledgeIndex // 转换为正向索引
				: translationIndex >= 0
				? translationIndex + 1
				: index + 1;

		// 6. 处理已存在的知识点块
		currentBlocks.value.splice(insertIndex, 0, knowledgeBlock);

		// 7. 高亮原文中的知识点
		let displayText = block.text;

		// 处理新知识点的高亮
		const originRegex = new RegExp(knowledgeData.origin, "gi");
		if (block.text.match(originRegex)) {
			displayText = displayText.replace(
				originRegex,
				`<mark class="highlight-knowledge">${knowledgeData.origin}</mark>`
			);
		} else {
			const wordRegex = new RegExp(knowledgeData.word, "gi");
			if (block.text.match(wordRegex)) {
				knowledgeData.origin = knowledgeData.word;
				displayText = displayText.replace(
					wordRegex,
					`<mark class="highlight-knowledge">${knowledgeData.word}</mark>`
				);
			}
		}

		// 处理已存在知识点的高亮
		existingKnowledges.forEach((word) => {
			const existingKnowledge = currentKnowledge.value.get(word);
			if (existingKnowledge) {
				const existingRegex = new RegExp(existingKnowledge.origin, "gi");
				if (displayText.match(existingRegex)) {
					displayText = displayText.replace(
						existingRegex,
						`<mark class="highlight-knowledge">${existingKnowledge.origin}</mark>`
					);
				}
			}
		});

		block.displayText = displayText;

		// 8. 更新场景
		emit(
			"update:scenes",
			props.scenes.map((scene, sceneIndex) =>
				sceneIndex === currentIndex.value ? currentBlocks.value : scene
			)
		);

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

		const formattedTexts = filteredTexts.map((text) => `[${text}/${text}]`);

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
				text: formatKnowledgeDisplay(knowledgeData),
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
	// TODO: 实现切换注释功能
	console.log("切换注释:", index);
};

// 分割场景
const handleSplitScene = (index) => {
	// 获取当前场景的所有块
	const currentScene = [...currentBlocks.value];

	// 分割成两个场景
	const firstPart = currentScene.slice(0, index);
	const secondPart = currentScene.slice(index);

	// 获取分割点的块
	const splitBlock = secondPart[0];
	const splitBlockMatch = splitBlock.id.match(/block_(\d+)_(\d+)/);

	if (!splitBlockMatch) {
		console.error("无法解析块ID:", splitBlock.id);
		return;
	}

	// 获取新场景的编号
	const newSceneNumber = currentIndex.value + 1;

	// 为新场景添加标题
	const newSceneTitle = {
		id: `title_${newSceneNumber}`,
		text: `# New Scene`,
		isTitle: true,
	};
	secondPart.unshift(newSceneTitle);

	// 更新第二个场景中所有块的 ID
	let currentBlockIndex = 0;
	for (let i = 0; i < secondPart.length; i++) {
		const block = secondPart[i];
		if (block.isTitle) continue;

		if (!block.isTranslated && !block.isKnowledge) {
			// 更新原文块 ID
			const oldId = block.id;
			block.id = `block_${newSceneNumber}_${currentBlockIndex}`;

			// 更新对应的翻译块 ID
			const translationBlock = secondPart.find(
				(b) =>
					b.isTranslated &&
					(b.originalId === oldId || b.id === `translation-${oldId}`)
			);
			if (translationBlock) {
				translationBlock.id = `translation-block_${newSceneNumber}_${currentBlockIndex}`;
				translationBlock.originalId = block.id;
			}

			// 更新对应的知识点块 ID
			const knowledgeBlocks = secondPart.filter(
				(b) => b.isKnowledge && b.id.startsWith(`knowledge-${oldId}`)
			);
			knowledgeBlocks.forEach((kb, kIndex) => {
				kb.id = `knowledge-block_${newSceneNumber}_${currentBlockIndex}-${kIndex}`;
				kb.originalId = block.id;
			});

			currentBlockIndex++;
		}
	}

	// 更新场景数据
	const updatedScenes = [...props.scenes];
	updatedScenes[currentIndex.value] = firstPart;
	updatedScenes.splice(currentIndex.value + 1, 0, secondPart);

	// 更新后续场景的编号和 ID
	for (let i = currentIndex.value + 2; i < updatedScenes.length; i++) {
		const scene = updatedScenes[i];
		const sceneNumber = i;

		// 更新场景标题
		const sceneTitle = scene.find((block) => block.isTitle);
		if (sceneTitle) {
			sceneTitle.id = `title_${sceneNumber}`;
			sceneTitle.text = `# Scene${sceneNumber + 1}`;
		}

		// 更新场景中所有块的 ID
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

	// 发送更新事件
	emit("update:scenes", updatedScenes);

	console.log(updatedScenes);

	// 切换到新场景
	currentIndex.value = currentIndex.value + 1;
	currentBlocks.value = secondPart;

	// 重置工具栏状态
	selectedBlockIndex.value = null;

	showToast({ message: "场景分割成功", type: "success" });
};

// 合并场景
const handleMergeScenes = (index) => {
	// 获取要合并的两个场景
	const upperScene = [...props.scenes[index]];
	const lowerScene = [...props.scenes[index + 1]];

	// 移除下面场景的标题块
	const mergedScene = [
		...upperScene,
		...lowerScene.filter((block) => !block.isTitle),
	];

	// 更新场景数据
	const updatedScenes = [...props.scenes];
	updatedScenes[index] = mergedScene;
	updatedScenes.splice(index + 1, 1);

	// 更新后续场景的标题编号
	for (let i = index + 1; i < updatedScenes.length; i++) {
		const sceneTitle = updatedScenes[i].find((block) => block.isTitle);
		if (sceneTitle) {
			sceneTitle.id = `title_${i}`;
		}
	}

	// 发送更新事件
	emit("update:scenes", updatedScenes);

	// 如果当前正在查看被合并的场景，切换到合并后的场景
	if (currentIndex.value === index + 1) {
		currentIndex.value = index;
	} else if (currentIndex.value > index + 1) {
		// 如果在查看后面的场景，索引减1
		currentIndex.value--;
	}

	// 更新当前显示的场景内容
	currentBlocks.value = updatedScenes[currentIndex.value];

	showToast({ message: "场景合并成功", type: "success" });
};

const getScenePreview = (scene) => {
	// 过滤出原文块（非标题、非翻译、非知识点的块）
	const originalBlocks = scene.filter(
		(block) => !block.isTitle && !block.isTranslated && !block.isKnowledge
	);

	// 获取前两个原文块的文本
	const preview = originalBlocks
		.slice(0, 2)
		.map((block) => block.text)
		.join("\n");

	return preview || "空场景";
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
			console.log(response.data.data);
			currentBlocks.value[index].text = `# ${newTitle}`;

			// 更新场景
			emit(
				"update:scenes",
				props.scenes.map((scene, sceneIndex) =>
					sceneIndex === currentIndex.value ? currentBlocks.value : scene
				)
			);

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

	if (newText === "") {
		// 删除空的翻译行
		currentBlocks.value.splice(index, 1);
	} else {
		// 更新翻译文本
		currentBlocks.value[index].text = newText;
	}

	// 通知父组件更新场景
	emit(
		"update:scenes",
		props.scenes.map((scene, sceneIndex) =>
			sceneIndex === currentIndex.value ? currentBlocks.value : scene
		)
	);
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
	position: sticky;
	top: 1rem;
}

.scene-thumbnails {
	width: 100%;
	max-height: calc(100vh - 150px);
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1rem;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 12px;
	border: 2px solid #eee;
	backdrop-filter: blur(5px);
}

.scene-thumbnail {
	padding: 0.75rem;
	border: 2px solid #ddd;
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
	font-weight: bold;
	font-size: 0.875rem;
	color: #333;
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
	gap: 15px;
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
	box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
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

/* .loading-overlay::after {
	content: "01";
	position: absolute;
	top: -10%;
	left: 0;
	width: 100%;
	height: 120%;
	background: linear-gradient(
		90deg,
		transparent 0%,
		rgba(var(--primary-color-rgb), 0.1) 25%,
		rgba(var(--secondary-color-rgb), 0.05) 75%,
		transparent 100%
	);
	background-size: 200% 100%;
	color: rgba(var(--secondary-color-rgb), 0.05);
	font-family: monospace;
	font-size: 12px;
	letter-spacing: 4px;
	line-height: 8px;
	white-space: break-spaces;
	animation: matrix-rain 2s linear infinite;
} */

/* @keyframes matrix-rain {
	0% {
		background-position: 100% 0;
		transform: translateY(0);
	}
	100% {
		background-position: -100% 0;
		transform: translateY(10%);
	}
} */
</style>
