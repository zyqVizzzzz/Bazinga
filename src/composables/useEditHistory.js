import { ref } from "vue";

export function useEditHistory(maxHistoryLength = 50) {
	// 存储每个块的历史记录
	const blockHistory = ref(new Map());
	// 存储每个块的历史指针
	const blockHistoryPointer = ref(new Map());

	// 全局历史记录，用于跨块操作
	const globalHistory = ref([]);
	const globalHistoryPointer = ref(-1);

	// 添加历史记录
	const addToHistory = (blockId, state) => {
		if (!blockId) return;

		// 初始化历史记录
		if (!blockHistory.value.has(blockId)) {
			blockHistory.value.set(blockId, [state]);
			blockHistoryPointer.value.set(blockId, 0);
			return;
		}

		const history = blockHistory.value.get(blockId);
		const pointer = blockHistoryPointer.value.get(blockId);

		// 如果在历史记录中间进行了修改，删除后面的记录
		if (pointer < history.length - 1) {
			history.splice(pointer + 1);
		}

		// 添加新状态
		history.push({ ...state });

		// 限制历史记录长度
		if (history.length > maxHistoryLength) {
			history.shift();
		} else {
			blockHistoryPointer.value.set(blockId, history.length - 1);
		}
	};

	// 添加全局历史记录（跨块操作）
	const addToGlobalHistory = (action) => {
		// 如果在历史记录中间进行了修改，删除后面的记录
		if (globalHistoryPointer.value < globalHistory.value.length - 1) {
			globalHistory.value.splice(globalHistoryPointer.value + 1);
		}

		// 添加新操作
		globalHistory.value.push(action);

		// 限制历史记录长度
		if (globalHistory.value.length > maxHistoryLength) {
			globalHistory.value.shift();
		} else {
			globalHistoryPointer.value = globalHistory.value.length - 1;
		}
	};

	// 撤销操作
	const undo = (blockId) => {
		if (!blockId || !blockHistory.value.has(blockId)) return null;

		const history = blockHistory.value.get(blockId);
		const pointer = blockHistoryPointer.value.get(blockId);

		if (pointer > 0) {
			blockHistoryPointer.value.set(blockId, pointer - 1);
			return history[pointer - 1];
		}

		return null;
	};

	// 全局撤销操作
	const globalUndo = () => {
		if (globalHistoryPointer.value > 0) {
			globalHistoryPointer.value--;
			return globalHistory.value[globalHistoryPointer.value];
		}
		return null;
	};

	// 重做操作
	const redo = (blockId) => {
		if (!blockId || !blockHistory.value.has(blockId)) return null;

		const history = blockHistory.value.get(blockId);
		const pointer = blockHistoryPointer.value.get(blockId);

		if (pointer < history.length - 1) {
			blockHistoryPointer.value.set(blockId, pointer + 1);
			return history[pointer + 1];
		}

		return null;
	};

	// 全局重做操作
	const globalRedo = () => {
		if (globalHistoryPointer.value < globalHistory.value.length - 1) {
			globalHistoryPointer.value++;
			return globalHistory.value[globalHistoryPointer.value];
		}
		return null;
	};

	// 获取当前状态
	const getCurrentState = (blockId) => {
		if (!blockId || !blockHistory.value.has(blockId)) return null;

		const history = blockHistory.value.get(blockId);
		const pointer = blockHistoryPointer.value.get(blockId);

		return history[pointer];
	};

	// 清除历史记录
	const clearHistory = (blockId) => {
		if (blockId) {
			blockHistory.value.delete(blockId);
			blockHistoryPointer.value.delete(blockId);
		} else {
			blockHistory.value.clear();
			blockHistoryPointer.value.clear();
			globalHistory.value = [];
			globalHistoryPointer.value = -1;
		}
	};

	return {
		blockHistory,
		blockHistoryPointer,
		globalHistory,
		globalHistoryPointer,
		addToHistory,
		addToGlobalHistory,
		undo,
		globalUndo,
		redo,
		globalRedo,
		getCurrentState,
		clearHistory,
	};
}
