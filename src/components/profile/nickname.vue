<template>
	<div class="relative inline-block">
		<div
			v-if="isEditing"
			class="absolute left-1/2 -translate-x-1/2 text-gray-700 font-bold"
			style="width: 300px; top: -36px; z-index: 99; font-size: 13px"
		>
			{{ t("profile.nickname_tips") }}
		</div>
		<div>
			<h1
				v-if="!isEditing"
				class="nickname-text text-xl font-bold text-gray-200 relative w-full"
			>
				{{ nickname }}
			</h1>
			<input
				v-if="isEditing"
				ref="nicknameRef"
				v-model="tempNickname"
				class="dynamic-input text-center focus:outline-none"
			/>
			<!-- @blur="resetEditing" -->
		</div>
		<!-- 编辑按钮 -->
		<button
			v-if="!isEditing"
			class="absolute text-sm -right-3 top-1/2 transform -translate-y-1/2 translate-x-full"
			@click="toggleEditing"
		>
			<i class="bi bi-pencil-square"></i>
		</button>

		<!-- 保存按钮 -->
		<button
			v-if="isEditing"
			class="absolute -right-0 top-1/2 transform -translate-y-1/2 translate-x-full"
			style="z-index: 99"
			@mousedown="saveEditing"
		>
			<i class="bi bi-arrow-right-circle"></i>
		</button>
	</div>
</template>
<script setup>
import { ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const { nickname } = defineProps({
	nickname: String,
});
const emit = defineEmits(["on-save-nickname"]);

const isEditing = ref(false);
const tempNickname = ref("");
const nicknameRef = ref(null);

// 切换编辑模式
const toggleEditing = () => {
	tempNickname.value = nickname;
	isEditing.value = true;
	nextTick(() => {
		nicknameRef.value?.focus(); // 确保 DOM 渲染完成后再执行 focus
	});
};

const saveEditing = async () => {
	if (tempNickname.value.trim() === nickname.trim()) {
		isEditing.value = false;
		return;
	}
	isEditing.value = false;
	emit("on-save-nickname", tempNickname.value);
};

const resetEditing = () => {
	isEditing.value = false;
};
</script>
<style scoped>
.nickname-text {
	z-index: 99;
	white-space: nowrap; /* 强制文本在一行显示 */
	overflow: hidden; /* 隐藏超出的文本 */
	text-overflow: ellipsis; /* 显示省略号 */
}
.dynamic-input {
	border: none;
	padding: 4px;
	font-size: 1rem;
	color: white;
	background-color: transparent;
	/* 其他样式 */
}
</style>
