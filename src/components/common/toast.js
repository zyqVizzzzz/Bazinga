import { createApp } from "vue";
import Toast from "@/components/common/Toast.vue";

let toastInstance;

export function showToast({
	message,
	disc = "",
	type = "info",
	duration = 3000,
	position = "top", // 添加 position 参数
}) {
	if (toastInstance) {
		toastInstance.unmount(); // 移除已有的 Toast 实例
	}

	const container = document.createElement("div");
	document.body.appendChild(container);

	// 将 position 传递给 Toast 组件
	toastInstance = createApp(Toast, {
		message,
		type,
		duration,
		disc,
		position,
	});
	toastInstance.mount(container);

	setTimeout(() => {
		toastInstance.unmount();
		document.body.removeChild(container);
		toastInstance = null;
	}, duration + 300);
}
