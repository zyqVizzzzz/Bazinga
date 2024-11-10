<template>
	<h2
		class="pl-6 pr-2 pb-3 card-title text-primary relative mb-5 w-full flex justify-between items-center border-b"
	>
		<span>{{ title }}</span>
		<div class="flex space-x-2 pr-5">
			<div class="tooltip" data-tip="保存进度">
				<div
					v-if="!isFlipped"
					@click="saveProgress"
					class="text-xs text-center save-capsule shadow-md text-gray-600"
				>
					<span class="cursor-pointer font-bold">
						<i class="bi bi-floppy text-lg text-primary"></i>
					</span>
				</div>
			</div>
		</div>
	</h2>
</template>

<script setup>
const props = defineProps({
	isFlipped: Boolean,
	title: String,
});
const emit = defineEmits(["on-save-progress"]);

const saveProgress = () => {
	emit("on-save-progress");
};
</script>
<style scoped>
.save-capsule {
	display: flex;
	align-items: center;
	justify-content: space-around;
	cursor: pointer;
	width: 60px;
	height: 28px;
	border-radius: 30px;
}
</style>
