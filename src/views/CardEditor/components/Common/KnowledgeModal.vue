<template>
	<dialog ref="modal" class="modal">
		<div class="modal-box w-11/12 max-w-3xl">
			<h3 class="font-bold text-lg mb-4">知识点生成</h3>

			<div class="space-y-4">
				<!-- 原文显示 -->
				<div class="original-text p-4 bg-gray-50 rounded-lg">
					<p class="text-sm text-gray-700">{{ selectedText }}</p>
				</div>

				<!-- 知识点表单 -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">单词/短语</span>
					</label>
					<input
						v-model="knowledge.word"
						type="text"
						class="input input-bordered w-full"
					/>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">中文释义</span>
					</label>
					<input
						v-model="knowledge.definition_zh"
						type="text"
						class="input input-bordered w-full"
					/>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">例句</span>
					</label>
					<textarea
						v-model="knowledge.example"
						class="textarea textarea-bordered"
					></textarea>
				</div>
			</div>

			<div class="modal-action">
				<button
					class="btn btn-primary"
					@click="handleConfirm"
					:disabled="loading"
				>
					<span
						v-if="loading"
						class="loading loading-spinner loading-sm"
					></span>
					<span v-else>确认</span>
				</button>
				<button class="btn" @click="handleClose">取消</button>
			</div>
		</div>
	</dialog>
</template>

<script setup>
import { ref, reactive } from "vue";

const props = defineProps({
	selectedText: {
		type: String,
		default: "",
	},
});

const emit = defineEmits(["confirm", "close"]);
const modal = ref(null);
const loading = ref(false);

const knowledge = reactive({
	word: "",
	definition_zh: "",
	example: "",
});

const handleConfirm = async () => {
	loading.value = true;
	try {
		await emit("confirm", knowledge);
		handleClose();
	} finally {
		loading.value = false;
	}
};

const handleClose = () => {
	modal.value.close();
	emit("close");
};

// 暴露方法给父组件
defineExpose({
	open: () => modal.value.showModal(),
});
</script>
