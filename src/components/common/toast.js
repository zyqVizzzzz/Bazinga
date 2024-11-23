import { createApp } from "vue";
import Toast from "@/components/common/Toast.vue";

let toastInstance;

export function showToast({
	message,
	disc = "",
	type = "info",
	duration = 3000,
}) {
	if (toastInstance) {
		toastInstance.unmount(); // 移除已有的 Toast 实例
	}

	const container = document.createElement("div");
	document.body.appendChild(container);

	toastInstance = createApp(Toast, { message, type, duration, disc });
	toastInstance.mount(container);

	setTimeout(() => {
		toastInstance.unmount();
		document.body.removeChild(container);
		toastInstance = null;
	}, duration + 300);
}
