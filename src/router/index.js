import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Collections from "@/views/Collections.vue";
import Collection from "@/views/Collection.vue";

import Notebook from "@/views/Notebook.vue";
import Profile from "@/views/Profile2.vue";
import CardPreview from "@/views/CardPreview.vue";

import Login from "@/views/Login.vue";
import Signup from "@/views/Signup.vue";
import Membership from "@/views/Membership.vue";
import CardEditor from "@/views/CardEditor.vue";
import CollectionSetup from "@/views/CollectionSetup.vue";
import Test from "@/views/Test.vue";

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
	},
	{
		path: "/collections",
		name: "Collections",
		component: Collections,
	},
	{
		path: "/collections/:id",
		name: "Collection",
		component: Collection,
	},
	{
		path: "/setup-collection",
		name: "CollectionSetup",
		component: CollectionSetup,
	},
	{
		path: "/collections/:id/:season/:episode",
		name: "CardPreview",
		component: CardPreview,
	},
	{
		path: "/card-editor/:id/:season/:episode",
		name: "CardEditor",
		component: CardEditor,
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
