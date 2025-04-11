<template>
	<div class="scene-thumbnails-container w-1/5">
		<div class="scene-thumbnails">
			<draggable
				v-model="localScenes"
				item-key="index"
				handle=".drag-btn"
				:disabled="!isCustom"
				@change="handleDragChange"
			>
				<template #item="{ element: scene, index }">
					<!-- 场景缩略图卡带 -->
					<div class="cartridge-container">
						<div
							class="cartridge"
							:class="{ 'cartridge-active': currentIndex === index }"
							@click="$emit('switch-scene', index)"
						>
							<!-- 卡带主体 -->
							<div class="cartridge-body">
								<div class="cartridge-label">
									<div
										class="cartridge-title line-clamp-2 text-sm"
										v-if="scene[0]?.text"
									>
										{{ scene[0].text.replace(/^#\s*/, "") }}
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
											@click.stop="$emit('merge-scenes', index)"
											title="向上合并场景"
										>
											<i class="bi bi-arrow-bar-up"></i>
										</button>
										<button
											class="action-btn delete-btn"
											@click.stop="$emit('delete-scene', index)"
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
</template>

<script setup>
import { ref, watch } from "vue";
import draggable from "vuedraggable";
import { showToast } from "@/components/common/toast.js";

const props = defineProps({
	scenes: {
		type: Array,
		required: true,
	},
	currentIndex: {
		type: Number,
		default: 0,
	},
	isCustom: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits([
	"update:scenes",
	"switch-scene",
	"merge-scenes",
	"delete-scene",
]);

// 创建本地场景数据副本
const localScenes = ref([...props.scenes]);

// 监听 props.scenes 变化，更新本地数据
watch(
	() => props.scenes,
	(newScenes) => {
		localScenes.value = [...newScenes];
	},
	{ deep: true }
);

// 处理拖拽变化
const handleDragChange = (evt) => {
	// 如果是移动操作
	if (evt.moved) {
		const { oldIndex, newIndex } = evt.moved;

		// 通知父组件更新场景顺序和当前索引
		emit("update:scenes", localScenes.value, oldIndex, newIndex);

		// 显示提示
		showToast({ message: "场景顺序已更新", type: "success" });
	}
};
</script>

<style scoped>
/* 这里可以复制原来的样式 */
</style>
