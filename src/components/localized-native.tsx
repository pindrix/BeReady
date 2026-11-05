import { forwardRef, type ComponentRef } from "react";
import {
  Alert as NativeAlert,
  Pressable as NativePressable,
  TextInput as NativeTextInput,
  type PressableProps,
  type TextInputProps,
} from "react-native";
import { translateText, isRTL } from "../i18n";
import { useLocale } from "./localized-text";
export const LocalizedPressable = forwardRef<
  ComponentRef<typeof NativePressable>,
  PressableProps & { translateLabel?: boolean }
>(function LocalizedPressable({ translateLabel = true, ...props }, ref) {
  useLocale();
  return (
    <NativePressable
      {...props}
      ref={ref}
      accessibilityLabel={
        props.accessibilityLabel
          ? translateLabel
            ? translateText(props.accessibilityLabel)
            : props.accessibilityLabel
          : undefined
      }
      accessibilityHint={
        props.accessibilityHint
          ? translateText(props.accessibilityHint)
          : undefined
      }
    />
  );
});
export const LocalizedTextInput = forwardRef<
  ComponentRef<typeof NativeTextInput>,
  TextInputProps
>(function LocalizedTextInput(props, ref) {
  const locale = useLocale();
  return (
    <NativeTextInput
      {...props}
      ref={ref}
      placeholder={
        props.placeholder ? translateText(props.placeholder) : undefined
      }
      accessibilityLabel={
        props.accessibilityLabel
          ? translateText(props.accessibilityLabel)
          : undefined
      }
      style={[
        isRTL(locale)
          ? { writingDirection: "rtl", textAlign: "right" }
          : undefined,
        props.style,
      ]}
    />
  );
});
export const LocalizedAlert = {
  alert(...args: Parameters<typeof NativeAlert.alert>) {
    const [title, message, buttons, options] = args;
    const localized: Parameters<typeof NativeAlert.alert> = [
      translateText(title ?? ""),
      message ? translateText(message) : message,
      buttons?.map((b) => ({
        ...b,
        text: b.text ? translateText(b.text) : b.text,
      })),
      options,
    ];
    NativeAlert.alert(
      ...(localized.slice(0, args.length) as Parameters<
        typeof NativeAlert.alert
      >),
    );
  },
};
