import { prefixes } from "./prefixes";
import { suffixes } from "./suffixes";
import { roots } from "./roots";

export function getDefinitions(word) {
	// 初始拆解结果
	let result = {
		prefix: "",
		root: "",
		suffix: "",
	};

	// 匹配前缀
	for (let prefixObj of prefixes) {
		if (word.startsWith(prefixObj.prefix)) {
			result.prefix = prefixObj.prefix;
			word = word.slice(result.prefix.length); // 去除前缀部分
			break;
		}
	}

	// 匹配后缀
	for (let suffixObj of suffixes) {
		if (word.endsWith(suffixObj.suffix)) {
			result.suffix = suffixObj.suffix;
			word = word.slice(0, -result.suffix.length); // 去除后缀部分
			break;
		}
	}

	// 尝试匹配词根
	const rootObj = roots.find((r) => word.startsWith(r.root));
	if (rootObj) {
		// 匹配到词根
		result.root = rootObj.root;
		word = word.slice(result.root.length); // 去除词根部分
	} else {
		// 如果没有匹配到词根，剩余部分就是词根
		result.root = word;
	}

	// 获取定义
	const prefixDefinition =
		prefixes.find((p) => p.prefix === result.prefix)?.definition || "";
	const suffixDefinition =
		suffixes.find((s) => s.suffix === result.suffix)?.definition || "";
	const rootDefinition =
		roots.find((r) => r.root === result.root)?.definition || "";

	// 拼接拆解的单词形式
	let decomposedWord = "";
	if (result.prefix) {
		decomposedWord += result.prefix + "-"; // 前缀后面加 "-"
	}
	decomposedWord += result.root; // 添加词根部分
	if (result.suffix) {
		decomposedWord += "-" + result.suffix; // 后缀前面加 "-"
	}

	return {
		prefix: result.prefix,
		prefixMeaning: prefixDefinition,
		root: result.root,
		meaning: rootDefinition,
		suffix: result.suffix,
		suffixMeaning: suffixDefinition,
		decomposedWord: decomposedWord, // 返回拆解版单词
	};
}
