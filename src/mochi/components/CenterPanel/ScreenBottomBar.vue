<template>
	<div class="screen-bottom-icons">
		<template v-if="!props.isSubMenu">
			<div class="transform">
				<div class="flex flex-col items-center relative group">
					<div
						class="w-12 h-12 relative flex items-center justify-center rounded-sm transition-all duration-200"
						:class="[
							props.activeIndex === 0
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							props.isAnimating === 0
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer',
						]"
					>
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
							props.activeIndex === 1
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							props.isAnimating === 1
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer',
						]"
					>
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
							props.activeIndex === 2
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							props.isAnimating === 2
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer',
						]"
					>
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
							props.activeIndex === 3
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							props.isAnimating === 3
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer',
						]"
					>
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
							props.activeIndex === index
								? 'bg-[#eeffc9] ring-2 ring-[#cada9b]'
								: 'bg-transparent',
							props.isAnimating === index
								? 'opacity-50 cursor-not-allowed'
								: 'cursor-pointer',
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
const props = defineProps({
	activeIndex: {
		type: Number,
		default: -1,
	},
	isSubMenu: {
		type: Boolean,
		default: false,
	},
	parentType: {
		type: String,
		default: "",
	},
	// 正在动画的按钮索引
	isAnimating: {
		type: Number,
		default: -1,
	},
});

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
	return subMenuItems[props.parentType] || [];
});
</script>

<style scoped>
.screen-bottom-icons {
	display: flex;
	justify-content: space-around;
	font-size: 1.2rem;
	padding-bottom: 4px;
}
</style>
