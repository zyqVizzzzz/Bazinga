import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import "./style.css";
import "./main.css"; // 引入 Tailwind CSS
import App from "./App.vue";
import router from "./router"; // 引入 Router

// 创建 Pinia 实例
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // 启用持久化插件

createApp(App).use(router).use(pinia).mount("#app");
