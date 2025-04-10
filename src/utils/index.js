import md5 from "md5"; // 需要安装 md5 包

export const hexToRgba = (hex, alpha) => {
	let r = parseInt(hex.slice(1, 3), 16);
	let g = parseInt(hex.slice(3, 5), 16);
	let b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const formatNumber = (num) => {
	return num < 10 ? `0${num}` : num.toString();
};

export const generateTextHash = (text) => {
	return md5(text.trim().toLowerCase());
};

const UserRole = {
	GUEST: "guest",
	FREE_USER: "free_user",
	PREMIUM_USER: "premium_user",
};

const AuthType = {
	PUBLIC: "public",
	FREE: "free",
	PREMIUM: "premium",
	PRIVATE: "private",
};

export const canAccessResource = (
	userRole,
	authType,
	userId,
	resourceOwnerId
) => {
	// 如果是资源拥有者，允许访问
	if (userId && resourceOwnerId && userId === resourceOwnerId) {
		return true;
	}

	// 根据用户角色和资源类型判断权限
	switch (userRole) {
		case UserRole.PREMIUM_USER:
			return [AuthType.PUBLIC, AuthType.FREE, AuthType.PREMIUM].includes(
				authType
			);
		case UserRole.FREE_USER:
			return [AuthType.PUBLIC, AuthType.FREE].includes(authType);
		case UserRole.GUEST:
			return authType === AuthType.PUBLIC;
		default:
			return false;
	}
};

// 中文检测
export const isChinese = (text) => {
	// 检查是否包含中文字符
	const hasChinese = /[\u4e00-\u9fa5]/.test(text);

	// 检查是否只包含中文字符、标点符号和空白字符
	const onlyChineseAndPunctuation =
		/^[\u4e00-\u9fa5\s，。！？、：；""''（）【】《》…—]+$/u.test(text);

	// 只有当文本中包含中文且不包含英文字母、数字等非中文内容时，才认为是纯中文
	return hasChinese && onlyChineseAndPunctuation;
};
