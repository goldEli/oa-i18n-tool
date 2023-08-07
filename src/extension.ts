import * as vscode from "vscode";
import * as babel from "@babel/core";
import type { NodePath, types } from "@babel/core";
import { containsChinese } from "./utils";

function transform(code: string): string {
  function autoOptionalPlugin() {
    return {
      visitor: {
        MemberExpression(path: NodePath<types.MemberExpression>) {
          const text = path.toString();

          path.replaceWithSourceString(text.replace(/\./g, "?."));
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
    () => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const selectedText = editor.document.getText(editor.selection);
        if (!containsChinese(selectedText)) {
          vscode.window.showInformationMessage("选中文本中不包含中文！");
		  return;
        }
        if (!selectedText) {
          return;
        }

        // editor.edit((builder) => {
        //   builder.replace(editor.selection, transform(selectedText));
        // });
        vscode.window.showInformationMessage("转换成功！");
      }
    }
  );

  context.subscriptions.push(transformCommand);
}
