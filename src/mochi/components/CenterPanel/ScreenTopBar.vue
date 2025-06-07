<template>
	<div class="screen-top-bar px-5 pt-2">
		<div class="flex-1">
			<div class="flex items-center">
				<img
					src="../../assets/icons/coin.png"
					alt="Points"
					class="mr-1 w-[25px] h-[25px]"
					style="image-rendering: pixelated"
				/>
				<span class="text-base text-[#4b6130] font-numbers">{{
					pointsStore.points
				}}</span>
			</div>
		</div>

		<!-- Health bar section -->
		<div class="flex-1 ml-2">
			<div class="flex items-center">
				<img
					src="../../assets/icons/hart.png"
					alt="Health"
					class="mr-2 w-[21px] h-[21px]"
					style="image-rendering: pixelated"
				/>
				<div class="w-full flex-1 mb-1">
					<div
						class="relative h-[10px]"
						style="background-color: rgb(235, 255, 183)"
					>
						<div
							class="absolute top-0 h-full"
							style="width: 2px; left: -2px; background-color: rgb(97, 101, 74)"
						></div>
						<div
							class="absolute top-0 h-full"
							style="
								width: 2px;
								right: -2px;
								background-color: rgb(97, 101, 74);
							"
						></div>
						<div
							class="absolute left-0 w-full"
							style="height: 2px; top: -2px; background-color: rgb(97, 101, 74)"
						></div>
						<div
							class="absolute left-0 w-full"
							style="
								height: 2px;
								bottom: -2px;
								background-color: rgb(97, 101, 74);
							"
						></div>
						<div
							class="h-full relative w-full flex flex-col items-center justify-center"
						>
							<div class="w-full h-full bg-gray-200/20 flex">
								<div
									class="h-full bg-[rgb(151,174,98)]/70 relative"
									:style="{
										width: `${
											(catStore.catState?.currentHealthiness /
												catStore.catState?.maxHealthPoints) *
											100
										}%`,
									}"
								>
									<!-- 健康条分格 -->
									<div class="absolute inset-0 flex">
										<div
											v-for="i in healthBarSegments"
											:key="i"
											class="flex-1 border-r border-[#ebffb7]/50"
										></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useCatStore } from "../../store/catStore";
import { usePointsStore } from "@/store/index";

const catStore = useCatStore();
const pointsStore = usePointsStore();
onMounted(async () => {
	const points = await pointsStore.fetchPoints();
	pointsStore.setPoints(points);
});

// 计算健康条格子数量
const healthBarSegments = computed(() => {
	const currentHealth = catStore.catState?.currentHealthiness || 0;
	const maxHealth = catStore.catState?.maxHealthPoints || 100;

	// 根据健康值百分比计算格子数，最少1个，最多10个
	const healthPercentage = currentHealth / maxHealth;
	return Math.max(1, Math.ceil(healthPercentage * 10));
});
</script>

<style scoped>
.screen-top-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 0.9em;
	color: #1b5e20;
}

/* 夜猫子模式下的顶部栏 */
/* .night-owl-bar {
	color: #b8c7e0;
}

.night-owl-bar {
	color: #a0c78a !important;
}

.night-owl-bar [class*="text-[#4b6130]"] {
	color: #a0c78a !important;
} */

/* 夜猫子模式下的健康条 */
/* .night-owl-bar [style*="background-color: rgb(235, 255, 183)"] {
	background-color: rgba(26, 52, 34, 0.8) !important;
}

.night-owl-bar [style*="background-color: rgb(97, 101, 74)"] {
	background-color: rgba(60, 89, 66, 0.5) !important;
}

.night-owl-bar [style*="background-color: rgb(151, 174, 98)"] {
	background-color: rgba(60, 89, 66, 0.7) !important;
} */
</style>
