Mochi Code Rules

## 目录结构

/src/mochi/services/catService.js
/src/mochi/components/MochiCenterPanel.vue
/src/mochi/components/MochiLeftPanel.vue
/src/mochi/components/MochiRightPanel.vue

和 MochiCenterPanel 对应的：
/src/mochi/components/CenterPanel/PetDisplay.vue
/src/mochi/components/CenterPanel/ControlButtons.vue
/src/mochi/components/CenterPanel/ScreenBottomBar.vue
/src/mochi/components/CenterPanel/ScreenTopBar.vue

请检查以上目录结构里的文件，完成任务。

## 代码规则

用：import apiClient from "@/api"; 导入 apiClient。
用以下语法调用 API：

```js
try {
	const cat = await catService.getUserCat(userId.value);
	if (cat) {
		catId.value = cat._id;
		catState.value = cat;
		emit("cat-updated", cat);
	}
} catch (error) {
	showToast({
		message: "获取猫猫信息失败",
		type: "error",
		duration: 3000,
	});
}
```
