<template>
	<h2
		class="px-6 pb-3 card-title text-accent relative mb-5 w-full flex justify-between items-center border-b"
	>
		<!-- 左边的 title -->
		<span>{{ title }}</span>

		<!-- 右边的图标 -->
		<div class="flex items-center">
			<!-- <div class="cursor-pointer" @click="onToggleTrans" v-if="!isFlipped">
				<TransIcon :showTrans="showTrans" />
			</div> -->
			<!-- <div
				class="cursor-pointer ml-4"
				@click="onToggleHints"
				v-if="showHints && currentKnowledgePoints.length > 0 && !isFlipped"
			>
				<LightIcon :showHints="showHints" />
			</div> -->

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
