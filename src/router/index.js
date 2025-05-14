import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{
		path: "/",
		name: "Home",
		component: () => import("@/views/Home.vue"),
	},
	{
		path: "/collections",
		name: "Collections",
		component: () => import("@/views/Collections.vue"),
	},
	{
		path: "/collections/:id",
		name: "Collection",
		component: () => import("@/views/Collection.vue"),
	},
	{
		path: "/setup-collection",
		name: "CollectionSetup",
		component: () => import("@/views/CollectionSetup.vue"),
	},
	{
		path: "/collections/:id/:season/:episode",
		name: "CardPreview",
		component: () => import("@/views/CardPreview.vue"),
	},
	{
		path: "/card-editor/:id/:season/:episode",
		name: "CardEditor",
		component: () => import("@/views/CardEditor.vue"),
	},
	{
		path: "/notebook",
		name: "Notebook",
		component: () => import("@/views/Notebook.vue"),
	},
	{
		path: "/profile",
		name: "Profile",
		component: () => import("@/views/Profile.vue"),
	},
	{
		path: "/login",
		name: "Login",
		component: () => import("@/views/Login.vue"),
	},
	{
		path: "/signup",
		name: "Signup",
		component: () => import("@/views/Signup.vue"),
	},
	{
		path: "/reset-password",
		name: "ForgotPassword",
		component: () => import("@/views/ForgotPassword.vue"),
	},
	{
		path: "/useragreement",
		name: "useragreement",
		component: () => import("@/layout/userAgreement.vue"),
	},
	{
		path: "/privacypolicy",
		name: "privacypolicy",
		component: () => import("@/layout/privacyPolicy.vue"),
	},
	{
		path: "/mochi",
		name: "Mochi",
		component: () => import("@/mochi/MochiView.vue"),
	},
	// {
	// 	path: "/test",
	// 	name: "Test",
	// 	component: () => import("@/views/Test.vue"),
	// },
	// {
	// 	path: "/gen_practice",
	// 	name: "gen_practice",
	// 	component: () => import("@/prompt/practice_prompt.vue"),
	// },
	// {
	// 	path: "/gen_knowledge",
	// 	name: "gen_knowledge",
	//  component: () => import("@/prompt/knowledge_prompt.vue"),
	// },
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
