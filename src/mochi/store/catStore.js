import { defineStore } from "pinia";
import { catService } from "../services/catService";
import { questionService } from "../services/questionService";
import { showToast } from "@/components/common/toast.js";
import { usePointsStore } from "@/store/index";

const pointsStore = usePointsStore();

export const useCatStore = defineStore("cat", {
	state: () => ({
		catId: null,
		catState: {
			shortTermStates: {
				food: 50,
				happiness: 50,
				cleanliness: 50,
				energy: 50,
				health: 50,
			},
			currentHealthPoints: 100,
			maxHealthPoints: 100,
			currentHealthiness: 100,
			aiContext: {
				lastSaid: "喵～",
				moodKeywords: [],
			},
		},
		// UI状态
		currentActiveIconIndex: -1,
		isSubMenu: false,
		isAnswering: false,
		currentParentType: "",
		currentSubType: "",
		currentQuestion: null,
		selectedAnswer: -1,
		isAnimating: -1,
		showExplanation: false,
		quirks: [],
		lifeStatus: "alive", // 'alive', 'dead'
		activationDate: null,
		deathDate: null,
		hasCat: false, // 添加是否有cat的状态
		showCreateCatDialog: false, // 添加显示创建cat对话框的状态
	}),

	getters: {
		// 计算属性
		petStatus: (state) => {
			const healthiness = state.catState.currentHealthiness || 0;
			if (healthiness >= 90) return "极佳";
			if (healthiness >= 70) return "良好";
			if (healthiness >= 50) return "一般";
			if (healthiness >= 30) return "不佳";
			return "糟糕";
		},
		// 检查是否有夜猫子怪癖
		hasNightOwlQuirk: (state) => {
			return (
				state.catState &&
				state.catState.quirks &&
				state.catState?.quirks[0]?.quirkId?.includes("nightOwl")
			);
		},
		canInteract: (state) => {
			return state.lifeStatus === "alive";
		},

		isAlive: (state) => state.lifeStatus === "alive",
		isDead: (state) => state.lifeStatus === "dead",

		statusText: (state) => {
			switch (state.lifeStatus) {
				case "alive":
					return "健康";
				case "dead":
					return "已死亡";
				default:
					return "未知";
			}
		},
	},

	actions: {
		// 初始化猫咪数据
		async initCat() {
			try {
				const cat = await catService.getUserCat();
				if (cat) {
					this.catId = cat._id;
					this.catState = cat;
					this.lifeStatus = cat.lifeStatus || "alive";
					this.activationDate = cat.activationDate;
					this.deathDate = cat.deathDate;
					this.hasCat = true;
				} else {
					// 没有cat时，显示创建对话框
					this.hasCat = false;
					this.showCreateCatDialog = true;
				}
			} catch (error) {
				// 如果是404错误（没有找到cat），也显示创建对话框
				if (error.response && error.response.status === 404) {
					this.hasCat = false;
					this.showCreateCatDialog = true;
				} else {
					showToast({
						message: "获取猫猫信息失败",
						type: "error",
						duration: 3000,
					});
				}
			}
		},

		// 创建新猫猫
		async createCat() {
			try {
				this.isCreating = true;
				const cat = await catService.createCat(); // 不再传递参数

				this.catId = cat._id;
				this.catState = cat;
				this.lifeStatus = cat.lifeStatus || "alive";
				this.hasCat = true;
				this.showCreateCatDialog = false;
				this.isCreating = false;

				showToast({
					message: `猫猫 MOCHI 创建成功！`, // 固定显示MOCHI
					type: "success",
					duration: 3000,
				});

				return cat;
			} catch (error) {
				this.isCreating = false;
				showToast({
					message: "创建猫猫失败",
					type: "error",
					duration: 3000,
				});
				throw error;
			}
		},

		// 取消创建猫猫
		cancelCreateCat() {
			this.showCreateCatDialog = false;
		},

		// 复活猫猫
		async reviveCat() {
			if (!this.catId) {
				throw new Error("没有找到猫猫ID");
			}

			if (this.lifeStatus !== "dead") {
				throw new Error("只有死亡的猫猫才能复活");
			}

			try {
				const revivedCat = await catService.reviveCat(this.catId);

				// 更新猫咪状态
				this.catState = revivedCat;
				this.lifeStatus = revivedCat.lifeStatus || "alive";
				this.deathDate = null;

				showToast({
					message: "猫猫复活成功！",
					type: "success",
					duration: 3000,
				});

				return revivedCat;
			} catch (error) {
				showToast({
					message: "复活猫猫失败",
					type: "error",
					duration: 3000,
				});
				throw error;
			}
		},

		// 更新猫咪状态
		updateCatState(newState) {
			this.catState = newState;
		},

		// 与猫咪互动
		async interactWithCat() {
			if (this.lifeStatus === "dead") {
				throw new Error("猫猫已经死亡，无法进行交互");
			}

			if (!this.catId || !this.currentParentType) return;

			try {
				const actionType =
					this.currentParentType === "Food"
						? "FEED"
						: this.currentParentType === "Clean"
						? "CLEAN"
						: this.currentParentType === "Doctor"
						? "DOCTOR"
						: this.currentParentType === "Play"
						? "PLAY"
						: "";

				// 获取当前的type值
				const type = this.currentSubType
					? ([
							"CatFood",
							"Donat",
							"Fish",
							"Meat",
							"Bath",
							"Brush",
							"Soap",
							"Towel",
							"Check",
							"Bandage",
							"Medicine",
							"Vaccine",
							"Feather",
							"Laser",
							"Ball",
							"Puzzle",
					  ].indexOf(this.currentSubType) %
							4) +
					  1
					: 1;

				const updatedCat = await catService.interactWithCat(
					this.catId,
					actionType,
					this.currentSubType,
					type
				);

				this.catState = updatedCat;

				const pointsToAdd = type === 3 || type === 4 ? 2 : 1;
				pointsStore.updatePoints(pointsToAdd);

				return updatedCat;
			} catch (error) {
				showToast({
					message: "与猫猫互动失败",
					type: "error",
					duration: 3000,
				});
				return null;
			}
		},

		async interactWithCatWhenWrong() {
			if (!this.catId || !this.currentParentType) return;

			try {
				const actionType =
					this.currentParentType === "Food"
						? "FEED"
						: this.currentParentType === "Clean"
						? "CLEAN"
						: this.currentParentType === "Doctor"
						? "DOCTOR"
						: this.currentParentType === "Play"
						? "PLAY"
						: "";

				// 获取当前的type值
				const type = this.currentSubType
					? ([
							"CatFood",
							"Donat",
							"Fish",
							"Meat",
							"Bath",
							"Brush",
							"Soap",
							"Towel",
							"Check",
							"Bandage",
							"Medicine",
							"Vaccine",
							"Feather",
							"Laser",
							"Ball",
							"Puzzle",
					  ].indexOf(this.currentSubType) %
							4) +
					  1
					: 1;

				const updatedCat = await catService.interactWithCatWhenWrong(
					this.catId,
					actionType,
					this.currentSubType,
					type
				);

				this.catState = updatedCat;

				return updatedCat;
			} catch (error) {
				showToast({
					message: "与猫猫互动失败",
					type: "error",
					duration: 3000,
				});
				return null;
			}
		},

		// UI状态管理
		setActiveIndex(index) {
			if (this.isAnimating === index && !this.isSubMenu) return;
			this.currentActiveIconIndex = index;
		},

		// 选择子菜单项并获取问题
		async selectSubMenuItem(subTypeIndex) {
			if (!this.isSubMenu || !this.currentParentType) return;

			// 获取子菜单选择的项目
			const subMenuItems = {
				Food: ["CatFood", "Donat", "Fish", "Meat"],
				Clean: ["Bath", "Brush", "Soap", "Towel"],
				Doctor: ["Check", "Bandage", "Medicine", "Vaccine"],
				Play: ["Feather", "Laser", "Ball", "Puzzle"],
			};

			this.currentSubType = subMenuItems[this.currentParentType][subTypeIndex];

			try {
				// 获取随机题目
				const type = subTypeIndex + 1;
				const question = await questionService.getRandomQuestion(type);
				this.setQuestion(question);
				return question;
			} catch (error) {
				showToast({
					message: "获取题目失败",
					type: "error",
					duration: 3000,
				});
				// 如果获取题目失败，重置状态
				this.resetState();
				return null;
			}
		},

		// 提交答案
		async submitAnswer() {
			if (!this.isAnswering || this.selectedAnswer === -1) {
				if (this.isAnswering) {
					showToast({
						message: "请先选择一个答案",
						type: "warning",
						duration: 2000,
					});
				}
				return { success: false, message: "未选择答案" };
			}

			// 检查答案是否正确
			if (this.currentQuestion.options[this.selectedAnswer].isCorrect) {
				try {
					const updatedCat = await this.interactWithCat();
					return {
						success: true,
						isCorrect: true,
						catState: updatedCat,
						parentType: this.currentParentType,
					};
				} catch (error) {
					showToast({
						message: "互动失败",
						type: "error",
						duration: 3000,
					});
					return { success: false, message: "互动失败" };
				}
			} else {
				showToast({
					message: "回答错误，请重试！",
					type: "error",
					duration: 2000,
				});
				try {
					const updatedCat = await this.interactWithCatWhenWrong();
					// 答题错误，重置答题状态但保持子菜单状态
					this.selectedAnswer = -1;
					this.showExplanation = true;
					return {
						success: true,
						isCorrect: false,
						catState: updatedCat,
						parentType: this.currentParentType,
					};
				} catch (error) {
					// 即使互动失败也继续处理
					this.selectedAnswer = -1;
					this.showExplanation = true;
					return { success: true, isCorrect: false };
				}
			}
		},

		enterSubMenu(parentType) {
			this.isSubMenu = true;
			this.currentParentType = parentType;
			this.currentActiveIconIndex = -1;
		},

		resetState() {
			this.isSubMenu = false;
			this.isAnswering = false;
			this.currentParentType = "";
			this.currentSubType = "";
			this.currentActiveIconIndex = -1;
			this.currentQuestion = null;
			this.selectedAnswer = -1;
			this.showExplanation = false;
		},

		setAnimationState(isAnimating, index) {
			this.isAnimating = isAnimating ? index : -1;
		},

		// 答题相关
		setQuestion(question) {
			this.currentQuestion = question;
			this.isAnswering = true;
			this.selectedAnswer = -1;
		},

		selectAnswer(index) {
			this.selectedAnswer = index;
		},

		// 在 actions 中添加重置方法
		resetStore() {
			this.catId = null;
			this.catState = {
				shortTermStates: {
					food: 50,
					happiness: 50,
					cleanliness: 50,
					energy: 50,
					health: 50,
				},
				currentHealthPoints: 100,
				maxHealthPoints: 100,
				currentHealthiness: 100,
				aiContext: {
					lastSaid: "喵～",
					moodKeywords: [],
				},
			};
			this.currentActiveIconIndex = -1;
			this.isSubMenu = false;
			this.isAnswering = false;
			this.currentParentType = "";
			this.currentSubType = "";
			this.currentQuestion = null;
			this.selectedAnswer = -1;
			this.isAnimating = -1;
			this.showExplanation = false;
			this.quirks = [];
			this.lifeStatus = "alive";
			this.activationDate = null;
			this.deathDate = null;
			this.hasCat = false;
			this.showCreateCatDialog = false;
		},
	},
});
