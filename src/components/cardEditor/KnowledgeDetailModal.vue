<template>
	<dialog ref="modalRef" id="knowledge_detail_modal" class="modal">
		<div class="modal-box retro-manual">
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
			<!-- 标题区域 -->
			<div class="manual-header">
				<div class="manual-title">
					<h3 class="word-title">{{ knowledge?.word }}</h3>
					<div class="word-subtitle">{{ knowledge?.word_zh }}</div>
				</div>
			</div>

			<div class="manual-content">
				<div class="manual-logo">BAZINGA™ KNOWLEDGE SYSTEM</div>
				<!-- 中文释义 -->
				<div class="manual-section">
					<div class="section-title">
						<div class="title-decoration">◆</div>
						<h4 class="text-sm">中文释义</h4>
					</div>
					<p class="section-content text-left">
						{{ knowledge?.definition_zh }}
					</p>
				</div>

				<!-- 同义词 -->
				<div v-if="knowledge?.synonyms" class="manual-section">
					<div class="section-title">
						<div class="title-decoration">◆</div>
						<h4 class="text-sm">同义词</h4>
					</div>
					<ol class="section-list text-left">
						<li
							v-for="(synonym, index) in knowledge.synonyms.split('|')"
							:key="index"
						>
							{{ synonym.trim() }}
						</li>
					</ol>
				</div>

				<!-- 例句 -->
				<div v-if="knowledge?.example" class="manual-section text-left">
					<div class="section-title">
						<div class="title-decoration">◆</div>
						<h4 class="text-sm">例句</h4>
					</div>
					<div class="example-box">
						<p>{{ knowledge?.example }}</p>
						<p class="example-translation">{{ knowledge?.example_zh }}</p>
					</div>
				</div>

				<!-- 补充说明 -->
				<div v-if="knowledge?.note" class="manual-section text-left">
					<div class="section-title">
						<div class="title-decoration">◆</div>
						<h4 class="text-sm">补充说明</h4>
					</div>
					<p class="section-content">{{ knowledge?.note }}</p>
				</div>
			</div>

			<!-- 关闭按钮 -->
			<div class="manual-footer"></div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>关闭</button>
		</form>
	</dialog>
</template>

<script setup>
import { ref } from "vue";

defineProps({
	knowledge: {
		type: Object,
		default: null,
	},
});

const modalRef = ref(null);

// 暴露方法给父组件
defineExpose({
	showModal() {
		modalRef.value?.showModal();
	},
});
</script>

<style scoped>
.retro-manual {
	background: var(--milk-color);
	border: 2px solid #000;
	box-shadow: 2px 2px 0 #000;
	/* font-family: "MS PGothic", "Microsoft YaHei", sans-serif; */
	max-width: 600px;
	padding: 2rem;
	position: relative;
	/* background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
		linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px); */
	/* background-size: 10px 10px; */
}

.manual-header {
	border-bottom: 2px solid #000;
	margin-bottom: 0.1rem;
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
	font-size: 1.3rem;
	font-weight: 800;
	letter-spacing: 1px;
	margin-bottom: 0.2rem;
}

.word-subtitle {
	font-size: 0.875rem;
	color: #666;
	letter-spacing: 2px;
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

.section-content {
	font-size: 0.875rem;
	line-height: 1.6;
	color: #333;
}

.section-list {
	list-style-type: decimal;
	padding-left: 1.5rem;
	font-size: 0.875rem;
	line-height: 1.6;
	color: #333;
}

.example-box {
	background: #fff;
	border: 1px solid #000;
	padding: 1rem;
	font-size: 0.875rem;
	line-height: 1.6;
	border-radius: 12px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.example-translation {
	margin-top: 0.5rem;
	color: #666;
	font-style: italic;
}

.manual-footer {
	text-align: center;
	margin-top: 2rem;
	padding-top: 1rem;
	border-top: 2px solid #000;
}

@keyframes scanline {
	0% {
		transform: translateY(-100%);
	}
	100% {
		transform: translateY(100%);
	}
}
</style>
