import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue"; // 引入 Home 页面
import Notebook from "../views/Notebook.vue"; // 引入 笔记本（Notebook） 页面
import Category from "../views/Category.vue"; // 引入 目录（Category） 页面
import Lesson from "../views/Lesson.vue"; // 引入 课程（Lesson） 页面
import Profile from "../views/Profile.vue"; // 引入 课程（Lesson） 页面
import Login from "@/views/Login.vue";

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
	},
	{
		path: "/Category/:id",
		name: "Category",
		component: Category,
	},
	{
		path: "/Category/:id/:season/:episode", // 根据季和集进入具体课程内容
		name: "Lesson",
		component: Lesson,
	},
	{
		path: "/notebook",
		name: "Notebook",
		component: Notebook,
	},
	{
		path: "/profile",
		name: "Profile",
		component: Profile,
	},
	{
		path: "/login",
		name: "Login",
		component: Login,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
