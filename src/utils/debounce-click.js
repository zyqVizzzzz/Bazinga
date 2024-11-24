export const vDebounceClick = {
	beforeMount(el, binding) {
		const delay = binding.value?.delay || 300; // 默认300ms
		let isDisabled = false;

		const onClick = (e) => {
			const originalClick = binding.value?.handler || binding.value;

			if (typeof originalClick !== "function") {
				console.warn("v-debounce-click directive requires a function");
				return;
			}

			if (isDisabled) {
				e.stopPropagation();
				return;
			}

			// 禁用按钮并添加视觉反馈
			isDisabled = true;
			const originalClass = el.className;
			el.className = `${originalClass} opacity-50 cursor-not-allowed`;

			// 执行原始点击事件
			originalClick(e);

			// 延迟后恢复按钮状态
			setTimeout(() => {
				isDisabled = false;
				el.className = originalClass;
			}, delay);
		};

		el.addEventListener("click", onClick);
		el._debounceClick = onClick;
	},

	beforeUnmount(el) {
		el.removeEventListener("click", el._debounceClick);
		delete el._debounceClick;
	},
};
