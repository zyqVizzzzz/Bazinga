<template>
	<div class="all-collections">
		<h1 class="text-2xl font-bold mb-10 text-center flex flex-col">
			<span>Collections <mark class="pink"> Gallery </mark></span>
			<span class="text-gray-400 text-sm mt-2 font-normal"
				>n. 画廊 - /ˈɡæləri/</span
			>
		</h1>
		<div class="grid-container">
			<div
				v-for="scene in scenes"
				:key="scene.id"
				class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
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
			<!-- 空白新增卡片 -->
			<div
				class="card bg-gray-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex items-center justify-center"
				style="height: 330px; border: 2px dashed #ccc; border-radius: 0.8rem"
				@click="addNewScene"
			>
				<div class="text-gray-500 text-xl font-semibold mb-2">
					<i class="bi bi-folder-plus text-2xl"></i>
				</div>
				<span class="text-gray-500 text-base font-semibold">Create</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const router = useRouter();
const scenes = ref([]);

onMounted(() => {
	getAllScenes();
});

const getAllScenes = async () => {
	try {
		const res = await apiClient.get("/catalogs");
		if (res.data.code === 200) {
			scenes.value = res.data.data;
		} else {
			showToast({ message: res.data.message, type: "error" });
		}
	} catch (error) {
		console.error("Failed to fetch scenes", error);
	}
};

const goToCollection = (id) => {
	router.push("/collections/" + id);
};

const addNewScene = () => {
	router.push("/setup-collection");
};
</script>

<style scoped>
.all-collections {
	width: 100%;
	margin-top: 80px;
	margin-bottom: 100px;
	min-height: 500px;
	padding: 20px;
}

.grid-container {
	display: grid;
	grid-template-columns: repeat(3, 1fr); /* 每行显示 3 个卡片 */
	gap: 20px; /* 卡片之间的间距 */
	justify-items: center;
}

.card {
	width: 100%;
	max-width: 320px; /* 控制每个卡片的最大宽度 */
}
.card {
	transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}
.card:hover {
	transform: translateY(-5px);
}
</style>
