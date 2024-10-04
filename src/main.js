import { createApp } from "vue";
import "./style.css";
import "./main.css"; // 引入 Tailwind CSS
import App from "./App.vue";
import router from "./router"; // 引入 Router

createApp(App).use(router).mount("#app");
