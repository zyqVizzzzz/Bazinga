import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue"; // 引入 Home 页面
import Lesson from "../views/Lesson.vue"; // 引入 Lesson 页面
import Notebook from "../views/Notebook.vue"; // 引入 Notebook 页面

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
	},
	{
		path: "/lesson/:id",
		name: "Lesson",
		component: Lesson,
	},
	{
		path: "/notebook",
		name: "Notebook",
		component: Notebook,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
