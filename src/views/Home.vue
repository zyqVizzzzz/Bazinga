<template>
	<div class="home">
		<h1 class="text-2xl font-bold mb-10 text-center">
			Version 1.0.0
			<span class="text-base block">美剧笔记本</span>
		</h1>
		<div class="flex flex-wrap justify-center mb-10 gap-12">
			<!-- 循环渲染关卡 -->
			<div
				v-for="scene in scenes.slice(0, 3)"
				:key="scene.id"
				class="card w-80 bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
				@click="goToCollection(scene._id)"
			>
				<div class="w-full" style="height: 150px" v-if="scene.banner">
					<img
						:src="scene.banner"
						alt="logo"
						class="w-full h-full object-cover"
						style="border-radius: 0.8rem 0.8rem 0 0"
					/>
				</div>
				<div
					class="w-full"
					:style="{ background: scene.theme }"
					style="height: 150px; border-radius: 0.8rem 0.8rem 0 0"
					v-else
				></div>

				<div
					class="card-body justify-center items-center"
					style="height: 180px"
					:style="{ color: scene.theme }"
				>
					<h2 class="card-title justify-center">
						{{ scene.showName }}
					</h2>
					<p
						style="flex-grow: 0; font-weight: 900"
						:style="{ color: scene.theme }"
					>
						{{ scene.name }}
					</p>
					<!-- <p class="text-xs" style="flex-grow: 0; font-weight: 900">
					{{ scene.level }}
				</p> -->
				</div>
			</div>
		</div>
		<div class="text-center mb-16 font-bold">
			<span class="text-primary cursor-pointer" @click="goToAllScenes">
				查看更多...
			</span>
		</div>

		<!-- 第二部分: Version 1.1.0 文章目录 -->
		<div class="w-full mt-10">
			<h1 class="text-2xl font-bold mb-10 text-center">
				Version 2.0.0
				<span class="text-base block">AI同伴 & 笔记上传/分享</span>
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
							----------------------------------------------------- 1%
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
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const router = useRouter();
const scenes = ref([]);

onMounted(() => {
	getCatalogs();
});

const getCatalogs = async () => {
	try {
		const response = await apiClient.get("/catalogs");
		if (response.data.code === 200) {
			scenes.value = response.data.data;
		} else {
			showToast({
				message: response.data.message,
				type: "error",
				duration: 3000,
			});
		}
	} catch (error) {
		console.error("Failed to fetch catalogs", error);
	}
};

const goToAllScenes = () => {
	router.push("/collections");
};

// 文章列表数据
const articles = ref([
	{
		title: "With math, 6900 simply cannot be contained by 500",
		title_zh: "开发者留言",
		progress: 0,
	},
]);

const goToCollection = (id) => {
	router.push("/collections/" + id);
};
</script>
<style>
.home {
	width: 100%;
	margin-top: 100px;
}
.bg-custom {
	background-color: rgba(255, 255, 255, 1);
	background-image: url("@/assets/cytus.jpg"); /* 背景图片路径 */
	background-repeat: no-repeat; /* 不重复 */
	background-position: right center; /* 图片定位在右侧中央 */
	background-size: 16%; /* 根据需要调整图片的大小 */
}

/* .shadow-md {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
} */
</style>
