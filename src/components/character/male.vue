<template>
	<div>
		<canvas ref="canvasRef" width="500" height="500"></canvas>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const canvasRef = ref(null);

onMounted(() => {
	const canvas = canvasRef.value;
	const ctx = canvas.getContext("2d");

	// 背景
	ctx.fillStyle = "#f0f0f0";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// 恐龙身体（椭圆形状）
	ctx.beginPath();
	ctx.ellipse(250, 300, 100, 150, Math.PI / 2, 0, Math.PI * 2);
	ctx.fillStyle = "#66cc66"; // 绿色
	ctx.fill();
	ctx.strokeStyle = "#333"; // 边框颜色
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.closePath();

	// 恐龙头部（多边形）
	ctx.beginPath();
	ctx.moveTo(200, 180); // 起点
	ctx.lineTo(280, 180); // 顶部
	ctx.lineTo(320, 240); // 右下角
	ctx.lineTo(160, 240); // 左下角
	ctx.closePath();
	ctx.fillStyle = "#66cc66"; // 绿色
	ctx.fill();
	ctx.stroke();

	// 恐龙尾巴（三角形）
	ctx.beginPath();
	ctx.moveTo(350, 320);
	ctx.lineTo(400, 360);
	ctx.lineTo(350, 380);
	ctx.closePath();
	ctx.fillStyle = "#66cc66";
	ctx.fill();
	ctx.stroke();

	// 恐龙的背鳍（三角形，多个）
	ctx.beginPath();
	ctx.moveTo(200, 180);
	ctx.lineTo(220, 150);
	ctx.lineTo(240, 180);
	ctx.closePath();
	ctx.fillStyle = "#ffcc00";
	ctx.fill();
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(240, 160);
	ctx.lineTo(260, 130);
	ctx.lineTo(280, 160);
	ctx.closePath();
	ctx.fillStyle = "#ffcc00";
	ctx.fill();
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(280, 140);
	ctx.lineTo(300, 110);
	ctx.lineTo(320, 140);
	ctx.closePath();
	ctx.fillStyle = "#ffcc00";
	ctx.fill();
	ctx.stroke();

	// 恐龙腿（矩形）
	ctx.fillStyle = "#66cc66"; // 绿色
	ctx.fillRect(210, 350, 30, 60);
	ctx.fillRect(260, 350, 30, 60);
	ctx.strokeRect(210, 350, 30, 60);
	ctx.strokeRect(260, 350, 30, 60);

	// 恐龙爪子（三角形）
	ctx.beginPath();
	ctx.moveTo(210, 410); // 左腿爪子
	ctx.lineTo(220, 430);
	ctx.lineTo(230, 410);
	ctx.closePath();
	ctx.fillStyle = "#333";
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(260, 410); // 右腿爪子
	ctx.lineTo(270, 430);
	ctx.lineTo(280, 410);
	ctx.closePath();
	ctx.fillStyle = "#333";
	ctx.fill();

	// 恐龙眼睛（圆形）
	ctx.beginPath();
	ctx.arc(250, 210, 10, 0, Math.PI * 2, true); // 左眼
	ctx.fillStyle = "#fff";
	ctx.fill();
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(260, 210, 5, 0, Math.PI * 2, true); // 瞳孔
	ctx.fillStyle = "#000";
	ctx.fill();

	// 恐龙嘴巴（曲线）
	ctx.beginPath();
	ctx.moveTo(230, 240);
	ctx.quadraticCurveTo(250, 260, 270, 240); // 曲线嘴巴
	ctx.strokeStyle = "#333";
	ctx.lineWidth = 2;
	ctx.stroke();
});
</script>

<style scoped>
canvas {
	border: 1px solid #ccc;
	display: block;
	margin: 0 auto;
}
</style>
