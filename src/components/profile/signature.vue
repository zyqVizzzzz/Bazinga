<template>
	<div class="sign-container bg-paper" @click="toggleEditing">
		<template v-if="isEditingSignature">
			<!-- 可编辑的文本框 -->
			<textarea
				ref="signatureInput"
				v-model="tempSignature"
				class="editable-input"
				rows="1"
			></textarea>

			<!-- 保存和取消按钮 -->
			<div class="button-group">
				<button
					class="btn btn-sm text-xs btn-primary text-white"
					@mousedown.stop="saveSignature"
				>
					保存
				</button>
				<button
					class="btn btn-sm text-xs btn-gray"
					@mousedown.stop="resetEditing"
				>
					取消
				</button>
			</div>
			<div
				class="text-xs text-red-500 font-bold border-t w-full border-gray-200 py-2 mt-2"
			>
				我知道这是个怪异的互动...你依然可以在这里输入很多个字，如果你非要这么做的话...如你所见，它可能会挡住一些东西...but
				whatever...虽然我不建议你在这里输入太多字，但如果你非要这么做的话...
				<br /><br />
				那你就是进一步的怪家伙...
			</div>
		</template>
		<template v-else>
			<!-- 把换行符替换为 p 标签 -->
			<div v-html="formattedSignature"></div>
		</template>
	</div>
</template>

<script setup>
import { ref, nextTick, computed } from "vue";

const props = defineProps({
	signature: String, // 接收父组件传入的签名
});
const emit = defineEmits(["update-signature"]); // 用于向父组件发送更新事件

const isEditingSignature = ref(false);
const tempSignature = ref(props.signature);
const signatureInput = ref(null);

// 切换编辑状态
const toggleEditing = () => {
	tempSignature.value = props.signature;
	isEditingSignature.value = true;
	nextTick(() => {
		signatureInput.value?.focus();
	});
};

// 保存签名
const saveSignature = () => {
	isEditingSignature.value = false;
	emit("update-signature", tempSignature.value); // 向父组件传递更新的签名
};

// 重置编辑状态
const resetEditing = () => {
	isEditingSignature.value = false;
	console.log(isEditingSignature.value);
	tempSignature.value = props.signature; // 恢复到原有值
};

// 计算属性：将换行符转换为 p 标签
const formattedSignature = computed(() => {
	return props.signature
		? props.signature
				.split("\n")
				.map((line) => `<p style="line-height: 28px">${line}</p>`)
				.join("")
		: "";
});
</script>

<style scoped>
.sign-container {
	width: 150%;
	font-size: 0.875rem;
	position: absolute;
	left: 50%;
	top: -140px;
	border-width: 2px;
	padding: 0.5rem;
	border-color: #000;
	transform: translate(-50%, -33%);
	z-index: 10;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}
.bg-paper {
	background: linear-gradient(155deg, #f4f2f2, #eeeeee);
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1), 4px 8px 12px rgba(0, 0, 0, 0.2);
	border-radius: 8px !important;
}
.editable-input {
	background: transparent;
	border: none;
	outline: none;
	text-align: center;
	font-size: 0.875rem;
	width: 100%;
	padding: 0.5rem;
	resize: none !important;
	/* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1); */
	resize: vertical; /* 允许用户垂直调整 textarea 高度 */
}

/* 按钮组样式 */
.button-group {
	display: flex;
	justify-content: center;
	margin-top: 8px;
}

button {
	margin: 0 8px 6px;
}

/* button:hover {
	background-color: #0056b3;
} */
</style>
