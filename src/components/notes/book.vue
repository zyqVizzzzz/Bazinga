<template>
	<!-- 笔记容器，带有分页 -->
	<div
		ref="notebookRef"
		class="relative notebook bg-white shadow-md rounded-lg px-6 py-5 w-full bg-grid-paper"
	>
		<h2 class="text-2xl font-medium text-gray-600 text-left mb-4 pl-2">
			Vocabulary
		</h2>
		<ul
			class="list-disc list-inside text-gray-700 text-left mb-6 flex flex-wrap"
		>
			<li
				class="mt-2 w-1/2"
				v-for="(note, index) in paginatedVocabularyNotes"
				:key="index"
			>
				<div
					class="pl-2 transition-shadow duration-300 ease-in-out hover:shadow-red cursor-pointer"
					style="padding-top: 2px; padding-bottom: 2px"
					@click="selectNote(note)"
				>
					<span class="font-bold text-base">{{ note.word }}</span>
					<span class="ml-4 text-gray-500">{{ note.pos }}</span>
					<span class="text-gray-800 ml-2"
						><strong>{{ note.word_zh }}</strong></span
					>
				</div>
			</li>
		</ul>
		<!-- 分页器 -->
		<div class="absolute right-4 bottom-4 inline-flex items-center space-x-4">
			<button
				class="btn btn-secondary"
				@click="prevPage"
				:disabled="currentPage === 1"
			>
				Prev
			</button>
			<span class="text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
			<button
				class="btn btn-secondary"
				@click="nextPage"
				:disabled="currentPage === totalPages"
			>
				Next
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
const notebookRef = ref(null);
const currentPage = ref(1);

// 将父组件的相关 props 或数据传递到这里
const notes = ref([]); // 用于存储词汇笔记
// const vocabularyNotes = ref([]);
const props = defineProps({
	notes: Object,
});

// 每页显示的项目数，默认设置为 6
const itemsPerPage = ref(6);

// 监听窗口大小并根据容器高度动态计算每页的项目数
const calculateItemsPerPage = () => {
	const containerHeight = notebookRef.value?.offsetHeight - 192 || 0; // 获取容器高度
	console.log(containerHeight);
	const itemHeight = 36; // 假设每个项目的高度为40px (可根据实际调整)
	itemsPerPage.value = Math.ceil(containerHeight / itemHeight) * 2; // 根据高度计算每页显示的项目数

	console.log(itemsPerPage.value);
};

// 计算总页数
const totalPages = computed(() => {
	const totalItems = props.notes.length;
	return Math.ceil(totalItems / itemsPerPage.value);
});

// 获取当前页显示的 vocabulary 内容
const paginatedVocabularyNotes = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value;
	const end = start + itemsPerPage.value;
	return props.notes.slice(start, end);
});

// 监听窗口变化，动态调整每页项目数
const handleResize = () => {
	calculateItemsPerPage();
};

// 在组件挂载时初始化
onMounted(() => {
	calculateItemsPerPage(); // 初始化时计算每页项目数
	window.addEventListener("resize", handleResize); // 监听窗口变化
});

// 清除监听器
onBeforeUnmount(() => {
	window.removeEventListener("resize", handleResize);
});

const emit = defineEmits(["on-select-note"]);

// 选中笔记并展示在 edit-content 区域
const selectNote = (note) => {
	// 在父组件中处理选中逻辑
	emit("on-select-note", note);
};

// 分页导航
const nextPage = () => {
	if (currentPage.value < totalPages.value) {
		currentPage.value++;
	}
};

const prevPage = () => {
	if (currentPage.value > 1) {
		currentPage.value--;
	}
};
</script>

<style scoped>
/* 自定义阴影颜色为浅红色 */
.hover\:shadow-red:hover {
	box-shadow: 0px 2px 2px rgba(255, 0, 211, 0.4);
}

/* 过渡效果 */
.transition-shadow {
	transition: box-shadow 0.3s ease-in-out;
}

/* 信纸背景 */
.bg-line-paper {
	background-image: linear-gradient(
		transparent 28px,
		rgba(229, 229, 229, 0.4) 12px
	);
	background-size: 100% 29px;
}

/* 细格子背景 */
.bg-grid-paper {
	background-color: white;
	background-image: linear-gradient(
			90deg,
			rgba(0, 0, 0, 0.03) 1px,
			transparent 1px
		),
		linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px);
	background-size: 20px 20px; /* 网格间距 */
}

.notebook {
	position: relative;
	height: calc(100vh - 250px);
	overflow-y: auto;
}

.pagination-container {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.btn-secondary:disabled {
	background-color: rgb(255, 230, 240);
	cursor: not-allowed;
}
li {
	list-style-type: none;
}
</style>
