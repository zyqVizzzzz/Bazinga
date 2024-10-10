<template>
	<h2
		class="px-6 pb-3 card-title text-accent relative mb-5 w-full flex justify-between items-center border-b"
	>
		<span>{{ title }}</span>
		<div class="flex items-center">
			<a
				class="text-base"
				style="
					position: absolute;
					bottom: 8px;
					right: 20px;
					cursor: pointer;
					color: #222;
				"
				@click="onTogglePractice"
			>
				Let's Bazinga!!!!
			</a>
		</div>
	</h2>
</template>

<script setup>
const props = defineProps({
	isFlipped: Boolean,
	title: String,
	showPractice: Boolean,
	currentPractice: Array,
});

// 定义事件
const emit = defineEmits(["togglePractice"]);

const onTogglePractice = () => {
	emit("togglePractice");
};
</script>
