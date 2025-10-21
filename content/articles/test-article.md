---
title: "Complete Markdown Style Test"
description: "A comprehensive test of all markdown elements and typography styles"
keywords: ["markdown", "typography", "test", "style guide"]
---

# Heading Level 1

## Heading Level 2

### Heading Level 3

#### Heading Level 4

##### Heading Level 5

###### Heading Level 6

## Paragraph Text

This is a regular paragraph with **bold text**, *italic text*, and ***bold italic text***. You can also use _underscores for italics_ and __double underscores for bold__. Here's some ~~strikethrough text~~ as well.

This is a second paragraph to demonstrate spacing between paragraphs. It includes `inline code` and a [regular link](https://example.com) as well as an [internal link](/about).

## Emphasis and Text Formatting

- **Bold text using asterisks**
- __Bold text using underscores__
- *Italic text using asterisks*
- _Italic text using underscores_
- ***Bold and italic combined***
- ~~Strikethrough text~~
- `Inline code with backticks`
- <mark>Highlighted text</mark>

## Japanese Text Testing

これは日本語のテストパラグラフです。**太字のテキスト**、*イタリック体*、そして`インラインコード`を含んでいます。

漢字、ひらがな、カタカナ、そして英語の混在テスト: 今日はとても良い天気です。Let's go to カフェ for some coffee!

## Lists

### Unordered List

- First level item
- Another first level item
  - Second level item
  - Another second level item
    - Third level item
    - Another third level item
- Back to first level

### Ordered List

1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item
   1. Nested item 3.1
      1. Deep nested 3.1.1
      2. Deep nested 3.1.2
4. Fourth item

### Mixed List

1. First ordered item
   - Unordered sub-item
   - Another unordered sub-item
2. Second ordered item
   1. Ordered sub-item
   2. Another ordered sub-item
      - Mixed nesting

### Task List

- [x] Completed task
- [ ] Uncompleted task
- [x] Another completed task
  - [ ] Nested uncompleted task
  - [x] Nested completed task

## Blockquotes

> This is a simple blockquote. It can contain **bold**, *italic*, and `code`.

> This is a multi-line blockquote.
> It continues on the next line.
> 
> And even has multiple paragraphs.

> Nested blockquotes are also possible.
>> This is a nested quote.
>>> And this is triple nested.

## Code Blocks

### JavaScript

```javascript
// JavaScript code with syntax highlighting
function greetUser(name) {
  const message = `Hello, ${name}!`;
  return message;
}

const result = greetUser("World");
```

### Python

```python
# Python code example
def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    fib_sequence = [0, 1]
    for i in range(2, n):
        fib_sequence.append(fib_sequence[-1] + fib_sequence[-2])
    return fib_sequence

print(fibonacci(10))
```

### Shell

```bash
# Shell commands
npm install @fontsource/noto-sans-jp
echo "Testing monospace font"
ls -la /usr/local/bin
```

### JSON

```json
{
  "name": "test-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Tables

### Basic Table

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
| Cell 7   | Cell 8   | Cell 9   |

### Aligned Table

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
| Lorem        | Ipsum          | Dolor         |
| 123          | 456            | 789           |

### Complex Table with Formatting

| Feature | Description | Status | Priority |
|---------|-------------|--------|----------|
| **Bold** | Text in bold | ✅ Complete | High |
| *Italic* | Text in italics | ⏳ In Progress | Medium |
| `Code` | Inline code | ❌ Not Started | Low |
| [Link](#) | Clickable link | ✅ Complete | High |

## Horizontal Rules

---

Three hyphens

***

Three asterisks

___

Three underscores

## Links and References

- [External link](https://github.com)
- [Internal link](/articles)
- [Link with title](https://example.com "This is a title")
- [Reference link][ref1]
- [Another reference][ref2]
- Autolink: <https://example.com>
- Email: <email@example.com>

[ref1]: https://reference1.com "Reference 1"
[ref2]: https://reference2.com "Reference 2"

## Images

![Alt text for image](https://via.placeholder.com/600x400 "Optional title")

![Small image](https://via.placeholder.com/150x150)

## HTML Elements

<details>
<summary>Click to expand</summary>

This is hidden content that can be toggled.
- It can contain lists
- **Bold text**
- `Code blocks`

</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd> to copy

<sup>Superscript</sup> and <sub>Subscript</sub> text

## Mathematical Expressions

Inline math: $E = mc^2$

Block math:

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

## Footnotes

Here's a sentence with a footnote[^1].

This is another sentence with a different footnote[^2].

[^1]: This is the first footnote.
[^2]: This is the second footnote with **formatting**.

## Definition Lists

Term 1
: Definition for term 1

Term 2
: Definition for term 2
: Alternative definition for term 2

## Abbreviations

HTML is great for web development.
CSS makes things pretty.

*[HTML]: HyperText Markup Language
*[CSS]: Cascading Style Sheets

## Emoji Support

🎉 Celebration emoji
🚀 Rocket emoji
💻 Computer emoji
🌸 Sakura emoji for Japanese context

## Edge Cases and Special Characters

Special characters: & < > " ' © ® ™ € ¥ £ ¢

Escaping: \*not italic\* \[not a link\] \`not code\`

Very long word: supercalifragilisticexpialidocious

Very long URL: https://example.com/very/long/path/to/resource/that/might/break/layout/in/some/cases/test.html

## Nested Elements

> ### Quote with heading
> 
> This quote contains:
> - A list item
> - Another item with **bold**
> 
> ```javascript
> // Code inside a quote
> alert("Hello");
> ```
> 
> | Table | In Quote |
> |-------|----------|
> | Yes   | It works |

## Unicode and Special Scripts

Arabic: مرحبا بالعالم
Hebrew: שלום עולם
Chinese: 你好世界
Korean: 안녕하세요
Russian: Привет мир
Greek: Γεια σου κόσμο

## Final Typography Test

The quick brown fox jumps over the lazy dog. THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG. 1234567890

いろはにほへと ちりぬるを わかよたれそ つねならむ うゐのおくやま けふこえて あさきゆめみし ゑひもせす
