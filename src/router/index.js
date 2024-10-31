import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Notebook from "@/views/Notebook.vue";
import Category from "@/views/Category.vue";
import Lesson from "@/views/Lesson.vue";
import Profile from "@/views/Profile.vue";
import Login from "@/views/Login.vue";
import Signup from "@/views/Signup.vue";
import Membership from "@/views/Membership.vue";
import CardList from "@/views/CardList.vue";
import CardEdit from "@/views/CardEdit.vue";
import CardCreate from "@/views/CardCreate.vue";
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
		path: "/all-collections",
		name: "CardList",
		component: CardList,
	},
	{
		path: "/card-edit/:id/:season/:episode",
		name: "CardEdit",
		component: CardEdit,
	},
	{
		path: "/create-collection",
		name: "CardCreate",
		component: CardCreate,
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
		path: "/membership",
		name: "Membership",
		component: Membership,
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
