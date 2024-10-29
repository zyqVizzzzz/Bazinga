export default class CustomItalic {
	static get isInline() {
		return true;
	}

	static get sanitize() {
		return {
			i: {},
		};
	}

	static get toolbox() {
		return {
			title: "Mark",
			icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>',
		};
	}

	// Editor.js 的 API 方法，用于检测选中文本
	surround(range) {
		if (range) {
			const selection = window.getSelection();
			if (!selection.rangeCount) return;

			const wrapper = document.createElement("i");
			wrapper.appendChild(range.extractContents());
			range.insertNode(wrapper);
		}
	}

	render() {
		const button = document.createElement("button");
		button.innerHTML = "Mark";
		button.classList.add("cdx-italic");
		button.addEventListener("click", () => {
			document.execCommand("italic");
		});
		return button;
	}
}
