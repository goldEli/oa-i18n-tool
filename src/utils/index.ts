import * as vscode from "vscode";
import * as fs from "fs";
// import axios from "axios";
import { translateToEn } from "./translateToEn";
import path = require("path");

export function containsChinese(text: string): boolean {
  const pattern = /[\u4e00-\u9fa5]/; // 匹配中文字符的正则表达式
  return pattern.test(text);
}

export function getRootPath(): string {
  let rootPath = "";
  if (vscode.workspace.workspaceFolders !== undefined) {
    let wf = vscode.workspace.workspaceFolders[0].uri.path;
    let f = vscode.workspace.workspaceFolders[0].uri.fsPath;

    rootPath = wf;
  }
  return rootPath;
}

export function readJSONFile(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}
function removeSpecialCharacters(inputString: string): string {
  // 使用正则表达式匹配非字母和非数字的字符，并替换为空字符串
  return inputString.replace(/[^a-zA-Z0-9]/g, "");
}

function replaceSpecialCharacters(inputString: string): string {
  // 使用正则表达式匹配非字母和非数字的字符，并替换为空字符串
  // return inputString.replace(/(/g, "");
  const ret = inputString
    .replace(/（/g, "zlp")
    .replace(/）/g, "zrp")
    .replace(/\(/g, "lp")
    .replace(/\)/g, "rp")
    .replace(/{/g, "lb")
    .replace(/}/g, "rb")
    .replace(/\[/g, "lsb")
    .replace(/\]/g, "rsb")
    .replace(/【/g, "zlsb")
    .replace(/】/g, "zrsb")
    .replace(/;/g, "semicolon")
    .replace(/；/g, "zsemicolon")
    .replace(/,/g, "comma")
    .replace(/，/g, "zcomma")
    .replace(/:/g, "colon")
    .replace(/\//g, "slash")
    .replace(/\\/g, "backslash")
    .replace(/、/g, "zslash")
    .replace(/\?/g, "qmark")
    .replace(/？/g, "zqmark")
    .replace(/：/g, "zcolon");

  // colon comma semicolon
  return ret;
}

export const getCamelCaseString = (arr: string[]) => {
  const str = arr
    .map((item) => replaceSpecialCharacters(item))
    .map((item) => removeSpecialCharacters(item))
    .filter((item) => !!item)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  return str.charAt(0).toLowerCase() + str.slice(1);
};

const capitalize = (str: string) => {
  let ret = "";
  try {
    ret = str.charAt(0).toUpperCase() + str.slice(1);
  } catch (error) {
    console.log("ret:", str, error);
  }
  return ret;
};

export const createI18n = async (str: string) => {
  const objZh: Record<string, string> = {};
  const objEn: Record<string, string> = {};
  const en = await translateToEn(str);
  if (!en) {
    vscode.window.showInformationMessage("翻译接口报错！");
  }
  const key = getCamelCaseString(en?.split(" ") ?? []);
  objZh[key] = str;
  objEn[key] = capitalize(en);
  return {
    key,
    objZh,
    objEn,
  };
};

export const handleSelectedText = (str: string) => {
  let temp = str;
  const first = temp.at(0) ?? "";
  const last = temp.at(-1) ?? "";
  if (['"', "'", "`"].includes(first)) {
    temp = temp.slice(1);
  }
  if (['"', "'", "`"].includes(last)) {
    temp = temp.slice(0, -1);
  }

  return temp;
};

export function addContentToJsonFile(
  filePath: string,
  jsonData: any,
  addJsonData: any
): void {
  try {
    // 合并新的内容
    const updatedData = { ...jsonData, ...addJsonData };

    // 将内容写入 JSON 文件
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));

    console.log("成功向JSON文件添加内容");
  } catch (error) {
    console.error("无法添加内容到JSON文件:", error);
  }
}

function configFileExists(filePath: string) {
  try {
    // 使用 fs.existsSync 检查文件是否存在
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    // 如果出现错误，说明文件不存在
    return false;
  }
}
function getValueByKey(filePath: string, key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // 读取 JSON 文件
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        // 将文件内容解析为 JSON 对象
        const jsonData = JSON.parse(data);

        // 获取指定 key 的 value
        const value = jsonData[key];
        resolve(value);
      } catch (jsonError) {
        reject(jsonError);
      }
    });
  });
}

export const getI18nPath = async () => {
  // 根目录
  const rootPath = getRootPath().slice(3);
  const configPath = path.resolve(rootPath, "./.ifun-oa-i18n.json");

  if (configFileExists(configPath)) {
    const value = await getValueByKey(configPath, "ifun-oa-i18n.url");

    const ret = {
      enPath: path.join(rootPath, value?.enPath),
      zhPath: path.join(rootPath, value?.zhPath),
    };
    console.log("配置地址", ret);
    return ret;
  }

  const document = vscode.window.activeTextEditor?.document;
  const resource = document
    ? { uri: document.uri, languageId: document.languageId }
    : undefined;
  const configuration = vscode.workspace.getConfiguration(
    "ifun-oa-i18n.url",
    resource
  ) as any;
  const { enPath, zhPath } = configuration;
  // 国际化资源文件路径
  return {
    enPath: enPath ?? path.join(rootPath, "/src/locals/en.json"),
    zhPath: zhPath ?? path.join(rootPath, "/src/locals/zh.json"),
  };
};
