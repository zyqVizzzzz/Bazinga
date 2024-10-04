import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// 引入 Tailwind CSS 相关插件
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	css: {
		postcss: {
			plugins: [tailwindcss, autoprefixer],
		},
	},
});
