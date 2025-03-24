<template>
	<div class="user-agreement max-w-4xl mx-auto px-4 py-8">
		<!-- 标题 -->
		<div class="retro-title-box text-center mb-10">
			<h1 class="text-2xl font-bold">
				<div class="text-shadow-retro">
					<span><mark class="retro-highlight">用户协议</mark></span>
				</div>
			</h1>
		</div>

		<!-- 协议内容 -->
		<div class="prose prose-slate max-w-none">
			<div
				v-for="(section, index) in sections"
				:key="index"
				class="section mb-8"
			>
				<h2 class="text-lg font-bold mb-4 text-left px-4">
					{{ section.title }}
				</h2>
				<div class="section-content">
					<div
						v-for="(item, idx) in section.items"
						:key="idx"
						class="item mb-6"
					>
						<h3
							v-if="item.title"
							class="text-base font-semibold mb-2 text-left"
						>
							{{ item.title }}
						</h3>
						<div class="content" v-html="formatContent(item.content)"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { userAgreement } from "../constants/userAgreement";

const sections = ref(userAgreement);

// 格式化内容，处理列表和换行
const formatContent = (content) => {
	if (!content) return "";

	// 处理列表项
	let formattedContent = content.replace(/- ([^\n]+)/g, "<li>$1</li>");
	if (formattedContent.includes("<li>")) {
		formattedContent = `<ul class="list-disc pl-4">${formattedContent}</ul>`;
	}

	// 处理换行
	formattedContent = formattedContent.replace(/<br \/>/g, '<br class="my-2">');

	return formattedContent;
};
</script>

<style scoped>
.text-shadow-retro {
	text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2),
		-1px -1px 0 rgba(255, 255, 255, 0.2);
}

.retro-highlight {
	background: linear-gradient(
		transparent 60%,
		rgba(var(--secondary-color-rgb), 0.2) 40%
	);
	padding: 0 0.5rem;
	border-radius: 4px;
}

.user-agreement {
	font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.content {
	font-size: 0.875rem;
	white-space: pre-wrap;
	text-align: left;
}

.user-agreement :deep(strong) {
	font-weight: bold;
	color: var(--primary);
}

.user-agreement :deep(p) {
	line-height: 1.75;
}

.user-agreement :deep(ul) {
	margin-top: 1rem;
	margin-bottom: 1rem;
	padding-left: 1.5rem;
	list-style-type: disc;
}

.user-agreement :deep(li) {
	margin-top: 0.5rem;
	margin-bottom: 0.5rem;
}

.section-content {
	padding: 0 1rem;
}
</style>
