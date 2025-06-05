import { ref, onMounted, onUnmounted } from "vue";

// 断点配置
const breakpoints = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
};

export function useBreakpoint() {
	const windowWidth = ref(0);
	const isMobile = ref(false);
	const isTablet = ref(false);
	const isDesktop = ref(false);

	const updateBreakpoint = () => {
		windowWidth.value = window.innerWidth;
		isMobile.value = windowWidth.value < breakpoints.md; // < 768px
		isTablet.value =
			windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg; // 768px - 1024px
		isDesktop.value = windowWidth.value >= breakpoints.lg; // >= 1024px
	};

	onMounted(() => {
		updateBreakpoint();
		window.addEventListener("resize", updateBreakpoint);
	});

	onUnmounted(() => {
		window.removeEventListener("resize", updateBreakpoint);
	});

	return {
		windowWidth,
		isMobile,
		isTablet,
		isDesktop,
		// 便捷方法
		isSmallScreen: isMobile,
		isMediumScreen: isTablet,
		isLargeScreen: isDesktop,
	};
}

// 也可以导出一个简化版本，只检测是否为移动端
export function useMobile() {
	const { isMobile } = useBreakpoint();
	return { isMobile };
}
