<template>
	<div class="relative inline-block">
		<div
			v-if="isEditing"
			class="absolute left-1/2 -translate-x-1/2 text-red-500 font-bold bg-paper"
			style="width: 300px; top: -156px; z-index: 99; font-size: 13px"
		>
			理论上，你可以输入很多字，但最终只有50个字符会被上传，大概是25个汉字或50个英文字母...而实际情况是，我建议你起一个更短的名字，最好在10个字以内，因为这里没有任何换行的处理，字太多会超出卡片的宽度...当然，whatever，如果你非要这么做的话...
			<p class="pt-1">那你就是个怪家伙...</p>
		</div>
		<div>
			<h1
				v-if="!isEditing"
				class="nickname-text text-2xl font-bold text-gray-800 relative w-full"
				style="height: 32px"
			>
				{{ nickname }}
			</h1>
			<input
				v-if="isEditing"
				ref="nicknameRef"
				v-model="tempNickname"
				class="dynamic-input text-center focus:outline-none"
				style="padding: 6px 0"
				@blur="resetEditing"
			/>
		</div>
		<!-- 编辑按钮 -->
		<button
			v-if="!isEditing"
			class="absolute -right-3 top-1/2 transform -translate-y-1/2 translate-x-full"
			@click="toggleEditing"
		>
			<i class="bi bi-pencil-square text-xl"></i>
		</button>

		<!-- 保存按钮 -->
		<button
			v-if="isEditing"
			class="absolute -right-3 top-1/2 transform -translate-y-1/2 translate-x-full"
			style="z-index: 99"
			@mousedown="saveEditing"
		>
			<i class="bi bi-arrow-right-circle"></i>
		</button>
	</div>
</template>
<script setup>
import { ref, nextTick } from "vue";

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
	border: 1px solid #ccc;
	padding: 4px;
	font-size: 16px;
	/* 其他样式 */
}
</style>
