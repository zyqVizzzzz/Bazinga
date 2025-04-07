<template>
	<dialog ref="speakerModalRef" class="modal">
		<div class="modal-box vintage-modal">
			<h3 class="vintage-title">选择角色</h3>
			<p class="vintage-subtitle">为「对话」文本行添加或选择一个角色名称</p>

			<div class="speaker-select relative w-full">
				<div class="vintage-input-container">
					<input
						v-model="newSpeaker"
						type="text"
						class="vintage-input"
						placeholder="输入角色..."
						@keydown.enter.prevent="handleSpeakerInput"
					/>
				</div>

				<!-- 标签列表 -->
				<div class="vintage-tags-container">
					<div v-for="speaker in speakers" :key="speaker" class="vintage-tag">
						<span class="cursor-pointer" @click="selectSpeaker(speaker)">{{
							speaker
						}}</span>
						<button
							class="vintage-tag-remove"
							@click.stop="removeSpeaker(speaker)"
						>
							<i class="bi bi-x"></i>
						</button>
					</div>
				</div>
			</div>
			<div class="vintage-actions">
				<button @click="handleConfirm" class="retro-btn w-[100px] h-8">
					<div class="btn-shadow">
						<div class="btn-edge">
							<div class="btn-face">确定</div>
						</div>
					</div>
				</button>
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>关闭</button>
		</form>
	</dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
	speakers: {
		type: Array,
		required: true,
	},
});

const emit = defineEmits(["update", "remove", "confirm"]);

const speakerModalRef = ref(null);
const newSpeaker = ref("");

const handleSpeakerInput = () => {
	if (!newSpeaker.value.trim()) return;
	emit("update", newSpeaker.value.trim());
	newSpeaker.value = "";
};

const selectSpeaker = (speaker) => {
	newSpeaker.value = speaker;
};

const removeSpeaker = (speaker) => {
	emit("remove", speaker);
};

const handleConfirm = () => {
	// 不管是否为空都发送 confirm 事件
	const trimmedSpeaker = newSpeaker.value.trim();
	if (trimmedSpeaker) {
		emit("update", trimmedSpeaker);
	}
	emit("confirm", trimmedSpeaker); // 即使是空值也发送
	speakerModalRef.value?.close();
};

// 暴露方法给父组件
defineExpose({
	showModal: () => speakerModalRef.value?.showModal(),
	close: () => speakerModalRef.value?.close(),
});
</script>

<style scoped>
.vintage-modal {
	/* background: #f5f2eb; */
	border: 3px solid #000;
	border-radius: 12px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 1);
	padding: 24px;
	position: relative;
	max-width: 400px;
}

.vintage-title {
	/* font-family: "Comic Sans MS", "Hannotate SC", sans-serif; */
	font-weight: bold;
	font-size: 20px;
	margin-bottom: 16px;
	text-align: center;
	position: relative;
	color: #000;
}

.vintage-title::after {
	content: "";
	position: absolute;
	bottom: -8px;
	left: 25%;
	right: 25%;
	height: 2px;
	background: #000;
}

.vintage-subtitle {
	text-align: center;
	color: #666;
	font-size: 14px;
	margin-bottom: 20px;
	font-style: italic;
}

.vintage-input-container {
	border: 2px solid #000;
	border-radius: 8px;
	padding: 8px 12px;
	background: #fff;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
	margin-bottom: 16px;
	position: relative;
}

.vintage-input {
	width: 100%;
	background: transparent;
	border: none;
	outline: none;
	font-size: 14px;
	color: #000;
	font-family: "Comic Sans MS", "Hannotate SC", sans-serif;
}

.vintage-input::placeholder {
	color: #888;
}

.vintage-tags-container {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 16px;
	margin-bottom: 24px;
}

.vintage-tag {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	background: #fff;
	border: 2px solid #000;
	border-radius: 20px;
	font-size: 13px;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
	transition: all 0.2s;
}

.vintage-tag:hover {
	transform: translateY(-2px);
	box-shadow: 2px 4px 0 rgba(0, 0, 0, 0.1);
}

.vintage-tag-remove {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.1);
	color: #666;
	border: none;
	cursor: pointer;
	transition: all 0.2s;
}

.vintage-tag-remove:hover {
	background: var(--secondary-color);
	color: #fff;
}

.vintage-actions {
	display: flex;
	justify-content: center;
	gap: 16px;
	margin-top: 16px;
}

.vintage-btn {
	padding: 6px 16px;
	border: 2px solid #000;
	border-radius: 8px;
	font-weight: bold;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;
	position: relative;
	background: #fff;
	box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
}

.vintage-btn:hover {
	transform: translateY(-2px);
	box-shadow: 2px 4px 0 rgba(0, 0, 0, 0.2);
}

.vintage-btn:active {
	transform: translateY(0);
	box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.confirm-btn {
	background: var(--primary-color);
	color: #fff;
}

.cancel-btn {
	background: #f5f2eb;
	color: #000;
}

.retro-btn {
	position: relative;
	border: none;
	background: none;
	cursor: pointer;
}

.retro-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-shadow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #666;
	border-radius: 6px;
	transform: translateY(2px);
}

.btn-edge {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: #888;
	border-radius: 6px;
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
	border-radius: 6px;
	color: #333;
	font-weight: bold;
	transform: translateY(-2px);
	transition: transform 0.1s;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 按钮交互效果 */
.retro-btn:hover:not(:disabled) .btn-face {
	background-color: white;
}

.retro-btn:active:not(:disabled) .btn-edge,
.retro-btn:active:not(:disabled) .btn-face {
	transform: translateY(0);
}
</style>
