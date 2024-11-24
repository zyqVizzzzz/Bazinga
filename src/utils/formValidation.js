export const validateCollectionTitle = (title) => {
	if (!title?.trim()) {
		return {
			isValid: false,
			error: "请输入标题",
		};
	}

	// 计算等效长度
	const length = calculateLength(title);
	const actualLength = title.length;

	// 检查是否全是英文（允许40个字符）
	const isAllEnglish = !/[\u4e00-\u9fa5]/.test(title);

	if (isAllEnglish && actualLength > 40) {
		return {
			isValid: false,
			error: "英文标题不能超过40个字符",
			value: title.slice(0, 40),
		};
	}

	// 如果包含中文，使用等效长度检查
	if (length > 20) {
		return {
			isValid: false,
			error: "标题长度超出限制（中文20字符或英文40字符）",
			value: truncateString(title),
		};
	}

	return {
		isValid: true,
		error: "",
	};
};

export const validateCollectionForm = (formData) => {
	const errors = {};

	// 验证标题
	const titleValidation = validateTitle(formData.showName);
	if (!titleValidation.isValid) {
		errors.showName = titleValidation.error;
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
		correctedValues: titleValidation.value
			? { showName: titleValidation.value }
			: null,
	};
};

// 判断字符是否是中文
const isChineseChar = (char) => {
	return /[\u4e00-\u9fa5]/.test(char);
};

// 计算字符串的等效长度（中文算1个，英文算0.5个）
const calculateLength = (str) => {
	let length = 0;
	for (let char of str) {
		length += isChineseChar(char) ? 1 : 0.5;
	}
	return length;
};

// 获取显示的字符数（用于UI显示）
export const getDisplayLength = (str) => {
	if (!str) return 0;
	let chineseCount = 0;
	let englishCount = 0;

	for (let char of str) {
		if (isChineseChar(char)) {
			chineseCount++;
		} else {
			englishCount++;
		}
	}

	return {
		current: str.length,
		max: Math.max(20, 40), // 显示最大可能的字符数
		chineseCount,
		englishCount,
	};
};

// 截断字符串到指定长度
const truncateString = (str) => {
	let length = 0;
	let result = "";

	for (let char of str) {
		const charLength = isChineseChar(char) ? 1 : 0.5;
		if (length + charLength > 20) {
			break;
		}
		length += charLength;
		result += char;
	}

	return result;
};
