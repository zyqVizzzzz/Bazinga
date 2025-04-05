<template>
	<dialog ref="deleteKnowledgeModalRef" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">删除知识点</h3>
			<p class="py-4">确定要删除这个知识点吗？</p>
			<div class="modal-action justify-center">
				<form method="dialog" class="flex gap-2">
					<button
						class="btn btn-sm btn-secondary text-white"
						@click="handleConfirm"
					>
						确认删除
					</button>
					<button class="btn btn-sm">取消</button>
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

const emit = defineEmits(["confirm"]);
const deleteKnowledgeModalRef = ref(null);

const showModal = () => {
	deleteKnowledgeModalRef.value?.showModal();
};

const handleConfirm = () => {
	emit("confirm");
};

defineExpose({
	showModal,
});
</script>
