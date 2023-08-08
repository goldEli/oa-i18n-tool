import * as vscode from "vscode";
import * as babel from "@babel/core";
import type { NodePath, types } from "@babel/core";
import {
  addContentToJsonFile,
  containsChinese,
  createI18n,
  getI18nPath,
  getRootPath,
  handleSelectedText,
  readJSONFile,
} from "./utils";
import path = require("path");
import { error } from "console";

function transform(code: string): string {
  function autoOptionalPlugin() {
    return {
      visitor: {
        Literal(path: NodePath<types.MemberExpression>) {
          const text = path.toString();
          console.log(text);
          debugger;
          // path.replaceWithSourceString(text.replace(/\./g, "?."));
        },
        Identifier(path: NodePath<types.MemberExpression>) {
          const text = path.toString();
          console.log(text);
          debugger;
          // path.replaceWithSourceString(text.replace(/\./g, "?."));
        },
        ExpressionStatement(path: NodePath<types.MemberExpression>) {
          const text = path.toString();
          console.log(text);
          debugger;
          // path.replaceWithSourceString(text.replace(/\./g, "?."));
        },
      },
    };
  }

  const res = babel.transformSync(code, {
    plugins: [autoOptionalPlugin],
  });

  return res?.code || "";
}

export function activate(context: vscode.ExtensionContext) {
  const transformCommand = vscode.commands.registerCommand(
    "i18nReplace",
    async () => {
      const editor = vscode.window.activeTextEditor;

      const { enPath, zhPath } = getI18nPath();

      const enObj = await readJSONFile(enPath);
      const zhObj = await readJSONFile(zhPath);

      if (editor) {
        const selectedText = editor.document.getText(editor.selection);

        if (!containsChinese(selectedText)) {
          vscode.window.showInformationMessage("选中文本中不包含中文！");
          return;
        }
        if (!selectedText) {
          return;
        }
        const text = handleSelectedText(selectedText);
        const {
          key,
          objEn: addObjEn,
          objZh: addObjZh,
        } = await createI18n(text);
        editor.edit((builder) => {
          builder.replace(editor.selection, `t('${key}')`);
        });

        // 如果 key 不存在对应的国际化直接替换，生成资源文件
        if (!zhObj[key]) {
          addContentToJsonFile(zhPath, zhObj, addObjZh);
          addContentToJsonFile(enPath, enObj, addObjEn);
        }

        vscode.window.showInformationMessage(
          "执行成功：" + JSON.stringify(addObjEn) + JSON.stringify(addObjZh)
        );
        // editor.edit((builder) => {
        //   builder.replace(editor.selection, transform(selectedText));
        // });
      }
    }
  );

  context.subscriptions.push(transformCommand);
}
