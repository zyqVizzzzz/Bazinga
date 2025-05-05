<template>
	<div class="card-container">
		<div class="code-card">
			<div class="code-input">{{ betaCode }}</div>
			<div class="serial-number">{{ serialNumber }}</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "CodeCard",
	data() {
		return {
			betaCode: "12345678",
			serialNumber: "0123",
		};
	},
};
</script>

<style scoped>
.card-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	padding: 20px;
}

.code-card {
	width: 511px;
	height: 768px;
	position: relative;
	background-image: url("@/assets/code.png");
	background-size: cover;
	background-position: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.code-input {
	font-size: 64px;
	font-family: "Arial Black", "Impact", sans-serif;
	font-weight: 900;
	text-align: center;
	margin-top: 130px;
	color: #222;
	-webkit-text-stroke: 1px black;
	text-stroke: 1px black;
}

.serial-number {
	font-size: 42px;
	font-family: "Arial Black", "Impact", sans-serif;
	font-weight: 900;
	position: absolute;
	bottom: 150px;
	left: 0;
	width: 100%;
	text-align: center;
	color: #000;
}
</style>
