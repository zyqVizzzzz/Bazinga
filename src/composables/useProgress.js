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

		console.log("Current route params:", params);

		return Object.values(params).every(
			(param) => param !== undefined && param !== null
		);
	};

	// 保存进度方法
	const saveProgress = async () => {
		if (isSaving.value) return;

		// 检查路由参数是否完整
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

			console.log("Saving progress with params:", {
				course,
				season,
				episode,
				page,
				sign,
			});
			app;
			appStore.saveProgress(course, season, episode, page, sign);
			console.log(appStore.progressList);
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
				console.log("Route params updated and valid");
				hasUnsavedChanges.value = true;
			}
		}
	);

	// 同步保存方法
	const syncSaveProgress = () => {
		if (!checkRouteParams()) {
			console.warn("Route params not ready, skipping sync save");
			return;
		}

		try {
			const course = route.params.id;
			const season = route.params.season;
			const episode = route.params.episode;
			const page = currentPage.value;
			const sign = route.query.sign;

			appStore.saveProgress(course, season, episode, page, sign);

			const xhr = new XMLHttpRequest();
			xhr.open("POST", "/api/users/me/update", false);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(
				JSON.stringify({
					learningProgress: appStore.progressList,
				})
			);
		} catch (error) {
			console.error("Sync save failed:", error);
		}
	};

	// 处理浏览器关闭/刷新
	const handleBeforeUnload = (e) => {
		if (checkRouteParams()) {
			syncSaveProgress();
			e.preventDefault();
			e.returnValue = "";
		}
	};

	// 初始化事件监听
	onMounted(() => {
		console.log("Adding beforeunload listener");
		window.addEventListener("beforeunload", handleBeforeUnload);
	});

	// 组件卸载时的清理和保存
	onUnmounted(() => {
		console.log("Component unmounting, saving progress...");
		window.removeEventListener("beforeunload", handleBeforeUnload);
		// 确保在组件卸载时执行保存
		if (checkRouteParams()) {
			saveProgress();
		}
	});

	// 设置事件监听
	const setupEventListeners = () => {
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			if (checkRouteParams()) {
				saveProgress();
			}
		};
	};

	return {
		saveProgress,
		isSaving,
		hasUnsavedChanges,
		setupEventListeners, // 返回事件监听器设置函数
	};
}
