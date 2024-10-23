<template>
	<div></div>
</template>
<script setup>
// ios 模拟
const getArrayBuffer = () => {
	const hexString =
		"02 80 f7 ff fc ff 00 00 00 00 00 00 26 ed a8 03 c9 e3 43 ff a5 fd 4f 00 6c ed 8f 03 62 e3 3c ff bf fe 9a ff c0 ec 93 03 e1 e3 2d ff af ff 1b ff 39 eb c1 04 ed e3 02 ff 3f 00 89 fe 73 ea 34 05 fb e2 c8 fe 7e 00 e7 fd de e9 3c 05 a7 e1 a1 fe a6 00 68 fd 10 ea 1e 05 6d e0 9e fe a3 00 05 fd 2d ea 82 05 83 df a5 fe 6e 00 cc fc 5a ea a3 05 11 df 79 fe cf ff 99 fc 52 eb 8c 05 2e de 18 fe 33 ff 76 fc 84 eb d2 05 f0 dc c0 fd ba fe 64 fc d2 eb 77 05 9e db 7e fd 7a fe 2a fc 1d ec 4f 05 49 da 79 fd 72 fe dc fb 4e ec 0a 05 ff d8 9c fd 78 fe 88 fb d9 ec 3c 04 18 d8 e1 fd ac fe 37 fb da ed 7a 03 a5 d7 4a fe 0e ff f2 fa 2c ef 2c 03 e2 d7 d5 fe 5b ff a9 fa 14 f0 10 03 92 d8 7c ff 68 ff 4d fa 68 f0 a7 02 6b d9 16 00 55 ff e1 f9 22 f1 50 02 7a da 87 00 59 ff 7b f9 f5 f1 b9 01 d5 db df 00 98 ff 2c f9 23 f3 6e 01 15 dd 1f 01 d6 ff de f8 ff ec 94 03 b7 e3 6e ff d8 fc 81 01 2d f0 7e fe 78 e2 0d 00 73 00 6a 00 48 f0 9c fe 46 e2 0f 00 59 00 65 00 4f f0 8a fe 45 e2 16 00";
	const hexArray = hexString.split(" ").map((byte) => parseInt(byte, 16));
	const uint8Array = new Uint8Array(hexArray);

	const buffer = uint8Array.buffer;

	return buffer;
};

const getHexString = () => {
	const buffer = getArrayBuffer();
	const uint8Array = new Uint8Array(buffer);
	const flagIndex = uint8Array.findIndex((byte, index, arr) => {
		return (
			byte === 0x00 &&
			arr[index + 1] === 0x00 &&
			arr[index + 2] === 0x00 &&
			arr[index + 3] === 0x00 &&
			arr[index + 4] === 0x00 &&
			arr[index + 5] === 0x00
		);
	});

	// 如果找到标志
	if (flagIndex !== -1) {
		const firstPart = uint8Array.slice(0, 6);
		const flagPart = uint8Array.slice(flagIndex, flagIndex + 6);
		const secondPart = uint8Array.slice(flagIndex + 6, flagIndex + 18);

		const fullDataArray = new Uint8Array([
			...firstPart,
			...flagPart,
			...secondPart,
		]);

		const hexString = Array.from(fullDataArray)
			.map((byte) => byte.toString(16).padStart(2, "0"))
			.join(" ");

		console.log(`Hex String: ${hexString}`);
	}
};

// 安卓模拟
// 模拟安卓端数据传输，将数据拆分成多个块
const simulateAndroidDataTransmission = (callback) => {
	const chunks = [
		new Uint8Array([
			0x00, 0x80, 0xff, 0xff, 0xfe, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x8d, 0xfb, 0x0a, 0xff, 0xcc, 0xde, 0xec, 0xff,
		]), // 第一条数据
		new Uint8Array([
			0x16, 0x00, 0x14, 0x00, 0xa2, 0xfb, 0x2a, 0xff, 0xcf, 0xde, 0xed, 0xff,
			0x17, 0x00, 0x15, 0x00, 0x85, 0xfb, 0x08, 0xff,
		]), // 第二条数据
	];

	// 模拟逐块发送数据，每块间隔500ms
	chunks.forEach((chunk, index) => {
		setTimeout(() => {
			callback(chunk);
		}, index * 500);
	});
};

// 处理接收到的数据
const processChunk = (data) => {
	// 检查是否包含 00 00 00 00 00 00
	const hexString = Array.from(data)
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join(" ");
	if (hexString.includes("00 00 00 00 00 00")) {
		console.log("Processing Data:", hexString);
		// 在这里进行进一步处理，例如存储、解析或其他操作
	} else {
		console.log("Data does not contain '00 00 00 00 00 00', skipping.");
	}
};

// 模拟安卓端接收数据
simulateAndroidDataTransmission((data) => {
	processChunk(data);
});
</script>
