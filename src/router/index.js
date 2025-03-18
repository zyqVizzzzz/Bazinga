import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Collections from "@/views/Collections.vue";
import Collection from "@/views/Collection.vue";

import Notebook from "@/views/Notebook.vue";
import Profile from "@/views/Profile.vue";
import CardPreview from "@/views/CardPreview.vue";

import Login from "@/views/Login.vue";
import Signup from "@/views/Signup.vue";
import ForgotPassword from "@/views/ForgotPassword.vue";
import Membership from "@/views/Membership.vue";
import CardEditor from "@/views/CardEditor.vue";
import CardEditor2 from "@/views/CardEditorBackup.vue";
import CollectionSetup from "@/views/CollectionSetup.vue";
import Test from "@/views/Test.vue";
import GenPractice from "@/prompt/practice_prompt.vue";
import GenKnowledge from "@/prompt/knowledge_prompt.vue";
import GeneratePodcast from "@/prompt/generate_podcast.vue";
import GenerateInvitation from "@/prompt/generate_invitation.vue";

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
		path: "/reset-password",
		name: "ForgotPassword",
		component: ForgotPassword,
	},
	{
		path: "/membership",
		name: "Membership",
		component: Membership,
	},
	{
		path: "/purchase",
		name: "Purchase",
		component: () => import("@/views/Purchase.vue"),
		meta: {
			requiresAuth: true,
		},
	},
	{
		path: "/test",
		name: "Test",
		component: Test,
	},
	{
		path: "/gen_practice",
		name: "gen_practice",
		component: GenPractice,
	},
	{
		path: "/gen_knowledge",
		name: "gen_knowledge",
		component: GenKnowledge,
	},
	{
		path: "/generate-podcast",
		name: "generate-podcast",
		component: GeneratePodcast,
	},
	{
		path: "/generate-invitation",
		name: "generate-invitation",
		component: GenerateInvitation,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
