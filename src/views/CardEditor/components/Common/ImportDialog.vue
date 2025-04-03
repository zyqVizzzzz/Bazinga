<template>
	<dialog ref="modal" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg mb-4">导入内容</h3>

			<div class="form-control">
				<label class="label">
					<span class="label-text">输入网址</span>
				</label>
				<input
					v-model="url"
					type="text"
					class="input input-bordered w-full"
					placeholder="https://"
				/>
			</div>

			<div class="modal-action">
				<button
					class="btn btn-primary"
					@click="handleImport"
					:disabled="loading || !isValidUrl"
				>
					<span
						v-if="loading"
						class="loading loading-spinner loading-sm"
					></span>
					<span v-else>导入</span>
				</button>
				<button class="btn" @click="handleClose">取消</button>
			</div>
		</div>
	</dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const emit = defineEmits(["confirm", "close"]);
const modal = ref(null);
const loading = ref(false);
const url = ref("");

const isValidUrl = computed(() => {
	try {
		new URL(url.value);
		return true;
	} catch {
		return false;
	}
});

const handleImport = async () => {
	loading.value = true;
	try {
		await emit("confirm", url.value);
		handleClose();
	} finally {
		loading.value = false;
	}
};

const handleClose = () => {
	url.value = "";
	modal.value.close();
	emit("close");
};

defineExpose({
	open: () => modal.value.showModal(),
});
</script>
