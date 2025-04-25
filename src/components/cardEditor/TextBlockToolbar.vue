<template>
	<div
		class="text-toolbox bg-milk rounded-lg flex items-center justify-between px-4 py-2 fixed z-10"
		:style="{
			top: toolboxPosition?.top + 'px',
			left: toolboxPosition?.left + 'rem',
		}"
	>
		<!-- 左侧按钮组 -->
		<div class="flex items-center gap-3">
			<div class="tooltip" data-tip="标记为新场景">
				<button class="ghost-btn" @click="$emit('split-scene')">
					<SplitIcon size="4" />
				</button>
			</div>

			<div class="h-6 w-px bg-gray-300 mx-2"></div>
			<div class="tooltip" data-tip="翻译">
				<button class="ghost-btn" @click="$emit('translate')">
					<TranslationIcon size="4" />
				</button>
			</div>
			<div class="tooltip" data-tip="生成知识点">
				<button class="ghost-btn" @click="$emit('auto-generate-knowledge')">
					<KnowledgeIcon size="4" />
				</button>
			</div>
			<div class="tooltip" data-tip="手动选择知识点">
				<button class="ghost-btn" @click="$emit('manual-knowledge')">
					<GenerateIcon size="4" />
				</button>
			</div>
			<div class="h-6 w-px bg-gray-300 mx-2"></div>

			<div class="tooltip" data-tip="标记为注释">
				<button class="ghost-btn" @click="$emit('toggle-narration')">
					<i class="bi bi-chat-square-text"></i>
				</button>
			</div>
			<div class="tooltip" data-tip="添加角色">
				<button class="ghost-btn" @click="$emit('toggle-speaker')">
					<i
						class="bi"
						:class="hasSpeaker ? 'bi-emoji-surprise-fill' : 'bi-emoji-surprise'"
					></i>
				</button>
			</div>
			<div class="tooltip" data-tip="删除">
				<button class="ghost-btn" @click="$emit('delete-block')">
					<i class="bi bi-trash"></i>
				</button>
			</div>
		</div>
		<div v-if="processing" class="flex items-center gap-3 ml-6">
			<div class="flex items-center justify-center w-6 h-6">
				<span class="loading loading-spinner loading-xs text-gray-800"></span>
			</div>
		</div>
	</div>
</template>

<script setup>
import TranslationIcon from "@/components/icons/Translation.vue";
import KnowledgeIcon from "@/components/icons/Knowledge.vue";
import GenerateIcon from "@/components/icons/Generate.vue";
import SplitIcon from "@/components/icons/Split.vue";
defineProps({
	toolboxPosition: {
		type: Object,
		required: true,
	},
	isNarration: {
		type: Boolean,
		default: false,
	},
	processing: {
		type: Boolean,
		default: false,
	},
	hasSpeaker: {
		type: Boolean,
		default: false,
	},
});

defineEmits([
	"translate",
	"auto-generate-knowledge",
	"toggle-narration",
	"manual-knowledge",
	"toggle-speaker",
	"split-scene",
	"delete-block",
]);
</script>
<style scoped>
.text-toolbox {
	position: absolute;
	transform: translateY(-100%); /* 增加向上偏移 */
	backdrop-filter: blur(8px); /* 背景模糊效果 */
	border-top: 2px solid #2c3e50; /* 更深的边框颜色 */
	border-bottom: 2px solid #2c3e50; /* 更深的边框颜色 */
	/* border-left: 1px solid #2c3e50;  */
	box-shadow: 0 4px 6px 1px rgba(0, 0, 0, 0.2), 0 2px 4px 1px rgba(0, 0, 0, 0.1),
		0 0 0 2px rgba(255, 255, 255, 0.3); /* 多层阴影效果 */
	z-index: 100;
}

.text-toolbox::after {
	content: "";
	position: absolute;
	bottom: -8px;
	left: 50%;
	transform: translateX(-50%);
	width: 0;
	height: 0;
	border-left: 8px solid transparent;
	border-right: 8px solid transparent;
	border-top: 8px solid #222; /* 添加小三角 */
}

.ghost-btn {
	padding: 4px 12px;
	border-radius: 6px;
	background: transparent;
	font-size: 12px;
	transition: all 0.2s ease;
	color: #2c3e50;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.ghost-btn:hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
