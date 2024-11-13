<template>
	<div
		v-show="showHints && localKnowledgePoints.length > 0"
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
				v-for="(point, index) in localKnowledgePoints"
				:key="index"
				class="flex justify-center items-center h-full"
			>
				<div class="knowledge-card overflow-hidden w-full h-full relative">
					<div class="card-body block py-8 px-6">
						<!-- 单词及音标 -->
						<h3
							class="card-title text-secondary text-lg mb-1 text-left"
							style="line-height: 1.3rem"
						>
							{{ point.word }}
						</h3>
						<!-- 词性 -->
						<p class="text-left text-sm text-gray-500 font-light mb-2">
							<span v-if="point.type === 'vocabulary'">{{
								point.word_zh
							}}</span>
							<span class="text-sm text-gray-500 ml-2" v-if="point.pos">{{
								point.pos
							}}</span>

							<span v-if="point.symbols" class="text-sm text-gray-500 ml-4"
								>[{{ point.symbols }}]</span
							>
						</p>
						<p
							v-if="point.type !== 'vocabulary'"
							class="text-left text-sm text-gray-500 font-light mb-2"
						>
							{{ point.definition_zh }}
						</p>
						<!-- Rank (根据 rank 动态显示星级) -->
						<div class="flex items-center relative -left-1 mb-4 text-xs">
							<span class="badge badge-secondary" v-if="point.type"
								><span class="relative -top-0.5 text-white">{{
									point.type
								}}</span>
							</span>
							<span class="badge badge-secondary ml-2" v-if="point.book"
								><span class="relative -top-0.5 text-white">{{
									point.book
								}}</span>
							</span>
						</div>

						<div class="border-gray-300 border-b"></div>
						<div
							class="py-2 border-gray-300 border-b"
							v-if="
								point.type !== 'vocabulary' &&
								(point.system?.rootAnalysis?.root ||
									point.system?.affixAnalysis?.suffix ||
									point.system?.affixAnalysis?.prefix)
							"
						>
							<div>
								<!-- 词根 -->
								<div
									v-if="point.system?.rootAnalysis?.root"
									class="text-gray-600 mb-1 text-left"
								>
									<p class="font-bold">
										<span class="text-xs">[词根] </span>
										{{ point.system.rootAnalysis.root ?? "" }}
										<span
											class="font-normal text-xs"
											v-if="point.system.rootAnalysis?.meaning_zh"
										>
											：{{ point.system.rootAnalysis.meaning_zh ?? "" }}
										</span>
									</p>
								</div>

								<!-- 前缀 -->
								<div
									v-if="point.system?.affixAnalysis?.prefix"
									class="text-gray-600 mb-1 text-left"
								>
									<p class="mb-1 font-bold">
										<span class="text-xs">[前缀] </span>
										{{ point.system.affixAnalysis.prefix ?? "" }}-
										<span
											class="font-normal text-xs"
											v-if="point.system.affixAnalysis?.prefixMeaning_zh"
										>
											：{{ point.system.affixAnalysis.prefixMeaning_zh ?? "" }}
										</span>
									</p>
								</div>

								<!-- 后缀 -->
								<div
									v-if="point.system?.affixAnalysis?.suffix"
									class="text-gray-600 text-left"
								>
									<p class="mb-1 font-bold">
										<span class="text-xs">[后缀] </span>
										-{{ point.system.affixAnalysis.suffix ?? "" }}
										<span
											class="font-normal text-xs"
											v-if="point.system.affixAnalysis?.suffixMeaning_zh"
										>
											：{{ point.system.affixAnalysis.suffixMeaning_zh ?? "" }}
										</span>
									</p>
								</div>
							</div>
						</div>

						<!-- 例句 -->
						<p
							v-if="point.example"
							class="text-left text-sm font-extralight mt-2"
						>
							<strong></strong> {{ point.example }}
						</p>
						<p
							v-if="point.example_zh"
							class="china-font text-left text-xs mt-1"
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
						<i
							class="bi bi-bookmark text-xl"
							:class="{ 'text-secondary': point.marked }"
						></i>
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
import LightIcon from "../icons/Light.vue";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

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

			if (response.data.code === 200) {
				point.marked = false;
				emit("update-note", {
					word: point.word,
					action: "remove",
					scene: point.scene,
				});
			} else {
				showToast({
					message: response.data.message,
					type: "error",
					duration: 3000,
				});
			}
		} else {
			// 添加笔记
			const response = await apiClient.put(
				`/lesson-notes/${props.resourceId}`,
				point
			);
			if (response.data.code === 200) {
				point.marked = true;
				emit("update-note", { note: point, action: "add", scene: point.scene });
			} else {
				showToast({
					message: response.data.message,
					type: "error",
					duration: 3000,
				});
			}
		}
	} catch (error) {
		showToast({
			message: error,
			type: "error",
			duration: 3000,
		});
		console.error("Error updating bookmark:", error);
	}
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
	top: -30px;
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
	transform: translateY(6px) !important;
}

.knowledge-capsule {
	box-shadow: 0 6px 15px rgba(255, 0, 255, 0.1); /* 红色阴影 */
}
</style>
