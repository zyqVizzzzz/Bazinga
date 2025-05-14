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

	// 与猫猫互动
	async interactWithCat(catId, actionType, actionSubType = "") {
		try {
			const response = await apiClient.post(`/cats/${catId}/interact`, {
				actionType,
				actionSubType,
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
};
