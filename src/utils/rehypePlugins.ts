import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to wrap tables in a scrollable container.
 * Allows tables to scroll horizontally on small screens without
 * breaking their layout with display:block hacks.
 */
export function rehypeTableWrapper() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName === "table" && parent && typeof index === "number") {
        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-scroll-wrapper"] },
          children: [node],
        };
        (parent as Element).children[index] = wrapper;
      }
    });
  };
}

/**
 * Rehype plugin to style task list checkboxes with Daisy UI classes.
 */
export function rehypeTaskListCheckbox() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, _index, parent) => {
      if (
        node.tagName === "input" &&
        node.properties?.type === "checkbox" &&
        parent &&
        (parent as Element).tagName === "li"
      ) {
        const existingClass = node.properties.className;
        const classes: string[] = Array.isArray(existingClass)
          ? existingClass.filter((c): c is string => typeof c === "string")
          : typeof existingClass === "string"
            ? [existingClass]
            : [];

        node.properties.className = [...classes, "checkbox", "checkbox-primary", "checkbox-sm"];

        const parentElement = parent as Element;
        const parentClasses: string[] = Array.isArray(parentElement.properties?.className)
          ? (parentElement.properties.className as (string | number)[]).filter(
              (c): c is string => typeof c === "string",
            )
          : typeof parentElement.properties?.className === "string"
            ? [parentElement.properties.className]
            : [];

        parentElement.properties = parentElement.properties || {};
        if (!parentClasses.includes("task-list-item")) {
          parentElement.properties.className = [...parentClasses, "task-list-item"];
        }
      }
    });
  };
}
