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

export const getCamelCaseString = (arr: string[]) => {
  // 使用正则表达式模式进行匹配
  const pattern = /^[A-Za-z]+$/;

  const str = arr
    .filter((item) => pattern.test(item))
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

export const getI18nPath = () => {
  // 根目录
  const rootPath = getRootPath().slice(3);
  // 国际化资源文件路径
  const enPath = path.join(rootPath, "/src/locals/en.json");
  const zhPath = path.join(rootPath, "/src/locals/zh.json");
  return {
    enPath,
    zhPath,
  };
};
