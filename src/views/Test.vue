<template>
	<div class="container mx-auto p-4">
		<div class="flex gap-4">
			<!-- 控制面板 -->
			<div class="w-48">
				<div class="space-y-4">
					<button class="retro-btn-small w-full" @click="add">添加</button>
					<button class="retro-btn-small w-full" @click="replace">替换</button>

					<div class="form-check">
						<input
							id="disabled"
							type="checkbox"
							v-model="enabled"
							class="form-check-input"
						/>
						<label class="form-check-label" for="disabled">启用拖拽</label>
					</div>
				</div>
			</div>

			<!-- 拖拽列表 -->
			<div class="flex-1">
				<h2 class="text-xl font-bold mb-4">
					拖拽测试 {{ dragging ? "(拖拽中...)" : "" }}
				</h2>

				<draggable
					v-model="list"
					:disabled="!enabled"
					item-key="id"
					class="space-y-2"
					ghost-class="ghost"
					:move="checkMove"
					@start="dragging = true"
					@end="dragging = false"
				>
					<template #item="{ element }">
						<div
							class="flex items-center p-3 bg-white border rounded-lg shadow-sm"
							:class="{ 'not-draggable': !enabled }"
						>
							<span class="handle cursor-move mr-3" v-if="enabled">
								<i class="bi bi-grip-vertical"></i>
							</span>
							<span>{{ element.name }}</span>
						</div>
					</template>
				</draggable>
			</div>

			<!-- 数据显示 -->
			<div class="w-48">
				<h3 class="text-lg font-bold mb-2">当前数据</h3>
				<pre class="text-sm">{{ JSON.stringify(list, null, 2) }}</pre>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";
import draggable from "vuedraggable";

let id = 1;
const enabled = ref(true);
const dragging = ref(false);
const list = ref([
	{ id: 1, name: "项目 1" },
	{ id: 2, name: "项目 2" },
	{ id: 3, name: "项目 3" },
]);

const add = () => {
	list.value.push({ name: "新项目 " + id, id: id++ });
};

const replace = () => {
	list.value = [{ name: "替换项目", id: id++ }];
};

const checkMove = (e) => {
	console.log("目标位置: " + e.draggedContext.futureIndex);
	return true; // 允许移动
};
</script>

<style scoped>
.ghost {
	opacity: 0.5;
	background: #c8ebfb;
}

.not-draggable {
	cursor: no-drop;
	opacity: 0.5;
}

.form-check {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.form-check-input {
	width: 1rem;
	height: 1rem;
}
</style>
