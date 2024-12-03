import { ref, watch, onMounted, onUnmounted } from "vue";

export function useProgress(
	appStore,
	apiClient,
	showToast,
	currentPage,
	route
) {
	const isSaving = ref(false);
	const hasUnsavedChanges = ref(false);

	// 检查路由参数是否都存在
	const checkRouteParams = () => {
		const params = {
			course: route.params.id,
			season: route.params.season,
			episode: route.params.episode,
			page: currentPage.value,
			sign: route.query.sign,
		};

		return Object.values(params).every(
			(param) => param !== undefined && param !== null
		);
	};

	// 普通保存进度方法
	const saveProgress = async () => {
		if (isSaving.value) return;

		if (!checkRouteParams()) {
			console.warn("Route params not ready, skipping save");
			return;
		}

		try {
			isSaving.value = true;
			const course = route.params.id;
			const season = route.params.season;
			const episode = route.params.episode;
			const page = currentPage.value;
			const sign = route.query.sign;

			appStore.saveProgress(course, season, episode, page, sign);
			const response = await apiClient.post("/users/me/update", {
				learningProgress: appStore.progressList,
			});

			if (response.data.code === 200) {
				hasUnsavedChanges.value = false;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error(error);
		} finally {
			isSaving.value = false;
		}
	};

	// 只保存到本地 - 用于页面卸载时
	const saveLocalProgress = () => {
		if (!checkRouteParams()) return;

		const course = route.params.id;
		const season = route.params.season;
		const episode = route.params.episode;
		const page = currentPage.value;
		const sign = route.query.sign;

		console.log("Saving local progress:", {
			course,
			season,
			episode,
			page,
			sign,
		});

		// 只保存到 store，不发送请求
		appStore.saveProgress(course, season, episode, page, sign);
	};

	// 处理页面刷新/关闭
	const handleBeforeUnload = () => {
		if (hasUnsavedChanges.value) {
			saveLocalProgress();
		}
	};

	// 监听路由参数变化
	watch(
		() => [
			route.params.id,
			route.params.season,
			route.params.episode,
			route.query.sign,
			currentPage.value,
		],
		() => {
			if (checkRouteParams()) {
				hasUnsavedChanges.value = true;
			}
		}
	);

	// 设置事件监听
	onMounted(async () => {
		window.addEventListener("beforeunload", handleBeforeUnload);

		// 如果有本地进度，同步到后端
		if (appStore.progressList.length > 0) {
			try {
				await apiClient.post("/users/me/update", {
					learningProgress: appStore.progressList,
				});
			} catch (error) {
				console.error("Failed to sync local progress:", error);
			}
		}
	});

	// 组件卸载时的清理和保存
	onUnmounted(() => {
		console.log("Component unmounting, saving local progress...");
		window.removeEventListener("beforeunload", handleBeforeUnload);
		if (checkRouteParams()) {
			saveLocalProgress();
		}
	});

	return {
		saveProgress,
		isSaving,
		hasUnsavedChanges,
	};
}
