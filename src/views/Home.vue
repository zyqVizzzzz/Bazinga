<template>
	<div class="home flex flex-wrap justify-center gap-6 p-6">
		<!-- 循环渲染关卡 -->
		<div
			v-for="(scene, index) in scenes"
			:key="scene.id"
			class="card w-80 bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
		>
			<!-- 卡片头部 -->
			<div class="card-body justify-center items-center">
				<h2 class="card-title justify-center text-primary">{{ scene.name }}</h2>
				<p style="flex-grow: 0">{{ scene.description }}</p>

				<!-- 操作按钮 -->
				<div
					class="card-actions justify-center mt-4"
					v-if="index !== scenes.length - 1"
				>
					<button class="btn btn-primary" @click="goToLesson(scene.id)">
						Start
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const scenes = ref([
	{
		id: "simpsons",
		name: "The Simpsons",
		description: "辛普森一家",
	},
	{
		id: "rick",
		name: "Rick and Morty",
		description: "瑞克和莫蒂",
	},
	{
		id: "scene3",
		name: "More...",
		description: "开发中...",
	},
]);

const goToLesson = (id) => {
	router.push("/lesson/" + id);
};
</script>
<style>
.home {
	width: 100%;
}
</style>
