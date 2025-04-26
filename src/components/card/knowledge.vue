<template>
	<div
		class="card-knowledge w-2/5 ml-4 transition-all duration-300 border-l relative"
	>
		<!-- Swiper 轮播 -->
		<Swiper
			v-show="showHints && localKnowledgePoints.length > 0"
			ref="mySwiper"
			:modules="[Pagination, Navigation]"
			:loop="false"
			:slides-per-view="1"
			space-between="30"
			:pagination="pagination"
			:navigation="navigation"
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
						<!-- 知识点 -->
						<h3
							class="card-title text-secondary text-lg mb-1 text-left"
							style="line-height: 1.3rem"
						>
							{{ point.word }}
						</h3>
						<!-- 中文释义 -->
						<p class="text-left text-sm text-gray-500 font-light mb-4">
							<span>{{ point.word_zh }}</span>
						</p>
						<div class="border-gray-300 border-b"></div>

						<p class="text-left text-sm text-gray-500 font-light mt-4 mb-4">
							{{ point.definition_zh }}
						</p>
						<!-- <p
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
						</p> -->

						<!-- 详细释义 -->
						<div class="flex items-center mt-4">
							<button
								class="btn btn-sm btn-outline btn-secondary gap-2 hover:scale-105 transition-all duration-200 hover:text-white"
								@click="showFullDefinition(point)"
							>
								<i class="bi bi-book text-xs"></i>
								<span class="text-xs">完整释义</span>
							</button>
						</div>
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
		<div
			class="custom-pagination-container"
			v-show="localKnowledgePoints.length > 0 && showHints"
		>
			<div class="swiper-button-prev custom-nav-btn"></div>
			<div class="swiper-pagination"></div>
			<div class="swiper-button-next custom-nav-btn"></div>
		</div>

		<div
			v-show="!localKnowledgePoints.length"
			class="h-full min-h-[200px] p-6 bg-gray-50/50 rounded-l flex justify-center items-center"
		>
			<!-- 需要解锁的情况 -->
			<div v-if="needUnlock" class="text-center">
				<i class="bi bi-lock text-2xl text-gray-500 mb-3"></i>
				<h3 class="text-gray-800 font-medium text-base mb-4">解锁知识点内容</h3>
				<p class="text-gray-600 text-sm mb-4 max-w-xs">
					本场景的知识点内容需要解锁资源包才能查看。解锁后可获得：
				</p>
				<ul class="text-gray-600 text-sm text-left list-disc list-inside mb-4">
					<li>全部剧集的场景知识点解析</li>
					<li>Bazinga 播客强化解读</li>
				</ul>
				<button
					class="btn btn-sm btn-secondary text-white gap-2 hover:scale-105 transition-all duration-200 mt-2"
					@click="handleUnlock"
				>
					<i class="bi bi-unlock text-xs"></i>
					<span>解锁资源包 ¥19.9</span>
				</button>
			</div>

			<!-- 真的没有知识点数据的情况 -->
			<div v-else>
				<i class="bi bi-folder2-open text-2xl text-gray-500"></i>
				<p class="text-gray-800 text-sm mt-2">暂无知识点数据</p>
			</div>
		</div>

		<!-- Dialog 模态框 -->
		<dialog id="definition_modal" class="modal">
			<div class="modal-box retro-manual">
				<form method="dialog" class="absolute right-4 top-4">
					<button class="retro-btn w-8 h-8">
						<div class="btn-shadow">
							<div class="btn-edge">
								<div class="btn-face">
									<i class="bi bi-x-lg"></i>
								</div>
							</div>
						</div>
					</button>
				</form>
				<!-- 标题区域 -->
				<div class="manual-header">
					<div class="manual-title">
						<h3 class="word-title">{{ currentPoint?.word }}</h3>
						<div class="word-subtitle">{{ currentPoint?.word_zh }}</div>
					</div>
				</div>

				<div class="manual-content">
					<div class="manual-logo">BAZINGA™ KNOWLEDGE SYSTEM</div>
					<!-- 中文释义 -->
					<div class="manual-section">
						<div class="section-title">
							<div class="title-decoration">◆</div>
							<h4 class="text-sm">中文释义</h4>
						</div>
						<p class="section-content text-left">
							{{ currentPoint?.definition_zh }}
						</p>
					</div>

					<!-- 同义词 -->
					<div v-if="currentPoint?.synonyms" class="manual-section">
						<div class="section-title">
							<div class="title-decoration">◆</div>
							<h4 class="text-sm">同义词</h4>
						</div>
						<ol class="section-list text-left">
							<li
								v-for="(synonym, index) in currentPoint.synonyms.split('|')"
								:key="index"
							>
								{{ synonym.trim() }}
							</li>
						</ol>
					</div>

					<!-- 例句 -->
					<div v-if="currentPoint?.example" class="manual-section text-left">
						<div class="section-title">
							<div class="title-decoration">◆</div>
							<h4 class="text-sm">例句</h4>
						</div>
						<div class="example-box">
							<p>{{ currentPoint?.example }}</p>
							<p class="example-translation">{{ currentPoint?.example_zh }}</p>
						</div>
					</div>

					<!-- 补充说明 -->
					<div v-if="currentPoint?.note" class="manual-section text-left">
						<div class="section-title">
							<div class="title-decoration">◆</div>
							<h4 class="text-sm">补充说明</h4>
						</div>
						<p class="section-content">{{ currentPoint?.note }}</p>
					</div>
				</div>

				<!-- 关闭按钮 -->
				<div class="manual-footer"></div>
			</div>
			<form method="dialog" class="modal-backdrop">
				<button>关闭</button>
			</form>
		</dialog>
	</div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { Pagination, Navigation } from "swiper/modules";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";

const mySwiper = ref(null); // Swiper 实例
const pagination = {
	el: ".swiper-pagination", // 分页点的容器
	clickable: true, // 允许点击切换
	type: "fraction", // 使用分数形式的页码 (如 "1/5")
	renderFraction: function (currentClass, totalClass) {
		return (
			'<span class="' +
			currentClass +
			'"></span>' +
			" / " +
			'<span class="' +
			totalClass +
			'"></span>'
		);
	},
};
const navigation = {
	nextEl: ".swiper-button-next",
	prevEl: ".swiper-button-prev",
};

const props = defineProps({
	currentKnowledgePoints: Object,
	showHints: Boolean,
	currentCustomNotes: Array,
	resourceId: String,
	currentDialogueIndex: Number,
	needUnlock: Boolean,
});
const emit = defineEmits([
	"on-slide-change",
	"on-toggle-hints",
	"update-note",
	"unlock-package",
]);

const handleUnlock = () => {
	emit("unlock-package");
};
const currentKnowledgeIndex = ref(0); // 当前知识点卡片索引
const localKnowledgePoints = ref([]); // 创建局部的响应式数组
const currentPoint = ref(null);

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
		if (error.response.status === 401) {
			showToast({
				message: "登录后解锁全部功能",
				type: "info",
				duration: 3000,
			});
		} else {
			showToast({
				message: error,
				type: "error",
				duration: 3000,
			});
		}
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

const showFullDefinition = (point) => {
	currentPoint.value = point;
	const modal = document.getElementById("definition_modal");
	modal.showModal();
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
	transform: translateY(-10px);
	transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.knowledge-card:hover .knowledge-card-star {
	opacity: 1;
	transform: translateY(3px);
}

.clicked {
	opacity: 1;
	transform: translateY(6px) !important;
}

.knowledge-capsule {
	box-shadow: 0 6px 15px rgba(255, 0, 255, 0.1);
}

.knowledge-empty-state {
	position: relative;
	width: 100%;
	height: 100%;
}

/* 可选的悬浮效果 */
.knowledge-empty-state:hover .bi {
	transform: translateY(-2px);
}

.knowledge-empty-state .bi {
	transition: transform 0.2s ease;
}

/* 确保图标垂直对齐 */
.bi::before {
	vertical-align: middle;
}

.btn-outline.btn-secondary:hover {
	--tw-text-opacity: 1;
	color: white;
}
</style>
<style>
.custom-pagination-container {
	position: absolute;
	bottom: 15px;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 10;
}

.swiper-pagination {
	position: static;
	width: auto;
	margin: 0 10px;
	transform: none;
}

.swiper-pagination-fraction {
	background-color: rgba(255, 255, 255, 0.3);
	color: var(--color-secondary, #333);
	padding: 4px 10px;
	border-radius: 12px;
	font-size: 12px;
	font-weight: 500;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	min-width: 60px;
	text-align: center;
}

.custom-nav-btn {
	position: static;
	margin: 0;
	color: var(--color-secondary, #333);
	background-color: rgba(255, 255, 255, 0.3);
	width: 28px;
	height: 28px;
	border-radius: 50%;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.custom-nav-btn:hover {
	background-color: rgba(200, 200, 200, 0.2);
	transform: translateY(-1px);
	box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.custom-nav-btn::after {
	font-size: 12px;
	font-weight: bold;
}

.swiper-button-disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.retro-manual {
	background: var(--milk-color);
	border: 2px solid #000;
	box-shadow: 2px 2px 0 #000;
	max-width: 600px;
	padding: 2rem;
	position: relative;
}

.manual-header {
	border-bottom: 2px solid #000;
	margin-bottom: 0.1rem;
	padding-bottom: 1rem;
}

.manual-logo {
	font-family: "Courier New", monospace;
	font-size: 0.75rem;
	font-weight: bold;
	letter-spacing: 1px;
	margin-bottom: 1.5rem;
	color: #666;
}

.word-title {
	color: var(--secondary-color);
	font-size: 1.2rem;
	font-weight: 800;
	letter-spacing: 1px;
	margin-bottom: 0.2rem;
}

.word-subtitle {
	font-size: 0.875rem;
	color: #666;
}

.manual-section {
	margin-bottom: 1.5rem;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 1rem;
	border-bottom: 1px dashed #000;
	padding-bottom: 0.5rem;
}

.title-decoration {
	font-size: 0.875rem;
	color: #666;
}

.section-content {
	font-size: 0.875rem;
	line-height: 1.6;
	color: #333;
}

.section-list {
	list-style-type: decimal;
	padding-left: 1.5rem;
	font-size: 0.875rem;
	line-height: 1.6;
	color: #333;
}

.example-box {
	background: #fff;
	border: 1px solid #000;
	padding: 1rem;
	font-size: 0.875rem;
	line-height: 1.6;
	border-radius: 12px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.example-translation {
	margin-top: 0.5rem;
	color: #666;
	font-style: italic;
}

.manual-footer {
	text-align: center;
	margin-top: 2rem;
	padding-top: 1rem;
	border-top: 2px solid #000;
}
</style>
