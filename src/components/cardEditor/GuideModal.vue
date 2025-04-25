<template>
	<dialog ref="modalRef" class="modal modal-bottom sm:modal-middle">
		<div class="modal-box retro-manual p-6 max-w-3xl">
			<form method="dialog" class="absolute right-4 top-4">
				<button class="retro-btn w-8 h-8">
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">
								<i class="bi bi-x-lg"></i>
							</div>
						</div>
					</div>
				</button>
			</form>

			<!-- 说明书标题区 -->
			<div class="manual-header mb-6">
				<div class="manual-title">
					<div class="word-title">编辑器使用指南</div>
				</div>
			</div>

			<div class="manual-content">
				<div class="manual-logo">BAZINGA™ EDITOR SYSTEM</div>

				<!-- 基础操作说明 -->
				<div class="manual-section">
					<div class="section-title">
						<div class="title-decoration">◆</div>
						<h4 class="text-sm">基础操作</h4>
					</div>
					<div class="section-content space-y-4">
						<div class="guide-item">
							<div class="guide-icon">
								<i class="bi bi-pencil-square"></i>
							</div>
							<div class="guide-text">
								<h5 class="guide-item-title">文本编辑</h5>
								<p>
									点击文本块进行编辑，支持直接输入和粘贴。按 Enter 保存更改。
								</p>
							</div>
						</div>
						<div class="guide-item">
							<div class="guide-icon">
								<i class="bi bi-files"></i>
							</div>
							<div class="guide-text">
								<h5 class="guide-item-title">场景管理</h5>
								<p>点击右侧卡带切换场景，使用连接按钮合并相邻场景。</p>
							</div>
						</div>
					</div>
				</div>

				<!-- AI 辅助功能 -->
				<div class="manual-section">
					<div class="section-title">
						<div class="title-decoration">◆</div>
						<h4 class="text-sm">AI 辅助功能</h4>
					</div>
					<div class="section-content space-y-4">
						<div class="guide-item">
							<div class="guide-icon">
								<i class="bi bi-translate"></i>
							</div>
							<div class="guide-text">
								<h5 class="guide-item-title">自动翻译</h5>
								<p>选中文本块后，点击工具栏中的翻译按钮进行自动翻译。</p>
							</div>
						</div>
						<div class="guide-item">
							<div class="guide-icon">
								<i class="bi bi-lightbulb"></i>
							</div>
							<div class="guide-text">
								<h5 class="guide-item-title">知识点生成</h5>
								<p>系统自动识别关键词并生成知识卡片，点击查看详细释义。</p>
							</div>
						</div>
					</div>
				</div>

				<!-- 快捷键说明 -->
				<div class="manual-section">
					<div class="section-title">
						<div class="title-decoration">◆</div>
						<h4 class="text-sm">快捷键</h4>
					</div>
					<div class="shortcut-grid">
						<div class="shortcut-item">
							<kbd>Enter</kbd>
							<span>保存编辑</span>
						</div>
						<div class="shortcut-item">
							<kbd>Esc</kbd>
							<span>取消编辑</span>
						</div>
					</div>
				</div>
			</div>

			<div class="manual-footer"></div>
		</div>
	</dialog>
</template>

<script setup>
import { ref } from "vue";

const modalRef = ref(null);

defineExpose({
	showModal: () => modalRef.value?.showModal(),
	hideModal: () => modalRef.value?.close(),
});
</script>

<style scoped>
.retro-manual {
	background: var(--milk-color);
	border: 2px solid #000;
	box-shadow: 2px 2px 0 #000;
	position: relative;
}

.manual-header {
	border-bottom: 2px solid #000;
	padding-bottom: 1rem;
}

.manual-logo {
	font-family: "Courier New", monospace;
	font-size: 0.75rem;
	font-weight: bold;
	letter-spacing: 1px;
	margin-bottom: 1.5rem;
	color: #666;
}

.word-title {
	color: var(--secondary-color);
	font-size: 1.5rem;
	font-weight: 800;
	letter-spacing: 1px;
	margin-bottom: 0.5rem;
}

.word-subtitle {
	font-size: 0.875rem;
	color: #666;
}

.manual-section {
	margin-bottom: 1.5rem;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 1rem;
	border-bottom: 1px dashed #000;
	padding-bottom: 0.5rem;
}

.title-decoration {
	font-size: 0.875rem;
	color: #666;
}

.guide-item {
	display: flex;
	gap: 1rem;
	padding: 1rem;
	background: #fff;
	border: 1px solid #000;
	border-radius: 8px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
}

.guide-icon {
	font-size: 1.5rem;
	color: var(--secondary-color);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
}

.guide-text {
	flex: 1;
}

.guide-item-title {
	font-weight: bold;
	margin-bottom: 0.5rem;
	color: #333;
}

.guide-text p {
	font-size: 0.875rem;
	color: #666;
	line-height: 1.5;
}

.shortcut-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 1rem;
}

.shortcut-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem;
	background: #fff;
	border: 1px solid #000;
	border-radius: 6px;
	font-size: 0.875rem;
}

kbd {
	background: #eee;
	border: 1px solid #ccc;
	border-radius: 4px;
	padding: 0.25rem 0.5rem;
	font-family: monospace;
	font-size: 0.75rem;
	box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.manual-footer {
	text-align: center;
	margin-top: 2rem;
	padding-top: 1rem;
	border-top: 2px solid #000;
}
</style>
