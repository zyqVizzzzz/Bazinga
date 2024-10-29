// 引入 crypto-js
import CryptoJS from "crypto-js";

// 32 字节的密钥（与后端一致）
const encryptionKey = CryptoJS.enc.Utf8.parse(import.meta.env.VITE_SCRIPT_KEY);

// 加密函数
export const encryptUrl = (url) => {
	const encrypted = CryptoJS.AES.encrypt(url, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	});
	return encrypted.toString();
};

// 解密函数（前端）
export const decryptUrl = (encryptedData) => {
	try {
		// 分离 IV 和加密内容
		const [ivHex, encryptedText] = encryptedData.split(":");
		console.log("IV:", ivHex, "Encrypted Text:", encryptedText); // 调试日志

		// 将 IV 和密钥转换为 CryptoJS 可读格式
		const iv = CryptoJS.enc.Hex.parse(ivHex);
		const key = CryptoJS.enc.Hex.parse(
			"5de158850f43521b4c6a272ec144ace793dd8948ae42357d8a83f2bf66ad5c45"
		);

		// 使用 AES 解密
		const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
			iv: iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7,
		});

		// 解密后的数据转换为 UTF-8 字符串
		const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

		if (!decryptedText) {
			throw new Error("Failed to parse decrypted text.");
		}

		console.log("Decrypted Text:", decryptedText);
		return decryptedText;
	} catch (error) {
		console.error("Decryption error:", error);
		throw error;
	}
};
