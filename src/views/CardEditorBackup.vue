<template>
	<div class="container w-full mx-auto my-10 p-4">
		<div class="flex editor-box">
			<!-- 左侧工具栏 -->
			<div
				class="optionbox-container option-group flex-col justify-between space-y-4"
			>
				<div class="tooltip" data-tip="返回">
					<button class="retro-btn" @click="goBack">
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
					<button class="retro-btn" @click="saveContent">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<i class="bi bi-floppy text-lg"></i>
								</div>
							</div>
						</div>
					</button>
				</div>
			</div>

			<!-- 中间编辑区域 -->
			<div class="editor-container text-sm mt-4 relative">
				<div class="text-sm rounded shadow-editor" style="overflow-y: auto">
					<div class="notion-editor-container p-6">
						<div
							v-for="(block, index) in blocks"
							:key="index"
							class="block-container mb-4"
						>
							<!-- 空块占位符 - 用于添加新块 -->
							<div
								v-if="block.type === 'empty'"
								class="empty-block relative group"
								@click="showBlockMenu(index)"
							>
								<div
									class="flex items-center p-2 border border-dashed border-gray-300 rounded hover:bg-gray-50 cursor-text"
								>
									<div class="text-gray-400 text-sm">点击添加内容...</div>
								</div>
								<div
									v-if="showMenuAt === index"
									class="block-menu absolute left-0 mt-1 bg-white shadow-lg rounded-lg z-10 p-1"
								>
									<div
										@click="changeBlockType(index, 'heading')"
										class="menu-item p-2 hover:bg-gray-100 rounded flex items-center"
									>
										<i class="bi bi-type-h1 mr-2"></i> 标题
									</div>
									<div
										@click="changeBlockType(index, 'text')"
										class="menu-item p-2 hover:bg-gray-100 rounded flex items-center"
									>
										<i class="bi bi-text-paragraph mr-2"></i> 原文
									</div>
									<div
										@click="changeBlockType(index, 'text_zh')"
										class="menu-item p-2 hover:bg-gray-100 rounded flex items-center"
									>
										<i class="bi bi-translate mr-2"></i> 翻译
									</div>
									<div
										@click="addKnowledge(index)"
										class="menu-item p-2 hover:bg-gray-100 rounded flex items-center"
									>
										<i class="bi bi-lightbulb mr-2"></i> 知识点
									</div>
								</div>
							</div>

							<!-- 标题块 -->
							<div
								v-else-if="block.type === 'heading'"
								class="heading-block relative group"
							>
								<div class="flex items-center">
									<div
										class="block-handle opacity-0 group-hover:opacity-100 mr-2"
									>
										<i class="bi bi-grip-vertical text-gray-400"></i>
									</div>
									<input
										v-model="block.content"
										class="w-full p-2 text-xl font-bold border-0 focus:ring-0 focus:outline-none"
										:placeholder="'无标题'"
									/>
									<div class="block-actions opacity-0 group-hover:opacity-100">
										<button
											@click="removeBlock(index)"
											class="btn btn-xs btn-ghost"
										>
											<i class="bi bi-trash text-gray-400"></i>
										</button>
									</div>
								</div>
								<div class="h-px bg-gray-200 mt-2"></div>
							</div>

							<!-- 文本块 -->
							<div
								v-else-if="block.type === 'text'"
								class="text-block relative group"
							>
								<div class="flex items-start">
									<div
										class="block-handle opacity-0 group-hover:opacity-100 mr-2 mt-3"
									>
										<i class="bi bi-grip-vertical text-gray-400"></i>
									</div>
									<textarea
										v-model="block.content"
										class="w-full p-2 border-0 focus:ring-0 focus:outline-none"
										rows="1"
										:placeholder="'输入原文...'"
										@input="autoResizeTextarea($event.target)"
									></textarea>
									<div
										class="block-actions opacity-0 group-hover:opacity-100 mt-2"
									>
										<button
											@click="translateBlock(index)"
											class="btn btn-xs btn-ghost"
											title="翻译"
										>
											<i class="bi bi-translate text-primary"></i>
										</button>
										<button
											@click="addKnowledge(index)"
											class="btn btn-xs btn-ghost"
											title="添加知识点"
										>
											<i class="bi bi-lightbulb text-secondary"></i>
										</button>
										<button
											@click="removeBlock(index)"
											class="btn btn-xs btn-ghost"
											title="删除"
										>
											<i class="bi bi-trash text-gray-400"></i>
										</button>
									</div>
								</div>
							</div>

							<!-- 翻译块 -->
							<div
								v-else-if="block.type === 'text_zh'"
								class="text-zh-block relative group ml-6"
							>
								<div class="flex items-start">
									<div
										class="block-handle opacity-0 group-hover:opacity-100 mr-2 mt-3"
									>
										<i class="bi bi-grip-vertical text-gray-400"></i>
									</div>
									<textarea
										v-model="block.content"
										class="w-full p-2 border-0 bg-gray-50 rounded-md focus:ring-0 focus:outline-none"
										rows="1"
										:placeholder="'输入翻译...'"
										@input="autoResizeTextarea($event.target)"
									></textarea>
									<div
										class="block-actions opacity-0 group-hover:opacity-100 mt-2"
									>
										<button
											@click="removeBlock(index)"
											class="btn btn-xs btn-ghost"
											title="删除"
										>
											<i class="bi bi-trash text-gray-400"></i>
										</button>
									</div>
								</div>
							</div>

							<!-- 知识点块 -->
							<div
								v-else-if="block.type === 'knowledge'"
								class="knowledge-block relative group ml-6"
							>
								<div class="flex items-start">
									<div
										class="block-handle opacity-0 group-hover:opacity-100 mr-2 mt-3"
									>
										<i class="bi bi-grip-vertical text-gray-400"></i>
									</div>
									<div
										class="w-full p-3 border border-secondary/30 rounded-md bg-secondary/5"
									>
										<div class="flex justify-between items-start">
											<h4 class="font-medium text-secondary">
												{{ block.content.word }}
											</h4>
											<div
												class="block-actions opacity-0 group-hover:opacity-100"
											>
												<button
													@click="editKnowledge(index)"
													class="btn btn-xs btn-ghost"
													title="编辑"
												>
													<i class="bi bi-pencil text-gray-500"></i>
												</button>
												<button
													@click="removeBlock(index)"
													class="btn btn-xs btn-ghost"
													title="删除"
												>
													<i class="bi bi-trash text-error"></i>
												</button>
											</div>
										</div>
										<p class="text-sm mt-1">{{ block.content.word_zh }}</p>
										<p class="text-xs mt-1 text-gray-600">
											{{ block.content.definition_zh }}
										</p>
									</div>
								</div>
							</div>
						</div>

						<!-- 添加新块按钮 -->
						<div
							class="add-block-button mt-4 opacity-50 hover:opacity-100 transition-opacity"
						>
							<button
								@click="addEmptyBlock"
								class="btn btn-sm btn-ghost btn-circle"
							>
								<i class="bi bi-plus text-lg"></i>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 知识点编辑弹窗 -->
		<dialog id="knowledge_modal" class="modal">
			<div class="modal-box w-11/12 max-w-lg">
				<h3 class="font-bold text-lg mb-4">添加知识点</h3>
				<div class="space-y-3">
					<div class="form-control">
						<label class="label">
							<span class="label-text">知识点</span>
						</label>
						<input
							type="text"
							v-model="knowledgeForm.word"
							placeholder="输入知识点"
							class="input input-bordered w-full"
						/>
					</div>
					<div class="form-control">
						<label class="label">
							<span class="label-text">释义</span>
						</label>
						<input
							type="text"
							v-model="knowledgeForm.word_zh"
							placeholder="输入释义"
							class="input input-bordered w-full"
						/>
					</div>
					<div class="form-control">
						<label class="label">
							<span class="label-text">详细释义</span>
						</label>
						<textarea
							v-model="knowledgeForm.definition_zh"
							placeholder="输入详细释义"
							class="textarea textarea-bordered w-full"
							rows="3"
						></textarea>
					</div>
				</div>
				<div class="modal-action">
					<button
						@click="generateKnowledge"
						class="btn btn-secondary"
						:disabled="generateLoading"
					>
						<span
							v-if="generateLoading"
							class="loading loading-spinner loading-xs mr-1"
						></span>
						自动生成
					</button>
					<button @click="saveKnowledge" class="btn btn-primary">保存</button>
					<button @click="closeKnowledgeModal" class="btn">取消</button>
				</div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>关闭</button>
			</form>
		</dialog>
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "@/components/common/toast.js";
import apiClient from "@/api";

const router = useRouter();

// 编辑器数据
const blocks = ref([
	{ type: "heading", content: "无标题文档" },
	{ type: "text", content: "这是一个示例段落。您可以在此处输入文本。" },
	{ type: "empty", content: "" },
]);

// 知识点表单
const knowledgeForm = ref({
	word: "",
	word_zh: "",
	definition_zh: "",
	example: "",
	example_zh: "",
	type: "daily_expression",
	note: "",
	synonyms: "",
});

// 当前正在编辑的块索引
const currentEditingIndex = ref(-1);
const generateLoading = ref(false);
const showMenuAt = ref(-1);

// 显示块类型菜单
const showBlockMenu = (index) => {
	showMenuAt.value = index;
};

// 改变块类型
const changeBlockType = (index, newType) => {
	blocks.value[index].type = newType;
	blocks.value[index].content = "";
	showMenuAt.value = -1;

	// 延迟执行，确保DOM已更新
	setTimeout(() => {
		const inputs = document.querySelectorAll("input, textarea");
		const targetInput = inputs[index];
		if (targetInput) {
			targetInput.focus();
		}
	}, 0);
};

// 添加空块
const addEmptyBlock = () => {
	blocks.value.push({ type: "empty", content: "" });
};

// 添加新块
const addNewBlock = (type = "text") => {
	blocks.value.push({ type, content: "" });
	// 延迟执行，确保DOM已更新
	setTimeout(() => {
		const textareas = document.querySelectorAll("textarea, input");
		const lastTextarea = textareas[textareas.length - 1];
		if (lastTextarea) {
			lastTextarea.focus();
		}
	}, 0);
};

// 翻译块
const translateBlock = async (index) => {
	const block = blocks.value[index];
	if (block.type !== "text" || !block.content.trim()) return;

	try {
		// 调用翻译API
		const response = await apiClient.post("/translation", {
			text: block.content,
			source: "en",
			target: "zh",
		});

		if (response.data.code === 200) {
			// 在当前块后插入翻译块
			blocks.value.splice(index + 1, 0, {
				type: "text_zh",
				content: response.data.data.translatedText,
			});
		} else {
			showToast({ message: "翻译失败", type: "error" });
		}
	} catch (error) {
		console.error("Translation failed:", error);
		showToast({ message: "翻译请求失败", type: "error" });
	}
};

// 添加知识点
const addKnowledge = (index) => {
	currentEditingIndex.value = index;

	// 从当前块中提取可能的知识点
	if (blocks.value[index] && blocks.value[index].content) {
		const text = blocks.value[index].content;
		const words = text.split(/\s+/).filter((word) => word.length > 2);

		if (words.length > 0) {
			// 取第一个可能的单词作为默认值
			knowledgeForm.value.word = words[0].replace(/[.,;!?]$/, "");
		}
	}

	document.getElementById("knowledge_modal").showModal();
	showMenuAt.value = -1;
};

// 编辑知识点
// 编辑知识点
const editKnowledge = (index) => {
	currentEditingIndex.value = index;
	const knowledge = blocks.value[index].content;

	// 填充表单数据
	knowledgeForm.value = {
		word: knowledge.word || "",
		word_zh: knowledge.word_zh || "",
		definition_zh: knowledge.definition_zh || "",
		example: knowledge.example || "",
		example_zh: knowledge.example_zh || "",
		type: knowledge.type || "daily_expression",
		note: knowledge.note || "",
		synonyms: knowledge.synonyms || "",
	};

	document.getElementById("knowledge_modal").showModal();
};

// 生成知识点
const generateKnowledge = async () => {
	if (!knowledgeForm.value.word) {
		showToast({ message: "请先输入知识点", type: "warning" });
		return;
	}

	generateLoading.value = true;
	try {
		const res = await apiClient.post("/knowledge/generate", {
			word: knowledgeForm.value.word,
		});

		if (res.data.code === 200) {
			const data = res.data.data;
			knowledgeForm.value.word_zh = data.word_zh;
			knowledgeForm.value.definition_zh =
				data.word_zh + "；" + data.definition_zh;
			knowledgeForm.value.example = data.example;
			knowledgeForm.value.example_zh = data.example_zh;
			knowledgeForm.value.synonyms = data.synonyms;
			knowledgeForm.value.type = data.type;
			knowledgeForm.value.note = data.note;
		} else {
			showToast({ message: "生成知识点失败", type: "warning" });
		}
	} catch (err) {
		showToast({ message: "网络错误，请重试！", type: "warning" });
	} finally {
		generateLoading.value = false;
	}
};

// 保存知识点
const saveKnowledge = () => {
	if (!knowledgeForm.value.word || !knowledgeForm.value.word_zh) {
		showToast({ message: "请填写知识点和释义", type: "warning" });
		return;
	}

	if (currentEditingIndex.value >= 0) {
		// 如果是编辑现有知识点
		if (blocks.value[currentEditingIndex.value].type === "knowledge") {
			blocks.value[currentEditingIndex.value].content = {
				...knowledgeForm.value,
			};
		} else {
			// 在当前编辑块后插入知识点块
			blocks.value.splice(currentEditingIndex.value + 1, 0, {
				type: "knowledge",
				content: { ...knowledgeForm.value },
			});
		}
	}

	// 重置表单和关闭弹窗
	closeKnowledgeModal();
};

// 关闭知识点弹窗
const closeKnowledgeModal = () => {
	document.getElementById("knowledge_modal").close();
	currentEditingIndex.value = -1;
	knowledgeForm.value = {
		word: "",
		word_zh: "",
		definition_zh: "",
		example: "",
		example_zh: "",
		type: "daily_expression",
		note: "",
		synonyms: "",
	};
};

// 删除块
const removeBlock = (index) => {
	blocks.value.splice(index, 1);

	// 如果删除后没有块了，添加一个空块
	if (blocks.value.length === 0) {
		addEmptyBlock();
	}
};

// 保存内容
const saveContent = async () => {
	try {
		// 过滤掉空块
		const contentToSave = blocks.value.filter(
			(block) => block.type !== "empty"
		);

		// 这里可以实现保存逻辑，例如将blocks数据发送到后端
		console.log("保存内容:", contentToSave);

		showToast({ message: "内容已保存", type: "success" });
	} catch (error) {
		showToast({ message: "保存失败", type: "error" });
	}
};

// 返回
const goBack = () => {
	router.back();
};

// 自动调整文本区域高度
const autoResizeTextarea = (textarea) => {
	if (!textarea) return;

	textarea.style.height = "auto";
	textarea.style.height = textarea.scrollHeight + "px";
};

// 点击其他区域关闭菜单
const closeMenu = (event) => {
	if (!event.target.closest(".empty-block")) {
		showMenuAt.value = -1;
	}
};

onMounted(() => {
	// 初始化所有文本区域的高度
	setTimeout(() => {
		document.querySelectorAll("textarea").forEach((textarea) => {
			autoResizeTextarea(textarea);
		});
	}, 0);

	// 添加点击事件监听器
	document.addEventListener("click", closeMenu);
});

onBeforeUnmount(() => {
	// 移除事件监听器
	document.removeEventListener("click", closeMenu);
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
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.1s;
}

.retro-btn:hover .btn-edge {
	transform: translateY(-1px);
}

.retro-btn:active .btn-edge {
	transform: translateY(0);
}

.editor-container {
	width: 60%;
	max-width: 800px;
	margin: 0 auto;
	max-height: 80vh;
	border-radius: 8px;
	background-color: white;
}

.notion-editor-container {
	min-height: 300px;
}

.shadow-editor {
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	border: 1px solid #f0f0f0;
	max-height: 80vh;
}

.block-container {
	position: relative;
}

.block-handle {
	position: absolute;
	left: -24px;
	cursor: move;
	padding: 2px;
}

.empty-block {
	min-height: 32px;
}

.block-menu {
	min-width: 180px;
	border: 1px solid #eee;
}

.menu-item {
	cursor: pointer;
	user-select: none;
}

.text-block textarea,
.text-zh-block textarea {
	min-height: 32px;
	resize: none;
	overflow: hidden;
	line-height: 1.5;
}

.knowledge-block {
	margin-top: 0.5rem;
}

.block-actions {
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
	background: white;
	padding: 0 4px;
	border-radius: 4px;
	display: flex;
	gap: 4px;
}

.add-block-button {
	display: flex;
	justify-content: center;
	margin-top: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.editor-box {
		flex-direction: column;
	}

	.editor-container {
		width: 100%;
	}

	.optionbox-container {
		position: fixed;
		bottom: 20px;
		right: 20px;
		flex-direction: row;
		z-index: 10;
		margin-top: 0;
		height: auto;
	}

	.block-handle {
		display: none;
	}
}
</style>
