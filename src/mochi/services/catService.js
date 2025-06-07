import apiClient from "@/api";

export const catService = {
	// 获取用户的猫猫
	async getUserCat(userId) {
		try {
			const response = await apiClient.get(`/cats/user/${userId}`);
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("获取猫猫失败", error);
			throw error;
		}
	},

	async createCat() {
		try {
			const response = await apiClient.post("/cats", {
				appearance: {
					baseSprite: "default",
					accessories: [],
				},
			});
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("创建猫猫失败", error);
			throw error;
		}
	},

	// 复活猫猫
	async reviveCat(catId) {
		try {
			const response = await apiClient.post(`/cats/${catId}/revive`);
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("复活猫猫失败", error);
			throw error;
		}
	},

	// 与猫猫互动
	async interactWithCat(catId, actionType, actionSubType = "", type = 1) {
		try {
			const response = await apiClient.post(`/cats/${catId}/interact`, {
				actionType,
				actionSubType,
				type,
			});
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error(`猫猫互动失败: ${actionType}`, error);
			throw error;
		}
	},

	// 回答错误时与猫猫互动（状态减少）
	async interactWithCatWhenWrong(
		catId,
		actionType,
		actionSubType = "",
		type = 1
	) {
		try {
			console.log("df");
			const response = await apiClient.post(`/cats/${catId}/interact-wrong`, {
				actionType,
				actionSubType,
				type,
			});
			console.log("df", response.data);
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error(`回答错误猫猫互动失败: ${actionType}`, error);
			throw error;
		}
	},

	// 获取猫猫状态衰减
	async decayCatState(catId) {
		try {
			const response = await apiClient.post(`/cats/${catId}/decay`);
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("猫猫状态衰减失败", error);
			throw error;
		}
	},

	// 创建猫猫状态快照
	async createCatSnapshot(catId) {
		try {
			const response = await apiClient.post(`/cats/${catId}/snapshot`);
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("创建猫猫状态快照失败", error);
			throw error;
		}
	},

	// 测试离线状态衰减
	async testOfflineDecay(catId, offlineHours) {
		try {
			const response = await apiClient.post(`/cats/${catId}/test-offline`, {
				offlineHours: offlineHours,
			});
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("测试离线状态衰减失败", error);
			throw error;
		}
	},

	testQuirk: async (catId) => {
		try {
			const response = await apiClient.post(`/cats/${catId}/test-quirk`);
			if (response.data.code === 200) {
				return response.data.data;
			}
			throw new Error(response.data.message);
		} catch (error) {
			console.error("Test quirk failed:", error);
			throw error;
		}
	},
};
