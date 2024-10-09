<template>
	<div
		v-show="showHints && currentKnowledgePoints.length > 0"
		class="card-knowledge w-2/5 ml-4 transition-all duration-300 border-l relative"
	>
		<!-- Swiper 轮播 -->
		<Swiper
			ref="mySwiper"
			:modules="[Pagination]"
			:loop="false"
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
					<div class="card-body block py-4 px-6">
						<!-- 单词及音标 -->
						<h3 class="card-title text-secondary text-lg">
							{{ point.word }}
						</h3>
						<!-- 词性 -->
						<p
							v-if="point.pos"
							class="text-left text-sm text-gray-500 font-light mb-1"
						>
							{{ point.pos }}
							<span v-if="point.symbols" class="text-sm text-gray-500 ml-2"
								>[{{ point.symbols }}]</span
							>
						</p>
						<!-- 定义 -->
						<p class="text-left text-sm mb-3">
							{{ point.word_zh }}
						</p>
						<!-- Rank (根据 rank 动态显示星级) -->
						<div class="flex items-center relative -left-1 mb-4">
							<span class="badge badge-secondary"
								><span class="relative -top-0.5">{{ point.type }}</span>
								<div class="ml-2 flex">
									<template v-for="n in 5">
										<StarIcon
											:class="
												n <= point.rank ? 'text-yellow-400' : 'text-pink-300'
											"
										/>
									</template>
								</div>
							</span>
						</div>
						<div class="border border-base-200 border-b"></div>
						<!-- 例句 -->
						<p
							v-if="point.example"
							class="text-left text-sm font-extralight mt-2"
						>
							<strong></strong> {{ point.example }}
						</p>
						<p
							v-if="point.example_zh"
							class="china-font text-left text-xs mt-2"
						>
							<strong></strong> {{ point.example_zh }}
						</p>
					</div>

					<!-- 收藏功能 -->

					<div
						class="knowledge-card-star absolute -top-6 right-0 m-4 text-center opacity-0 duration-300 cursor-pointer"
						:class="{ 'opacity-100': isHovered }"
						@click="toggleBookmark"
					>
						<BookmarkIcon :solid="isBookmarked" />
					</div>
				</div>
			</SwiperSlide>
		</Swiper>
		<div class="swiper-pagination"></div>
	</div>
</template>
<script setup>
import { ref, defineEmits } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Pagination } from "swiper/modules";
import StarIcon from "../icons/Star.vue";
import BookmarkIcon from "../icons/Bookmark.vue";

const mySwiper = ref(null); // Swiper 实例
const pagination = {
	el: ".swiper-pagination", // 分页点的容器
	clickable: true, // 允许点击切换
};

defineProps({
	currentKnowledgePoints: Object,
	showTrans: Boolean,
	showHints: Boolean,
});

// 当前知识点卡片索引
const currentKnowledgeIndex = ref(0);
const emit = defineEmits(["on-slide-change"]);
// Swiper 滑动事件处理，更新当前知识点卡片索引
const onSlideChange = (swiper) => {
	currentKnowledgeIndex.value = swiper.activeIndex;
	emit("on-slide-change", currentKnowledgeIndex.value); // 可以传递数据作为参数
};

// 鼠标悬停状态
const isHovered = ref(false);
// 是否收藏状态
const isBookmarked = ref(false);

// 切换书签状态
const toggleBookmark = () => {
	isBookmarked.value = !isBookmarked.value;
};

// 添加到笔记本
const addNote = (point) => {
	console.log("Added to notebook:", point);
};
</script>
<style scoped>
/* 星号图标 */
/* .knowledge-card-star {
	width: 100%;
	height: 40px;
	background: rgba(0, 0, 0, 0.1);
	cursor: pointer;
	transition: opacity 0.3s ease-in-out;
	color: #f6d860;
	display: flex;
	align-items: center;
	justify-content: center;
} */

/* 鼠标悬停显示星号 */
.knowledge-card-star {
	position: absolute;
	top: -24px;
	right: 0;
	margin: 16px;
	opacity: 0;
	transform: translateY(-20px);
	transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.knowledge-card:hover .knowledge-card-star {
	opacity: 1;
	transform: translateY(0);
}

.bookmark-animated {
	animation: bookmarkDrop 0.5s ease forwards;
}

/* 书签的下拉动画 */
@keyframes bookmarkDrop {
	0% {
		transform: translateY(-20px);
	}
	100% {
		transform: translateY(10px);
	}
}
</style>
