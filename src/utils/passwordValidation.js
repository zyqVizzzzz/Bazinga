import { ref, computed } from "vue";
import { required, minLength, helpers } from "@vuelidate/validators";

const passwordForm = ref({
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
});

// 自定义验证规则
const containsLower = (value) => /[a-z]/.test(value);
const containsUpper = (value) => /[A-Z]/.test(value);
const containsNumber = (value) => /[0-9]/.test(value);
const containsSpecial = (value) => /[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(value);

// 基本密码规则
const passwordRule = {
	required: helpers.withMessage("请输入密码", required),
	minLength: helpers.withMessage("密码长度不能小于8位", minLength(8)),
	containsLetter: helpers.withMessage(
		"密码必须包含字母",
		(value) => containsLower(value) || containsUpper(value)
	),
	containsNumber: helpers.withMessage("密码必须包含数字", containsNumber),
	containsSpecial: helpers.withMessage(
		"密码必须包含特殊字符（!@#$%^&*()-_=+[]{}|;:,.<>?）",
		containsSpecial
	),
	format: helpers.withMessage(
		"密码只能包含字母、数字和特殊字符（!@#$%^&*()-_=+[]{}|;:,.<>?）",
		(value) => /^[A-Za-z0-9!@#$%^&*()\-_=+[\]{}|;:,.<>?]*$/.test(value)
	),
};

// 密码复杂度评分（0-4分）
const calculatePasswordStrength = (password) => {
	if (!password) return 0;
	let score = 0;

	// 长度检查
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;

	// 字符类型检查
	if (containsLower(password) || containsUpper(password)) score++;
	if (containsNumber(password)) score++;
	if (containsSpecial(password)) score++;

	return Math.min(score, 4);
};

const getPasswordStrengthText = (score) => {
	const strengthTexts = ["弱", "一般", "中等", "强", "很强"];
	return strengthTexts[score];
};

const getPasswordStrengthColor = (score) => {
	const strengthColors = [
		"red-500",
		"orange-500",
		"yellow-500",
		"green-500",
		"green-700",
	];
	return strengthColors[score];
};

// 验证规则
const rules = computed(() => ({
	tempNickname: nicknameRule,
	tempSignature: signatureRule,
	currentPassword: {
		required: helpers.withMessage("请输入当前密码", required),
		minLength: helpers.withMessage("密码长度不能小于8位", minLength(8)),
	},
	newPassword: {
		...passwordRule,
		notSameAsOld: helpers.withMessage(
			"新密码不能与当前密码相同",
			(value) => value !== passwordForm.value.currentPassword || !value
		),
	},
	confirmPassword: {
		...passwordRule,
		sameAsPassword: helpers.withMessage(
			"两次输入的密码不一致",
			sameAs(computed(() => passwordForm.value.newPassword))
		),
	},
}));

export const passwordStrength = computed(() => {
	const score = calculatePasswordStrength(passwordForm.value.newPassword);
	return {
		score,
		text: getPasswordStrengthText(score),
		color: getPasswordStrengthColor(score),
	};
});
