export class TranslateTool {
	static get isInline() {
		return true;
	}

	constructor({ api, config }) {
		this.api = api;
		this.button = null;
		this.tag = "MARK";
		this.config = config || {};
		this.onAction = config.onAction || (() => {});
	}

	render() {
		this.button = document.createElement("button");
		this.button.type = "button";
		this.button.innerHTML = `
      <i class="bi bi-translate"></i>
    `;
		this.button.classList.add("ce-inline-tool");

		return this.button;
	}

	surround(range) {
		const selectedText = range.toString().trim();
		if (!selectedText) return;

		// 调用外部处理函数，传递选中的文本和当前块的信息
		this.onAction({
			type: "translate",
			text: selectedText,
			range,
			api: this.api,
			blockIndex: this.getSelectedBlockIndex(),
		});
	}

	wrap(range) {
		const selectedText = range.extractContents();
		const mark = document.createElement(this.tag);
		mark.appendChild(selectedText);
		range.insertNode(mark);
	}

	unwrap(range) {
		const mark = this.api.selection.findParentTag(this.tag);
		const text = mark.innerHTML;
		mark.parentNode.replaceChild(document.createTextNode(text), mark);
	}

	checkState() {
		const selection = window.getSelection();
		const hasSelection = !selection.isCollapsed;
		this.button.classList.toggle("ce-inline-tool--active", hasSelection);
	}

	getSelectedBlockIndex() {
		return this.api.blocks.getCurrentBlockIndex();
	}

	static get sanitize() {
		return {
			mark: {},
		};
	}
}
