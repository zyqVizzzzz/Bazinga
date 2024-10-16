/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [require("daisyui")],
	// daisyui: {
	// 	themes: [
	// 		{
	// 			mytheme: {
	// 				// primary: "#a991f7",
	// 				// secondary: "#d94219",
	// 				// accent: "#37cdbe",
	// 				// neutral: "#3d4451",
	// 				// accent: "#a1c4fd",
	// 				// neutral: "#f3f4f6",
	// 				// "base-100": "#ffffff",
	// 				// info: "#3abff8",
	// 				// success: "#36d399",
	// 				// warning: "#fbbd23",
	// 				// error: "#f87272",
	// 			},
	// 		},
	// 	],
	// },
};
