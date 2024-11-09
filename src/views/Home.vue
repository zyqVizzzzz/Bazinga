<template>
	<div class="home">
		<h1 class="text-2xl font-bold mb-10 text-center flex flex-col">
			<div>
				Ver.1 <span><mark class="pink">Collections</mark></span>
			</div>
			<div class="flex mx-auto flex-col mt-2">
				<span class="text-gray-400 text-sm font-normal">
					n. 合集(复数) - /kəˈlɛkʃənz/
				</span>
			</div>
		</h1>
		<div class="flex flex-wrap justify-center mb-10 gap-12">
			<!-- 循环渲染关卡 -->
			<div
				v-for="scene in scenes.slice(0, 3)"
				:key="scene.id"
				class="card w-80 bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer transition-all duration-300"
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
				</div>
			</div>
		</div>
		<div class="text-center mb-16 font-bold">
			<span
				class="common-capsule text-sm text-center mt-2 mx-auto w-60 text-gray-600 transition-all duration-300"
				@click="goToAllScenes"
			>
				<- More Collections ->
			</span>
		</div>

		<!-- 第二部分: Version 1.1.0 文章目录 -->
		<div class="w-full mt-40">
			<h1 class="text-2xl font-bold mb-5 text-center">Next</h1>
			<!-- <h1 class="text-2xl font-bold mb-10 text-center">
				Ver.2 AI
				<div
					class="text-gray-400 text-sm font-normal mt-2 mx-auto flex justify-between relative"
					style="width: 11rem; left: 5px"
				>
					<div>
						<mark class="pink">Artificial</mark>
						<div class="mt-1 relative">
							/ˌɑːrtɪˈfɪʃəl/<span
								class="absolute"
								style="left: -120px; top: -0.5rem"
								>{ adj. 人工的 }</span
							>
						</div>
					</div>
					<div>
						<mark class="pink">Intelligence</mark>
						<div class="mt-1 relative">
							/ɪnˈtɛlɪdʒəns/<span
								class="absolute"
								style="right: -100px; top: -0.5rem"
								>{ n. 智能 }</span
							>
						</div>
					</div>
				</div>
			</h1> -->
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
import { ref, onMounted } from "vue";
import { showToast } from "@/components/common/toast.js";
import { useRouter } from "vue-router";
import apiClient from "@/api";

const router = useRouter();
const scenes = ref([]);
const articles = ref([
	{
		title: "With math, 6900 simply cannot be contained by 500",
		title_zh: "开发者留言",
		progress: 0,
	},
]);

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

const goToCollection = (id) => {
	router.push("/collections/" + id);
};
</script>
<style scoped>
.home {
	width: 100%;
	margin-top: 100px;
	margin-bottom: 100px;
}
.bg-custom {
	background-color: rgba(255, 255, 255, 1);
	background-image: url("@/assets/cytus.jpg");
	background-repeat: no-repeat;
	background-position: right center;
	background-size: 16%;
}
.card {
	transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}
.card:hover {
	transform: translateY(-5px);
}
</style>
