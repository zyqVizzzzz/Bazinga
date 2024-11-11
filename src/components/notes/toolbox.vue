<template>
	<div class="retro-toolbox w-full flex items-center justify-between px-4">
		<!-- Blind-Box 按钮 -->
		<button class="retro-btn" @click="openBlinkBox">
			<div class="btn-shadow">
				<div class="btn-edge">
					<div class="btn-face">
						<span>Blind-Box</span>
					</div>
				</div>
			</div>
		</button>

		<!-- 搜索框 -->
		<div class="search-box flex items-center space-x-2 relative">
			<div class="retro-input-wrapper">
				<input
					v-model="searchQuery"
					type="text"
					class="retro-input"
					@input="onInputWord"
					@keydown.enter="searchWord"
					placeholder="Quick search..."
				/>
			</div>
			<button class="retro-btn-small" @click="searchWord">
				<div class="btn-shadow">
					<div class="btn-edge">
						<div class="btn-face">
							<i class="bi bi-search text-lg"></i>
						</div>
					</div>
				</div>
			</button>

			<!-- 联想框 -->
			<div
				v-if="suggestions.length"
				class="suggestions-box"
				style="margin-left: 0; margin-top: 8px"
			>
				<div class="suggestions-shadow">
					<div class="suggestions-edge">
						<div class="suggestions-face">
							<ul>
								<li
									v-for="(suggestion, index) in suggestions"
									:key="index"
									@click="selectSuggestion(suggestion)"
									class="suggestion-item"
								>
									{{ suggestion }}
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 模式切换按钮 -->
		<button class="retro-btn" @click="startReviewMode">
			<div class="btn-shadow">
				<div class="btn-edge">
					<div class="btn-face">
						<span>{{ isImportantMode ? "Vocabulary" : "Star-List" }}</span>
						<div v-if="showLightning" class="lightning-animation">
							<FlashIcon :size="'4'" class="mr-2" />+1
						</div>
					</div>
				</div>
			</div>
		</button>
	</div>
</template>

<script setup>
import { ref, watch, toRefs } from "vue";
import FlashIcon from "../icons/Flash.vue";
import { useNotebookStore } from "@/store/index";
import apiClient from "@/api";
import { showToast } from "@/components/common/toast.js";
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
			if (response.data.code === 200) {
				// 获取联想结果
				suggestions.value = response.data.data;
			} else {
				showToast({ message: res.data.message, type: "error" });
			}
		} catch (error) {
			showToast({ message: error, type: "error" });
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
/* 工具箱容器 */
.retro-toolbox {
	background: repeating-linear-gradient(
		45deg,
		#f0f0f0,
		#f0f0f0 10px,
		#f8f8f8 10px,
		#f8f8f8 20px
	);
	border-radius: 12px;
	box-shadow: 4px 4px 0 0 rgba(0, 0, 0, 0.2);
	height: 100%;
}

/* 复古按钮样式 */
.retro-btn {
	position: relative;
	min-width: 120px;
	height: 40px;
	border: none;
	background: none;
	cursor: pointer;
	font-size: 0.875rem;
	font-weight: bold;
}

.retro-btn-small {
	position: relative;
	width: 40px;
	height: 40px;
	border: none;
	background: none;
	cursor: pointer;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 8px;
	transform: translateY(-2px);
	transition: transform 0.1s;
}

.btn-face {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	border: 2px solid #333;
	border-radius: 8px;
	color: #333;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 复古输入框 */
.retro-input-wrapper {
	position: relative;
	width: 240px;
}

.retro-input {
	width: 100%;
	height: 40px;
	padding: 0 1rem;
	background: white;
	border: 2px solid #333;
	border-radius: 8px;
	font-size: 0.875rem;
	box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.retro-input:focus {
	outline: none;
	box-shadow: 4px 4px 0 rgba(var(--primary-color-rgb), 0.2);
}

/* 联想框样式 */
.suggestions-box {
	position: absolute;
	top: 100%;
	left: 0;
	width: 100%;
	z-index: 100;
}

.suggestions-shadow {
	background-color: #666;
	border-radius: 8px;
	transform: translateY(2px);
}

.suggestions-edge {
	background-color: #888;
	border-radius: 8px;
	transform: translateY(-2px);
}

.suggestions-face {
	background-color: white;
	border: 2px solid #333;
	border-radius: 8px;
	transform: translateY(-2px);
	overflow: hidden;
}

.suggestion-item {
	padding: 0.75rem 1rem;
	font-size: 0.875rem;
	cursor: pointer;
	border-bottom: 1px solid #eee;
	transition: all 0.2s;
}

.suggestion-item:hover {
	background-color: rgba(var(--primary-color-rgb), 0.1);
}

/* 按钮交互效果 */
.retro-btn:hover .btn-face,
.retro-btn-small:hover .btn-face {
	background-color: white;
}

.retro-btn:active .btn-edge,
.retro-btn:active .btn-face,
.retro-btn-small:active .btn-edge,
.retro-btn-small:active .btn-face {
	transform: translateY(0);
}

/* 闪电动画优化 */
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

.lightning-animation {
	color: var(--secondary-color);
	font-size: 14px;
	animation: lightningMove 3s ease-in-out forwards;
	position: absolute;
	left: -60px;
	z-index: 20;
}

/* 装饰效果 */
.retro-toolbox::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: repeating-linear-gradient(
		45deg,
		transparent,
		transparent 2px,
		rgba(0, 0, 0, 0.02) 2px,
		rgba(0, 0, 0, 0.02) 4px
	);
	border-radius: 9px;
	pointer-events: none;
}
</style>
