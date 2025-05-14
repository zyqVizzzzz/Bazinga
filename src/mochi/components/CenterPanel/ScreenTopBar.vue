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
				<span class="text-base text-[#4b6130] font-numbers">157</span>
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
									class="h-full bg-[#304700]"
									:style="{
										width: `${
											(props.catState?.currentHealthPoints /
												props.catState?.maxHealthPoints) *
											100
										}%`,
									}"
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
// 接收猫猫状态作为props
const props = defineProps({
	catState: {
		type: Object,
		default: () => ({
			shortTermStates: {
				food: 50,
				happiness: 50,
				cleanliness: 50,
				energy: 50,
				health: 50,
			},
			currentHealthPoints: 100,
			maxHealthPoints: 100,
		}),
	},
});
</script>

<style scoped>
.screen-top-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 0.9em; /* Tailwind: text-sm */
	color: #1b5e20;
}
</style>
