import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Notebook from "@/views/Notebook.vue";
import Category from "@/views/Category.vue";
import Lesson from "@/views/Lesson.vue";
import Profile from "@/views/Profile.vue";
import Login from "@/views/Login.vue";
import Signup from "@/views/Signup.vue";
import Test from "@/views/Test.vue";

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
	},
	{
		path: "/category/:id",
		name: "Category",
		component: Category,
	},
	{
		path: "/category/:id/:season/:episode", // 根据季和集进入具体课程内容
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
	{
		path: "/signup",
		name: "Signup",
		component: Signup,
	},
	{
		path: "/test",
		name: "Test",
		component: Test,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
