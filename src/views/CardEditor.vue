<template>
	<div class="container w-full mx-auto mt-10 pt-2">
		<div class="flex editor-box">
			<div class="editor-container text-sm relative w-1/2">
				<div
					class="editor-wrapper text-sm rounded shadow-editor"
					style="overflow-y: auto"
				>
					<div id="editor" class="editorjs-container"></div>
				</div>
			</div>
			<div class="right-panel w-1/2">
				<div
					class="option-group flex items-center justify-between p-4 border-b border-gray-100"
				>
					<div class="text-lg font-bold relative top-[-2px]">卡片编辑器</div>
					<div class="flex space-x-4 relative top-[2px]">
						<div class="tooltip" data-tip="退出">
							<button class="retro-btn" @click="backToPreview">
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
							<button class="retro-btn" @click="saveDialogue(true)">
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face">
											<i class="bi bi-floppy text-lg"></i>
										</div>
									</div>
								</div>
							</button>
						</div>

						<div class="tooltip" data-tip="生成器">
							<button
								class="retro-btn"
								@click="openKnowledgeModal"
								:disabled="generateAllLoading"
							>
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face">
											<i
												v-if="!generateAllLoading"
												class="bi bi-magic text-lg"
											></i>
											<span
												v-else
												class="loading loading-spinner loading-xs"
											></span>
										</div>
									</div>
								</div>
							</button>
						</div>

						<!-- 新增说明指南按钮 -->
						<div class="tooltip" data-tip="使用指南">
							<button class="retro-btn" @click="openGuideModal">
								<div class="btn-shadow">
									<div class="btn-edge">
										<div class="btn-face">
											<i class="bi bi-question-circle text-lg"></i>
										</div>
									</div>
								</div>
							</button>
						</div>
					</div>
				</div>
				<div
					class="toolbox-container mt-4 border border-gray-100 shadow-xl rounded-xl shadow-knowledge sticky top-[15%]"
				>
					<div class="relative w-full max-w-2xl mx-auto">
						<div class="relative">
							<div class="decorated-card py-6 px-4">
								<div
									class="flex items-center justify-between space-x-2 ml-3 mb-4"
								>
									<select
										v-model="currentSceneIndex"
										class="select select-sm select-bordered w-32 mr-4"
										@change="handleSceneChange"
									>
										<option
											v-for="(scene, index) in scenes"
											:key="index"
											:value="index"
										>
											场景 {{ index + 1 }}
										</option>
									</select>
								</div>

								<!-- 场景内容显示区 -->
								<div class="scene-content space-y-4">
									<div
										class="scene-title pl-2 text-base font-medium mb-2 text-left text-xl"
									>
										{{ currentScene?.title }}
									</div>

									<!-- 原文显示区 -->
									<div class="original-text space-y-2">
										<template
											v-for="(block, index) in currentSceneBlocks"
											:key="index"
										>
											<!-- 工具栏 -->
											<div
												v-if="selectedBlockIndex === index && !block.isTitle"
												class="text-toolbox"
											>
												<button @click="translateBlock(index)">
													<i class="bi bi-translate"></i> 翻译
												</button>
												<button @click="generateKnowledgeFromBlock(block)">
													<i class="bi bi-lightbulb"></i> 生成知识点
												</button>
											</div>
											<div
												class="text-sm p-2 rounded hover:bg-gray-50 cursor-pointer text-left"
												:class="{
													'font-bold': block.isTitle,
													'translated-text': block.isTranslated,
													'knowledge-block': block.isKnowledge,
												}"
												@click="handleBlockClick(index, block)"
												v-html="
													block.isKnowledge
														? block.text
														: block.displayText || block.text
												"
											></div>
										</template>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- <KnowledgeGenerator
			v-if="editor"
			ref="knowledgeGeneratorRef"
			:editor="editor"
			:currentKnowledge="currentKnowledge"
			:shouldTranslate="shouldTranslate"
			@update:currentKnowledge="currentKnowledge = $event"
		/> -->

		<!-- 使用指南弹窗 -->
		<dialog id="guide_modal" class="modal">
			<div class="modal-box w-11/12 max-w-3xl">
				<h3 class="font-bold text-lg mb-4">编辑器使用指南</h3>
				<div class="space-y-2">
					<div
						v-for="(item, index) in guideItems"
						:key="index"
						class="card bg-base-100 shadow-sm"
					>
						<div class="card-body p-2">
							<div class="flex items-start">
								<div class="text-left w-full">
									<h4 class="font-medium">
										{{ index + 1 + ". " + item.title }}
									</h4>
									<p class="text-sm mt-1">{{ item.description }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-action">
					<form method="dialog">
						<button class="btn">关闭</button>
					</form>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>关闭</button>
			</form>
		</dialog>
	</div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { showToast } from "@/components/common/toast.js";
import EditorJS from "@editorjs/editorjs";
import apiClient from "@/api";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/store";
import { exampleText, exampleTextZh } from "@/constants/Example.js";
import KnowledgeGenerator from "@/components/cardEditor/KnowledgeGenerator.vue";
import { v4 as uuidv4 } from "uuid";

const route = useRoute();
const router = useRouter();
const editor = ref(null);
const totalDialogues = ref(0); // 总对话数

const currentDialogueIndex = ref(0); // 当前对话索引
const currentDialogue = ref({}); // 当前对话
const currentKnowledge = ref(new Map()); // 当前知识点
const scriptJson = ref(null);

// const knowledgeGeneratorRef = ref(null); // 知识点生成器引用

const generateAllLoading = ref(false);
const isSaved = ref(false);

// 添加自动保存状态变量
const autoSaving = ref(false);
const lastSavedTime = ref(null);

const scenes = ref([]);
const currentSceneIndex = ref(0);
const currentScene = ref(null);
const currentSceneBlocks = ref([]);

const selectedBlockIndex = ref(null);

// 添加新的数据结构
const blocksMap = ref(new Map()); // 存储所有块的数据，键为唯一ID
const sceneStructure = ref([]); // 存储场景结构，包含块ID的引用

const updateCurrentScene = async () => {
	if (!editor.value) return;

	const content = await editor.value.save();
	const editorBlocks = content.blocks;

	// 第一步：保存当前场景的所有块数据
	if (currentSceneBlocks.value && currentSceneBlocks.value.length > 0) {
		currentSceneBlocks.value.forEach((block) => {
			if (block.id) {
				blocksMap.value.set(block.id, { ...block });
			} else if (block.originalIndex) {
				// 兼容旧数据，使用originalIndex作为ID
				block.id = block.originalIndex;
				blocksMap.value.set(block.id, { ...block });
			}
		});
	}

	// 第二步：解析编辑器内容，生成新的场景结构
	const newScenes = [];
	let currentScene = null;

	// 找出所有场景标题和原文块
	for (let i = 0; i < editorBlocks.length; i++) {
		const block = editorBlocks[i];
		const text = block.data.text;

		// 检查是否是标题
		if (text.startsWith("#")) {
			currentScene = {
				index: newScenes.length,
				title: text.replace("#", "").trim(),
				blockIds: [], // 存储块ID而不是块内容
			};
			newScenes.push(currentScene);
			continue;
		}

		if (!currentScene) continue;

		// 为原文块创建或查找唯一ID
		let blockId = block.id || `editor-block-${uuidv4()}`;

		// 尝试通过内容匹配找到现有块
		if (!blocksMap.value.has(blockId)) {
			const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");

			// 尝试通过内容匹配找到现有块
			let matchFound = false;
			for (const [id, existingBlock] of blocksMap.value.entries()) {
				if (!existingBlock.isTranslated && !existingBlock.isKnowledge) {
					const existingText = existingBlock.text.replace(
						/<\/?[^>]+(>|$)/g,
						""
					);

					// 使用相似度匹配
					if (
						existingText === cleanText ||
						existingText.includes(cleanText) ||
						cleanText.includes(existingText)
					) {
						blockId = id; // 使用现有块的ID
						matchFound = true;
						break;
					}

					// 如果没有直接匹配，尝试词汇相似度匹配
					const oldWords = existingText
						.toLowerCase()
						.split(/\s+/)
						.filter((w) => w.length > 0);
					const newWords = cleanText
						.toLowerCase()
						.split(/\s+/)
						.filter((w) => w.length > 0);

					// 计算共同单词数量
					const commonWords = oldWords.filter((word) =>
						newWords.includes(word)
					);

					// 如果共同单词占比超过60%，认为是同一个块
					const similarity =
						commonWords.length / Math.max(oldWords.length, newWords.length);
					if (similarity > 0.6) {
						blockId = id; // 使用现有块的ID
						matchFound = true;
						break;
					}
				}
			}

			// 如果没有找到匹配，创建新块
			if (!matchFound) {
				console.log(`未找到匹配，创建新块: ${blockId}`);
			}
		}

		// 如果是新块，创建并存储
		if (!blocksMap.value.has(blockId)) {
			blocksMap.value.set(blockId, {
				id: blockId,
				text: text.replace(/<\/?[^>]+(>|$)/g, ""),
				isTitle: false,
				editorId: block.id, // 保存编辑器块ID以便后续匹配
				originalIndex: blockId, // 兼容旧代码
			});
		} else {
			// 更新现有块的文本内容
			const existingBlock = blocksMap.value.get(blockId);
			const oldText = existingBlock.text;
			existingBlock.text = text.replace(/<\/?[^>]+(>|$)/g, "");
			existingBlock.editorId = block.id;

			// 如果文本内容发生变化，需要重新应用知识点高亮
			if (oldText !== existingBlock.text) {
				// 更新 displayText
				if (existingBlock.displayText) {
					// 重新应用知识点高亮
					applyKnowledgeHighlight(existingBlock, currentSceneIndex.value);
				} else {
					// 如果没有 displayText，直接使用 text
					existingBlock.displayText = existingBlock.text;
				}

				// 强制更新右侧面板中对应的块
				const blockIndex = currentSceneBlocks.value.findIndex(
					(b) => b.id === blockId || b.originalIndex === blockId
				);
				if (blockIndex >= 0) {
					// 使用解构和重新赋值来触发响应式更新
					const updatedBlock = { ...existingBlock };
					currentSceneBlocks.value[blockIndex] = updatedBlock;

					// 强制触发视图更新
					currentSceneBlocks.value = [...currentSceneBlocks.value];
				}
			}
		}

		// 将块ID添加到场景结构中
		currentScene.blockIds.push(blockId);
	}

	// 第三步：更新场景数据
	sceneStructure.value = newScenes;

	// 如果是初始化阶段，不更新场景数据
	if (scenes.value.length === 0) {
		return;
	}

	// 第四步：更新当前场景的显示
	if (newScenes.length > 0) {
		// 确保当前场景索引有效
		if (currentSceneIndex.value >= newScenes.length) {
			currentSceneIndex.value = newScenes.length - 1;
		}

		// 更新场景数组
		scenes.value = newScenes.map((scene) => ({
			...scene,
			blocks: [], // 暂时清空blocks，后面会重建
		}));

		// 更新当前场景
		currentScene.value = scenes.value[currentSceneIndex.value];

		// 重建当前场景的块数组
		const newSceneBlocks = [];
		const currentSceneStructure = sceneStructure.value[currentSceneIndex.value];

		if (currentSceneStructure && currentSceneStructure.blockIds) {
			// 遍历当前场景的所有块ID
			for (const blockId of currentSceneStructure.blockIds) {
				// 获取原文块
				const originalBlock = blocksMap.value.get(blockId);
				if (originalBlock) {
					// 添加原文块
					newSceneBlocks.push({ ...originalBlock });

					// 检查是否有对应的翻译块
					const translationId = `translation-${blockId}`;
					if (blocksMap.value.has(translationId)) {
						// 添加翻译块
						newSceneBlocks.push({ ...blocksMap.value.get(translationId) });
					}

					// 检查是否有对应的知识点块
					const knowledgeId = `knowledge-${blockId}`;
					if (blocksMap.value.has(knowledgeId)) {
						// 添加知识点块
						newSceneBlocks.push({ ...blocksMap.value.get(knowledgeId) });
					}
				}
			}
		}

		// 更新当前场景块数组
		currentSceneBlocks.value = newSceneBlocks;
	}
};

// 处理文本块点击
const handleBlockClick = (index, block) => {
	if (block.isTitle || block.isTranslated || block.isKnowledge) {
		selectedBlockIndex.value = null;
		return;
	}
	selectedBlockIndex.value = index;
};

// 知识点按钮的点击处理函数
const handleKnowledgeButtonClick = (event) => {
	// 检查点击的是否是知识点按钮
	const detailBtn = event.target.closest(".knowledge-detail-btn");
	const deleteBtn = event.target.closest(".knowledge-delete-btn");

	if (detailBtn || deleteBtn) {
		// 阻止事件冒泡，避免触发其他点击事件
		event.stopPropagation();

		// 获取知识点关键词
		const word = detailBtn
			? detailBtn.getAttribute("data-word")
			: deleteBtn.getAttribute("data-word");

		if (detailBtn) {
			// 处理详情按钮点击
			showKnowledgeDetail(word);
		} else if (deleteBtn) {
			// 处理删除按钮点击
			deleteKnowledge(word);
		}
	}
};

// 显示知识点详情
const showKnowledgeDetail = (word) => {
	const knowledge = currentKnowledge.value.get(word);
	if (knowledge) {
		// 这里可以实现显示详情的逻辑，例如打开一个模态框
		showToast({ message: `查看知识点详情: ${word}`, type: "info" });
		console.log("知识点详情:", knowledge);
	}
};

// 删除知识点
const deleteKnowledge = (word) => {
	// 从当前知识点Map中删除
	if (currentKnowledge.value.has(word)) {
		currentKnowledge.value.delete(word);

		// 更新所有包含该知识点的块
		updateBlocksAfterKnowledgeDelete(word);

		showToast({ message: `已删除知识点: ${word}`, type: "success" });
	}
};

// 更新删除知识点后的块
const updateBlocksAfterKnowledgeDelete = (word) => {
	// 遍历所有场景
	scenes.value.forEach((scene, sceneIndex) => {
		const sceneId = `Scene${sceneIndex + 1}`;

		// 获取当前场景的块
		const sceneBlocks =
			sceneIndex === currentSceneIndex.value
				? currentSceneBlocks.value
				: scene.blocks;

		// 更新原文块中的高亮
		sceneBlocks.forEach((block) => {
			if (
				!block.isTitle &&
				!block.isTranslated &&
				!block.isKnowledge &&
				block.displayText
			) {
				// 移除该知识点的高亮
				const regex = new RegExp(
					`<mark class="pink">\\b${word}\\b</mark>`,
					"gi"
				);
				block.displayText = block.displayText.replace(regex, word);
			}

			// 如果是知识点块，需要检查是否包含被删除的知识点
			if (block.isKnowledge) {
				// 获取块的ID
				const blockId = block.id || block.originalIndex;
				if (blockId && blockId.startsWith("knowledge-")) {
					const originalId = blockId.replace("knowledge-", "");
					const originalBlock = blocksMap.value.get(originalId);

					if (originalBlock) {
						// 重新生成知识点显示内容
						// 这里需要获取该块关联的所有知识点，然后排除被删除的知识点
						// 简化处理：直接从当前场景中查找与该原文块关联的知识点
						const relatedKnowledge = [];
						Array.from(currentKnowledge.value.values()).forEach((k) => {
							if (
								k.scenes &&
								k.scenes.has(sceneId) &&
								originalBlock.text.toLowerCase().includes(k.word.toLowerCase())
							) {
								relatedKnowledge.push(k);
							}
						});

						if (relatedKnowledge.length > 0) {
							// 更新知识点块内容
							block.text = formatKnowledgeDisplay(relatedKnowledge);
						} else {
							// 如果没有关联知识点了，标记该块待删除
							block.toBeRemoved = true;
						}
					}
				}
			}
		});

		// 删除标记为待删除的知识点块
		if (sceneIndex === currentSceneIndex.value) {
			currentSceneBlocks.value = currentSceneBlocks.value.filter(
				(block) => !block.toBeRemoved
			);
		} else {
			scene.blocks = scene.blocks.filter((block) => !block.toBeRemoved);
		}
	});

	// 强制更新视图
	currentSceneBlocks.value = [...currentSceneBlocks.value];
};

// 点击事件处理器
const handleClickOutside = (event) => {
	// 检查点击是否在文本块或工具栏内部
	const isClickOnBlock = event.target.closest(".text-sm.p-2.rounded");
	const isClickOnToolbox = event.target.closest(".text-toolbox");

	if (!isClickOnBlock && !isClickOnToolbox) {
		selectedBlockIndex.value = null;
	}
};

// 修改翻译块函数
const translateBlock = async (index) => {
	const block = currentSceneBlocks.value[index];
	if (!block || block.isTranslated) return;

	try {
		// 确保块有ID
		const blockId = block.id || block.originalIndex;
		if (!blockId) {
			console.error("无法翻译：块没有ID");
			return;
		}

		// 检查是否已有翻译块
		const translationId = `translation-${blockId}`;
		const hasExistingTranslation = blocksMap.value.has(translationId);

		const response = await apiClient.post("/translation", {
			text: block.text,
			source: "en",
			target: "zh",
		});

		const translatedText = response.data.data.translatedText;

		// 创建或更新翻译块
		const translationBlock = {
			id: translationId,
			text: translatedText,
			isTitle: false,
			isTranslated: true,
			originalId: blockId, // 关联到原文块
			originalIndex: blockId, // 兼容旧代码
		};

		// 保存到blocksMap
		blocksMap.value.set(translationId, translationBlock);

		// 如果已有翻译块，则更新内容；否则插入新的翻译块
		if (hasExistingTranslation) {
			// 找到现有翻译块的位置
			const existingIndex = currentSceneBlocks.value.findIndex(
				(b) => b.id === translationId || b.originalIndex === translationId
			);
			if (existingIndex >= 0) {
				currentSceneBlocks.value[existingIndex].text = translatedText;
			}
		} else {
			// 在当前块后插入翻译文本
			currentSceneBlocks.value.splice(index + 1, 0, translationBlock);
		}

		showToast({ message: "翻译成功", type: "success" });
	} catch (error) {
		console.error("Translation failed:", error);
		showToast({ message: "翻译失败，请重试", type: "error" });
	}
};

// 修改生成知识点函数
const generateKnowledgeFromBlock = async (block) => {
	if (!block) return;

	try {
		generateAllLoading.value = true;

		// 确保块有ID
		const blockId = block.id || block.originalIndex;
		if (!blockId) {
			console.error("无法生成知识点：块没有ID");
			return;
		}

		// 提取关键词
		const keyPhrases = await extractKeyPhrases(block.text);
		const generatedKnowledgeItems = [];

		for (const phrase of keyPhrases) {
			try {
				const res = await apiClient.post("/knowledge/generate", {
					word: phrase,
				});

				if (res.data.code === 200) {
					// 将新生成的知识点添加到列表
					generatedKnowledgeItems.push(res.data.data);

					// 同时添加到当前知识点Map中
					if (!currentKnowledge.value.has(res.data.data.word)) {
						const sceneId = `Scene${currentSceneIndex.value + 1}`;
						currentKnowledge.value.set(res.data.data.word, {
							...res.data.data,
							scenes: new Set([sceneId]),
						});
					}
				}
			} catch (err) {
				console.error(`Failed to generate knowledge for "${phrase}":`, err);
			}
		}

		// 高亮原文中的知识点
		let highlightedText = block.text;
		generatedKnowledgeItems.forEach((item) => {
			const word = item.word;
			const regex = new RegExp(`\\b${word}\\b`, "gi");
			highlightedText = highlightedText.replace(regex, (match) => {
				return `<mark class="pink">${match}</mark>`;
			});
		});

		// 更新原文块的displayText
		const originalBlock = blocksMap.value.get(blockId) || block;
		if (originalBlock) {
			originalBlock.displayText = highlightedText;

			// 更新当前显示的块
			const blockIndex = currentSceneBlocks.value.findIndex(
				(b) => b.id === blockId || b.originalIndex === blockId
			);
			if (blockIndex >= 0) {
				currentSceneBlocks.value[blockIndex].displayText = highlightedText;
			}
		}

		// 创建知识点块
		if (generatedKnowledgeItems.length > 0) {
			const knowledgeId = `knowledge-${blockId}`;
			const knowledgeBlock = {
				id: knowledgeId,
				text: formatKnowledgeDisplay(generatedKnowledgeItems),
				isTitle: false,
				isKnowledge: true,
				originalId: blockId,
				originalIndex: blockId, // 兼容旧代码
			};

			// 保存到blocksMap
			blocksMap.value.set(knowledgeId, knowledgeBlock);

			// 检查是否已有知识点块
			const existingIndex = currentSceneBlocks.value.findIndex(
				(b) => b.id === knowledgeId || b.originalIndex === knowledgeId
			);

			if (existingIndex >= 0) {
				// 更新现有知识点块
				currentSceneBlocks.value[existingIndex].text = knowledgeBlock.text;
			} else {
				// 找到原文块和可能的翻译块
				const originalIndex = currentSceneBlocks.value.findIndex(
					(b) => b.id === blockId || b.originalIndex === blockId
				);
				if (originalIndex >= 0) {
					// 检查下一个块是否是翻译块
					const nextIndex = originalIndex + 1;
					const hasTranslation =
						nextIndex < currentSceneBlocks.value.length &&
						currentSceneBlocks.value[nextIndex].isTranslated;

					// 确定插入位置
					const insertIndex = hasTranslation ? nextIndex + 1 : nextIndex;

					// 插入知识点块
					currentSceneBlocks.value.splice(insertIndex, 0, knowledgeBlock);
				}
			}
		}

		showToast({ message: "知识点生成成功", type: "success" });
	} catch (error) {}
};

// 格式化知识点显示
const formatKnowledgeDisplay = (knowledgeItems) => {
	return knowledgeItems
		.map((item) => {
			return `<div class="knowledge-item p-1">
			<div class="flex justify-between">
				<span class="font-bold">${item.word}</span>
				<div class="flex items-center">
					<span class="text-gray-600 mr-2">${item.word_zh}</span>
					<button class="knowledge-btn knowledge-detail-btn" data-word="${item.word}" title="详情">
						<i class="bi bi-info-circle"></i>
					</button>
					<button class="knowledge-btn knowledge-delete-btn" data-word="${item.word}" title="删除">
						<i class="bi bi-trash"></i>
					</button>
				</div>
			</div>
		</div>`;
		})
		.join("");
};

// 提取关键词或短语
const extractKeyPhrases = async (text) => {
	// 使用辅助方法计算合适的关键词数量
	const maxPhrases = calculateMaxPhrases(text);
	const options = { maxPhrases };
	try {
		const response = await apiClient.post("/translation/extract-key-phrases", {
			text,
			options,
		});

		if (response.data.code === 200) {
			return response.data.data.phrases;
		}

		// return fallbackExtractPhrases(text);
	} catch (error) {
		console.error("Failed to extract key phrases:", error);
		// return fallbackExtractPhrases(text);
	}
};

// 根据文本长度计算合适的知识点数量
const calculateMaxPhrases = (text) => {
	// 计算单词数量（按空格分割）
	const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length;
	// 根据单词数量动态计算关键词数量
	if (wordCount <= 25) {
		return 1;
	} else if (wordCount <= 50) {
		return 2;
	} else if (wordCount <= 100) {
		return 3;
	} else if (wordCount <= 200) {
		return 4;
	} else {
		return 5;
	}
};

// 重构场景切换处理方法
const handleSceneChange = () => {
	if (scenes.value.length > 0) {
		currentScene.value = scenes.value[currentSceneIndex.value];

		// 使用场景结构和blocksMap重建当前场景的块数组
		const newSceneBlocks = [];
		const currentSceneStructure = sceneStructure.value[currentSceneIndex.value];

		if (currentSceneStructure && currentSceneStructure.blockIds) {
			// 遍历当前场景的所有块ID
			for (const blockId of currentSceneStructure.blockIds) {
				// 获取原文块
				const originalBlock = blocksMap.value.get(blockId);
				if (originalBlock) {
					// 添加原文块 - 使用深拷贝确保不共享引用
					const clonedOriginalBlock = JSON.parse(JSON.stringify(originalBlock));
					newSceneBlocks.push(clonedOriginalBlock);

					// 检查是否有对应的翻译块
					const translationId = `translation-${blockId}`;
					if (blocksMap.value.has(translationId)) {
						// 添加翻译块 - 使用深拷贝确保不共享引用
						const translationBlock = blocksMap.value.get(translationId);
						newSceneBlocks.push(JSON.parse(JSON.stringify(translationBlock)));
					}

					// 检查是否有对应的知识点块
					const knowledgeId = `knowledge-${blockId}`;
					if (blocksMap.value.has(knowledgeId)) {
						// 添加知识点块 - 使用深拷贝确保不共享引用
						const knowledgeBlock = blocksMap.value.get(knowledgeId);
						newSceneBlocks.push(JSON.parse(JSON.stringify(knowledgeBlock)));
					}
				}
			}
		}

		// 更新当前场景块数组
		currentSceneBlocks.value = newSceneBlocks;

		// 滚动到选中场景的位置
		const editorBlock = document.querySelector(
			`.ce-block:nth-child(${currentScene.value.index + 1})`
		);
		if (editorBlock) {
			editorBlock.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}
};

// 使用指南数据
const guideItems = ref([
	{
		title: "卡片标题",
		description: "每张卡片的标题请以 # 开头",
	},
	{
		title: "标准格式",
		description:
			"英文段落 + 中文段落 + 空行 = 一个完整的段落。中文翻译紧邻英文段落",
	},
	{
		title: "保存",
		description:
			"点击左侧「保存」按钮，或输入 Command/Ctrl + s，完成保存。同时，编辑器有自动保存功能。",
	},
	{
		title: "知识点",
		description:
			"选中单词，选择粗体，或输入 Command/Ctrl + b，可将选中部分加入右侧知识点列表",
	},
	{
		title: "旁白/注释",
		description:
			"选中段落，选择斜体，或输入 Command/ctrl + i，可以将该段落标记为旁白或注释",
	},
	{
		title: "翻译",
		description: "选中段落，选择翻译，完成翻译",
	},
	{
		title: "对白标记",
		description: "用'[]'标记说话者，标记该段落为对白",
	},
	{
		title: "生成器",
		description:
			"点击左侧「生成器」按钮，试试自动生成知识点、播客、情景剧等功能...",
	},
]);

// 优化编辑器初始化逻辑
const initEditorJS = async () => {
	console.log("Initializing EditorJS...");
	if (!scriptJson.value) return;

	try {
		const blocks = await initEditorBlocks(scriptJson.value);

		// 销毁现有编辑器实例（如果存在）
		if (editor.value) {
			await editor.value.destroy();
		}

		editor.value = new EditorJS({
			holder: "editor",
			placeholder: "请在此编辑文本...",
			data: { blocks },
			inlineToolbar: [],
			onReady: async () => {
				console.log("编辑器准备就绪");
				await updateCurrentScene();
			},
			onChange: async (api, event) => {
				// 立即更新当前场景
				await updateCurrentScene();
				// 强制刷新右侧面板
				currentSceneBlocks.value = JSON.parse(
					JSON.stringify(currentSceneBlocks.value)
				);
			},
		});
	} catch (error) {
		console.error("初始化编辑器失败:", error);
		showToast({ message: "初始化编辑器失败，请刷新页面重试", type: "error" });
	}
};

// 初始化知识点
const initKnowledges = async () => {
	try {
		const response = await apiClient.get(`/knowledge`, {
			params: {
				catalogId: route.params.id,
				lessonId: route.query.sign,
			},
		});

		if (response.data.code === 200) {
			// 初始化 Map
			currentKnowledge.value = new Map();

			// 处理每个场景的知识点
			response.data.data.forEach((scene) => {
				scene.knowledge.forEach((item) => {
					const existingKnowledge = currentKnowledge.value.get(item.word);

					if (!existingKnowledge) {
						// 创建新的知识点对象，添加场景信息
						currentKnowledge.value.set(item.word, {
							...item,
							scenes: new Set([scene.sceneId]),
						});
					} else {
						// 更新现有知识点的场景集合
						existingKnowledge.scenes.add(scene.sceneId);
					}
				});
			});
		}
	} catch (error) {
		console.error(error);
	}
};

const initDialogues = async () => {
	try {
		const res = await apiClient.get(`/scripts/episode/${route.query.sign}`);
		if (res.data.code === 200 && res.data.data) {
			scriptJson.value = res.data.data.scriptData;
			currentDialogue.value =
				res.data.data.scriptData.scenes[0].dialogues[
					currentDialogueIndex.value
				];
			totalDialogues.value =
				res.data.data.scriptData.scenes[0].dialogues.length;

			// 初始化右侧面板的场景数据，包括原文和翻译
			initRightPanelScenes(res.data.data.scriptData);
		} else {
			throw new Error("课程信息不完整或未找到");
		}
	} catch (err) {}
};

// 初始化右侧面板的场景数据
const initRightPanelScenes = (scriptData) => {
	const newScenes = [];

	scriptData.scenes[0].dialogues.forEach((dialogue, dialogueIndex) => {
		// 创建新场景
		const scene = {
			index: dialogueIndex,
			title: dialogue.title,
			blockIds: [], // 存储块ID而不是块内容
			blocks: [], // 兼容现有代码
		};

		// 处理每组文本，添加原文和翻译到右侧面板
		for (let i = 0; i < dialogue.text.length; i++) {
			const [speaker, text] = dialogue.text[i];
			const textZhPair = dialogue.text_zh[i] || ["", ""];
			const [speakerZh, textZh] = textZhPair;

			// 添加英文原文块
			const originalText =
				speaker === "narration"
					? `<i>${text}</i>`
					: speaker
					? `[${speaker}] ${text}`
					: text;

			// 创建唯一ID
			const blockId = `block_${dialogueIndex}_${i}`;

			// 创建原文块
			const originalBlock = {
				id: blockId,
				text: originalText,
				isTitle: false,
				originalIndex: blockId, // 兼容旧代码
			};

			// 保存到blocksMap
			blocksMap.value.set(blockId, originalBlock);

			// 添加到场景结构
			scene.blockIds.push(blockId);

			// 添加到blocks数组（兼容现有代码）
			scene.blocks.push(originalBlock);

			// 如果有中文翻译，也添加到右侧面板
			if (textZh && textZh.trim() !== "") {
				const translatedText = speakerZh ? `[${speakerZh}] ${textZh}` : textZh;
				const translationId = `translation-${blockId}`;

				// 创建翻译块
				const translationBlock = {
					id: translationId,
					text: translatedText,
					isTitle: false,
					isTranslated: true,
					originalId: blockId,
					originalIndex: blockId, // 兼容旧代码
				};

				// 保存到blocksMap
				blocksMap.value.set(translationId, translationBlock);

				// 添加到blocks数组（兼容现有代码）
				scene.blocks.push(translationBlock);
			}
		}

		newScenes.push(scene);
	});

	// 更新场景数据
	scenes.value = newScenes;
	sceneStructure.value = newScenes.map((scene) => ({
		index: scene.index,
		title: scene.title,
		blockIds: scene.blockIds,
	}));

	// 设置当前场景
	if (newScenes.length > 0) {
		currentScene.value = newScenes[currentSceneIndex.value];
		currentSceneBlocks.value = [...currentScene.value.blocks];
	}
};

// 初始化知识点显示
const initKnowledgeDisplay = async () => {
	try {
		// 确保知识点数据已加载
		if (currentKnowledge.value.size === 0) {
			await initKnowledges();
		}

		// 遍历所有场景
		scenes.value.forEach((scene, sceneIndex) => {
			const sceneId = `Scene${sceneIndex + 1}`;

			// 获取当前场景的块
			const sceneBlocks =
				sceneIndex === currentSceneIndex.value
					? currentSceneBlocks.value
					: scene.blocks;

			// 创建一个映射，将每个知识点关联到对应的原文块
			const knowledgeByWord = new Map();

			// 收集该场景的所有知识点
			Array.from(currentKnowledge.value.values()).forEach((knowledge) => {
				if (knowledge.scenes && knowledge.scenes.has(sceneId)) {
					// 将知识点按关键词分组
					const word = knowledge.word;
					if (!knowledgeByWord.has(word)) {
						knowledgeByWord.set(word, []);
					}
					knowledgeByWord.get(word).push(knowledge);
				}
			});

			// 如果场景有知识点，为每个原文块检查是否有对应的知识点
			if (knowledgeByWord.size > 0) {
				// 从后向前遍历，避免插入时索引变化
				for (let i = sceneBlocks.length - 1; i >= 0; i--) {
					const block = sceneBlocks[i];

					// 跳过非原文块（标题、翻译、已有知识点）
					if (block.isTitle || block.isTranslated || block.isKnowledge) {
						continue;
					}

					// 确保块有ID
					const blockId = block.id || block.originalIndex;
					if (!blockId) continue;

					// 检查这个原文块中是否包含任何知识点关键词
					const blockText = block.text.toLowerCase();
					const matchedKnowledge = [];

					// 收集所有匹配的知识点
					knowledgeByWord.forEach((items, word) => {
						if (blockText.includes(word.toLowerCase())) {
							matchedKnowledge.push(...items);

							// 在原文中高亮知识点（只在右侧面板显示）
							const regex = new RegExp(`\\b${word}\\b`, "gi");
							if (!block.displayText) {
								block.displayText = block.text;
							}
							block.displayText = block.displayText.replace(regex, (match) => {
								return `<mark class="pink">${match}</mark>`;
							});
						}
					});

					// 如果找到匹配的知识点，在原文块后插入知识点块
					if (matchedKnowledge.length > 0) {
						// 检查下一个块是否是翻译块
						const nextIndex = i + 1;
						const hasTranslation =
							nextIndex < sceneBlocks.length &&
							sceneBlocks[nextIndex].isTranslated;

						// 确定插入位置：如果有翻译块，则在翻译块后面插入；否则在当前块后面插入
						const insertIndex = hasTranslation ? nextIndex + 1 : nextIndex;

						// 创建知识点展示块
						const knowledgeId = `knowledge-${blockId}`;
						const knowledgeBlock = {
							id: knowledgeId,
							text: formatKnowledgeDisplay(matchedKnowledge),
							isTitle: false,
							isKnowledge: true,
							originalId: blockId,
							originalIndex: blockId, // 兼容旧代码
						};

						// 保存到blocksMap
						blocksMap.value.set(knowledgeId, knowledgeBlock);

						// 在确定的位置插入知识点块
						if (sceneIndex === currentSceneIndex.value) {
							currentSceneBlocks.value.splice(insertIndex, 0, knowledgeBlock);
						} else {
							scene.blocks.splice(insertIndex, 0, knowledgeBlock);
						}
					}
				}
			}
		});
	} catch (error) {
		console.error("初始化知识点显示失败:", error);
	}
};

// 编辑器块初始化
const initEditorBlocks = (scriptData) => {
	const blocks = [];
	const dialogues = scriptData.scenes[0].dialogues;

	// 清空现有的blocksMap，准备重新初始化
	blocksMap.value.clear();

	dialogues.forEach((dialogue, dialogueIndex) => {
		// 添加标题
		const titleId = `title_${dialogueIndex}`;
		const titleBlock = {
			type: "paragraph",
			data: { text: `# ${dialogue.title}` },
			id: titleId, // 为编辑器块添加唯一ID
		};
		blocks.push(titleBlock);

		// 保存标题块到blocksMap
		blocksMap.value.set(titleId, {
			id: titleId,
			text: `# ${dialogue.title}`,
			isTitle: true,
		});

		// 处理每组文本，只添加英文原文
		for (let i = 0; i < dialogue.text.length; i++) {
			const [speaker, text] = dialogue.text[i];

			// 创建唯一ID
			const blockId = `block_${dialogueIndex}_${i}`;

			// 格式化文本
			const formattedText =
				speaker === "narration"
					? `<i>${text}</i>`
					: speaker
					? `[${speaker}] ${text}`
					: text;

			// 创建编辑器块
			const editorBlock = {
				type: "paragraph",
				data: { text: formattedText },
				id: blockId, // 为编辑器块添加唯一ID
			};
			blocks.push(editorBlock);

			// 保存原文块到blocksMap
			blocksMap.value.set(blockId, {
				id: blockId,
				text: formattedText,
				isTitle: false,
				originalIndex: blockId, // 兼容旧代码
			});

			// 如果有翻译，也保存到blocksMap
			const [speakerZh, textZh] = dialogue.text_zh[i] || ["", ""];
			if (textZh && textZh.trim() !== "") {
				const translationId = `translation-${blockId}`;
				const translatedText = speakerZh ? `[${speakerZh}] ${textZh}` : textZh;

				blocksMap.value.set(translationId, {
					id: translationId,
					text: translatedText,
					isTitle: false,
					isTranslated: true,
					originalId: blockId,
					originalIndex: blockId, // 兼容旧代码
				});
			}
		}
	});

	return blocks;
};

// 添加打开模态框的方法
const openKnowledgeModal = async () => {
	// try {
	// 	generateAllLoading.value = true;
	// 	await knowledgeGeneratorRef.value.openModal();
	// } finally {
	// 	generateAllLoading.value = false;
	// }
};

onMounted(async () => {
	if (route.query.mode === "edit") {
		getDefaultJson();
		getDefaultKnowledge();
	} else {
		try {
			await initDialogues(); // 先初始化对话数据
			await initKnowledges(); // 再初始化知识点数据
			await initKnowledgeDisplay(); // 初始化知识点显示
		} catch (error) {
			handleApiError(error, "初始化数据失败");
		}
	}

	await initEditorJS(); // 最后初始化编辑器

	// 点击事件监听
	document.addEventListener("click", handleClickOutside);

	// 知识点按钮的事件委托
	document.addEventListener("click", handleKnowledgeButtonClick);
});

// 保存
const saveDialogue = async (isCustom = false) => {
	try {
		// 从右侧面板提取原文
		const outputDialogues = processSceneData();

		if (outputDialogues.length > 0) {
			// 在保存前记录当前的编辑状态
			const currentEditorContent = editor.value
				? await editor.value.save()
				: null;

			const updatedJson = {
				...scriptJson.value,
				scenes: [
					{
						...scriptJson.value.scenes[0],
						dialogues: outputDialogues,
					},
				],
			};

			// 上传脚本
			await uploadScripts(updatedJson, isCustom);
			scriptJson.value = updatedJson;

			// 保存知识点
			await saveAllKnowledge(isCustom); // 不显示额外的成功提示

			if (isCustom) {
				isSaved.value = true; // 标记为已保存
				showToast({ message: "脚本保存成功", type: "success" });
			}

			// 记录最后保存时间
			lastSavedTime.value = new Date();
		} else {
			if (isCustom) {
				showToast({ message: "没有内容可保存", type: "warning" });
			}
		}
	} catch (error) {
		console.error("保存脚本失败:", error);
		if (isCustom) {
			showToast({ message: "保存失败，请重试", type: "error" });
		}
	}
};

// 处理场景数据
function processSceneData() {
	const outputDialogues = [];

	// 确保scenes.value存在且有内容
	if (!scenes.value || scenes.value.length === 0) {
		console.warn("没有场景数据可处理");
		return outputDialogues;
	}

	// 遍历所有场景
	scenes.value.forEach((scene, sceneIndex) => {
		// 创建新场景对象
		const dialogue = {
			id: `Scene${sceneIndex + 1}`,
			season: route.params.season,
			episode: route.params.episode,
			title: scene.title || `场景${sceneIndex + 1}`,
			img: "",
			text: [],
			text_zh: [],
		};

		// 获取当前场景的所有块ID
		const blockIds = scene.blockIds || [];

		// 处理场景内的文本块
		for (let i = 0; i < blockIds.length; i++) {
			const blockId = blockIds[i];
			const block = blocksMap.value.get(blockId);

			if (!block) continue;

			// 清除原文中的高亮标记，使用原始text而不是displayText
			let cleanText = block.text;
			// 移除所有<mark class="pink">标签
			cleanText = cleanText.replace(/<mark class="pink">(.*?)<\/mark>/g, "$1");

			// 检查是否有对应的翻译块
			const translationId = `translation-${blockId}`;
			const translationBlock = blocksMap.value.get(translationId);

			// 解析原文
			const englishLine = parseDialogueLine(cleanText, "en");
			dialogue.text.push([englishLine.speaker, englishLine.text]);

			// 如果有翻译，添加翻译；否则添加空翻译
			if (translationBlock) {
				const chineseLine = parseDialogueLine(translationBlock.text, "zh");
				dialogue.text_zh.push([chineseLine.speaker, chineseLine.text]);
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
}

// 保存所有知识点的方法
const saveAllKnowledge = async (isCustom = false) => {
	try {
		await autoSaveAllKnowledge();

		// 只有在用户手动保存时才显示提示
		if (isCustom) {
			showToast({ message: "卡片保存成功", type: "success" });
		}

		// 刷新知识点数据
		await initKnowledges();
	} catch (error) {
		console.error("Failed to save knowledge:", error);

		// 错误提示也只在用户手动保存时显示
		if (isCustom) {
			showToast({
				message: error.response?.data?.message || "卡片保存失败",
				type: "error",
			});
		}
	}
};

// 自动保存知识点的方法也需要修改
const autoSaveAllKnowledge = async () => {
	if (autoSaving.value) return; // 防止重复保存

	try {
		autoSaving.value = true;

		// 按场景ID重组知识点数据
		const sceneKnowledgeMap = new Map();

		// 遍历所有知识点，按场景分组
		Array.from(currentKnowledge.value.values()).forEach((knowledge) => {
			// 确保我们有一个scenes集合
			if (knowledge.scenes) {
				knowledge.scenes.forEach((sceneId) => {
					if (!sceneKnowledgeMap.has(sceneId)) {
						sceneKnowledgeMap.set(sceneId, []);
					}
					// 创建知识点副本，排除scenes属性
					const { scenes, ...knowledgeData } = knowledge;
					sceneKnowledgeMap.get(sceneId).push(knowledgeData);
				});
			}
		});

		// 收集右侧面板生成的知识点
		scenes.value.forEach((scene, index) => {
			const sceneId = `Scene${index + 1}`;

			// 确保该场景在知识点映射中有一个条目
			if (!sceneKnowledgeMap.has(sceneId)) {
				sceneKnowledgeMap.set(sceneId, []);
			}

			// 从场景块中提取知识点
			const sceneBlocks =
				index === currentSceneIndex.value
					? currentSceneBlocks.value
					: scene.blocks;

			const knowledgeBlocks = sceneBlocks.filter((block) => block.isKnowledge);

			// 如果有知识点块但对应场景没有知识点数据，尝试从块中提取
			if (
				knowledgeBlocks.length > 0 &&
				sceneKnowledgeMap.get(sceneId).length === 0
			) {
				// 这里可以添加从知识点块中提取知识点数据的逻辑
				// 暂时不实现，因为我们已经在生成知识点时添加到了currentKnowledge中
			}
		});

		// 准备批量保存的数据，格式与后端接口匹配
		const outputDialogues = processSceneData();

		// 创建要发送的数据项
		const items = [];

		// 遍历所有对话场景
		outputDialogues.forEach((dialogue) => {
			const sceneId = dialogue.id;
			const sceneKnowledge = sceneKnowledgeMap.get(sceneId) || [];

			// 创建场景数据项
			const item = {
				sceneId: sceneId,
			};

			// 只有当有知识点时才添加knowledge字段
			if (sceneKnowledge.length > 0) {
				item.knowledge = sceneKnowledge;
			}

			// 保持原有practice字段不变
			if (dialogue.practice) {
				item.practice = dialogue.practice;
			}

			// 添加到items数组
			items.push(item);
		});

		const bulkData = {
			catalogId: route.params.id,
			lessonId: route.query.sign,
			items: items,
		};

		// 调用现有的批量保存接口
		const response = await apiClient.post("/knowledge/bulk", bulkData);

		if (response.data.code === 200) {
			lastSavedTime.value = new Date();
			console.log("知识点自动保存成功", new Date().toLocaleTimeString());
		}
	} catch (error) {
		console.error("自动保存失败:", error);
		// 静默失败，不显示提示
	} finally {
		autoSaving.value = false;
	}
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
			if (isCustom) {
				isSaved.value = true;
				clearLocalProgressByCatalogId(catalogId);
				showToast({ message: "保存成功", type: "success" });
			}
		} else {
			showToast({ message: "保存失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: error, type: "error" });
	}
};

const clearLocalProgressByCatalogId = (catalogId) => {
	try {
		const appStore = useAppStore();

		// 过滤掉指定 catalogId 的进度
		const updatedProgress = appStore.progressList.filter(
			(item) => item.course !== catalogId
		);

		// 更新 store
		appStore.initProgress(updatedProgress);
	} catch (error) {
		console.error("Failed to clear local progress:", error);
	}
};

const backToPreview = () => {
	const courseId = route.params.id;
	const season = route.params.season;
	const episode = route.params.episode;
	const sign = route.query.sign;
	const mode = route.query?.mode;
	if (mode === "edit" && !isSaved.value) {
		router.replace("/collections/" + courseId);
		return;
	}
	router.replace({
		path: `/collections/${courseId}/${season}/${episode}`,
		query: {
			sign: sign,
		},
	});
};

const getDefaultJson = () => {
	const season = route.params.season;
	const episode = route.params.episode;
	const defaultData = [
		{
			id: "Scene1",
			season: season,
			episode: episode,
			title: "编辑器使用说明",
			img: "",
			text: exampleText,
			text_zh: exampleTextZh,
		},
	];
	scriptJson.value = {
		scenes: [
			{
				id: season + "-" + episode,
				title: episode,
				dialogues: defaultData,
			},
		],
	};
	currentDialogue.value = defaultData[0];
	totalDialogues.value = defaultData[0].length;
};

const getDefaultKnowledge = () => {
	currentKnowledge.value = new Map();
};

// 打开使用指南弹窗
const openGuideModal = () => {
	document.getElementById("guide_modal").showModal();
};

// 更新 parseDialogueLine 函数来保留文本中的 # 符号
function parseDialogueLine(line, tag) {
	let speaker = "";
	let text = line.trim();

	// 如果是 "zh" 标记，则去除所有标签
	if (tag === "zh") {
		text = text.replace(/<\/?[^>]+(>|$)/g, ""); // 移除所有 HTML 标签
	} else {
		// 检查是否整行被 <i> 标签包裹
		if (/^<i>.*<\/i>$/.test(text)) {
			text = text.slice(3, -4).trim(); // 去掉开头的 <i> 和结尾的 </i>
			speaker = "narration";
		} else {
			// 检查是否有角色名，使用正则表达式匹配最外层的 `[]` 并忽略内层 `[]`
			const match = text.match(/^\[([^\[\]]*)\]\s*(.*)/);
			if (match) {
				speaker = match[1].replace(/\[.*?\]/g, "").trim(); // 移除内部 `[]`
				text = match[2].trim();
			}
		}
	}

	return { speaker, text };
}

// 添加一个新的辅助函数来应用知识点高亮
// 在 script setup 部分的其他函数附近添加
const applyKnowledgeHighlight = (block, sceneIndex) => {
	// 获取场景ID
	const sceneId = `Scene${sceneIndex + 1}`;

	// 初始化 displayText 为原始文本
	block.displayText = block.text;

	// 收集该场景的所有知识点
	const matchedKnowledge = [];
	Array.from(currentKnowledge.value.values()).forEach((knowledge) => {
		if (knowledge.scenes && knowledge.scenes.has(sceneId)) {
			const word = knowledge.word;
			// 使用不区分大小写的包含检查
			if (block.text.toLowerCase().includes(word.toLowerCase())) {
				matchedKnowledge.push(knowledge);
			}
		}
	});

	// 应用高亮
	if (matchedKnowledge.length > 0) {
		matchedKnowledge.forEach((knowledge) => {
			const word = knowledge.word;
			// 使用单词边界正则表达式确保只匹配完整单词
			const regex = new RegExp(`\\b${word}\\b`, "gi");
			const beforeHighlight = block.displayText;
			block.displayText = block.displayText.replace(regex, (match) => {
				return `<mark class="pink">${match}</mark>`;
			});

			if (beforeHighlight === block.displayText) {
				// 尝试不使用单词边界的匹配
				const simpleRegex = new RegExp(word, "gi");
				block.displayText = block.displayText.replace(simpleRegex, (match) => {
					return `<mark class="pink">${match}</mark>`;
				});
			}
		});
	}

	return block;
};

// 监听 blocksMap 变化，更新知识点高亮
watch(
	blocksMap.value,
	() => {
		// 遍历当前场景的所有块
		currentSceneBlocks.value.forEach((block, index) => {
			// 只处理原文块（非标题、非翻译、非知识点）
			if (!block.isTitle && !block.isTranslated && !block.isKnowledge) {
				// 确保块有 ID
				const blockId = block.id || block.originalIndex;
				if (!blockId) return;

				// 获取 blocksMap 中的原始块
				const originalBlock = blocksMap.value.get(blockId);

				// 如果 blocksMap 中的块文本与当前块不同，更新当前块
				if (originalBlock && originalBlock.text !== block.text) {
					// 更新文本
					block.text = originalBlock.text;

					// 重新应用知识点高亮
					applyKnowledgeHighlight(block, currentSceneIndex.value);
				}
			}
		});
	},
	{ deep: true }
);
</script>
<style scoped>
.editor-box {
	position: relative;
	gap: 2rem;
}

/* 选项按钮容器 */
.optionbox-container {
	margin-top: 5%;
	position: sticky;
	top: 10%;
	right: 0;
	height: 10vh;
	display: flex;
	flex-direction: column;
	gap: 1rem;
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

.editor-wrapper {
	height: 100%;
	overflow-y: auto;
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* IE and Edge */
}

.editor-wrapper::-webkit-scrollbar {
	display: none; /* Chrome, Safari and Opera */
}

.editorjs-container {
	padding: 2rem;
	min-height: 100%;
}

/* .optionbox-container button:hover {
	transform: translate(2px, 2px);
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.optionbox-container button:active {
	transform: translate(4px, 4px);
	box-shadow: none;
} */

/* 编辑器容器 */
.editor-container {
	text-align: left;
	height: calc(100vh - 150px);
	border: 3px solid #333;
	border-radius: 12px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
	overflow: hidden;
}

.editorjs-container {
	padding: 2rem;
	height: 100%;
	overflow-y: auto;
	background-size: 100% 24px;
}

.right-panel {
	position: relative;
	height: fit-content;
}

.option-group {
	border: 3px solid #333;
	border-radius: 12px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
}

/* 工具箱容器 */
.toolbox-container {
	height: calc(100vh - 250px);
	overflow-y: auto;
	border: 3px solid #333;
	border-radius: 12px;
	background: white;
	box-shadow: -3px 3px 0 rgba(0, 0, 0, 0.2);
}

/* 工具箱装饰 */
.decorated-card {
	position: relative;
	overflow: hidden;
}

/* 知识点列表样式 */
.group {
	border: 2px solid transparent;
	transition: all 0.3s;
}

/* 滚动条样式 */
.toolbox-container::-webkit-scrollbar {
	width: 8px;
}

.toolbox-container::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}

.toolbox-container::-webkit-scrollbar-thumb {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
}

.toolbox-container::-webkit-scrollbar-thumb:hover {
	background: rgba(0, 0, 0, 0.3);
}

/* 空状态样式 */
.text-gray-500 {
	position: relative;
	padding: 2rem;
	border: 2px dashed #ccc;
	border-radius: 8px;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 10px,
		rgba(0, 0, 0, 0.02) 10px,
		rgba(0, 0, 0, 0.02) 20px
	);
}

.text-gray-500 i {
	font-size: 2.5rem;
	margin-bottom: 0.5rem;
}

/* 顶部装饰条 */
.bg-gradient-to-r {
	height: 4px;
	background: repeating-linear-gradient(
		90deg,
		rgba(var(--primary-color-rgb), 0.3),
		rgba(var(--secondary-color-rgb), 0.3) 20px,
		rgba(var(--primary-color-rgb), 0.3) 40px
	);
}

/* 按钮悬停效果 */
.btn-ghost:hover {
	background: rgba(var(--secondary-color-rgb), 0.1);
	transform: translateY(-1px);
}

.text-toolbox {
	display: flex;
	gap: 0.5rem;
	padding: 0.25rem;
	background-color: #f3f4f6;
	border: 1px solid #e5e7eb;
	border-radius: 0.375rem;
	margin-bottom: 0.5rem;
}

.text-toolbox button {
	padding: 0.25rem 0.5rem;
	font-size: 0.875rem;
	border-radius: 0.25rem;
	background-color: white;
	border: 1px solid #d1d5db;
	cursor: pointer;
}

.text-toolbox button:hover {
	background-color: #f9fafb;
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
	background-color: rgba(var(--secondary-color-rgb), 0.02);
	border-radius: 0.5rem;
	margin: 0.75rem 0;
	border-left: 4px solid var(--secondary-color); /* 添加左侧边框 */
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
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
	color: #3b82f6; /* 蓝色 */
}

.knowledge-delete-btn {
	color: #ef4444; /* 红色 */
}

.knowledge-btn i {
	font-size: 14px;
}
</style>
