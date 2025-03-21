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
											@blur="v$.showName.$touch()"
										/>
									</div>
									<div
										v-if="v$.showName.$error"
										class="text-red-500 text-sm mt-1"
									>
										{{ v$.showName.$errors[0].$message }}
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
											@blur="v$.name.$touch()"
										/>
									</div>
									<div v-if="v$.name.$error" class="text-red-500 text-sm mt-1">
										{{ v$.name.$errors[0].$message }}
									</div>
								</div>

								<!-- 合集简介 -->
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
											@blur="v$.description.$touch()"
										></textarea>
									</div>
									<div
										v-if="v$.description.$error"
										class="text-red-500 text-sm mt-1"
									>
										{{ v$.description.$errors[0].$message }}
									</div>
								</div>

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

								<!-- 难度滑块 -->
								<div class="form-control">
									<div class="retro-range-wrapper mt-2">
										<input
											v-model="noteForm.difficulty"
											type="range"
											class="retro-range"
											min="1"
											max="5"
										/>
										<div class="text-center mt-2 text-sm">
											{{ t("collectionSetup.form.level") }}:
											{{ noteForm.difficulty }}
										</div>
									</div>
								</div>

								<!-- 难度描述 -->
								<div class="form-control">
									<div class="retro-textarea-wrapper">
										<textarea
											v-model="noteForm.difficultyDetails"
											class="retro-textarea"
											:placeholder="t('collectionSetup.form.levelInput')"
											@blur="v$.difficultyDetails.$touch()"
										></textarea>
									</div>
									<div
										v-if="v$.difficultyDetails.$error"
										class="text-red-500 text-sm mt-1"
									>
										{{ v$.difficultyDetails.$errors[0].$message }}
									</div>
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
								<!-- <div class="form-control">
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

								<div class="form-control" v-if="selectedSeason">
									<div class="retro-input-wrapper">
										<input
											v-model="selectedSeason.seasonName"
											type="text"
											class="retro-input"
											placeholder="为组设置标题，未设置则自动以 S01, S02... 为标题"
											@blur="
												v$.seasons[selectedSeasonIndex]?.seasonName?.$touch()
											"
										/>
									</div>
									<div class="flex justify-between">
										<div
											v-if="v$.seasons[selectedSeasonIndex]?.seasonName?.$error"
											class="text-red-500 text-sm mt-1"
										>
											{{
												v$.seasons[selectedSeasonIndex]?.seasonName?.$errors[0]
													?.$message
											}}
										</div>
									</div>
								</div> -->

								<!-- Episodes网格 -->
								<div class="form-control" v-if="selectedSeason">
									<div class="flex justify-between items-center mb-2">
										<label class="retro-label">
											<span class="label-text">{{
												t("collectionSetup.form.episodes")
											}}</span>
										</label>
									</div>

									<div class="space-y-4">
										<div
											v-for="(episode, episodeIndex) in selectedSeason.episodes"
											:key="episodeIndex"
											class="flex items-center space-x-4 bg-base-200 p-4 rounded-lg"
										>
											<!-- EP编号显示 -->
											<div class="text-center font-medium">
												EP{{ episode.ep }}
											</div>

											<!-- EP名称输入 -->
											<div class="flex-1">
												<div class="retro-input-wrapper">
													<input
														v-model="episode.epName"
														type="text"
														class="retro-input"
														placeholder="请输入集数名称"
														@blur="
															v$.seasons[selectedSeasonIndex]?.episodes?.[
																episodeIndex
															]?.epName?.$touch()
														"
													/>
												</div>
												<div class="flex justify-between">
													<div
														v-if="
															v$.seasons[selectedSeasonIndex]?.episodes?.[
																episodeIndex
															]?.epName?.$error
														"
														class="text-red-500 text-sm mt-1"
													>
														{{
															v$.seasons[selectedSeasonIndex]?.episodes?.[
																episodeIndex
															]?.epName?.$errors[0]?.$message
														}}
													</div>
												</div>
											</div>

											<button
												type="button"
												class="retro-btn-small"
												@click="addEpisodeAfter(episodeIndex)"
											>
												<div class="btn-shadow">
													<div class="btn-edge">
														<div class="btn-face">
															<i class="bi bi-plus text-xl"></i>
														</div>
													</div>
												</div>
											</button>
											<!-- 删除按钮 -->
											<button
												type="button"
												class="retro-btn-small"
												@click="removeEpisode(episodeIndex)"
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
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 操作按钮 -->
		<div class="flex justify-center mb-20 space-x-6">
			<button
				v-debounce-click="{
					handler: submitNote,
					delay: 500,
				}"
				class="retro-btn-large"
			>
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
				<div class="btn-shadow btn-shadow-danger">
					<div class="btn-edge btn-edge-danger">
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
							v-debounce-click="{
								handler: confirmDelete,
								delay: 500,
							}"
							class="retro-btn-small danger modal-btn"
						>
							<div class="btn-shadow btn-shadow-danger">
								<div class="btn-edge btn-edge-danger">
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
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
import { useI18n } from "vue-i18n";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength, helpers } from "@vuelidate/validators";
import { useAppStore } from "@/store";

const { t, locale } = useI18n();

const router = useRouter();
const route = useRoute();

// 基本字段验证规则
const standardNameRule = {
	maxLength: helpers.withMessage("不能超过30个字符", maxLength(30)),
};

const longTextRule = {
	maxLength: helpers.withMessage("不能超过200个字符", maxLength(200)),
};

// 动态生成季节和集数的验证规则
const createSeasonRules = (seasons) => {
	const seasonRules = {};
	seasons.forEach((season, seasonIndex) => {
		seasonRules[seasonIndex] = {
			seasonName: standardNameRule,
			episodes: {
				$each: {
					epName: standardNameRule,
				},
			},
		};
	});
	return seasonRules;
};

// 验证规则
const rules = computed(() => ({
	showName: {
		required: helpers.withMessage("请输入标题", required),
		...standardNameRule,
	},
	name: standardNameRule,
	description: longTextRule,
	difficultyDetails: longTextRule,
	seasons: createSeasonRules(noteForm.value.seasons),
}));

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
			seasonName: "",
			episodes: [{ ep: "1", epName: "", scriptUrl: "" }],
		},
	],
});

const v$ = useVuelidate(rules, noteForm);

// 计算字符长度
const getCharCount = (text = "") => ({
	current: text.length,
	max: text.length >= 200 ? 200 : text.length >= 30 ? 30 : 30,
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
			// 确保每个季节都至少有一集
			const seasons = res.data.data.seasons.map((season) => {
				if (!season.episodes || season.episodes.length === 0) {
					season.episodes = [
						{
							ep: "1",
							epName: "",
							scriptUrl: "",
						},
					];
				}
				return season;
			});

			noteForm.value = {
				...res.data.data,
				seasons,
			};
			bannerPreview.value = res.data.data.banner;
			selectedSeasonIndex.value = 0;
		} else {
			showToast({ message: "合集获取失败，请重试！", type: "error" });
		}
	} catch (error) {
		showToast({ message: "合集获取失败，请重试！", type: "error" });
		console.error("Failed to create note:", error);
	}
};

// 新增季
const addSeason = async () => {
	const newSeasonNumber = noteForm.value.seasons.length + 1;
	const formattedSeasonNumber = `S${String(newSeasonNumber).padStart(2, "0")}`;
	noteForm.value.seasons.push({
		seasonNumber: formattedSeasonNumber,
		seasonName: "",
		episodes: [
			{
				ep: "1",
				epName: "",
				scriptUrl: "",
			},
		],
	});
	selectedSeasonIndex.value = noteForm.value.seasons.length - 1;
	await v$.value.$touch(); // 触发验证
};

// 删除当前选择的季
const removeSeason = () => {
	if (selectedSeasonIndex.value !== null && noteForm.value.seasons.length > 1) {
		noteForm.value.seasons.splice(selectedSeasonIndex.value, 1);
		// 如果删除的是最后一个季节，选中新的最后一个
		if (selectedSeasonIndex.value >= noteForm.value.seasons.length) {
			selectedSeasonIndex.value = noteForm.value.seasons.length - 1;
		}
	}
};

// 在指定位置后添加新集数
const addEpisodeAfter = (index) => {
	if (selectedSeason.value) {
		// 在指定位置后插入新集数
		selectedSeason.value.episodes.splice(index + 1, 0, {
			ep: "", // 临时设置为空，会在重新编号时更新
			epName: "",
			scriptUrl: "",
		});

		// 重新编号所有集数
		selectedSeason.value.episodes = selectedSeason.value.episodes.map(
			(episode, idx) => ({
				...episode,
				ep: String(idx + 1),
			})
		);
	}
};

// 删除指定集
const removeEpisode = (index) => {
	if (selectedSeason.value.episodes.length === 1) {
		showToast({ message: "每组请至少保留一篇内容", type: "warning" });
	}
	if (selectedSeason.value && index !== 0) {
		// 确保不能删除第一集
		selectedSeason.value.episodes.splice(index, 1);

		// 重新编号剩余集数
		selectedSeason.value.episodes = selectedSeason.value.episodes.map(
			(episode, idx) => ({
				...episode,
				ep: String(idx + 1),
			})
		);
	}
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
		if (res.data.code === 200) {
			clearLocalProgressByCatalogId(resourceId.value);
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

const clearLocalProgressByCatalogId = (catalogId) => {
	try {
		const appStore = useAppStore();

		// 过滤掉指定 catalogId 的进度
		const updatedProgress = appStore.progressList.filter(
			(item) => item.course !== catalogId
		);

		// 更新 store
		appStore.initProgress(updatedProgress);
	} catch (error) {
		console.error("Failed to clear local progress:", error);
	}
};

const closeDeleteModal = () => {
	document.getElementById("collection_delete_modal").close();
};

// 提交表单
const submitNote = async () => {
	const result = await v$.value.$validate();
	if (!result) {
		showToast({ message: "请检查表单填写是否正确", type: "error" });
		return;
	}
	if (noteForm.value.bannerFile) {
		// 上传封面图
		const bannerUrl = await uploadBanner(noteForm.value.bannerFile);
		if (!bannerUrl) return;
		noteForm.value.banner = bannerUrl;
	}
	console.log(noteForm.value);
	try {
		// 判断是新增还是编辑操作
		const res = resourceId.value
			? await apiClient.post(`/catalogs/${resourceId.value}`, noteForm.value) // 编辑接口
			: await apiClient.post("/catalogs", noteForm.value); // 新增接口

		if (res.data.code === 200) {
			// 如果是编辑操作，需要更新本地存储的进度信息
			if (resourceId.value) {
				updateLocalProgress(resourceId.value, noteForm.value);
			}

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

// 更新本地存储的进度信息

const updateLocalProgress = (catalogId, catalogData) => {
	try {
		const appStore = useAppStore();

		// 过滤掉不存在的季和集的进度
		const updatedProgress = appStore.progressList.filter((item) => {
			if (item.course !== catalogId) return true;

			// 检查季是否存在
			const seasonExists = catalogData.seasons.some(
				(season) => season.seasonNumber === item.season
			);
			if (!seasonExists) return false;

			// 检查集是否存在
			const season = catalogData.seasons.find(
				(s) => s.seasonNumber === item.season
			);
			const episodeExists = season.episodes.some(
				(episode) => episode.ep === item.episode
			);

			return episodeExists;
		});

		// 使用 store action 更新进度
		appStore.initProgress(updatedProgress);
	} catch (error) {
		console.error("Failed to update local progress:", error);
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

const handleTitleInput = () => {
	const result = validateCollectionTitle(noteForm.value.showName);
	formErrors.showName = result.error;

	if (result.value) {
		noteForm.value.showName = result.value;
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
	background-color: #b3b3b3;
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

.retro-btn-md {
	position: relative;
	width: 100%;
	height: 100%;
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
.btn-shadow-danger {
	background-color: #982929;
}
.btn-edge-danger {
	background-color: #b55353;
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
	border: 2px solid #333;
	border-radius: 8px;
	background: white;
	overflow: hidden;
	display: flex;
}
.episode-card-add {
	background-color: #f0f0f0;
}
.episode-card-add:hover {
	background-color: white;
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

.delete-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	opacity: 0;
	transition: opacity 0.2s ease;
	visibility: hidden;
}

.episode-card:hover .delete-overlay {
	opacity: 1;
	visibility: visible;
}

.delete-button {
	background-color: #fee2e2;
	color: #dc2626;
	width: 100%;
	height: 100%;
	border-radius: 6px;
	font-size: 0.875rem;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.25rem;
}

.delete-button:hover {
	background-color: #fecaca;
	transform: scale(1.05);
}
</style>
