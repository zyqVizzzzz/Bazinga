<template>
	<h1 class="text-2xl my-10 font-semibold text-center mb-4">
		{{ resourceId ? "Update" : "Create" }} {1} Collection
	</h1>
	<div
		class="grid my-10 justify-items-center grid-cols-2 gap-1 gap-y-8"
		style="padding: 0 40px"
	>
		<div class="card w-full max-w-lg shadow-lg bg-white rounded-lg p-6">
			<form class="space-y-4">
				<div class="form-control">
					<label for="showName" class="label">
						<span class="label-text"
							>Title<span class="text-red-500">（require）</span></span
						>
					</label>
					<input
						v-model="noteForm.showName"
						type="text"
						id="showName"
						class="input input-bordered w-full"
						:class="{ 'border-red-500': showError && !noteForm.showName }"
						placeholder="请输入合集名"
					/>
				</div>

				<!-- 英文名 -->
				<div class="form-control">
					<label for="name" class="label">
						<span class="label-text">Subtitle</span>
					</label>
					<input
						v-model="noteForm.name"
						type="text"
						id="name"
						class="input input-bordered w-full"
						placeholder="请输入副标题"
					/>
				</div>

				<!-- 描述 -->
				<div class="form-control">
					<label for="description" class="label">
						<span class="label-text">Discribe</span>
					</label>
					<textarea
						v-model="noteForm.description"
						id="description"
						class="textarea textarea-bordered w-full"
						placeholder="请输入合集描述"
					></textarea>
				</div>
			</form>
		</div>
		<div class="card w-full max-w-lg shadow-lg bg-white rounded-lg p-6">
			<form class="space-y-4">
				<!-- 封面图上传 -->
				<div class="form-control">
					<label for="banner" class="label">
						<span class="label-text">Banner</span>
					</label>
					<!-- 预览和上传区域 -->
					<div
						class="upload-area bg-gray-200 flex items-center justify-center rounded-lg cursor-pointer relative"
						@click="triggerFileInput"
					>
						<!-- 如果没有选择图片，显示上传图标和提示文本 -->
						<template v-if="!bannerPreview">
							<div class="text-center">
								<div>
									<i class="bi bi-upload text-xl text-gray-600"></i>
								</div>

								<span class="text-gray-600 text-sm"
									>click to upload banner image</span
								>
							</div>
						</template>

						<!-- 如果已经选择图片，显示封面图预览 -->
						<template v-else>
							<img
								:src="bannerPreview"
								alt="封面图预览"
								class="absolute inset-0 w-full h-full object-cover rounded-lg"
							/>
						</template>
					</div>

					<!-- 隐藏原始 input 文件上传控件 -->
					<input
						ref="fileInput"
						@change="handleFileUpload"
						type="file"
						id="banner"
						class="hidden"
						accept="image/*"
					/>
				</div>

				<!-- 主题色 -->
				<div class="form-control">
					<label for="theme" class="label">
						<span class="label-text">Theme Color</span>
					</label>
					<input
						v-model="noteForm.theme"
						@input="updateThemePreview"
						type="color"
						id="theme"
						class="input input-bordered w-full color-picker"
					/>
				</div>
			</form>
		</div>
		<div class="card w-full max-w-lg shadow-lg bg-white rounded-lg p-6">
			<form class="space-y-4">
				<!-- 难度 -->
				<div class="form-control">
					<label for="difficulty" class="label">
						<span class="label-text">Level (1-5)</span>
					</label>
					<input
						v-model="noteForm.difficulty"
						type="range"
						id="difficulty"
						class="range range-primary w-full custom-range"
						min="1"
						max="5"
					/>
					<div class="text-center mt-2 text-sm">
						Level: {{ noteForm.difficulty }}
					</div>
				</div>

				<!-- 难度描述 -->
				<div class="form-control">
					<textarea
						v-model="noteForm.difficultyDetails"
						id="difficultyDetails"
						class="textarea textarea-bordered w-full"
						placeholder="请输入难度描述"
					></textarea>
				</div>
			</form>
		</div>
		<div class="card w-full max-w-lg shadow-lg bg-white rounded-lg p-6">
			<form class="space-y-4">
				<!-- 设置 seasons -->
				<div class="form-control">
					<label class="label">
						<span class="label-text">Seasons</span>
					</label>
					<div class="flex space-x-2">
						<select
							v-model="selectedSeasonIndex"
							class="select select-bordered w-full"
						>
							<option
								v-for="(season, index) in noteForm.seasons"
								:key="index"
								:value="index"
							>
								{{ season.seasonNumber }}
							</option>
						</select>
						<!-- 添加和删除季按钮 -->
						<button
							type="button"
							class="btn btn-primary text-white"
							@click="addSeason"
						>
							<i class="bi bi-plus text-xl"></i>
						</button>
						<button
							type="button"
							class="btn btn-error text-white"
							@click="removeSeason"
							:disabled="!noteForm.seasons.length"
						>
							<i class="bi bi-trash text-lg"></i>
						</button>
					</div>
				</div>

				<!-- 设置 episodes -->
				<div class="form-control" v-if="selectedSeason">
					<label class="label">
						<span class="label-text">Episodes</span>
					</label>
					<div class="episode-group grid grid-cols-5 gap-4">
						<div
							v-for="(episode, episodeIndex) in selectedSeason.episodes"
							:key="episodeIndex"
							class="card card-compact bg-base-100 shadow-md relative mb-10"
						>
							<div class="card-body">
								{{ episode.ep }}
							</div>
							<button
								type="button"
								class="btn btn-error btn-sm mt-2 absolute w-full text-white"
								style="bottom: -40px"
								@click="removeEpisode(episodeIndex)"
							>
								<i class="bi bi-trash"></i>
							</button>
						</div>
						<div
							class="card card-compact bg-base-100 shadow-md mb-10 mx-2 cursor-pointer bg-primary text-white"
							@click="addEpisode"
						>
							<div
								class="card-body flex justify-center items-center text-center"
							>
								<i class="bi bi-plus text-2xl"></i>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
	<!-- 提交按钮 -->
	<div class="flex justify-center mb-20 space-x-6">
		<button @click="submitNote" class="btn w-60 mt-6 btn-primary text-white">
			Submit
		</button>
		<button
			v-if="resourceId"
			@click="deleteCollection"
			class="btn w-60 mt-6 text-gray-500 hover:btn-error hover:text-white"
		>
			Delete Collection
		</button>
	</div>
	<dialog id="collection_delete_modal" class="modal">
		<div class="modal-box">
			<h3 class="text-lg my-4 mb-8 font-bold">
				确认删除当前合集？此操作不可撤销！
			</h3>
			<div class="flex space-x-4 justify-center">
				<!-- if there is a button in form, it will close the modal -->
				<button
					@click="confirmDelete"
					class="btn bg-error px-4 text-white hover:bg-red-500 transition duration-300"
				>
					确认
				</button>
				<button class="btn px-4" @click="closeDeleteModal">取消</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const router = useRouter();
const route = useRoute();

// 表单数据
const noteForm = ref({
	showName: "",
	description: "",
	difficulty: 3,
	difficultyDetails: "",
	banner: "",
	name: "",
	theme: "#7a81d5",
	seasons: [
		{
			seasonNumber: "S01",
			episodes: [{ ep: "1", scriptUrl: "" }],
		},
	],
});

// 即时预览数据
const bannerPreview = ref("");
const showError = ref(false);
const fileInput = ref(null);
const selectedSeasonIndex = ref(null);
const resourceId = ref(route.query.resource);

onMounted(async () => {
	if (route.query.resource) {
		getCollection();
	} else {
		selectedSeasonIndex.value = 0; // 默认选择第一季
	}
});

// 获取选择的季
const selectedSeason = computed(() => {
	return noteForm.value.seasons[selectedSeasonIndex.value] || null;
});

const getCollection = async () => {
	try {
		const res = await apiClient.get("catalogs/" + route.query.resource);
		if (res.data.code === 200) {
			noteForm.value = res.data.data;
			bannerPreview.value = res.data.data.banner;
			selectedSeasonIndex.value = 0; // 默认选择第一季
		} else {
			showToast({ message: "合集获取失败，请重试！", type: "error" });
		}
	} catch (error) {
		showToast({ message: "合集获取失败，请重试！", type: "error" });
		console.error("Failed to create note:", error);
	}
};

const addSeason = () => {
	const newSeasonNumber = noteForm.value.seasons.length + 1;
	const formattedSeasonNumber = `S${String(newSeasonNumber).padStart(2, "0")}`;
	noteForm.value.seasons.push({
		seasonNumber: formattedSeasonNumber,
		episodes: [],
	});
	selectedSeasonIndex.value = noteForm.value.seasons.length - 1; // 自动选择新添加的季
};

// 删除当前选择的季
const removeSeason = () => {
	if (selectedSeasonIndex.value !== null) {
		noteForm.value.seasons.splice(selectedSeasonIndex.value, 1);
		selectedSeasonIndex.value = noteForm.value.seasons.length ? 0 : null; // 更新选择的索引
	}
};

// 添加新集
const addEpisode = () => {
	if (selectedSeason.value) {
		selectedSeason.value.episodes.push({
			ep: String(selectedSeason.value.episodes.length + 1),
			scriptUrl: "",
		});
	}
};

// 删除指定集
const removeEpisode = (episodeIndex) => {
	selectedSeason.value.episodes.splice(episodeIndex, 1);
};

// 打开文件上传对话框
const triggerFileInput = () => {
	fileInput.value.click();
};

// 文件上传处理函数
const handleFileUpload = (event) => {
	const file = event.target.files[0];
	if (file) {
		noteForm.value.bannerFile = file; // 存储文件到表单数据

		// 生成本地预览URL
		bannerPreview.value = URL.createObjectURL(file);
	}
};

// 方法：更新主题色预览
const updateThemePreview = () => {
	// 在选择主题色时更新按钮的颜色
};

const deleteCollection = () => {
	document.getElementById("collection_delete_modal").showModal();
};

const confirmDelete = async () => {
	try {
		const res = await apiClient.delete("/catalogs/" + resourceId.value);
		if ((res.data.code = 200)) {
			showToast({ message: "删除合集成功", type: "success" });
			router.replace({
				path: "/collections",
			});
		} else {
			showToast({ message: "删除合集失败", type: "error" });
		}
	} catch (error) {
		showToast({ message: "删除合集失败", type: "error" });
	}
};

const closeDeleteModal = () => {
	document.getElementById("collection_delete_modal").close();
};

// 提交表单
const submitNote = async () => {
	showError.value = !noteForm.value.showName;
	if (showError.value) {
		showToast({ message: "提交失败！请填写合集名", type: "error" });
		return;
	}
	if (noteForm.value.bannerFile) {
		// 上传封面图
		const bannerUrl = await uploadBanner(noteForm.value.bannerFile);
		if (!bannerUrl) return;
		noteForm.value.banner = bannerUrl;
	}
	try {
		// 判断是新增还是编辑操作
		const res = resourceId.value
			? await apiClient.post(`/catalogs/${resourceId.value}`, noteForm.value) // 编辑接口
			: await apiClient.post("/catalogs", noteForm.value); // 新增接口

		if (res.data.code === 200) {
			const successMessage = resourceId.value ? "合集更新成功" : "新增合集成功";
			showToast({ message: successMessage, type: "success" });
			setTimeout(() => {
				resourceId.value
					? router.push("/collections/" + resourceId.value)
					: router.push("/collections");
			}, 1000);
		} else {
			showToast({ message: "操作失败，请重试！", type: "error" });
		}
	} catch (error) {
		showToast({ message: "操作失败，请重试！", type: "error" });
		console.error("Failed to create or update note:", error);
	}
};

const uploadBanner = async (file) => {
	const formData = new FormData();
	formData.append("file", file);

	try {
		const response = await apiClient.post("/catalogs/banner/upload", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		if (response.data.code === 200) {
			return response.data.data.url; // 返回文件的URL
		} else {
			showToast({ message: "头像上传失败，请重试！", type: "error" });
			return;
		}
	} catch (error) {
		showToast({ message: "头像上传失败，请重试！", type: "error" });
		console.error("Failed to upload banner:", error);
	}
};
</script>

<style scoped>
/* 主要样式调整通过 DaisyUI 和 Tailwind CSS 完成 */
/* 自定义滑块样式 */
.custom-range {
	-webkit-appearance: none; /* 清除默认样式 */
	appearance: none;
	height: 16px;
	background-color: #fff; /* 滑轨颜色 */
	border-radius: 10px;
}

/* 滑块填充部分的颜色 */
.custom-range::-webkit-slider-runnable-track {
	height: 6px;
	background-color: #ddd;
	border-radius: 4px;
}

.custom-range::-moz-range-track {
	height: 6px;
	background-color: #ddd;
	border-radius: 4px;
}

.custom-range::-ms-track {
	height: 6px;
	background-color: #ddd;
	border-radius: 4px;
}

/* 滑块圆点样式 */
.custom-range::-webkit-slider-thumb {
	-webkit-appearance: none; /* 清除默认样式 */
	appearance: none;
	width: 16px;
	height: 16px;
	background-color: #fff; /* 滑块颜色 */
	border-radius: 50%;
	cursor: pointer;
	transition: background-color 0.2s ease; /* 平滑过渡 */
}

.custom-range::-moz-range-thumb {
	width: 16px;
	height: 16px;
	background-color: #fff;
	border-radius: 50%;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.custom-range::-ms-thumb {
	width: 16px;
	height: 16px;
	background-color: #fff;
	border-radius: 50%;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

/* 悬停和聚焦时滑块圆点的样式 */
.custom-range:hover::-webkit-slider-thumb,
.custom-range:focus::-webkit-slider-thumb {
	background-color: #fff; /* 悬停和聚焦的颜色 */
}

.custom-range:hover::-moz-range-thumb,
.custom-range:focus::-moz-range-thumb {
	background-color: #fff;
}

.custom-range:hover::-ms-thumb,
.custom-range:focus::-ms-thumb {
	background-color: #fff;
}
/* 自定义颜色选择器样式 */
.color-picker {
	appearance: none; /* 移除默认样式 */
	padding: 8px; /* 控制内部的颜色块大小 */
	height: 2.5rem; /* 控制整体高度 */
	border-radius: 6px; /* 圆角样式 */
}

/* 调整颜色块的大小 */
.color-picker::-webkit-color-swatch-wrapper {
	padding: 2px; /* 调整颜色块的内边距，减少颜色块的大小 */
}

.color-picker::-webkit-color-swatch {
	border-radius: 4px; /* 颜色块圆角 */
}
.upload-area {
	width: 100%;
	height: 10rem;
	border: 2px dashed #ddd;
	position: relative;
}

.upload-area:hover {
	background-color: #e2e8f0; /* 鼠标悬停时的背景色 */
}
.episode-group {
	display: grid;
	grid-template-columns: repeat(5, 1fr); /* 每排 5 列 */
	gap: 1rem; /* 卡片之间的间距 */
}
</style>
