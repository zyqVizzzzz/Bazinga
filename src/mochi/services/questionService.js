import apiClient from "@/api";

export const questionService = {
	// 获取随机问题
	async getRandomQuestion(difficulty = 1) {
		try {
			const response = await apiClient.get(
				`/questions/random?difficulty=${difficulty}`
			);
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("获取随机问题失败", error);
			throw error;
		}
	},

	// 验证答案
	async verifyAnswer(questionId, selectedOptionIndex) {
		try {
			const response = await apiClient.post(`/questions/${questionId}/verify`, {
				selectedOptionIndex,
			});
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("验证答案失败", error);
			throw error;
		}
	},

	// 获取用户的问题统计
	async getUserQuestionStats(userId) {
		try {
			const response = await apiClient.get(`/questions/stats/user/${userId}`);
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error("获取用户问题统计失败", error);
			throw error;
		}
	},

	// 获取特定类型的问题
	async getQuestionsByType(type, limit = 10) {
		try {
			const response = await apiClient.get(
				`/questions/type/${type}?limit=${limit}`
			);
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error(`获取类型为 ${type} 的问题失败`, error);
			throw error;
		}
	},

	// 获取特定难度的问题
	async getQuestionsByDifficulty(difficulty, limit = 10) {
		try {
			const response = await apiClient.get(
				`/questions/difficulty/${difficulty}?limit=${limit}`
			);
			if (response.data.code === 200) {
				return response.data.data;
			} else {
				throw new Error(response.data.message);
			}
		} catch (error) {
			console.error(`获取难度为 ${difficulty} 的问题失败`, error);
			throw error;
		}
	},
};
