<template>
	<div
		class="text-toolbox bg-milk border-2 border-gray-800 rounded-lg flex items-center justify-between px-4 py-2 shadow-retro"
	>
		<div class="flex items-center gap-3">
			<button class="ghost-btn" @click="$emit('translate')">翻译</button>
			<button class="ghost-btn" @click="$emit('generate-knowledge')">
				生成知识点
			</button>
			<button class="ghost-btn" @click="$emit('toggle-narration')">
				{{ isNarration ? "取消注释" : "标记为注释" }}
			</button>

			<!-- 说话者选择 -->
			<div class="speaker-select relative w-40">
				<input
					v-model="speakerInput"
					type="text"
					class="input input-bordered input-sm w-full"
					placeholder="选择或输入说话者..."
					@input="handleSpeakerInput"
				/>
				<div
					v-if="showSpeakerList"
					class="speaker-list absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg"
				>
					<div
						v-for="speaker in filteredSpeakers"
						:key="speaker"
						class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
						@click="selectSpeaker(speaker)"
					>
						{{ speaker }}
					</div>
				</div>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<span v-if="loading" class="loading loading-spinner loading-xs"></span>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
	isNarration: Boolean,
	speakers: {
		type: Array,
		default: () => [],
	},
	loading: Boolean,
});

const emit = defineEmits([
	"translate",
	"generate-knowledge",
	"toggle-narration",
	"select-speaker",
]);

const speakerInput = ref("");
const showSpeakerList = ref(false);

const filteredSpeakers = computed(() => {
	return props.speakers.filter((s) =>
		s.toLowerCase().includes(speakerInput.value.toLowerCase())
	);
});

const handleSpeakerInput = () => {
	showSpeakerList.value = true;
	emit("select-speaker", speakerInput.value);
};

const selectSpeaker = (speaker) => {
	speakerInput.value = speaker;
	showSpeakerList.value = false;
	emit("select-speaker", speaker);
};
</script>
