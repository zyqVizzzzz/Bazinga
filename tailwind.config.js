/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: "#7A81D5", // 进一步提高饱和度的蓝色
					secondary: "#E64B94", // 进一步提高饱和度的粉色
					accent: "#5CC6BB", // 进一步提高饱和度的绿色
					neutral: "#505665", // 进一步提高饱和度的灰色
					"base-100": "#ffffff", // 浅灰白背景（保持不变）
					orange: "#E36A32", // 进一步提高饱和度的橙色
				},
				extend: {
					boxShadow: {
						secondary: "0 4px 12px rgba(230, 75, 148, 0.3)", // 使用你的 secondary 颜色
					},
				},
			},
		],
	},
};
