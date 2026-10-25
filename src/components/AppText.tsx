import React from 'react';
import {
  StyleSheet,
  Text as NativeText,
  type TextProps,
} from 'react-native';

export const APP_FONT_FAMILY = 'ScheherazadeNew';
const ARABIC_TEXT_SCALE = 0.95;

export default function AppText({ style, children, ...props }: TextProps) {
  const resolvedStyle = StyleSheet.flatten(style);
  const fontSize = resolvedStyle?.fontSize;
  const hasArabicText =
    typeof children === 'string' &&
    /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/i.test(children);

  return (
    <NativeText
      {...props}
      style={[
        style,
        hasArabicText
          ? [
              { fontFamily: APP_FONT_FAMILY },
              typeof fontSize === 'number'
                ? { fontSize: Math.max(Math.round(fontSize * ARABIC_TEXT_SCALE), 10) }
                : null,
            ]
          : null,
      ]}
    >
      {children}
    </NativeText>
  );
}
