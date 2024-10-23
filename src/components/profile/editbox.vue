<template>
	<dialog id="profile_edit_modal" class="modal modal-edit">
		<div class="modal-box bg-paper border-black border-4">
			<h3 class="text-lg font-bold mb-4">rushing</h3>
			<form class="space-y-4">
				<!-- 词义 -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">词义：</span>
					</label>
					<input
						type="text"
						placeholder="请输入词义"
						class="input input-bordered w-full text-sm"
						v-model="editModalData.word_zh"
					/>
				</div>
			</form>
			<!-- 按钮 -->
			<div class="modal-action space-x-6 justify-center">
				<button
					class="my-4 edit-shadow text-sm text-secondary bg-white rounded-lg px-4 py-2 transition-all duration-300"
					@click="submitEdit"
				>
					保存
				</button>
				<button
					class="my-4 shadow-md text-sm text-gray-500 bg-white rounded-lg px-4 py-2 transition-all duration-300 ml-4 hover:shadow-lg"
					@click="closeEditModal"
				>
					取消
				</button>
			</div>
		</div>
	</dialog>
</template>
<script setup>
import { ref, watch } from "vue";

const props = defineProps({ showModal: Boolean, currentUser: Object });
const { currentUser } = props;

const emit = defineEmits(["on-edit-modal-close", "on-edit-modal-submit"]);

const editModalData = ref({
	word_zh: "",
	definition_zh: "",
	comment: "",
});

const closeEditModal = () => {
	emit("on-edit-modal-close");
};

const submitEdit = () => {
	let origin = currentUser;
	const result = Object.assign(origin, editModalData.value);
	emit("on-edit-modal-submit", result);
	closeEditModal();
};

watch(
	() => props.showModal,
	(newValue) => {
		if (newValue) {
			document.getElementById("profile_edit_modal").showModal();
			console.log(currentUser);
		} else {
			document.getElementById("profile_edit_modal").close();
			editModalData.value = {
				word_zh: "",
				definition_zh: "",
				comment: "",
			};
		}
	}
);
</script>
<style scoped>
.edit-shadow {
	box-shadow: 0 6px 10px rgba(var(--secondary-color-rgb), 0.3);
}
.edit-shadow:hover {
	box-shadow: 0 6px 10px rgba(var(--secondary-color-rgb), 0.6);
}
</style>
