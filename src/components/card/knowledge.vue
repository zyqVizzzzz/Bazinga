<template>
	<div
		v-show="showHints && localKnowledgePoints.length > 0"
		class="card-knowledge w-2/5 ml-4 transition-all duration-300 border-l relative"
	>
		<button
			class="absolute left-0 transform -translate-x-1/2 bg-white text-white p-2 rounded-full"
			style="
				top: 50%;
				transform: translateY(-50%) translateX(-50%);
				z-index: 9999;
			"
			@click="onToggleHints"
		>
			<LightIcon />
		</button>
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
				v-for="(point, index) in localKnowledgePoints"
				:key="index"
				class="flex justify-center items-center h-full"
			>
				<div
					class="knowledge-card overflow-hidden card w-4/5 bg-base-100 knowledge-capsule mb-4 h-5/6 mx-auto relative"
				>
					<div class="card-body block py-4 px-6">
						<!-- 单词及音标 -->
						<h3 class="card-title text-secondary text-lg mb-1">
							{{ point.word }}
						</h3>
						<!-- 词性 -->
						<p
							v-if="point.pos"
							class="text-left text-sm text-gray-500 font-light mb-2"
						>
							{{ point.word_zh }}
							<span class="text-sm text-gray-500 ml-2">{{ point.pos }}</span>

							<span v-if="point.symbols" class="text-sm text-gray-500 ml-4"
								>[{{ point.symbols }}]</span
							>
						</p>
						<!-- Rank (根据 rank 动态显示星级) -->
						<div class="flex items-center relative -left-1 mb-4">
							<span class="badge badge-secondary"
								><span class="relative -top-0.5 text-white">{{
									point.type
								}}</span>
							</span>
							<!-- <div class="ml-2 flex">
								<template v-for="n in 5">
									<StarIcon
										:class="
											n <= point.rank ? 'text-yellow-500' : 'text-pink-300'
										"
									/>
								</template>
							</div> -->
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
						:class="{ clicked: point.marked }"
						@click="toggleBookmark(point)"
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
import { onMounted, ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Pagination } from "swiper/modules";
import BookmarkIcon from "../icons/Bookmark.vue";
import LightIcon from "../icons/Light.vue";
import apiClient from "@/api";

const mySwiper = ref(null); // Swiper 实例
const pagination = {
	el: ".swiper-pagination", // 分页点的容器
	clickable: true, // 允许点击切换
};

const props = defineProps({
	currentKnowledgePoints: Object,
	showHints: Boolean,
	currentCustomNotes: Array,
	resourceId: String,
	currentDialogueIndex: Number,
});
const emit = defineEmits(["on-slide-change", "on-toggle-hints", "update-note"]);

const currentKnowledgeIndex = ref(0); // 当前知识点卡片索引
const localKnowledgePoints = ref([]); // 创建局部的响应式数组

// 滑动事件处理，更新当前知识点卡片索引
const onSlideChange = (swiper) => {
	currentKnowledgeIndex.value = swiper.activeIndex;
	emit("on-slide-change", currentKnowledgeIndex.value);
};

// 是否收藏状态
const isBookmarked = ref(false);
const toggleBookmark = async (point) => {
	point.scene = props.currentDialogueIndex + 1; // 当前场景
	try {
		if (point.marked) {
			// 移除笔记
			const response = await apiClient.post("/lesson-notes/remove", {
				resourceId: props.resourceId,
				word: point.word,
			});
			if (response.status === 201) {
				point.marked = false;
				emit("update-note", {
					word: point.word,
					action: "remove",
					scene: point.scene,
				});
			}
		} else {
			// 添加笔记
			const response = await apiClient.put(
				`/lesson-notes/${props.resourceId}`,
				point
			);
			if (response.status === 200) {
				point.marked = true;
				emit("update-note", { note: point, action: "add", scene: point.scene }); // 通知父组件更新笔记（添加）
			}
		}
	} catch (error) {
		console.error("Error updating bookmark:", error);
	}
};

const onToggleHints = () => {
	emit("on-toggle-hints");
};

// 比对两个数组的 word 属性
const compareCustomNotesWithKnowledgePoints = () => {
	localKnowledgePoints.value.forEach((point) => {
		// 检查 currentCustomNotes 数组中是否存在相同的 word
		const matchedNote = props.currentCustomNotes.find(
			(note) => note.word === point.word
		);
		if (matchedNote) {
			point.marked = true;
		} else {
			point.marked = false;
		}
	});
	console.log(props.currentCustomNotes, localKnowledgePoints.value);
};

onMounted(() => {
	localKnowledgePoints.value = JSON.parse(
		JSON.stringify(props.currentKnowledgePoints)
	);

	compareCustomNotesWithKnowledgePoints();
});
</script>
<style scoped>
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

.clicked {
	opacity: 1;
	transform: translateY(3px) !important;
}

.knowledge-capsule {
	box-shadow: 0 6px 15px rgba(255, 0, 255, 0.1); /* 红色阴影 */
}
</style>
