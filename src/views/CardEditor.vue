<template>
	<div class="container w-full mx-auto mt-10 pt-2">
		<div class="flex editor-box">
			<!-- 原文编辑器 -->
			<div
				class="editor-container text-sm relative"
				:class="{
					'w-1/2': viewMode === 'both',
					'w-2/3 mx-auto': viewMode === 'editor',
					hidden: viewMode === 'card',
				}"
				v-if="isCustom"
			>
				<!-- 添加导入按钮 -->
				<button
					class="absolute -top-10 right-0 flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-gray-100/80 backdrop-blur-sm px-3 py-1.5 rounded-md"
					@click="openImportDialog"
					:disabled="importing"
				>
					<span
						v-if="importing"
						class="loading loading-spinner loading-xs"
					></span>
					<i v-else class="bi bi-cloud-download"></i>
					<span class="text-sm">通过网址导入</span>
				</button>
				<div
					class="editor-wrapper text-sm rounded shadow-editor"
					style="overflow-y: auto"
				>
					<div id="editor" class="editorjs-container"></div>
				</div>
			</div>
			<!-- 卡片编辑器 -->
			<div
				class="right-panel"
				:class="{
					'w-1/2': viewMode === 'both',
					'w-2/3 mx-auto': viewMode === 'card',
					hidden: viewMode === 'editor',
				}"
			>
				<!-- 导出按钮 -->
				<button
					class="absolute -top-10 right-0 flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-gray-100/80 backdrop-blur-sm px-3 py-1.5 rounded-md"
					@click="exportToPDF"
					:disabled="exportingPDF"
				>
					<span
						v-if="exportingPDF"
						class="loading loading-spinner loading-xs"
					></span>
					<i v-else class="bi bi-markdown"></i>
					<span class="text-sm">导出为 Markdown 文档</span>
				</button>
				<div
					class="toolbox-container border border-gray-100 shadow-xl rounded-xl shadow-knowledge sticky top-[15%]"
				>
					<div class="relative w-full max-w-2xl mx-auto">
						<div class="relative">
							<div class="decorated-card py-6 px-4">
								<!-- 编辑器内容标题 -->
								<div
									class="flex items-center justify-between space-x-2 mx-2 mb-4"
								>
									<div
										class="scene-title text-base font-medium text-left text-xl"
									>
										{{ currentScene?.title }}
									</div>
									<div class="flex items-center gap-4">
										<!-- 一键翻译 -->
										<div class="tooltip" data-tip="一键翻译" v-if="isCustom">
											<button
												class="ghost-btn w-8 h-8 flex items-center justify-center"
												style="padding: 0.4rem"
												@click="translateEntireScene"
												:disabled="translatingScene"
											>
												<span
													v-if="translatingScene"
													class="loading loading-spinner loading-xs"
												></span>
												<!-- <i v-else class="bi bi-lightning-charge text-sm"></i> -->
												<TranslationIcon
													class="relative top-[1px]"
													size="5"
													v-else
												/>
											</button>
										</div>
										<div
											class="tooltip"
											data-tip="一键生成知识点"
											v-if="isCustom"
										>
											<button
												class="ghost-btn w-8 h-8 flex items-center justify-center"
												style="padding: 0.4rem"
												@click="generateKnowledgeForScene"
												:disabled="generatingSceneKnowledge"
											>
												<span
													v-if="generatingSceneKnowledge"
													class="loading loading-spinner loading-xs"
												></span>
												<!-- <i v-else class="bi bi-lightning-charge text-sm"></i> -->
												<KnowledgeIcon
													class="relative top-[1px]"
													size="5"
													v-else
												/>
											</button>
										</div>
										<!-- 生成播客按钮 -->
										<div class="tooltip" data-tip="生成播客" v-if="isCustom">
											<button
												class="ghost-btn w-8 h-8 flex items-center justify-center"
												style="padding: 0"
												@click="openKnowledgeModal"
											>
												<PodcastIcon size="6" />
											</button>
										</div>

										<!-- 选择场景 -->
										<select
											v-model="currentSceneIndex"
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

								<!-- 场景内容显示区 -->
								<div class="scene-content space-y-4">
									<!-- 编辑区 -->
									<div class="original-text space-y-2">
										<template
											v-for="(block, index) in currentSceneBlocks"
											:key="index"
										>
											<!-- 工具栏 -->
											<div
												v-if="
													isCustom &&
													selectedBlockIndex === index &&
													!block.isTitle
												"
												class="text-toolbox bg-milk border-2 border-gray-800 rounded-lg flex items-center justify-between px-4 py-2 shadow-retro relative"
											>
												<!-- 左侧按钮组 -->
												<div class="flex items-center gap-3">
													<button
														class="ghost-btn"
														@click="translateBlock(index)"
													>
														翻译
													</button>
													<button
														class="ghost-btn"
														@click="generateKnowledgeFromBlock(block)"
													>
														生成知识点
													</button>
													<button
														class="ghost-btn"
														@click="toggleNarration(index)"
													>
														{{
															currentSceneBlocks[index].narration
																? "取消注释"
																: "标记为注释"
														}}
													</button>
													<!-- 说话者选择 -->
													<div class="speaker-select relative w-40">
														<div
															class="min-h-[32px] p-1 border border-gray-300 rounded-lg cursor-text flex items-center hover:border-gray-400 transition-colors"
														>
															<input
																v-model="newSpeaker"
																type="text"
																class="flex-1 min-w-[60px] bg-transparent border-none outline-none text-xs text-gray-700"
																placeholder="选择或输入说话者..."
																@input="showSpeakerDropdown = true"
																@focus="showSpeakerDropdown = true"
																@change="handleSpeakerInput"
															/>
														</div>

														<!-- 下拉列表 -->
														<div
															v-if="
																showSpeakerDropdown &&
																filteredSpeakers.length > 0
															"
															class="absolute z-50 mt-1 w-full bg-base-100 border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto"
														>
															<div
																v-for="speaker in filteredSpeakers"
																:key="speaker"
																class="px-3 py-2 hover:bg-milk cursor-pointer text-xs text-gray-700 flex items-center justify-between group"
															>
																<span @click="selectSpeaker(speaker)">{{
																	speaker
																}}</span>
																<button
																	class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
																	@click.stop="removeSpeaker(speaker)"
																>
																	<i class="bi bi-x-circle"></i>
																</button>
															</div>
														</div>
													</div>
												</div>

												<!-- 右侧加载状态指示器 -->
												<div class="flex items-center gap-3">
													<div
														v-if="
															translatingBlockId === block.id ||
															generatingKnowledgeBlockId === block.id
														"
														class="flex items-center justify-center w-6 h-6"
													>
														<span
															class="loading loading-spinner loading-xs text-gray-800"
														></span>
													</div>
												</div>
											</div>
											<div
												class="text-sm p-2 rounded hover:bg-gray-50 cursor-pointer text-left"
												:class="{
													'font-bold': block.isTitle,
													'translated-text': block.isTranslated,
													'knowledge-block': block.isKnowledge,
													'text-primary': block.narration,
												}"
												@click="handleBlockClick(index, block)"
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

												<!-- 普通文本使用简单布局 -->
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
				</div>
			</div>
		</div>
		<KnowledgeGenerator
			v-if="editor"
			ref="knowledgeGeneratorRef"
			:editor="editor"
			:currentKnowledge="currentKnowledge"
			@update:currentKnowledge="currentKnowledge = $event"
		/>

		<!-- 添加悬浮按钮组 -->
		<div class="fixed-action-buttons">
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
				<button
					class="retro-btn"
					@click="saveDialogue(true)"
					:disabled="!isCustom"
				>
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">
								<i class="bi bi-floppy text-lg"></i>
							</div>
						</div>
					</div>
				</button>
			</div>

			<div class="tooltip" data-tip="视图">
				<button class="retro-btn" @click="toggleViewMode" :disabled="!isCustom">
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">
								<i
									class="bi"
									:class="{
										'bi-layout-split': viewMode === 'both',
										'bi-layout-text-window': viewMode === 'editor',
										'bi-layout-text-sidebar': viewMode === 'card',
									}"
								></i>
							</div>
						</div>
					</div>
				</button>
			</div>

			<!-- 新增说明指南按钮 -->
			<div class="tooltip" data-tip="使用说明">
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

		<!-- 在 components 中添加引用 -->
		<ImportDialog ref="importDialogRef" @confirm="handleImportConfirm" />

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
		<!-- 知识点详情模态框 -->
		<dialog id="knowledge_detail_modal" class="modal">
			<div
				class="modal-box border-2 border-gray-800"
				style="background-color: var(--milk-color)"
			>
				<div class="flex items-center gap-2">
					<h3 class="font-bold text-lg text-secondary">
						{{ selectedKnowledge?.word }}
					</h3>
					<PodcastIcon
						v-if="selectedKnowledge?.hasPodcast"
						size="5"
						class="text-secondary"
					/>
				</div>
				<div class="pt-2 pb-4 space-y-4">
					<!-- 中文释义 -->
					<div class="text-sm text-gray-500 text-left">
						{{ selectedKnowledge?.word_zh }}
					</div>

					<!-- 分割线 -->
					<div class="border-b border-gray-200"></div>

					<!-- 中文释义 -->
					<div>
						<h4 class="font-medium mb-2 text-left">中文释义</h4>
						<p class="text-sm text-gray-600 text-left">
							{{ selectedKnowledge?.definition_zh }}
						</p>
					</div>

					<!-- 同义词 -->
					<div v-if="selectedKnowledge?.synonyms">
						<h4 class="font-medium mb-2 text-left">同义词</h4>
						<ol
							class="text-sm text-gray-600 space-y-1 list-decimal list-inside"
						>
							<li
								v-for="(synonym, index) in selectedKnowledge.synonyms.split(
									'|'
								)"
								:key="index"
								class="text-left"
							>
								{{ synonym.trim() }}
							</li>
						</ol>
					</div>

					<!-- 例句 -->
					<div v-if="selectedKnowledge?.example" class="space-y-1">
						<h4 class="font-medium mb-2 text-left">例句</h4>
						<p class="text-sm text-gray-600 text-left">
							{{ selectedKnowledge?.example }}
						</p>
						<p class="text-sm text-gray-500 text-left">
							{{ selectedKnowledge?.example_zh }}
						</p>
					</div>

					<!-- 笔记 -->
					<div v-if="selectedKnowledge?.note">
						<h4 class="font-medium mb-2 text-left">补充说明</h4>
						<p class="text-sm text-gray-600 text-left">
							{{ selectedKnowledge?.note }}
						</p>
					</div>
				</div>

				<div class="modal-action justify-center">
					<form method="dialog">
						<button class="btn btn-sm btn-secondary text-white">关闭</button>
					</form>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>关闭</button>
			</form>
		</dialog>
		<!-- 删除知识点确认对话框 -->
		<dialog id="delete_knowledge_modal" class="modal">
			<div class="modal-box">
				<h3 class="font-bold text-lg">确认删除</h3>
				<p class="py-4 text-base">
					确定要删除知识点
					<span class="font-bold text-secondary">{{ knowledgeToDelete }}</span>
					吗？
				</p>
				<div class="modal-action flex justify-center gap-4">
					<button
						class="btn btn-error btn-sm text-white"
						@click="confirmDeleteKnowledge"
					>
						删除
					</button>
					<form method="dialog">
						<button class="btn btn-sm">取消</button>
					</form>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>取消</button>
			</form>
		</dialog>

		<!-- 在模板部分添加确认对话框 -->
		<dialog id="leave_confirm_modal" class="modal">
			<div class="modal-box">
				<h3 class="font-bold text-lg">确认离开</h3>
				<p class="py-4 text-base">您有未保存的更改，确定要离开吗？</p>
				<div class="modal-action flex justify-center gap-4">
					<button
						class="btn btn-accent btn-sm text-white"
						@click="saveDialogue(true, true)"
					>
						保存并离开
					</button>
					<button
						class="btn btn-secondary btn-sm text-white"
						@click="confirmLeave"
					>
						确认离开
					</button>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>取消</button>
			</form>
		</dialog>
	</div>
</template>
<script setup>
import { ref, onMounted, computed, onBeforeMount } from "vue";
import { showToast } from "@/components/common/toast.js";
import EditorJS from "@editorjs/editorjs";
import apiClient from "@/api";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useAppStore } from "@/store";
import KnowledgeGenerator from "@/components/cardEditor/KnowledgeGenerator.vue";
import { v4 as uuidv4 } from "uuid";
import PodcastIcon from "@/components/icons/Podcast.vue";
import KnowledgeIcon from "@/components/icons/Knowledge.vue";
import TranslationIcon from "@/components/icons/Translation.vue";
import {
	calculateMaxPhrases,
	calculateMaxPhrasesForScene,
	highlightKnowledgeInText,
	applyKnowledgeHighlight,
} from "@/utils/editor";
import { generateTextHash } from "@/utils";
import ImportDialog from "@/components/cardEditor/ImportDialog.vue";

const route = useRoute();
const router = useRouter();
const editor = ref(null);
const totalDialogues = ref(0); // 总对话数

const currentDialogueIndex = ref(0); // 当前对话索引
const currentDialogue = ref({}); // 当前对话
const currentKnowledge = ref(new Map()); // 当前知识点
const scriptJson = ref(null);

const knowledgeGeneratorRef = ref(null); // 知识点生成器引用

const generateAllLoading = ref(false);
const isSaved = ref(false);
const hasUnsavedChanges = ref(false);

// 添加自动保存状态变量
const autoSaving = ref(false);
const lastSavedTime = ref(null);

const scenes = ref([]);
const currentSceneIndex = ref(0);
const currentScene = ref(null);
const currentSceneBlocks = ref([]);

const selectedBlockIndex = ref(null);
const selectedKnowledge = ref(null);
const knowledgeToDelete = ref(null); // 存储待删除的知识点

// 添加新的数据结构
const blocksMap = ref(new Map()); // 存储所有块的数据，键为唯一ID
const sceneStructure = ref([]); // 存储场景结构，包含块ID的引用

const speakers = ref(new Set()); // 存储所有说话者
const showSpeakerDropdown = ref(false);
const newSpeaker = ref("");

const translatingBlockId = ref(null);
const generatingKnowledgeBlockId = ref(null);
const processingEntireScene = ref(false); // 处理全部内容的状态变量
const translatingScene = ref(false);
const generatingSceneKnowledge = ref(false);
const isCustom = ref(false);
// 视图显示状态
const viewMode = ref("both"); // 'both', 'editor', 'card'

// 导出状态变量
const exportingPDF = ref(false);

const importDialogRef = ref(null);

const openImportDialog = () => {
	importDialogRef.value?.openDialog();
};
// 添加导出 Markdown 方法
const exportToMarkdown = async () => {
	try {
		exportingPDF.value = true;

		// 生成 Markdown 内容，遍历所有场景
		let markdownContent = "";

		scenes.value.forEach((scene, sceneIndex) => {
			// 添加场景标题
			markdownContent += `## ${scene.title || `场景 ${sceneIndex + 1}`}\n\n`;

			// 获取当前场景的块
			const sceneBlocks =
				sceneIndex === currentSceneIndex.value
					? currentSceneBlocks.value
					: scene.blocks;

			// 遍历场景中的所有块
			sceneBlocks.forEach((block) => {
				if (block.isTitle) return;

				// 处理说话者和原文
				if (!block.isTranslated && !block.isKnowledge) {
					const speakerText = block.speaker ? `[**${block.speaker}**] ` : "";
					const cleanText = (block.displayText || block.text || "")
						.replace(/<mark[^>]*>(.*?)<\/mark>/g, "**`$1`**")
						.replace(/<[^>]+>/g, "");
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
							(k) => k.word === word || k.word_zh === translation
						);

						// 检查前一个块是否也是知识点
						const prevBlock = sceneBlocks[sceneBlocks.indexOf(block) - 1];
						const isPrevKnowledge = prevBlock && prevBlock.isKnowledge;

						// 如果前一个块是知识点，添加空行
						if (isPrevKnowledge) {
							markdownContent += "\n";
						}

						if (knowledge) {
							markdownContent += `> 💡 **${knowledge.word}** ｜ ${
								knowledge.word_zh
							}
> 📝 **解释**：${knowledge.definition_zh}
> 💫 **例句**：${knowledge.example} / ${knowledge.example_zh}
> 🎯 **同义词**：${knowledge.synonyms
								.split("|")
								.map((s, i) => `${i + 1}/ ${s.trim()}`)
								.join(" ")}\n\n---\n\n`;
						} else {
							markdownContent += `> 💡 ${word} - ${translation}\n\n---\n\n`;
						}
					}
				}
			});

			// 在场景之间添加额外的分隔
			if (sceneIndex < scenes.value.length - 1) {
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
		exportingPDF.value = false;
	}
};

const handleImportConfirm = async (importData) => {
	const { content, type, mode } = importData;

	// 根据导入类型和模式处理数据
	let newBlocks = [];

	if (type === "scene") {
		// 按场景导入
		content.scenes.forEach((scene, sceneIndex) => {
			// 添加场景标题
			newBlocks.push({
				type: "paragraph",
				data: {
					text: `# Header`,
				},
			});

			// 添加场景内容
			scene.forEach((paragraph) => {
				newBlocks.push({
					type: "paragraph",
					data: {
						text: paragraph,
					},
				});
			});
		});
	} else {
		// 按段落导入
		newBlocks.push({
			type: "paragraph",
			data: {
				text: `# Header`,
			},
		});

		// 添加场景内容
		content.paragraphs.forEach((paragraph) => {
			newBlocks.push({
				type: "paragraph",
				data: {
					text: paragraph,
				},
			});
		});
	}

	if (mode === "replace") {
		// 替换模式：清空现有内容
		await editor.value.clear();
		await editor.value.render({ blocks: newBlocks });
	} else {
		// 追加模式：获取现有内容后追加
		const currentContent = await editor.value.save();
		const updatedBlocks = [...currentContent.blocks, ...newBlocks];
		await editor.value.render({ blocks: updatedBlocks });
	}

	// 更新场景
	await updateCurrentScene();

	showToast({ message: "导入成功", type: "success" });
};

// 添加导出PDF方法
const exportToPDF = exportToMarkdown;

// 计算过滤后的说话者列表
const filteredSpeakers = computed(() => {
	if (!newSpeaker.value) return Array.from(speakers.value || new Set());
	return Array.from(speakers.value || new Set()).filter((speaker) =>
		speaker.toLowerCase().includes(newSpeaker.value.toLowerCase())
	);
});

// 使用指南数据
const guideItems = ref([
	{
		title: "左侧编辑器",
		description: "左侧编辑器负责编辑英文原始内容，并自动同步到右侧卡片生成器",
	},
	{
		title: "卡片标题(必填)",
		description: "每张卡片的标题请以 # 开头，系统将根据标题自动划分场景",
	},
	{
		title: "右侧卡片生成器",
		description: "卡片生成器提供生成知识点、翻译、注释等功能",
	},
	{
		title: "保存",
		description: "点击右侧保存按钮，生成知识点卡片",
	},
]);

// 编辑器初始化
const initEditorJS = async () => {
	console.log("Initializing EditorJS...");
	if (!scriptJson.value) return;

	try {
		processingEntireScene.value = true; // 设置初始化状态
		// 创建默认场景
		if (!scenes.value || scenes.value.length === 0) {
			const defaultScene = {
				index: 0,
				title: "",
				blockIds: [],
				blocks: [],
			};
			scenes.value = [defaultScene];
			currentScene.value = defaultScene;
			currentSceneBlocks.value = [];
			sceneStructure.value = [
				{
					index: 0,
					title: "",
					blockIds: [],
				},
			];
		}

		const blocks = scriptJson.value
			? await initEditorBlocks(scriptJson.value)
			: [];

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
				processingEntireScene.value = false; // 初始化完成后重置状态
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
		processingEntireScene.value = false; // 确保在出错时也重置状态
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
		if (dialogue.title) {
			const titleId = `title_${dialogueIndex}`;
			const titleBlock = {
				type: "paragraph",
				data: { text: `# ${dialogue.title}` },
				id: titleId,
			};
			blocks.push(titleBlock);

			// 保存标题块到blocksMap
			blocksMap.value.set(titleId, {
				id: titleId,
				text: `# ${dialogue.title}`,
				isTitle: true,
			});
		}

		// 处理每组文本，只添加英文原文
		for (let i = 0; i < dialogue.text.length; i++) {
			const [speaker, text] = dialogue.text[i];

			// 创建唯一ID
			const blockId = `block_${dialogueIndex}_${i}`;

			// 创建编辑器块
			const editorBlock = {
				type: "paragraph",
				data: { text: text }, // 直接使用text，不添加说话者标记
				id: blockId,
			};
			blocks.push(editorBlock);

			// 保存原文块到blocksMap
			blocksMap.value.set(blockId, {
				id: blockId,
				text: text, // 存储纯文本
				speaker: speaker, // 单独存储说话者
				isTitle: false,
				narration: speaker === "narration",
				originalIndex: blockId,
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
					originalIndex: blockId,
				});
			}
		}
	});

	return blocks;
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
					// 不管是哪个场景的知识点，都添加到 Map 中
					if (!currentKnowledge.value.has(item.word)) {
						currentKnowledge.value.set(item.word, {
							...item,
							scenes: new Set([scene.sceneId]),
						});
					} else {
						// 如果知识点已存在，只更新场景信息
						const existingKnowledge = currentKnowledge.value.get(item.word);
						existingKnowledge.scenes.add(scene.sceneId);
					}
				});
			});
		}
	} catch (error) {
		console.error(error);
	}
};

// 初始化右侧面板知识点显示
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

			// 收集该场景的所有知识点
			const matchedKnowledge = [];

			// 从知识点Map中筛选出当前场景的知识点
			Array.from(currentKnowledge.value.values()).forEach((knowledge) => {
				if (knowledge.scenes && knowledge.scenes.has(sceneId)) {
					// 将所有该场景的知识点添加到匹配列表中
					matchedKnowledge.push(knowledge);
				}
			});

			// 如果场景有知识点，为每个原文块应用高亮
			if (matchedKnowledge.length > 0) {
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

					// 使用 applyKnowledgeHighlight 函数应用知识点高亮
					applyKnowledgeHighlight(block, sceneIndex, currentKnowledge.value);

					// 检查块是否有匹配的知识点（通过检查 displayText 是否包含 mark 标签）
					if (
						block.displayText &&
						block.displayText.includes('<mark class="pink">')
					) {
						// 检查下一个块是否是翻译块
						const nextIndex = i + 1;
						const hasTranslation =
							nextIndex < sceneBlocks.length &&
							sceneBlocks[nextIndex].isTranslated;

						// 确定插入位置：如果有翻译块，则在翻译块后面插入；否则在当前块后面插入
						const insertIndex = hasTranslation ? nextIndex + 1 : nextIndex;

						// 筛选出与当前块文本匹配的知识点
						const blockMatchedKnowledge = matchedKnowledge.filter((k) =>
							block.text.toLowerCase().includes(k.word.toLowerCase())
						);

						// 如果找到匹配的知识点，创建知识点展示块
						if (blockMatchedKnowledge.length > 0) {
							// 创建知识点展示块
							const knowledgeId = `knowledge-${blockId}`;
							const knowledgeBlock = {
								id: knowledgeId,
								text: formatKnowledgeDisplay(blockMatchedKnowledge),
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
			}
		});
	} catch (error) {
		console.error("初始化知识点显示失败:", error);
	}
};

// 初始化右侧面板的场景数据
const initRightPanelScenes = (scriptData) => {
	const newScenes = [];

	scriptData.scenes[0].dialogues.forEach((dialogue, dialogueIndex) => {
		console.log(dialogue);
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
			// 创建唯一ID
			const blockId = `block_${dialogueIndex}_${i}`;

			// 创建原文块
			const originalBlock = {
				id: blockId,
				text: text, // 存储纯文本内容
				speaker: speaker, // 单独存储说话者
				isTitle: false,
				narration: speaker === "narration",
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

const initDialogues = async () => {
	try {
		const res = await apiClient.get(`/scripts/episode/${route.query.sign}`);
		if (res.data.code === 200 && res.data.data) {
			isCustom.value = res.data.data.isCustom;
			viewMode.value = isCustom.value ? "both" : "card";
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

// 打开模态框
const openKnowledgeModal = async () => {
	try {
		generateAllLoading.value = true;
		await knowledgeGeneratorRef.value.openModal();
	} finally {
		generateAllLoading.value = false;
	}
};

onMounted(async () => {
	// 从 localStorage 加载说话者列表
	const savedSpeakers = localStorage.getItem("cardEditorSpeakers");
	if (savedSpeakers) {
		const speakerArray = JSON.parse(savedSpeakers);
		speakers.value = new Set(speakerArray);
	}

	document.addEventListener("click", (e) => {
		const target = e.target;
		if (!target.closest(".speaker-select")) {
			showSpeakerDropdown.value = false;
			newSpeaker.value = "";
		}
	});

	if (route.query.mode === "edit") {
		getDefaultJson();
		getDefaultKnowledge();
		// viewMode.value = "editor";
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

// 选择说话者
const selectSpeaker = (speaker) => {
	applySpeakerToBlock(speaker);
	showSpeakerDropdown.value = false;
	newSpeaker.value = "";
};

// 移除说话者
const removeSpeaker = (speaker) => {
	speakers.value.delete(speaker);
	localStorage.setItem(
		"cardEditorSpeakers",
		JSON.stringify(Array.from(speakers.value))
	);
};

const updateCurrentScene = async () => {
	if (!editor.value) return;

	const content = await editor.value.save();
	const editorBlocks = content.blocks;

	// 检查编辑器是否为空，如果为空则添加默认标题
	if (editorBlocks.length === 0) {
		await editor.value.render({
			blocks: [
				{
					type: "paragraph",
					data: {
						text: "# Default Card Title",
					},
				},
			],
		});
		// 重新获取内容
		content = await editor.value.save();
		editorBlocks = content.blocks;
	}

	// 检查是否存在标题
	const hasTitle = editorBlocks.some(
		(block) => block.data.text && block.data.text.startsWith("#")
	);

	// 如果没有标题，自动添加一个默认标题
	if (!hasTitle && editorBlocks.length > 0) {
		editorBlocks.unshift({
			type: "paragraph",
			data: {
				text: "# Scene 1",
			},
		});
	}

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
	let currentSceneObj = null;
	let contentChanged = false; // 标记内容是否有变化

	// 找出所有场景标题和原文块
	for (let i = 0; i < editorBlocks.length; i++) {
		const block = editorBlocks[i];
		const text = block.data.text;

		// 检查是否是标题
		if (text.startsWith("#")) {
			currentSceneObj = {
				index: newScenes.length,
				title: text.replace("#", "").trim(),
				blockIds: [], // 存储块ID而不是块内容
			};
			newScenes.push(currentSceneObj);

			// 更新右侧面板的标题显示
			if (scenes.value[newScenes.length - 1]) {
				scenes.value[newScenes.length - 1].title = currentSceneObj.title;
			}
			continue;
		}

		if (!currentSceneObj) continue;

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
				narration: false, // 添加 narration 标记
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
				console.log("bianhua");
				contentChanged = true; // 标记内容已变化
				hasUnsavedChanges.value = true; // 标记有未保存的更改
				// 更新 displayText
				if (existingBlock.displayText) {
					// 重新应用知识点高亮
					applyKnowledgeHighlight(
						existingBlock,
						currentSceneIndex.value,
						currentKnowledge.value
					);
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
		currentSceneObj.blockIds.push(blockId);
	}

	// 第三步：更新场景数据
	sceneStructure.value = newScenes;

	// 如果场景结构发生变化，也标记为有未保存的更改
	if (
		!processingEntireScene.value && // 添加初始化检查
		JSON.stringify(sceneStructure.value) !==
			JSON.stringify(
				scenes.value.map((s) => ({
					index: s.index,
					title: s.title,
					blockIds: s.blockIds,
				}))
			)
	) {
		contentChanged = true;
		hasUnsavedChanges.value = true;
	}

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

// 处理整个场景的翻译
const translateEntireScene = async () => {
	if (translatingScene.value || !currentScene.value) return;

	try {
		translatingScene.value = true;
		showToast({ message: "开始翻译场景内容...", type: "info" });

		// 1. 收集当前场景的所有原文块
		const originalBlocks = currentSceneBlocks.value.filter(
			(block) => !block.isTitle && !block.isTranslated && !block.isKnowledge
		);

		if (originalBlocks.length === 0) {
			showToast({ message: "当前场景没有可翻译的原文内容", type: "warning" });
			return;
		}

		// 2. 批量翻译所有原文
		const textsToTranslate = originalBlocks.map((block) => block.text);
		const batchTranslationResponse = await apiClient.post(
			"/translation/batch",
			{
				texts: textsToTranslate,
				source: "en",
				target: "zh",
			}
		);

		const translatedTexts = batchTranslationResponse.data.data.translations;

		// 3. 为每个原文块添加翻译
		for (let i = 0; i < originalBlocks.length; i++) {
			const block = originalBlocks[i];
			const blockId = block.id || block.originalIndex;

			if (!blockId) continue;

			// 创建翻译块
			const translationId = `translation-${blockId}`;
			const translationBlock = {
				id: translationId,
				text: translatedTexts[i],
				isTitle: false,
				isTranslated: true,
				originalId: blockId,
				originalIndex: blockId,
			};

			// 保存到blocksMap
			blocksMap.value.set(translationId, translationBlock);

			// 查找原文块在当前场景中的位置并插入翻译
			const blockIndex = currentSceneBlocks.value.findIndex(
				(b) => b.id === blockId || b.originalIndex === blockId
			);

			if (blockIndex >= 0) {
				// 检查是否已有翻译块
				const nextIndex = blockIndex + 1;
				const hasTranslation =
					nextIndex < currentSceneBlocks.value.length &&
					currentSceneBlocks.value[nextIndex].isTranslated;

				if (!hasTranslation) {
					// 在原文块后插入翻译块
					currentSceneBlocks.value.splice(blockIndex + 1, 0, translationBlock);
				} else {
					// 更新现有翻译块
					currentSceneBlocks.value[nextIndex].text = translationBlock.text;
				}
			}
		}

		hasUnsavedChanges.value = true;
		showToast({ message: "场景翻译完成", type: "success" });
	} catch (error) {
		console.error("翻译场景内容失败:", error);
		showToast({ message: "翻译失败，请重试", type: "error" });
	} finally {
		translatingScene.value = false;
	}
};

// 为整个场景生成知识点
const generateKnowledgeForScene = async () => {
	if (generatingSceneKnowledge.value || !currentScene.value) return;

	try {
		generatingSceneKnowledge.value = true;
		showToast({ message: "开始生成场景知识点...", type: "info" });

		// 1. 收集当前场景的所有原文块
		const originalBlocks = currentSceneBlocks.value.filter(
			(block) => !block.isTitle && !block.isTranslated && !block.isKnowledge
		);

		if (originalBlocks.length === 0) {
			showToast({ message: "当前场景没有可处理的原文内容", type: "warning" });
			return;
		}

		// 2. 将整个场景的文本合并，一次性获取关键词
		const entireSceneText = originalBlocks.map((block) => block.text).join(" ");
		const wordCount = entireSceneText
			.split(/\s+/)
			.filter((word) => word.length > 0).length;
		const maxPhrases = calculateMaxPhrasesForScene(wordCount);
		const keyPhrases = await extractKeyPhrasesForScene(
			entireSceneText,
			maxPhrases
		);

		// 3. 逐个生成知识点并实时更新界面
		for (const phrase of keyPhrases) {
			try {
				const res = await apiClient.post("/translation/generate", {
					word: phrase,
				});

				if (res.data.code === 200) {
					const knowledgeItem = res.data.data;
					const sceneId = `Scene${currentSceneIndex.value + 1}`;

					// 添加到知识点集合
					currentKnowledge.value.set(knowledgeItem.word, {
						...knowledgeItem,
						scenes: new Set([sceneId]),
					});

					// 立即为所有包含该知识点的原文块应用高亮和添加知识点块
					for (const block of originalBlocks) {
						const blockId = block.id || block.originalIndex;
						if (!blockId) continue;

						if (
							block.text
								.toLowerCase()
								.includes(knowledgeItem.word.toLowerCase())
						) {
							// 应用高亮
							applyKnowledgeHighlight(
								block,
								currentSceneIndex.value,
								currentKnowledge.value
							);

							// 检查并添加知识点块
							const knowledgeId = `knowledge-${blockId}`;
							const existingKnowledgeBlock = currentSceneBlocks.value.find(
								(b) => b.id === knowledgeId
							);

							if (existingKnowledgeBlock) {
								// 更新现有知识点块
								const matchingKnowledge = Array.from(
									currentKnowledge.value.values()
								).filter((k) =>
									block.text.toLowerCase().includes(k.word.toLowerCase())
								);
								existingKnowledgeBlock.text =
									formatKnowledgeDisplay(matchingKnowledge);
							} else {
								// 创建新的知识点块
								const blockIndex = currentSceneBlocks.value.findIndex(
									(b) => b.id === blockId || b.originalIndex === blockId
								);

								if (blockIndex >= 0) {
									const nextIndex = blockIndex + 1;
									const hasTranslation =
										nextIndex < currentSceneBlocks.value.length &&
										currentSceneBlocks.value[nextIndex].isTranslated;

									const knowledgeBlock = {
										id: knowledgeId,
										text: formatKnowledgeDisplay([knowledgeItem]),
										isTitle: false,
										isKnowledge: true,
										originalId: blockId,
										originalIndex: blockId,
									};

									// 保存到blocksMap
									blocksMap.value.set(knowledgeId, knowledgeBlock);

									// 插入到适当位置
									const insertIndex = hasTranslation
										? nextIndex + 1
										: nextIndex;
									currentSceneBlocks.value.splice(
										insertIndex,
										0,
										knowledgeBlock
									);
								}
							}

							// 强制更新视图
							currentSceneBlocks.value = [...currentSceneBlocks.value];
						}
					}
				}
			} catch (err) {
				console.error(`Failed to generate knowledge for "${phrase}":`, err);
			}
		}

		hasUnsavedChanges.value = true;
		showToast({ message: "知识点生成完成", type: "success" });
	} catch (error) {
		console.error("生成知识点失败:", error);
		showToast({ message: "生成知识点失败，请重试", type: "error" });
	} finally {
		generatingSceneKnowledge.value = false;
	}
};

// 生成知识点
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

		generatingKnowledgeBlockId.value = blockId; // 设置正在生成知识点的块ID

		// 提取关键词
		const keyPhrases = await extractKeyPhrases(block.text);
		const generatedKnowledgeItems = [];

		for (const phrase of keyPhrases) {
			try {
				const res = await apiClient.post("/translation/generate", {
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
		let highlightedText = highlightKnowledgeInText(
			block.text,
			generatedKnowledgeItems
		);

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

			hasUnsavedChanges.value = true;
		}

		showToast({ message: "知识点生成成功", type: "success" });
	} catch (error) {
	} finally {
		generatingKnowledgeBlockId.value = null; // 清除正在生成知识点的块ID
	}
};

// 提取关键词或短语（整个场景）
const extractKeyPhrasesForScene = async (text, maxPhrases) => {
	try {
		// 收集当前场景已存在的知识点
		const existingPhrases = Array.from(currentKnowledge.value.keys());

		const response = await apiClient.post("/translation/extract-key-phrases", {
			text,
			options: {
				maxPhrases,
				existingPhrases, // 传入已存在的知识点列表
			},
		});

		if (response.data.code === 200) {
			return response.data.data.phrases;
		}
		return [];
	} catch (error) {
		console.error("Failed to extract key phrases for scene:", error);
		return [];
	}
};

// 提取关键词或短语（单个 block）
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

// 处理文本块点击
const handleBlockClick = (index, block) => {
	if (block.isTitle || block.isTranslated || block.isKnowledge) {
		selectedBlockIndex.value = null;
		return;
	}

	// 如果点击的是当前已选中的块，则取消选中（关闭工具栏）
	if (selectedBlockIndex.value === index) {
		selectedBlockIndex.value = null;
		return;
	}

	// 否则选中新的块（显示工具栏）
	selectedBlockIndex.value = index;
};

// 点击知识点按钮
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

const toggleViewMode = () => {
	switch (viewMode.value) {
		case "both":
			viewMode.value = "editor";
			break;
		case "editor":
			viewMode.value = "card";
			break;
		case "card":
			viewMode.value = "both";
			break;
	}
};

const toggleNarration = (index) => {
	const block = currentSceneBlocks.value[index];
	if (!block) return;

	// 确保块有ID
	const blockId = block.id || block.originalIndex;
	if (!blockId) return;

	// 获取原始文本（移除所有HTML标签）
	const plainText = block.text.replace(/<\/?[^>]+(>|$)/g, "");

	// 切换 narration 状态
	block.narration = !block.narration;

	// 更新block的文本
	block.text = plainText;

	// 如果有displayText，也需要更新
	if (block.displayText) {
		block.displayText = plainText;
		// 重新应用知识点高亮
		applyKnowledgeHighlight(
			block,
			currentSceneIndex.value,
			currentKnowledge.value
		);
	} else {
		block.displayText = plainText;
	}

	// 更新blocksMap中的数据
	const originalBlock = blocksMap.value.get(blockId);
	if (originalBlock) {
		originalBlock.narration = block.narration;
		originalBlock.text = plainText;
		if (originalBlock.displayText) {
			originalBlock.displayText = plainText;
			applyKnowledgeHighlight(
				block,
				currentSceneIndex.value,
				currentKnowledge.value
			);
		} else {
			originalBlock.displayText = plainText;
		}
	}

	// 强制更新视图
	currentSceneBlocks.value = [...currentSceneBlocks.value];
};

const handleSpeakerInput = () => {
	if (newSpeaker.value.trim()) {
		applySpeakerToBlock(newSpeaker.value.trim());
		if (!speakers.value.has(newSpeaker.value.trim())) {
			speakers.value.add(newSpeaker.value.trim());
			localStorage.setItem(
				"cardEditorSpeakers",
				JSON.stringify(Array.from(speakers.value))
			);
		}
		newSpeaker.value = "";
	}
};

// 应用说话者到当前块
const applySpeakerToBlock = (speaker) => {
	const block = currentSceneBlocks.value[selectedBlockIndex.value];
	if (!block) return;

	const blockId = block.id || block.originalIndex;
	if (!blockId) return;

	block.speaker = speaker;

	const originalBlock = blocksMap.value.get(blockId);
	if (originalBlock) {
		originalBlock.speaker = speaker;
	}

	// 强制更新视图
	currentSceneBlocks.value = [...currentSceneBlocks.value];
};

// 显示知识点详情
const showKnowledgeDetail = async (word) => {
	const knowledge = currentKnowledge.value.get(word);
	if (knowledge) {
		// 设置选中的知识点
		selectedKnowledge.value = knowledge;

		// 检查是否有对应的播客
		try {
			const textHash = generateTextHash(word.trim());
			const res = await apiClient.get(`/podcasts/search?knowledge=${textHash}`);
			if (res.data.code === 200 && res.data.data.podcasts.length) {
				selectedKnowledge.value.hasPodcast = true;
				selectedKnowledge.value.podcastData = res.data.data.podcasts[0];
			} else {
				selectedKnowledge.value.hasPodcast = false;
				selectedKnowledge.value.podcastData = null;
			}
		} catch (error) {
			console.error("检查播客失败:", error);
			selectedKnowledge.value.hasPodcast = false;
			selectedKnowledge.value.podcastData = null;
		}

		// 打开模态框
		document.getElementById("knowledge_detail_modal").showModal();
	}
};

// 删除知识点
const deleteKnowledge = (word) => {
	// 设置待删除的知识点
	knowledgeToDelete.value = word;

	// 打开确认对话框
	document.getElementById("delete_knowledge_modal").showModal();
};

// 确认删除
const confirmDeleteKnowledge = () => {
	// 从当前知识点Map中删除
	if (
		knowledgeToDelete.value &&
		currentKnowledge.value.has(knowledgeToDelete.value)
	) {
		currentKnowledge.value.delete(knowledgeToDelete.value);

		// 更新所有包含该知识点的块
		updateBlocksAfterKnowledgeDelete(knowledgeToDelete.value);

		hasUnsavedChanges.value = true;
		showToast({
			message: `已删除知识点: ${knowledgeToDelete.value}`,
			type: "success",
		});

		// 关闭对话框
		document.getElementById("delete_knowledge_modal").close();

		// 清空待删除的知识点
		knowledgeToDelete.value = null;
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

// 隐藏toolbox
const handleClickOutside = (event) => {
	// 检查点击是否在文本块或工具栏内部
	const isClickOnBlock = event.target.closest(".text-sm.p-2.rounded");
	const isClickOnToolbox = event.target.closest(".text-toolbox");

	if (!isClickOnBlock && !isClickOnToolbox) {
		selectedBlockIndex.value = null;
	}
};

// 翻译块
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

		translatingBlockId.value = blockId; // 设置正在翻译的块ID

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

		hasUnsavedChanges.value = true;
		showToast({ message: "翻译成功", type: "success" });
	} catch (error) {
		console.error("Translation failed:", error);
		showToast({ message: "翻译失败，请重试", type: "error" });
	} finally {
		translatingBlockId.value = null; // 清除正在翻译的块ID
	}
};

// 格式化知识点显示
const formatKnowledgeDisplay = (knowledgeItems) => {
	return knowledgeItems
		.map((item) => {
			return `<div class="knowledge-item p-1">
			<div class="flex justify-between items-center">
				<div class="flex items-center gap-2">
					<span class="font-bold">${item.word}</span>
					<span class="text-gray-600">${item.word_zh}</span>
				</div>
				${
					isCustom.value
						? `<div class="flex items-center gap-1">
					<button class="knowledge-btn knowledge-detail-btn hover:text-primary transition-colors" data-word="${item.word}" title="详情">
						<i class="bi bi-journal-text"></i>
					</button>
					<button class="knowledge-btn knowledge-delete-btn hover:text-secondary transition-colors" data-word="${item.word}" title="删除">
						<i class="bi bi-trash"></i>
					</button>
				</div>`
						: `<div class="flex items-center gap-1">
					<button class="knowledge-btn knowledge-detail-btn hover:text-primary transition-colors" data-word="${item.word}" title="详情">
						<i class="bi bi-journal-text"></i>
					</button>
				</div>`
				}
			</div>
		</div>`;
		})
		.join("");
};

// 重构场景切换处理方法
const handleSceneChange = () => {
	if (scenes.value.length > 0) {
		currentScene.value = scenes.value[currentSceneIndex.value];
		const newSceneBlocks = [];
		const currentSceneStructure = sceneStructure.value[currentSceneIndex.value];

		if (currentSceneStructure && currentSceneStructure.blockIds) {
			const sceneId = `Scene${currentSceneIndex.value + 1}`;
			const sceneKnowledge = Array.from(currentKnowledge.value.values()).filter(
				(k) => k.scenes && k.scenes.has(sceneId)
			);

			// 遍历当前场景的所有块ID
			for (const blockId of currentSceneStructure.blockIds) {
				const originalBlock = blocksMap.value.get(blockId);
				if (originalBlock) {
					// 添加原文块 - 使用深拷贝确保不共享引用
					const clonedOriginalBlock = JSON.parse(JSON.stringify(originalBlock));

					// 找出与当前块相关的知识点
					const blockKnowledge = sceneKnowledge.filter((k) =>
						clonedOriginalBlock.text
							.toLowerCase()
							.includes(k.word.toLowerCase())
					);

					// 如果有匹配的知识点，应用高亮
					if (blockKnowledge.length > 0) {
						applyKnowledgeHighlight(
							clonedOriginalBlock,
							currentSceneIndex.value,
							currentKnowledge.value
						);
					}

					// 添加原文块
					newSceneBlocks.push(clonedOriginalBlock);

					// 检查是否有对应的翻译块
					const translationId = `translation-${blockId}`;
					if (blocksMap.value.has(translationId)) {
						const translationBlock = blocksMap.value.get(translationId);
						newSceneBlocks.push(JSON.parse(JSON.stringify(translationBlock)));
					}

					// 只有当当前块包含知识点时，才添加知识点块
					if (blockKnowledge.length > 0) {
						const knowledgeId = `knowledge-${blockId}`;
						const knowledgeBlock = {
							id: knowledgeId,
							text: formatKnowledgeDisplay(blockKnowledge),
							isTitle: false,
							isKnowledge: true,
							originalId: blockId,
							originalIndex: blockId,
						};
						blocksMap.value.set(knowledgeId, knowledgeBlock);
						newSceneBlocks.push(JSON.parse(JSON.stringify(knowledgeBlock)));
					}
				}
			}
		}

		currentSceneBlocks.value = newSceneBlocks;
	}
};

// 保存
const saveDialogue = async (isCustom = false, shouldLeave = false) => {
	try {
		// 从右侧面板提取原文
		const outputDialogues = processSceneData();

		if (outputDialogues.length > 0) {
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
			const uploadSuccess = await uploadScripts(updatedJson, isCustom);
			if (!uploadSuccess) {
				return; // 如果上传失败，直接返回
			}

			scriptJson.value = updatedJson;

			// 保存知识点
			await saveAllKnowledge(isCustom);

			if (isCustom) {
				isSaved.value = true; // 标记为已保存
				hasUnsavedChanges.value = false; // 标记为已保存
				showToast({ message: "脚本保存成功", type: "success" });
			}

			// 如果需要离开，关闭确认对话框并执行离开操作
			if (shouldLeave) {
				document.getElementById("leave_confirm_modal").close();
				backToPreview();
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

	// 收集所有当前存在的原文块ID，用于后续检测删除的块
	const existingBlockIds = new Set();

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

			// 记录存在的块ID
			existingBlockIds.add(blockId);

			// 清除原文中的高亮标记，使用原始text而不是displayText
			let cleanText = block.text;
			// 移除所有<mark class="pink">标签
			cleanText = cleanText.replace(/<mark class="pink">(.*?)<\/mark>/g, "$1");

			// 检查是否有对应的翻译块
			const translationId = `translation-${blockId}`;
			const translationBlock = blocksMap.value.get(translationId);

			// 处理原文 - 直接使用 block 的 speaker 和 narration 属性
			if (block.narration) {
				dialogue.text.push(["narration", cleanText]);
			} else {
				dialogue.text.push([block.speaker || "", cleanText]);
			}

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

	// 清理已删除原文块对应的知识点
	cleanupDeletedBlocksKnowledge(existingBlockIds);

	return outputDialogues;
}

// 清理已删除原文块对应的知识点
const cleanupDeletedBlocksKnowledge = (existingBlockIds) => {
	// 获取所有知识点块ID
	const knowledgeBlockIds = Array.from(blocksMap.value.keys()).filter((id) =>
		id.startsWith("knowledge-")
	);

	// 检查每个知识点块，如果对应的原文块不存在了，则删除该知识点
	knowledgeBlockIds.forEach((knowledgeId) => {
		// 提取原文块ID
		const originalBlockId = knowledgeId.replace("knowledge-", "");

		// 如果原文块不存在了，删除对应的知识点块
		if (!existingBlockIds.has(originalBlockId)) {
			// 获取知识点块内容（在删除前）
			const knowledgeBlock = blocksMap.value.get(knowledgeId);
			let wordsToDelete = [];

			// 从知识点块的文本中提取知识点关键词
			if (knowledgeBlock && knowledgeBlock.text) {
				const wordMatches = knowledgeBlock.text.match(/data-word="([^"]+)"/g);
				if (wordMatches) {
					wordsToDelete = wordMatches.map((match) =>
						match.replace('data-word="', "").replace('"', "")
					);
				}
			}

			// 删除知识点块
			blocksMap.value.delete(knowledgeId);

			// 从知识点集合中删除对应的知识点
			wordsToDelete.forEach((word) => {
				if (currentKnowledge.value.has(word)) {
					console.log(`删除已移除原文块的知识点: ${word}`);
					currentKnowledge.value.delete(word);
				}
			});

			// 同时删除对应的翻译块
			const translationId = `translation-${originalBlockId}`;
			if (blocksMap.value.has(translationId)) {
				blocksMap.value.delete(translationId);
			}
		}
	});

	// 检查所有知识点，删除那些不再关联到任何现有场景的知识点
	Array.from(currentKnowledge.value.keys()).forEach((word) => {
		const knowledge = currentKnowledge.value.get(word);
		if (knowledge && knowledge.scenes) {
			// 检查知识点是否还关联到任何现有场景
			let stillUsed = false;

			// 遍历所有场景，检查知识点是否在任何现有原文中出现
			scenes.value.forEach((scene, sceneIndex) => {
				const sceneId = `Scene${sceneIndex + 1}`;
				if (knowledge.scenes.has(sceneId)) {
					// 检查该场景中的所有原文块
					const blockIds = scene.blockIds || [];
					for (const blockId of blockIds) {
						if (existingBlockIds.has(blockId)) {
							const block = blocksMap.value.get(blockId);
							if (
								block &&
								block.text &&
								block.text.toLowerCase().includes(word.toLowerCase())
							) {
								stillUsed = true;
								break;
							}
						}
					}
				}
			});

			// 如果知识点不再使用，删除它
			if (!stillUsed) {
				console.log(`删除不再使用的知识点: ${word}`);
				currentKnowledge.value.delete(word);
			}
		}
	});
};

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
	const episodeId = route.query.sign;
	try {
		const response = await apiClient.post(
			`/scripts/${catalogId}/episode/${episodeId}`,
			{
				scriptData: jsonData,
			}
		);

		if (response.data.code === 200) {
			if (isCustom) {
				isSaved.value = true;
				clearLocalProgressByCatalogId(catalogId);
			}
			return true; // 保存成功返回 true
		} else {
			showToast({ message: "保存失败", type: "error" });
			return false; // 保存失败返回 false
		}
	} catch (error) {
		showToast({ message: "保存失败", type: "error" });
		return false; // 发生错误返回 false
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
			title: "Default Card Title",
			text: [],
			text_zh: [],
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
	isCustom.value = true;
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

const targetRoute = ref(null);

// 修改路由守卫
onBeforeRouteLeave((to, from, next) => {
	console.log(hasUnsavedChanges.value);
	if (hasUnsavedChanges.value) {
		targetRoute.value = to;
		document.getElementById("leave_confirm_modal").showModal();
		next(false);
	} else {
		next();
	}
});

// 确认离开
const confirmLeave = () => {
	if (targetRoute.value) {
		document.getElementById("leave_confirm_modal").close();
		hasUnsavedChanges.value = false; // 重置未保存状态
		router.push(targetRoute.value); // 手动跳转到目标路由
		targetRoute.value = null;
	}
};

// 修改页面刷新处理
onBeforeMount(() => {
	window.addEventListener("beforeunload", (e) => {
		if (hasUnsavedChanges.value) {
			e.preventDefault();
			return "";
		}
	});
});
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
	overflow: visible;
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

/* 工具箱容器 */
.toolbox-container {
	height: calc(100vh - 150px);
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

.shadow-retro {
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.8);
}

.ghost-btn {
	padding: 0.375rem 0.75rem;
	font-size: 0.75rem;
	line-height: 1rem;
	display: flex;
	align-items: center;
	gap: 0.25rem;
	background-color: transparent;
	border: none;
	border-radius: 0.5rem;
	color: rgb(31, 41, 55);
	position: relative;
	overflow: hidden;
	transition: all 0.2s ease;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.ghost-btn:hover {
	/* background-color: rgb(249, 250, 251); */
	/* border-color: rgba(31, 41, 55, 0.4); */
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.ghost-btn:active {
	transform: translateY(1px);
	/* background-color: rgb(243, 244, 246); */
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.ghost-btn::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	/* background: rgba(0, 0, 0, 0.05); */
	transform: translateX(-100%);
	transition: transform 0.2s ease;
}

.ghost-btn:hover::before {
	transform: translateX(0);
}

.text-toolbox {
	display: flex;
	gap: 0.5rem;
	padding: 0.3rem;
	/* background-color: #f3f4f6; */
	/* border: 1px solid #e5e7eb; */
	border-radius: 0.375rem;
	margin-bottom: -0.2rem;
}

/* 可以添加纸张纹理背景 */
.text-toolbox::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	opacity: 0.1;
	pointer-events: none;
	border-radius: 0.5rem;
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
.speaker-badge {
	font-weight: 500;
	min-width: 60px;
	text-align: center;
}

/* 如果是旁白，使用不同的样式 */
.text-primary .speaker-badge {
	background-color: var(--primary-color);
	opacity: 0.8;
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
</style>
