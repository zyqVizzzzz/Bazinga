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
			<button class="ghost-btn" @click="$emit('split-scene')">
				标记为新场景
			</button>

			<div class="h-6 w-px bg-gray-300 mx-2"></div>
			<button class="ghost-btn" @click="$emit('translate')">翻译</button>

			<button class="ghost-btn" @click="$emit('generate-knowledge')">
				生成知识点
			</button>
			<button class="ghost-btn" @click="$emit('manual-knowledge')">
				手动选择知识点
			</button>
			<div class="h-6 w-px bg-gray-300 mx-2"></div>

			<button
				class="ghost-btn"
				@click="$emit('toggle-narration')"
				title="标记为注释"
			>
				<i
					class="bi"
					:class="isNarration ? 'bi-chat-square-text' : 'bi-chat-square'"
				></i>
			</button>
			<button
				class="ghost-btn"
				@click="$emit('toggle-speaker')"
				title="添加角色"
			>
				<i
					class="bi"
					:class="hasSpeaker ? 'bi-emoji-surprise-fill' : 'bi-emoji-surprise'"
				></i>
			</button>
			<button class="ghost-btn" @click="$emit('delete-block')" title="删除">
				<i class="bi bi-trash"></i>
			</button>
		</div>
		<div v-if="processing" class="flex items-center gap-3 ml-6">
			<div class="flex items-center justify-center w-6 h-6">
				<span class="loading loading-spinner loading-xs text-gray-800"></span>
			</div>
		</div>
	</div>
</template>

<script setup>
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
	"generate-knowledge",
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
