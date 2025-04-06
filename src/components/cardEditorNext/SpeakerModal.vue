<template>
	<dialog ref="speakerModalRef" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg mb-4">选择说话者</h3>
			<div class="speaker-select relative w-full">
				<div
					class="min-h-[32px] p-1 border border-gray-300 rounded-lg cursor-text flex items-center hover:border-gray-400 transition-colors"
				>
					<input
						v-model="newSpeaker"
						type="text"
						class="flex-1 min-w-[60px] bg-transparent border-none outline-none text-sm text-gray-700"
						placeholder="输入说话者..."
						@keydown.enter.prevent="handleSpeakerInput"
					/>
				</div>

				<!-- 标签列表 -->
				<div class="mt-4 flex flex-wrap gap-2">
					<div
						v-for="speaker in speakers"
						:key="speaker"
						class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors group"
					>
						<span class="cursor-pointer" @click="selectSpeaker(speaker)">{{
							speaker
						}}</span>
						<button
							class="opacity-50 group-hover:opacity-100 hover:text-red-500 transition-opacity"
							@click.stop="removeSpeaker(speaker)"
						>
							<i class="bi bi-x"></i>
						</button>
					</div>
				</div>
			</div>
			<div class="modal-action">
				<button class="btn btn-sm btn-primary" @click="handleConfirm">
					确定
				</button>
				<form method="dialog">
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

const props = defineProps({
	speakers: {
		type: Array,
		required: true,
	},
});

const emit = defineEmits(["update", "remove", "confirm"]);

const speakerModalRef = ref(null);
const newSpeaker = ref("");

const handleSpeakerInput = () => {
	if (!newSpeaker.value.trim()) return;
	emit("update", newSpeaker.value.trim());
	newSpeaker.value = "";
};

const selectSpeaker = (speaker) => {
	newSpeaker.value = speaker;
};

const removeSpeaker = (speaker) => {
	emit("remove", speaker);
};

const handleConfirm = () => {
	if (newSpeaker.value.trim()) {
		emit("update", newSpeaker.value.trim());
	}
	emit("confirm", newSpeaker.value.trim());
	speakerModalRef.value?.close();
};

// 暴露方法给父组件
defineExpose({
	showModal: () => speakerModalRef.value?.showModal(),
	close: () => speakerModalRef.value?.close(),
});
</script>
