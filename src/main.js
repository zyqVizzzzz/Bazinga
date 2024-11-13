import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { i18n } from "./i18n";

import "./style.css";
import "./main.css"; // Tailwind CSS
import "bootstrap-icons/font/bootstrap-icons.css";
import App from "./App.vue";
import router from "./router";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App).use(router).use(pinia).use(i18n).mount("#app");
