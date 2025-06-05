<template>
	<div class="screen-bottom-icons">
		<template v-if="!catStore.isSubMenu">
			<div class="icon-wrapper" @click="handleIconClick(0)">
				<div class="icon-container" :class="getIconClasses(0)">
					<!-- 加载进度条 -->
					<transition name="fade-progress">
						<div
							v-if="catStore.isAnimating === 0 && !catStore.isSubMenu"
							class="loading-progress-bar"
						></div>
					</transition>
					<div class="icon-image">
						<img
							alt="Food"
							loading="lazy"
							width="18"
							height="18"
							decoding="async"
							data-nimg="1"
							src="../../assets/icons/foods.png"
							style="color: transparent; image-rendering: pixelated"
						/>
					</div>
				</div>
			</div>
			<div class="icon-wrapper" @click="handleIconClick(1)">
				<div class="icon-container" :class="getIconClasses(1)">
					<transition name="fade-progress">
						<div
							v-if="catStore.isAnimating === 1 && !catStore.isSubMenu"
							class="loading-progress-bar"
						></div>
					</transition>
					<div class="icon-image">
						<img
							alt="Clean"
							loading="lazy"
							width="18"
							height="18"
							decoding="async"
							data-nimg="1"
							src="../../assets/icons/hygienes.png"
							style="color: transparent; image-rendering: pixelated"
						/>
					</div>
				</div>
			</div>
			<div class="icon-wrapper" @click="handleIconClick(2)">
				<div class="icon-container" :class="getIconClasses(2)">
					<transition name="fade-progress">
						<div
							v-if="catStore.isAnimating === 2 && !catStore.isSubMenu"
							class="loading-progress-bar"
						></div>
					</transition>
					<div class="icon-image">
						<img
							alt="Doctor"
							loading="lazy"
							width="18"
							height="18"
							decoding="async"
							data-nimg="1"
							src="../../assets/icons/healing.png"
							style="color: transparent; image-rendering: pixelated"
						/>
					</div>
				</div>
			</div>
			<div class="icon-wrapper" @click="handleIconClick(3)">
				<div class="icon-container" :class="getIconClasses(3)">
					<transition name="fade-progress">
						<div
							v-if="catStore.isAnimating === 3 && !catStore.isSubMenu"
							class="loading-progress-bar"
						></div>
					</transition>
					<div class="icon-image">
						<img
							alt="Play"
							loading="lazy"
							width="18"
							height="18"
							decoding="async"
							data-nimg="1"
							src="../../assets/icons/games.png"
							style="color: transparent; image-rendering: pixelated"
						/>
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			<div
				v-for="(item, index) in getSubMenuItems"
				:key="index"
				class="icon-wrapper"
				@click="handleSubMenuClick(index)"
			>
				<div class="icon-container" :class="getSubMenuIconClasses(index)">
					<div class="icon-image">
						<img
							:alt="item.name"
							loading="lazy"
							width="18"
							height="18"
							decoding="async"
							data-nimg="1"
							:src="item.icon"
							style="color: transparent; image-rendering: pixelated"
						/>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup>
import { computed } from "vue";
import { useCatStore } from "../../store/catStore";
import foodCatFood from "@/mochi/assets/icons/food-catfood.png";
import foodCatnip from "@/mochi/assets/icons/food-catnip.png";
import foodDonat from "@/mochi/assets/icons/food-donat.png";
import foodFish from "@/mochi/assets/icons/food-fish.png";
import hygieneComb from "@/mochi/assets/icons/hygiene-comb.png";
import hygieneNaliclipper from "@/mochi/assets/icons/hygiene-nailclipper.png";
import hygieneTooth from "@/mochi/assets/icons/hygiene-tooth.png";
import hygiene from "@/mochi/assets/icons/hygienes.png";
import healingMedicine from "@/mochi/assets/icons/healing-medicine.png";
import healingSurgery from "@/mochi/assets/icons/healing-surgery.png";
import healingVaccine from "@/mochi/assets/icons/healing-vaccine.png";
import healing from "@/mochi/assets/icons/healing.png";
import gameLaser from "@/mochi/assets/icons/game-laser.png";
import gameFeather from "@/mochi/assets/icons/game-feather.png";
import gameBall from "@/mochi/assets/icons/game-ball.png";
import gamePuzzle from "@/mochi/assets/icons/game-puzzle.png";

const catStore = useCatStore();

const subMenuItems = {
	Food: [
		{ name: "CatFood", icon: foodCatFood },
		{ name: "Donat", icon: foodDonat },
		{ name: "Fish", icon: foodFish },
		{ name: "Meat", icon: foodCatnip },
	],
	Clean: [
		{ name: "Bath", icon: hygieneComb },
		{ name: "Brush", icon: hygieneNaliclipper },
		{ name: "Soap", icon: hygieneTooth },
		{ name: "Towel", icon: hygiene },
	],
	Doctor: [
		{ name: "Check", icon: healing },
		{ name: "Bandage", icon: healingSurgery },
		{ name: "Medicine", icon: healingMedicine },
		{ name: "Vaccine", icon: healingVaccine },
	],
	Play: [
		{ name: "Feather", icon: gameFeather },
		{ name: "Laser", icon: gameLaser },
		{ name: "Ball", icon: gameBall },
		{ name: "Puzzle", icon: gamePuzzle },
	],
};

const getSubMenuItems = computed(() => {
	return subMenuItems[catStore.currentParentType] || [];
});

// 检查是否有夜猫子怪癖
const hasNightOwlQuirk = computed(() => catStore.hasNightOwlQuirk);

// 获取主菜单图标样式类
const getIconClasses = (index) => {
	return [
		catStore.currentActiveIconIndex === index ? "active" : "",
		catStore.isAnimating === index && !catStore.isSubMenu ? "disabled" : "",
	];
};

// 获取子菜单图标样式类
const getSubMenuIconClasses = (index) => {
	return [catStore.currentActiveIconIndex === index ? "active" : ""];
};

// 处理主菜单图标点击
const handleIconClick = (index) => {
	if (catStore.isAnimating === index && !catStore.isSubMenu) {
		return; // 如果正在动画中，禁止点击
	}
	// 这里可以添加具体的点击处理逻辑
	catStore.setActiveIcon(index);
};

// 处理子菜单图标点击
const handleSubMenuClick = (index) => {
	// 这里可以添加具体的子菜单点击处理逻辑
	catStore.setActiveIcon(index);
};
</script>

<style scoped>
.screen-bottom-icons {
	display: flex;
	justify-content: space-around;
	align-items: flex-end;
	padding: 6px 16px 6px;
	gap: 8px;
	min-height: 32px;
}

.icon-wrapper {
	flex: 1;
	display: flex;
	justify-content: center;
	max-width: 36px;
}

.icon-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	padding: 6px;
	border-radius: 6px;
	cursor: pointer;
	min-height: 56px;
	min-width: 48px;
}

.icon-container.active {
	background-color: #eeffc9;
	border: 2px solid #cada9b;
}

.icon-container.disabled {
	opacity: 0.5;
	cursor: not-allowed;
	pointer-events: none;
}

.icon-image {
	position: relative;
	z-index: 10;
	margin-bottom: 3px;
}

.icon-label {
	font-size: 9px;
	font-weight: 600;
	color: #2d3748;
	text-align: center;
	line-height: 1.2;
	max-width: 44px;
	word-wrap: break-word;
}

.loading-progress-bar {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(76, 175, 80, 0.3);
	z-index: 15;
	border-radius: 6px;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
}

.loading-progress-bar::after {
	content: "";
	position: absolute;
	width: 20px;
	height: 20px;
	background: conic-gradient(#8bc68d 0%, transparent 0);
	border-radius: 50%;
	animation: progress-animation 8s linear forwards;
}

@keyframes progress-animation {
	0% {
		background: conic-gradient(#8bc68d 0%, transparent 0%);
	}
	12.5% {
		background: conic-gradient(#8bc68d 12.5%, transparent 12.5%);
	}
	25% {
		background: conic-gradient(#8bc68d 25%, transparent 25%);
	}
	37.5% {
		background: conic-gradient(#8bc68d 37.5%, transparent 37.5%);
	}
	50% {
		background: conic-gradient(#8bc68d 50%, transparent 50%);
	}
	62.5% {
		background: conic-gradient(#8bc68d 62.5%, transparent 62.5%);
	}
	75% {
		background: conic-gradient(#8bc68d 75%, transparent 75%);
	}
	87.5% {
		background: conic-gradient(#8bc68d 87.5%, transparent 87.5%);
	}
	100% {
		background: conic-gradient(#8bc68d 100%, transparent 100%);
	}
}

.fade-progress-enter-active,
.fade-progress-leave-active {
	transition: opacity 0.3s ease;
}

.fade-progress-enter-from,
.fade-progress-leave-to {
	opacity: 0;
}

/* 夜猫子模式 */
.night-owl-bar .icon-container.active {
	background-color: rgba(120, 160, 130, 0.5);
	border-color: rgba(160, 200, 170, 0.7);
}

.night-owl-bar .icon-label {
	color: #d0f0c0;
}

.night-owl-bar .loading-progress-bar {
	background: linear-gradient(
		90deg,
		transparent,
		rgba(120, 160, 130, 0.7),
		transparent
	);
}

/* 响应式设计 */
@media (max-width: 480px) {
	.screen-bottom-icons {
		padding: 4px 12px 4px;
		gap: 4px;
		min-height: 32px;
	}

	.icon-container {
		padding: 4px;
		min-height: 32px;
		min-width: 32px;
	}

	.loading-progress-bar::after {
		width: 16px;
		height: 16px;
	}
}
</style>
