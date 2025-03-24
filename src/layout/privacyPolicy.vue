<template>
	<div class="privacy-policy max-w-4xl mx-auto px-4 py-8">
		<!-- 标题 -->
		<div class="retro-title-box text-center mb-10">
			<h1 class="text-2xl font-bold">
				<div class="text-shadow-retro">
					<span><mark class="retro-highlight">隐私政策</mark></span>
				</div>
			</h1>
		</div>

		<!-- 目录 -->
		<div class="mb-8 px-4 text-left">
			<div class="mb-6">
				欢迎您使用 Bazinga
				英语学习平台。本平台由魔力多奇实验室（以下简称"我们"）开发及运营，致力于为用户提供
				AI
				辅助英语学习服务。我们高度重视用户隐私和个人信息保护，严格遵守相关法律法规。本政策将帮助您了解我们如何收集、使用和保护您的信息。
			</div>

			<h2 class="text-lg font-bold mb-4">目录</h2>
			<ul class="list-inside list-decimal space-y-2">
				<li>我们如何收集和使用您的信息</li>
				<li>我们如何共享、转让、公开披露您的个人信息</li>
				<li>我们如何保护和保存您的个人信息</li>
				<li>您如何管理个人信息</li>
				<li>未成年人信息保护</li>
				<li>通知和修订</li>
				<li>第三方服务声明</li>
				<li>我们的基本情况</li>
				<li>如何联系我们</li>
				<li>定义</li>
			</ul>

			<div class="mt-6">
				本隐私政策与您使用的英语学习平台及其功能密切相关。请您仔细阅读并理解本政策全部内容，特别是以下划线、加粗等方式标注的重要条款，以便做出适当的选择。您点击"同意"或进行类似操作，即表示同意我们按照本政策收集、使用您的个人信息。
			</div>

			<div class="mt-4 p-4 bg-base-200 rounded-lg">
				<strong>特别提示：</strong
				>我们严格保护您的个人信息，但在您使用第三方服务（如 AI
				服务提供商）时，需要注意区分第三方的信息收集行为及其隐私政策。
			</div>
		</div>

		<!-- 政策内容 -->
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
			<div class="section mb-8">
				<h2 class="text-lg font-bold mb-4 text-left px-4">十、定义</h2>
				<div class="section-content">
					<div class="item mb-6 content">
						“个人信息”：指以电子或者其他方式记录的能够单独或者与其他信息结合识别特定自然人身份或者反映特定自然人活动情况的各种信息。

						<div class="content">
							<div class="overflow-x-auto">
								<table class="table table-zebra w-full">
									<thead>
										<tr>
											<th colspan="2" class="text-center">个人信息举例</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td class="font-medium">个人基本信息</td>
											<td>
												个人姓名、生日、性别、联系地址、手机号码、电子邮箱等等
											</td>
										</tr>
										<tr>
											<td class="font-medium">个人身份信息</td>
											<td>身份证、人脸照片等</td>
										</tr>
										<tr>
											<td class="font-medium">网络身份标识信息</td>
											<td>系统账号、IP地址、邮箱地址等</td>
										</tr>
										<tr>
											<td class="font-medium">个人教育工作信息</td>
											<td>个人职业、工作单位、学历、学位等</td>
										</tr>
										<tr>
											<td class="font-medium">个人社保及财产信息</td>
											<td>
												银行账户及其他支付工具的账户信息、收入来源、收入水平、保单信息、服务记录、借款信息等
											</td>
										</tr>
										<tr>
											<td class="font-medium">联系人信息</td>
											<td>通讯录</td>
										</tr>
										<tr>
											<td class="font-medium">个人上网记录</td>
											<td>网站浏览记录、软件使用记录、点击记录</td>
										</tr>
										<tr>
											<td class="font-medium">个人常用设备信息</td>
											<td>
												国际移动设备标识、网络设备的物理地址、设备序列号、设备名称、设备品牌、设备机型、操作系统等
											</td>
										</tr>
										<tr>
											<td class="font-medium">个人位置信息</td>
											<td>地理位置信息、WIFI信息、基站信息等</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
					<div class="item mb-6 content">
						“个人敏感信息”：指一旦泄露、非法提供或滥用可能危害人身和财产安全，极易导致个人名誉、身心健康受到损害或歧视性待遇等的个人信息。
						<div class="content">
							<div class="overflow-x-auto">
								<table class="table table-zebra w-full">
									<thead>
										<tr>
											<th colspan="2" class="text-center">个人敏感信息举例</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td class="font-medium">个人身份信息</td>
											<td>身份证</td>
										</tr>
										<tr>
											<td class="font-medium">网络身份标识信息</td>
											<td>系统账号、IP地址、邮箱地址等</td>
										</tr>
										<tr>
											<td class="font-medium">个人财产信息</td>
											<td>
												银行账户及其他支付工具的账户信息、收入来源、收入水平、服务记录等
											</td>
										</tr>
										<tr>
											<td class="font-medium">其他信息</td>
											<td>
												通讯录、手机号码、网页浏览记录、精准定位信息、声纹特征
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { userAgreement as privacyPolicy } from "../constants/privacyPolicy";

const sections = ref(privacyPolicy);

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

.privacy-policy {
	font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.content {
	font-size: 0.875rem;
	white-space: pre-wrap;
	text-align: left;
}

.privacy-policy :deep(strong) {
	font-weight: bold;
	color: var(--primary);
}

.privacy-policy :deep(p) {
	line-height: 1.75;
}

.privacy-policy :deep(ul) {
	margin-top: 1rem;
	margin-bottom: 1rem;
	padding-left: 1.5rem;
	list-style-type: disc;
}

.privacy-policy :deep(li) {
	margin-top: 0.5rem;
	margin-bottom: 0.5rem;
}

.section-content {
	padding: 0 1rem;
}
</style>
