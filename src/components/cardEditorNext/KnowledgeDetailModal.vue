<template>
	<dialog ref="modalRef" id="knowledge_detail_modal" class="modal">
		<div
			class="modal-box border-2 border-gray-800"
			style="background-color: var(--milk-color)"
		>
			<div class="flex items-center gap-2">
				<h3 class="font-bold text-lg text-secondary">
					{{ knowledge?.word }}
				</h3>
			</div>
			<div class="pt-2 pb-4 space-y-4">
				<!-- 中文释义 -->
				<div class="text-sm text-gray-500 text-left">
					{{ knowledge?.word_zh }}
				</div>

				<!-- 分割线 -->
				<div class="border-b border-gray-200"></div>

				<!-- 中文释义 -->
				<div>
					<h4 class="font-medium mb-2 text-left">中文释义</h4>
					<p class="text-sm text-gray-600 text-left">
						{{ knowledge?.definition_zh }}
					</p>
				</div>

				<!-- 同义词 -->
				<div v-if="knowledge?.synonyms">
					<h4 class="font-medium mb-2 text-left">同义词</h4>
					<ol class="text-sm text-gray-600 space-y-1 list-decimal list-inside">
						<li
							v-for="(synonym, index) in knowledge.synonyms.split('|')"
							:key="index"
							class="text-left"
						>
							{{ synonym.trim() }}
						</li>
					</ol>
				</div>

				<!-- 例句 -->
				<div v-if="knowledge?.example" class="space-y-1">
					<h4 class="font-medium mb-2 text-left">例句</h4>
					<p class="text-sm text-gray-600 text-left">
						{{ knowledge?.example }}
					</p>
					<p class="text-sm text-gray-500 text-left">
						{{ knowledge?.example_zh }}
					</p>
				</div>

				<!-- 笔记 -->
				<div v-if="knowledge?.note">
					<h4 class="font-medium mb-2 text-left">补充说明</h4>
					<p class="text-sm text-gray-600 text-left">
						{{ knowledge?.note }}
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
