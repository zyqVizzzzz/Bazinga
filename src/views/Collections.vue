<template>
	<div class="all-collections">
		<h1 class="text-2xl font-bold mb-10 text-center">卡片合集</h1>
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
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-7"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
						/>
					</svg>
				</div>
				<span class="text-gray-500 text-base font-semibold">制作卡片合集</span>
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
