<template>
	<div class="toolbox w-full flex items-center justify-between p-2 rounded-lg">
		<div class="action-buttons flex items-center space-x-2">
			<button
				class="btn btn-secondary btn-sm h-8 text-xs px-4 border-none text-white"
				@click="openBlinkBox"
			>
				单词盲盒
			</button>
		</div>

		<div class="search-box flex items-center space-x-2 relative">
			<input
				v-model="searchQuery"
				type="text"
				class="input input-bordered w-full max-w-xs h-8 text-xs"
				@input="onInputWord"
				@keydown.enter="searchWord"
				placeholder="输入单词"
			/>
			<button
				class="btn btn-sm bg-white h-8 text-xs px-4 border-2 border-none text-secondary hover:border-secondary hover:bg-secondary hover:text-white"
				@click="searchWord"
			>
				搜索
			</button>
			<!-- 联想框 -->
			<div
				v-if="suggestions.length"
				class="absolute top-full -left-2 w-full text-left max-w-xs bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10"
			>
				<ul>
					<li
						v-for="(suggestion, index) in suggestions"
						:key="index"
						@click="selectSuggestion(suggestion)"
						class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
					>
						{{ suggestion }}
					</li>
				</ul>
			</div>
		</div>

		<div>
			<button
				class="btn btn-secondary btn-sm h-8 text-xs px-4 border-none text-white relative"
				@click="startReviewMode"
			>
				{{ isImportantMode ? "全部词汇" : "重点词汇" }}
				<div v-if="showLightning" class="lightning-animation absolute flex">
					<FlashIcon :size="'4'" class="mr-2" />+1
				</div>
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, toRefs, computed } from "vue";
import FlashIcon from "../icons/Flash.vue";
import { useNotebookStore } from "@/store/index";
import apiClient from "@/api";
const notebookStore = useNotebookStore();
const { toggleBlinkBox } = notebookStore;

const props = defineProps({ flashState: Number });
const { flashState } = toRefs(props);

const searchQuery = ref("");
const suggestions = ref([]);
const showLightning = ref(false);
const isImportantMode = ref(false);

const emit = defineEmits([
	"on-search-word",
	"on-blink-box",
	"on-important-mode",
]);

// 查询功能
const searchWord = () => {
	if (searchQuery.value.trim()) {
		emit("on-search-word", searchQuery.value.trim());
	}
};

let debounceTimeout;
const debounce = (func, delay) => {
	return (...args) => {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => func(...args), delay);
	};
};

const selectSuggestion = (suggestion) => {
	searchQuery.value = suggestion; // 将选中的联想结果填充到输入框
	suggestions.value = []; // 清空联想结果
	searchWord();
};

const onInputWord = debounce(async () => {
	if (searchQuery.value.trim()) {
		try {
			// 调用后端接口
			const response = await apiClient.get(
				`/lesson-notes/user/suggest?term=${searchQuery.value.trim()}`
			);

			// 获取联想结果
			suggestions.value = response.data;
			console.log("Suggestions:", suggestions.value);
		} catch (error) {
			console.error("Error fetching suggestions:", error);
		}
	} else {
		suggestions.value = [];
	}
}, 300);

// 复习模式功能
const startReviewMode = () => {
	isImportantMode.value = !isImportantMode.value;
	emit("on-important-mode");
};

// 单词盲盒功能
const openBlinkBox = () => {
	toggleBlinkBox();
};

// 监听stateA的变化，数值增加时触发闪电图标显示
watch(flashState, (newVal, oldVal) => {
	if (newVal > oldVal) {
		showLightning.value = true;
		setTimeout(() => {
			showLightning.value = false; // 1秒后隐藏图标
		}, 3000); // 闪电图标停留2秒
	}
});
</script>

<style scoped>
.toolbox {
	height: 50px; /* 调整工具箱栏的高度 */
	background: linear-gradient(155deg, #222222, #1b1b1b);
	box-shadow: 2px 4px 6px rgba(0, 0, 0, 0.3);
}
/* 闪电图标的动画效果 */
@keyframes lightningMove {
	0% {
		transform: translateY(30px) scale(0.5);
		opacity: 0;
	}
	30% {
		transform: translateY(0) scale(1.2);
		opacity: 1;
	}
	70% {
		transform: translateY(-10px) scale(1);
		opacity: 1;
	}
	100% {
		transform: translateY(-30px) scale(0.5);
		opacity: 0;
	}
}

/* 定义闪电图标的动画 */
.lightning-animation {
	color: var(--secondary-color);
	font-size: 14px;
	animation: lightningMove 3s ease-in-out forwards;
	position: absolute;
	left: -60px; /* 控制闪电图标在按钮右侧 */
	z-index: 9999;
}
</style>
