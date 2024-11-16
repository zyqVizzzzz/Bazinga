<template>
	<div class="w-full mx-auto px-4">
		<!-- 标题 -->
		<div class="retro-title-box my-10 text-center">
			<h1 class="text-2xl font-bold text-shadow-retro">
				{{
					resourceId
						? t("collectionSetup.updateTitle")
						: t("collectionSetup.createTitle")
				}}
			</h1>
		</div>

		<!-- 表单网格 -->
		<div
			class="grid mb-10 justify-items-center grid-cols-2 gap-8 px-10 auto-rows-fr"
		>
			<!-- 基本信息卡片 -->
			<div class="retro-card h-full w-full max-w-lg">
				<div class="card-shadow h-full">
					<div class="card-edge h-full">
						<div class="card-face h-full">
							<form class="space-y-6">
								<!-- 标题输入 -->
								<div class="form-control">
									<label class="retro-label">
										<span class="label-text"
											>{{ t("collectionSetup.form.title") }}
											<span class="text-red-500"
												>({{ t("collectionSetup.form.titleDesc") }})</span
											>
										</span>
									</label>
									<div class="retro-input-wrapper">
										<input
											v-model="noteForm.showName"
											type="text"
											class="retro-input"
											:class="{
												'border-red-500': showError && !noteForm.showName,
											}"
											:placeholder="t('collectionSetup.form.titleInput')"
										/>
									</div>
								</div>

								<!-- 副标题输入 -->
								<div class="form-control">
									<label class="retro-label">
										<span class="label-text">{{
											t("collectionSetup.form.subTitle")
										}}</span>
									</label>
									<div class="retro-input-wrapper">
										<input
											v-model="noteForm.name"
											type="text"
											class="retro-input"
											:placeholder="t('collectionSetup.form.subTitleInput')"
										/>
									</div>
								</div>

								<!-- 描述文本框 -->
								<div class="form-control">
									<label class="retro-label">
										<span class="label-text">{{
											t("collectionSetup.form.description")
										}}</span>
									</label>
									<div class="retro-textarea-wrapper">
										<textarea
											v-model="noteForm.description"
											class="retro-textarea"
											:placeholder="t('collectionSetup.form.descriptionInput')"
										></textarea>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>

			<!-- 上传和主题卡片 -->
			<div class="retro-card h-full w-full max-w-lg">
				<div class="card-shadow h-full">
					<div class="card-edge h-full">
						<div class="card-face h-full">
							<form class="space-y-6">
								<!-- Banner上传区域 -->
								<div class="form-control">
									<label class="retro-label">
										<span class="label-text">{{
											t("collectionSetup.form.banner")
										}}</span>
									</label>
									<div class="retro-upload-area" @click="triggerFileInput">
										<template v-if="!bannerPreview">
											<div class="upload-content">
												<i class="bi bi-upload text-2xl"></i>
												<span class="mt-2">{{
													t("collectionSetup.form.bannerInput")
												}}</span>
											</div>
										</template>
										<template v-else>
											<img
												:src="bannerPreview"
												alt="Preview"
												class="preview-image"
											/>
										</template>
									</div>
									<input
										ref="fileInput"
										@change="handleFileUpload"
										type="file"
										class="hidden"
										accept="image/*"
									/>
								</div>

								<!-- 主题色选择器 -->
								<div class="form-control">
									<label class="retro-label">
										<span class="label-text">{{
											t("collectionSetup.form.themeColor")
										}}</span>
									</label>
									<div class="retro-color-picker">
										<input
											v-model="noteForm.theme"
											@input="updateThemePreview"
											type="color"
											class="w-full h-8 flex"
										/>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>

			<!-- 难度设置卡片 -->
			<div class="retro-card h-full w-full max-w-lg">
				<div class="card-shadow h-full">
					<div class="card-edge h-full">
						<div class="card-face h-full">
							<form class="space-y-6">
								<!-- 难度滑块 -->
								<div class="form-control">
									<label class="retro-label">
										<span class="label-text">{{
											t("collectionSetup.form.level")
										}}</span>
									</label>
									<div class="retro-range-wrapper">
										<input
											v-model="noteForm.difficulty"
											type="range"
											class="retro-range"
											min="1"
											max="5"
										/>
										<div class="text-center mt-2">
											{{ t("collectionSetup.form.level") }}:
											{{ noteForm.difficulty }}
										</div>
									</div>
								</div>

								<!-- 难度描述 -->
								<div class="retro-textarea-wrapper">
									<textarea
										v-model="noteForm.difficultyDetails"
										class="retro-textarea"
										:placeholder="t('collectionSetup.form.levelInput')"
									></textarea>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>

			<!-- 季节设置卡片 -->
			<div class="retro-card h-full w-full max-w-lg">
				<div class="card-shadow h-full">
					<div class="card-edge h-full">
						<div class="card-face h-full">
							<form class="space-y-6">
								<!-- Seasons选择器 -->
								<div class="form-control">
									<label class="retro-label">
										<span class="label-text">{{
											t("collectionSetup.form.seasons")
										}}</span>
									</label>
									<div class="flex space-x-4 items-center">
										<div class="retro-select-wrapper flex-1">
											<select
												v-model="selectedSeasonIndex"
												class="retro-select"
											>
												<option
													v-for="(season, index) in noteForm.seasons"
													:key="index"
													:value="index"
												>
													{{ season.seasonNumber }}
												</option>
											</select>
										</div>
										<button
											type="button"
											class="retro-btn-small"
											@click="addSeason"
										>
											<div class="btn-shadow">
												<div class="btn-edge">
													<div class="btn-face">
														<i class="bi bi-plus text-xl"></i>
													</div>
												</div>
											</div>
										</button>
										<button
											type="button"
											class="retro-btn-small"
											@click="removeSeason"
											:disabled="!noteForm.seasons.length"
										>
											<div class="btn-shadow">
												<div class="btn-edge">
													<div class="btn-face">
														<i class="bi bi-trash text-lg"></i>
													</div>
												</div>
											</div>
										</button>
									</div>
								</div>

								<!-- Episodes网格 -->
								<div class="form-control" v-if="selectedSeason">
									<label class="retro-label">
										<span class="label-text">{{
											t("collectionSetup.form.episodes")
										}}</span>
									</label>
									<div class="episode-group grid grid-cols-5 gap-4">
										<div
											v-for="(episode, episodeIndex) in selectedSeason.episodes"
											:key="episodeIndex"
											class="card card-compact bg-base-100 shadow-md relative mb-10"
										>
											<div class="card-body justify-center items-center">
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
				</div>
			</div>
		</div>

		<!-- 操作按钮 -->
		<div class="flex justify-center mb-20 space-x-6">
			<button class="retro-btn-large" @click="submitNote">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">{{ t("collectionSetup.form.submit") }}</div>
					</div>
				</div>
			</button>
			<button
				v-if="resourceId"
				class="retro-btn-large danger"
				@click="deleteCollection"
			>
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">{{ t("collectionSetup.form.delete") }}</div>
					</div>
				</div>
			</button>
		</div>

		<!-- 删除确认对话框 -->
		<dialog id="collection_delete_modal" class="modal">
			<div class="retro-modal">
				<div class="modal-content">
					<h3 class="text-lg font-bold mb-6">
						{{ t("collectionSetup.form.deleteTips") }}
						<!-- <div class="text-base"> -->
						<mark class="text-red-500">{{
							t("collectionSetup.form.deleteTips2")
						}}</mark>
						<!-- </div> -->
					</h3>
					<div class="flex space-x-4 justify-center">
						<button
							@click="confirmDelete"
							class="retro-btn-small danger modal-btn"
						>
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face">
										{{ t("collectionSetup.form.deleteConfirm") }}
									</div>
								</div>
							</div>
						</button>
						<button class="retro-btn-small modal-btn" @click="closeDeleteModal">
							<div class="btn-shadow">
								<div class="btn-edge">
									<div class="btn-face">
										{{ t("collectionSetup.form.deleteCancel") }}
									</div>
								</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</dialog>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

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
	theme: "#3f51b5",
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

// 更新主题色预览
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
.retro-card {
	position: relative;
	width: 100%;
	text-align: left;
}

.card-shadow {
	background-color: #666;
	border-radius: 12px;
	transform: translateY(4px);
}

.card-edge {
	background-color: #888;
	border-radius: 12px;
	transform: translateY(-4px);
}

.card-face {
	background-color: #f8f8f8;
	border: 3px solid #333;
	border-radius: 12px;
	padding: 1.5rem;
	transform: translateY(-4px);
}

/* 复古标题样式 */
.retro-title-box {
	position: relative;
	display: inline-block;
	padding: 1rem 3rem;
}

.title-decoration {
	position: absolute;
	width: 40px;
	height: 40px;
	border: 4px solid currentColor;
}

.title-decoration.left {
	left: -20px;
	top: 50%;
	transform: translateY(-50%) rotate(45deg);
}

.title-decoration.right {
	right: -20px;
	top: 50%;
	transform: translateY(-50%) rotate(45deg);
}

.text-shadow-retro {
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2),
		-1px -1px 0 rgba(255, 255, 255, 0.2);
}

.retro-input-wrapper {
	position: relative;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
	padding: 2px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.retro-input {
	width: 100%;
	padding: 0.5rem;
	border: none;
	background: transparent;
	font-family: inherit;
}

.retro-input:focus {
	outline: none;
}

.retro-textarea-wrapper {
	position: relative;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
	padding: 2px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.retro-textarea {
	width: 100%;
	padding: 0.5rem;
	border: none;
	background: transparent;
	resize: vertical;
	min-height: 100px;
}

.retro-textarea:focus {
	outline: none;
}

.retro-upload-area {
	position: relative;
	height: 160px;
	background: white;
	border: 2px dashed #333;
	border-radius: 8px;
	cursor: pointer;
	overflow: hidden;
	transition: all 0.3s;
}

.retro-upload-area:hover {
	background: #f0f0f0;
	border-style: solid;
}

.upload-content {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #666;
}

.preview-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.retro-range-wrapper {
	padding: 1rem;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
}

.retro-range {
	width: 100%;
	height: 20px;
	-webkit-appearance: none;
	background: transparent;
}

.retro-range::-webkit-slider-thumb {
	-webkit-appearance: none;
	width: 24px;
	height: 24px;
	background: white;
	border: 2px solid #333;
	border-radius: 50%;
	margin-top: -8px;
	cursor: pointer;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.retro-range::-webkit-slider-runnable-track {
	width: 100%;
	height: 8px;
	background: #ddd;
	border-radius: 4px;
	border: 1px solid #333;
}

.retro-select-wrapper {
	position: relative;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
	padding: 2px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.retro-select {
	width: 100%;
	padding: 0.5rem;
	border: none;
	background: transparent;
	appearance: none;
	cursor: pointer;
	font-family: inherit;
}

.retro-select:focus {
	outline: none;
}

.retro-btn-small {
	position: relative;
	width: 2.5rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

.retro-btn-small.modal-btn {
	width: 5rem;
	height: 2.5rem;
}

.retro-btn-large {
	position: relative;
	width: 10rem;
	height: 2.5rem;
	border: none;
	background: none;
	cursor: pointer;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 8px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	border: 2px solid #333;
	border-radius: 8px;
	color: #333;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
}

.retro-btn-small:hover .btn-face,
.retro-btn-large:hover .btn-face {
	background-color: white;
}

.retro-btn-small:active .btn-edge,
.retro-btn-small:active .btn-face,
.retro-btn-large:active .btn-edge,
.retro-btn-large:active .btn-face {
	transform: translateY(0);
}

.retro-btn-small.danger .btn-face,
.retro-btn-large.danger .btn-face {
	background-color: #fee2e2;
	border-color: #dc2626;
	color: #dc2626;
}

.retro-btn-small.danger:hover .btn-face,
.retro-btn-large.danger:hover .btn-face {
	background-color: #fecaca;
}

.retro-btn-small:disabled,
.retro-btn-large:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.retro-episode-grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 1rem;
	padding: 1rem 0;
}

.episode-card {
	position: relative;
	padding-bottom: 100%;
}

.card-content {
	position: absolute;
	inset: 0;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.delete-btn {
	position: absolute;
	bottom: -2rem;
	left: 0;
	width: 100%;
	padding: 0.25rem;
	background: #fee2e2;
	border: 2px solid #dc2626;
	border-radius: 4px;
	color: #dc2626;
	font-size: 0.875rem;
	transition: all 0.2s;
}

.delete-btn:hover {
	background: #fecaca;
}

.add-episode-card {
	position: relative;
	padding-bottom: 100%;
	cursor: pointer;
}

.add-episode-card::before {
	content: "";
	position: absolute;
	inset: 0;
	background: rgba(var(--primary-color-rgb), 0.1);
	border: 2px solid var(--primary-color);
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--primary-color);
	transition: all 0.2s;
}

.add-episode-card:hover::before {
	background: rgba(var(--primary-color-rgb), 0.2);
}

.retro-color-picker {
	position: relative;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
	padding: 2px;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.retro-color-picker input[type="color"] {
	border: none;
	padding: 0;
	background: transparent;
}

.retro-color-picker input[type="color"]::-webkit-color-swatch-wrapper {
	padding: 0;
}

.retro-color-picker input[type="color"]::-webkit-color-swatch {
	border: none;
	border-radius: 4px;
}

.retro-modal {
	background: white;
	border: 3px solid #333;
	border-radius: 12px;
	box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
	padding: 2rem;
	max-width: 500px;
	width: 90%;
	margin: 2rem auto;
}

.retro-label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: bold;
	color: #333;
}

.card-face::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.02) 2px,
		rgba(0, 0, 0, 0.02) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}

.card-face::after {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 50%;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
	border-radius: 9px 9px 0 0;
	pointer-events: none;
}
</style>
