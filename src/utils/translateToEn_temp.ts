// import axios from "axios";
import fetch from "node-fetch";
import { MD5 } from "./md5";
import * as vscode from "vscode";
// 使用示例
async function baiduTranslate(query: string): Promise<string> {
  const apiUrl = "http://api.fanyi.baidu.com/api/trans/vip/translate";

  var appid = "1111111";
  var key = "xxxxx";
  var salt = new Date().getTime();
  // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
  var from = "zh";
  var to = "en";
  var str1 = appid + query + salt + key;
  var sign = MD5(str1);
  const params = {
    q: query,
    appid: appid,
    salt: salt,
    from: from,
    to: to,
    sign: sign,
  };
  // 构建请求参数
  // const params = new URLSearchParams({
  //   q: query,
  //   from: fromLang,
  //   to: toLang,
  //   appid: apiKey,
  //   salt, // 随机数，用于生成签名
  // });

  // // 计算签名
  // const signStr = `${apiKey}${query}${params.get("salt")}${apiKey}`;
  // params.set("sign", new TextEncoder().encode(signStr).toString());
  const urlWithParams = new URL(apiUrl);
  Object.keys(params).forEach((key) =>
    // @ts-ignore
    urlWithParams.searchParams.append(key, params[key])
  );
  try {
    // 发送翻译请求
    const response = await fetch(urlWithParams);

    // 解析并返回结果
    const result = await response.json();
    console.log("----------result:", result);
    if ("trans_result" in result) {
      return result.trans_result[0].dst;
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error during translation request:", error);
    return "";
  }
}

const googleTanslate = async (content: string) => {
  console.log(typeof content, content);
  const url = "http://xxx";
  const data = {
    source_lang: "zh",
    target_lang: "en",
    content,
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = (await response.json()) as any;
    console.log("result", result);
    return result?.content ?? "";
  } catch (error) {
    console.error("翻译接口调用失败", error);
  }
  // try {
  //   const response = await axios({
  //     url: ,
  //     method: "post",
  //     headers: { "Content-Type": "application/json" },
  //     data: {
  //     },
  //   });

  //   return response.data.content ?? "";
  // } catch (error) {
  //   console.error(error);
  // }
};

export const translateToEn = async (content: string) => {
  const config = vscode.workspace.getConfiguration(
    "ifun-oa-i18n"
  ) 
  if (config.get("tranSource") === "google") {
    return googleTanslate(content);
  }
  return baiduTranslate(content);
};
