import { createI18n } from "vue-i18n";

const messages = {
	"zh-CN": {
		app: {
			lang: "zh-CN",
		},
		nav: {
			home: "首页",
			collections: "合辑",
			notes: "卡片",
			profile: "个人主页",
			login: "登录",
			signup: "注册",
		},
		home: {
			title: "Collections",
			subTitle: "合辑",
			devLog: "日志",
			more: "查看更多",
		},
		collections: {
			title: "书架",
			subTitle: "Bookshelf",
			create: "新增合辑",
		},
		collection: {
			continue: "继续上次进度",
			subTitle: "Bookshelf",
			create: "新增故事合辑",
		},
		collectionSetup: {
			createTitle: "创建合辑",
			updateTitle: "更新合辑",
			form: {
				title: "合辑名",
				titleDesc: "必填项",
				titleInput: "请输入合辑名",
				subTitle: "副标题",
				subTitleInput: "请输入副标题",
				description: "合辑简介",
				descriptionInput: "请输入合辑简介",
				banner: "封面图",
				bannerInput: "点击此处上传",
				themeColor: "主题色",
				level: "难度等级",
				levelInput: "请输入难度等级描述",
				seasons: "季/组",
				episodes: "集/文章",
				submit: "提交",
				delete: "删除合辑",
				deleteTips: "确认删除当前合辑?",
				deleteTips2: "此操作不可撤销",
				deleteConfirm: "确认",
				deleteCancel: "取消",
			},
		},
		login: {
			title: "登录",
			email: "邮箱",
			emailInput: "输入邮箱",
			password: "密码",
			passwordInput: "输入密码",
			submit: "登录",
			tips: "还没有账号?",
			tips2: "立即注册",
			error: "邮箱或密码有误，请重新登录",
		},
		signup: {
			title: "注册",
			email: "邮箱",
			emailInput: "输入邮箱",
			password: "密码",
			passwordInput: "输入密码",
			passwordRepeat: "确认密码",
			passwordRepeatInput: "再次输入密码",
			submit: "注册",
			tips: "已经有账户了?",
			tips2: "立即登录",
			error: "注册失败",
			success: "注册成功",
			verificationCode: "验证码",
			verificationCodeInput: "请输入验证码",
			sendCode: "发送验证码",
			emailRequired: "请输入邮箱地址",
			codeSent: "验证码已发送",
			sendCodeError: "验证码发送失败",
			codeRequired: "请输入验证码",
			passwordMismatch: "两次输入的密码不一致",
		},
		notes: {
			blindbox: "单词盲盒",
			starlist: "重点词汇",
			vocabulary: "全部单词",
			searchInput: "快速搜索",
			comment: "补充注释",
			commentInput: "请输入补充注释",
			submit: "提交注释",
			cancel: "取消编辑",
		},
		profile: {
			button_community: "加入社区",
			button_account: "账户设置",
			story_progress: "",
			word_progress: "",
			account_form: {
				save_account: "保存",
				cancel_account: "取消",
				email_input: "输入新邮箱地址",
				save_password: "保存",
				cancel_password: "取消",
				password_input: "输入当前密码",
				password_new_input: "输入新密码",
				password_confirm_input: "确认新密码",
			},
			change_password: "修改密码",
			story: {
				s_01: "目前已完成",
				s_02: "下一个节点在",
				s_03: "请继续前行",
			},
			vocabulary: {
				v_01: "词汇库数量",
				v_02: "词汇块处理",
			},
			nickname_tips: "请输入适当(...)数量的字符",
			sign_tips: "首先，最好不要输入很多字...其次，也没有必要输入很多字...",
			sign_submit: "保存",
			sign_cancel: "取消",
		},
	},
	"en-US": {
		app: {
			lang: "en-US",
		},
		nav: {
			home: "Home",
			collections: "Collections",
			notes: "Notes",
			profile: "Profile",
			login: "Login",
			signup: "Signup",
		},
		home: {
			title: "Collections",
			subTitle: "合辑(复数)",
			devLog: "PLAN_B",
			more: "More",
		},
		collections: {
			title: "Bookshelf",
			subTitle: "书架",
			create: "Create",
		},
		collection: {
			continue: "Continue",
			subTitle: "Bookshelf",
			create: "新增故事合辑",
		},
		collectionSetup: {
			createTitle: "Create Collection",
			updateTitle: "Update Collection",
			form: {
				title: "Title",
				titleDesc: "require",
				titleInput: "Please enter collection name",
				subTitle: "Subtitle",
				subTitleInput: "Please enter subtitle",
				description: "Description",
				descriptionInput: "Please enter collection description",
				banner: "Banner",
				bannerInput: "click to upload banner image",
				themeColor: "Theme Color",
				level: "Level",
				levelInput: "Please enter difficulty description",
				seasons: "Seasons",
				episodes: "Episodes",
				submit: "Submit",
				delete: "Delete Collection",
				deleteTips: "Confirm deletion of the current collection?",
				deleteTips2: "This action cannot be undone.",
				deleteTips_zh: "此操作不可撤销",
				deleteConfirm: "Confirm",
				deleteCancel: "Cancel",
			},
		},
		login: {
			title: "Login",
			email: "email",
			emailInput: "Please enter email",
			password: "password",
			passwordInput: "Please enter password",
			submit: "Login",
			tips: "No Account?",
			tips2: "Register Now!",
			error: "邮箱或密码有误，请重新登录",
		},
		signup: {
			title: "Signup",
			email: "email",
			emailInput: "Please enter email",
			password: "password",
			passwordInput: "Please enter password",
			passwordRepeat: "password confirm",
			passwordRepeatInput: "Please confirm password",
			submit: "Signup",
			tips: "Have Account?",
			tips2: "Login Now",
			error: "Registration failed",
			success: "Registration successful",
			verificationCode: "Verification Code",
			verificationCodeInput: "Please enter verification code",
			sendCode: "Send Code",
			emailRequired: "Please enter email address",
			codeSent: "Verification code sent",
			sendCodeError: "Failed to send verification code",
			codeRequired: "Please enter verification code",
			passwordMismatch: "Passwords do not match",
		},
		notes: {
			blindbox: "BlindBox",
			starlist: "StarList",
			vocabulary: "Vocabulary",
			searchInput: "Quick search...",
			comment: "Comment",
			commentInput: "Please enter comment",
			submit: "Submit",
			cancel: "Cancel",
		},
		profile: {
			button_community: "Join Community",
			button_account: "Account Setting",
			story_progress: "Episode Progress",
			word_progress: "Vocabulary Progress",
			account_form: {
				save_account: "Save",
				cancel_account: "Cancel",
				email_input: "Enter new email address",
				save_password: "Save",
				cancel_password: "Cancel",
				password_input: "Enter current password",
				password_new_input: "Enter new password",
				password_confirm_input: "Confirm new password",
			},
			change_password: "Change Password",
			story: {
				s_01: "Currently completed",
				s_02: "Next checkpoint at",
				s_03: "Please continue",
			},
			vocabulary: {
				v_01: "Vocabulary size",
				v_02: "Vocabulary block processing",
			},
			nickname_tips:
				"Theoretically, you can enter many characters, but only 50 characters will be uploaded, which is about 25 Chinese characters or 50 English letters... In practice, I recommend choosing a shorter name, preferably within 10 characters, as there is no line break processing here, and too many characters will exceed the card width... Of course, whatever, if you really want to do this...",
			sign_tips:
				"I know this is a weird interaction... You can still enter many characters here if you really want to... As you can see, it might block some things... but whatever... Although I don't recommend entering too many characters here, if you really want to do this...",
			sign_submit: "Save",
			sign_cancel: "Cancel",
		},
	},
};

export const i18n = createI18n({
	legacy: false, // 使用Composition API
	locale: localStorage.getItem("language") || "zh-CN", // 从本地存储读取默认语言
	fallbackLocale: "zh-CN", // 备用语言
	messages,
});
