export function containsChinese(text: string): boolean {
  const pattern = /[\u4e00-\u9fa5]/; // 匹配中文字符的正则表达式
  return pattern.test(text);
}
