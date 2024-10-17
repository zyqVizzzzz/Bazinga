<template>
	<div class="home">
		<h1 class="text-2xl font-bold mb-10 text-center">
			Version 1.0.0
			<span class="text-base block">持续更新中...</span>
		</h1>
		<div class="flex flex-wrap justify-center mb-20 gap-12">
			<!-- 循环渲染关卡 -->
			<div
				v-for="scene in scenes"
				:key="scene.id"
				class="card w-80 bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
				@click="goToLesson(scene.id)"
			>
				<div class="w-full" style="height: 150px" v-if="scene.logo">
					<img
						:src="scene.logo"
						alt="logo"
						class="w-full h-full object-cover"
						style="border-radius: 0.8rem 0.8rem 0 0"
					/>
				</div>

				<div
					class="card-body justify-center items-center"
					style="height: 180px"
				>
					<h2
						class="card-title justify-center text-primary"
						:style="{ color: scene.themeColor }"
					>
						{{ scene.name }}
					</h2>
					<p
						style="flex-grow: 0; font-weight: 900"
						:style="{ color: scene.themeColor }"
					>
						{{ scene.description }}
					</p>
					<!-- <p class="text-xs" style="flex-grow: 0; font-weight: 900">
					{{ scene.level }}
				</p> -->
				</div>
			</div>
		</div>

		<!-- 第二部分: Version 1.1.0 文章目录 -->
		<div class="w-full mt-10">
			<h1 class="text-2xl font-bold mb-10 text-center">
				Version 2.0.0
				<span class="text-base block">版本日志</span>
			</h1>

			<div
				class="w-full max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 relative bg-custom"
			>
				<div class="article-list space-y-4">
					<div
						v-for="(article, index) in articles"
						:key="index"
						class="items-center p-2 cursor-pointer text-left"
					>
						<div class="text-lg font-semibold">
							{{ article.title }}
						</div>
						<div class="text-base">
							{{ article.title_zh }}
							--------------------------------------------- 0%
						</div>
					</div>
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
		level: "初级/中级",
		logo: new URL("@/assets/simpsons.jpg", import.meta.url).href,
		// themeColor: "#e6c800",
		themeColor: "#cfa537",
	},
	{
		id: "rickandmorty",
		name: "Rick and Morty",
		level: "中级/高级",
		logo: new URL("@/assets/ram.jpg", import.meta.url).href,
		description: "瑞克和莫蒂",
		themeColor: "#1d7414",
	},
]);

// 文章列表数据
const articles = ref([
	{
		title: "Base6900：6900 simply cannot be contained by 500",
		title_zh: "一封开发者的来信",
		progress: 0,
	},
]);

const goToLesson = (id) => {
	router.push("/Category/" + id);
};
</script>
<style>
.home {
	width: 100%;
	margin-top: 120px;
}
.bg-custom {
	background-color: rgba(255, 255, 255, 1);
	background-image: url("@/assets/cytus.jpg"); /* 背景图片路径 */
	background-repeat: no-repeat; /* 不重复 */
	background-position: right center; /* 图片定位在右侧中央 */
	background-size: 16%; /* 根据需要调整图片的大小 */
}

.shadow-md {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
