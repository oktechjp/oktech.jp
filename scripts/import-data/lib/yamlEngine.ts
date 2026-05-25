import { parse, stringify } from "yaml";

export const yamlEngine = {
  parse: (str: string) => parse(str),
  stringify: (obj: unknown) =>
    stringify(obj, {
      defaultStringType: "PLAIN",
      defaultKeyType: "PLAIN",
      lineWidth: 0,
      doubleQuotedAsJSON: true,
      singleQuote: false,
    }),
};
