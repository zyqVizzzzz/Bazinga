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
