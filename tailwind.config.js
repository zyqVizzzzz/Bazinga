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
					primary: "#3f51b5",
					secondary: "#e8447a",
					accent: "#5CC6BB",
					neutral: "#505665",
					"base-100": "#ffffff",
					milk: "#faf9cd",
				},
				extend: {
					boxShadow: {
						secondary: "0 4px 12px rgba(248, 82, 122, 0.3)", // 使用你的 secondary 颜色
					},
					zIndex: {
						100: "100",
						200: "200",
					},
				},
			},
		],
	},
};
