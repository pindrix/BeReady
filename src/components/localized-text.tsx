import {
  Children,
  isValidElement,
  type ReactNode,
  useSyncExternalStore,
} from "react";
import { Text as NativeText, type TextProps } from "react-native";
import { getLocale, isRTL, subscribeLocale, translateText } from "../i18n";
export function useLocale() {
  return useSyncExternalStore(subscribeLocale, getLocale, getLocale);
}
function translateChildren(children: ReactNode, rtl: boolean): ReactNode {
  const result: ReactNode[] = [];
  let chunk = "";
  const flush = () => {
    if (chunk) {
      const translated = translateText(chunk);
      result.push(
        rtl
          ? translated.replace(/([\p{N}]+\s*\/\s*[\p{N}]+)/gu, "\u2066$1\u2069")
          : translated,
      );
      chunk = "";
    }
  };
  for (const child of Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number")
      chunk += String(child);
    else {
      flush();
      result.push(isValidElement(child) ? child : child);
    }
  }
  flush();
  return result;
}
export function LocalizedText({
  children,
  translate = true,
  style,
  ...props
}: TextProps & { translate?: boolean }) {
  const locale = useLocale(),
    rtl = isRTL(locale);
  return (
    <NativeText
      {...props}
      style={[
        rtl
          ? { writingDirection: "rtl", textAlign: "right" }
          : { writingDirection: "ltr" },
        style,
      ]}
    >
      {translate ? translateChildren(children, rtl) : children}
    </NativeText>
  );
}
export { LocalizedText as Text };
