import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

export const Typography = {
  h1: {
    fontFamily,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.6,
  } as TextStyle,
  h2: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    letterSpacing: -0.4,
  } as TextStyle,
  h3: {
    fontFamily,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.2,
  } as TextStyle,
  body: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,
  bodyBold: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,
  captionBold: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  } as TextStyle,
  small: {
    fontFamily,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  } as TextStyle,
};
