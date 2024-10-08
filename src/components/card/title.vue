<template>
	<h2
		class="card-title text-accent relative mb-5 w-full flex justify-between items-center"
	>
		<!-- 左边的 title -->
		<span>{{ title }}</span>

		<!-- 右边的图标 -->
		<div class="flex items-center">
			<div class="cursor-pointer" @click="onToggleTrans" v-if="!isFlipped">
				<TransIcon :showTrans="showTrans" />
			</div>
			<div
				class="cursor-pointer ml-4"
				@click="onToggleHints"
				v-if="currentKnowledgePoints.length > 0 && !isFlipped"
			>
				<LightIcon :showHints="showHints" />
			</div>
			<div
				class="cursor-pointer ml-4"
				@click="onTogglePractice"
				v-if="currentPractice.length > 0"
			>
				<PracticeIcon :showPractice="showPractice" />
			</div>
		</div>
	</h2>
</template>

<script setup>
import LightIcon from "../icons/Light.vue";
import TransIcon from "../icons/Language.vue";
import PracticeIcon from "../icons/Practice.vue";
const props = defineProps({
	isFlipped: Boolean,
	title: String,
	showTrans: Boolean,
	showHints: Boolean,
	showPractice: Boolean,
	currentKnowledgePoints: Array,
	currentPractice: Array,
});

// 定义事件
const emit = defineEmits(["toggleTrans", "toggleHints", "togglePractice"]);

const onToggleTrans = () => {
	emit("toggleTrans");
};

const onToggleHints = () => {
	emit("toggleHints");
};

const onTogglePractice = () => {
	emit("togglePractice");
};
</script>
