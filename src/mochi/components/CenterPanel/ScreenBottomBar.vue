<template>
	<div
		class="screen-bottom-icons"
		:class="{ 'night-owl-bar': hasNightOwlQuirk }"
	>
		<template v-if="!catStore.isSubMenu">
			<div class="transform">
				<div class="flex flex-col items-center relative group">
					<div
						class="w-12 h-12 relative flex items-center justify-center rounded-sm transition-all duration-200"
						:class="[
							catStore.currentActiveIconIndex === 0
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							catStore.isAnimating === 0 && !catStore.isSubMenu
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer',
						]"
					>
						<!-- 添加加载进度条 -->
						<transition name="fade-progress">
							<div
								v-if="catStore.isAnimating === 0 && !catStore.isSubMenu"
								class="loading-progress-bar"
							></div>
						</transition>
						<div class="z-10">
							<img
								alt="Food"
								loading="lazy"
								width="28"
								height="28"
								decoding="async"
								data-nimg="1"
								src="../../assets/icons/foods.png"
								style="color: transparent; image-rendering: pixelated"
							/>
						</div>
						<div
							class="absolute bottom-full mb-1 w-max max-w-xs px-2 py-1 bg-[#304700] text-[#ebffb7] text-xs rounded shadow-lg z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
							style="
								transform: translateY(10px) scale(0.9);
								transform: translateY(0) scale(1);
							"
						>
							<span class="font-bold">Food</span>
						</div>
					</div>
				</div>
			</div>
			<div class="transform">
				<div class="flex flex-col items-center relative group">
					<div
						class="w-12 h-12 relative flex items-center justify-center rounded-sm transition-all duration-200"
						:class="[
							catStore.currentActiveIconIndex === 1
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							catStore.isAnimating === 1 && !catStore.isSubMenu
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer',
						]"
					>
						<div
							v-if="catStore.isAnimating === 1 && !catStore.isSubMenu"
							class="loading-progress-bar"
						></div>
						<div class="z-10">
							<img
								alt="Clean"
								loading="lazy"
								width="28"
								height="28"
								decoding="async"
								data-nimg="1"
								src="../../assets/icons/hygienes.png"
								style="color: transparent; image-rendering: pixelated"
							/>
						</div>
						<div
							class="absolute bottom-full mb-1 w-max max-w-xs px-2 py-1 bg-[#304700] text-[#ebffb7] text-xs rounded shadow-lg z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
							style="
								transform: translateY(10px) scale(0.9);
								transform: translateY(0) scale(1);
							"
						>
							<span class="font-bold">Clean</span>
						</div>
					</div>
				</div>
			</div>
			<div class="transform">
				<div class="flex flex-col items-center relative group">
					<div
						class="w-12 h-12 relative flex items-center justify-center rounded-sm transition-all duration-200"
						:class="[
							catStore.currentActiveIconIndex === 2
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							catStore.isAnimating === 2 && !catStore.isSubMenu
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer',
						]"
					>
						<div
							v-if="catStore.isAnimating === 2 && !catStore.isSubMenu"
							class="loading-progress-bar"
						></div>
						<div class="z-10">
							<img
								alt="Doctor"
								loading="lazy"
								width="28"
								height="28"
								decoding="async"
								data-nimg="1"
								src="../../assets/icons/healing.png"
								style="color: transparent; image-rendering: pixelated"
							/>
						</div>
						<div
							class="absolute bottom-full mb-1 w-max max-w-xs px-2 py-1 bg-[#304700] text-[#ebffb7] text-xs rounded shadow-lg z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
							style="
								transform: translateY(10px) scale(0.9);
								transform: translateY(0) scale(1);
							"
						>
							<span class="font-bold">Doctor</span>
						</div>
					</div>
				</div>
			</div>
			<div class="transform">
				<div class="flex flex-col items-center relative group">
					<div
						class="w-12 h-12 relative flex items-center justify-center rounded-sm transition-all duration-200"
						:class="[
							catStore.currentActiveIconIndex === 3
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							catStore.isAnimating === 3 && !catStore.isSubMenu
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer',
						]"
					>
						<div
							v-if="catStore.isAnimating === 3 && !catStore.isSubMenu"
							class="loading-progress-bar"
						></div>
						<div class="z-10">
							<img
								alt="Play"
								loading="lazy"
								width="28"
								height="28"
								decoding="async"
								data-nimg="1"
								src="../../assets/icons/games.png"
								style="color: transparent; image-rendering: pixelated"
							/>
						</div>
						<div
							class="absolute bottom-full mb-1 w-max max-w-xs px-2 py-1 bg-[#304700] text-[#ebffb7] text-xs rounded shadow-lg z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
							style="
								transform: translateY(10px) scale(0.9);
								transform: translateY(0) scale(1);
							"
						>
							<span class="font-bold">Play</span>
						</div>
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			<div
				v-for="(item, index) in getSubMenuItems"
				:key="index"
				class="transform"
			>
				<div class="flex flex-col items-center relative group">
					<div
						class="w-12 h-12 relative flex items-center justify-center rounded-sm transition-all duration-200"
						:class="[
							catStore.currentActiveIconIndex === index
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							'cursor-pointer',
						]"
					>
						<div class="z-10">
							<img
								:alt="item.name"
								loading="lazy"
								width="28"
								height="28"
								decoding="async"
								data-nimg="1"
								:src="item.icon"
								style="color: transparent; image-rendering: pixelated"
							/>
						</div>
						<div
							class="absolute bottom-full mb-1 w-max max-w-xs px-2 py-1 bg-[#304700] text-[#ebffb7] text-xs rounded shadow-lg z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
							style="
								transform: translateY(10px) scale(0.9);
								transform: translateY(0) scale(1);
							"
						>
							<span class="font-bold">{{ item.name }}</span>
						</div>
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
</script>

<style scoped>
.screen-bottom-icons {
	display: flex;
	justify-content: space-around;
	font-size: 1.2rem;
	padding-bottom: 4px;
}

.loading-progress-bar {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(76, 175, 80, 0.3); /* 半透明绿色背景 */
	z-index: 15; /* 确保在图标上方但在提示下方 */
	border-radius: 4px;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
}

.loading-progress-bar::after {
	content: "";
	position: absolute;
	width: 50%;
	height: 50%;
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

/* 夜猫子模式下的底部栏 */
/* .night-owl-bar [class*="bg-[#eeffc9]"] {
	background-color: rgba(120, 160, 130, 0.5) !important;
}

.night-owl-bar [class*="ring-[#cada9b]"] {
	--tw-ring-color: rgba(160, 200, 170, 0.7) !important;
}

.night-owl-bar [class*="bg-[#304700]"] {
	background-color: #2a4a35 !important;
}

.night-owl-bar [class*="text-[#ebffb7]"] {
	color: #d0f0c0 !important;
}

.night-owl-bar .loading-progress-bar {
	background: linear-gradient(
		90deg,
		transparent,
		rgba(120, 160, 130, 0.7),
		transparent
	);
} */
</style>
