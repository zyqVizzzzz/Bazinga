import axios from "axios";
import router from "@/router";

// 创建 axios 实例
const apiClient = axios.create({
	// baseURL: import.meta.env.VITE_API_BASE_URL,
	baseURL: "/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// 请求拦截器
apiClient.interceptors.request.use(
	(config) => {
		// 可以在请求头中添加 Authorization token 等
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 响应拦截器
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		// 可以在这里处理错误，如未授权、网络问题等
		if (error.response && error.response.status === 401) {
			const currentRoute = router.currentRoute.value; // 获取当前路由
			// router.push({
			// 	path: "/login",
			// 	query: { redirect: currentRoute.fullPath },
			// });
		}
		return Promise.reject(error);
	}
);

export default apiClient;
