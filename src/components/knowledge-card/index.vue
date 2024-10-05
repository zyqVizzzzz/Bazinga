<template>
	<!-- Swiper 轮播 -->
	<Swiper
		ref="mySwiper"
		:modules="[Pagination]"
		:loop="currentKnowledgePoints.length > 1 ? true : false"
		:slides-per-view="1"
		space-between="30"
		:pagination="pagination"
		@slideChange="onSlideChange"
		class="h-full"
	>
		<SwiperSlide
			v-for="(point, index) in currentKnowledgePoints"
			:key="index"
			class="flex justify-center items-center h-full"
		>
			<div
				class="knowledge-card overflow-hidden card w-4/5 bg-base-100 shadow-lg mb-4 h-5/6 mx-auto relative"
			>
				<div class="card-body">
					<h3 class="card-title text-secondary">
						{{ point.name }}
					</h3>
					<p v-if="!showTrans" class="text-left text-base font-extralight">
						{{ point.desc }}
					</p>
					<p
						v-if="showTrans"
						class="china-font text-left text-sm font-extralight"
					>
						{{ point.desc_zh }}
					</p>
				</div>
				<div
					class="knowledge-card-star text-center opacity-0 duration-300 cursor-pointer"
					@click="addNote(point)"
				>
					<StarIcon />
				</div>
			</div>
		</SwiperSlide>
	</Swiper>
	<div class="swiper-pagination"></div>
</template>
<script setup>
import { ref, defineEmits } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Pagination } from "swiper/modules";
import StarIcon from "../icons/Star.vue";

const mySwiper = ref(null); // Swiper 实例
const pagination = {
	el: ".swiper-pagination", // 分页点的容器
	clickable: true, // 允许点击切换
};

defineProps({
	currentKnowledgePoints: Object,
	showTrans: Boolean,
});

// 当前知识点卡片索引
const currentKnowledgeIndex = ref(0);
const emit = defineEmits(["on-slide-change"]);
// Swiper 滑动事件处理，更新当前知识点卡片索引
const onSlideChange = (swiper) => {
	currentKnowledgeIndex.value = swiper.activeIndex;
	emit("on-slide-change", currentKnowledgeIndex.value); // 可以传递数据作为参数
};

// 添加到笔记本
const addNote = (point) => {
	// 将知识点添加到用户的笔记本中
	console.log("Added to notebook:", point);
};
</script>
<style scoped>
/* 星号图标 */
.knowledge-card-star {
	width: 100%;
	height: 40px;
	background: rgba(0, 0, 0, 0.1);
	cursor: pointer;
	transition: opacity 0.3s ease-in-out;
	color: #f6d860;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 鼠标悬停显示星号 */
.knowledge-card:hover .knowledge-card-star {
	opacity: 1;
}
</style>
