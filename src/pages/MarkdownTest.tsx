import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

const MarkdownTest: React.FC = () => {
  const sampleMarkdown = `
# Markdown Test Page

This is a test page to demonstrate Markdown rendering capabilities.

## Text Formatting

**Bold text** and *italic text* can be used for emphasis.

Combined **bold and _italic_** formatting works too.

## Lists

### Unordered Lists
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered Lists
1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

## Code

Inline \`code\` can be used for short snippets.

\`\`\`javascript
// This is a code block with syntax highlighting
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('Meilisearch User');
\`\`\`

## Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.

## Tables

| Feature | Support |
|---------|---------|
| Tables | ✅ |
| Lists | ✅ |
| Code blocks | ✅ |
| Blockquotes | ✅ |

## Links

[Visit Meilisearch](https://docs.meilisearch.com/)

## Task Lists

- [x] Implement Markdown support
- [ ] Add more features
- [ ] Complete testing

## Horizontal Rule

---

## Mixed Content Example

Here's an example that combines multiple markdown features:

> **Important Note:**
> 
> When using Meilisearch, make sure to:
> 1. Set up proper indexing
> 2. Configure relevant search attributes
> 
> \`\`\`bash
> # Example command
> meilisearch --master-key="your_master_key"
> \`\`\`

That's it for the markdown test!
`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Markdown Test</h1>
        <Link to="/">
          <Button variant="outline">Back to Chat</Button>
        </Link>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "prose-headings:font-semibold prose-headings:tracking-tight",
          "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-p:leading-7 prose-p:my-4",
          "prose-li:my-1",
          "prose-code:rounded prose-code:bg-muted prose-code:p-1 prose-code:text-sm",
          "prose-pre:bg-muted prose-pre:rounded-md",
          "prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
          "prose-img:rounded-md prose-img:max-w-full",
          "prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-table:border prose-table:border-border",
          "prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted",
          "prose-td:border prose-td:border-border prose-td:p-2"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize, rehypeRaw]}
            components={{
              pre: ({ node, ...props }) => (
                <pre {...props} className="p-4 overflow-x-auto" />
              ),
              code: ({ node, inline, className, children, ...props }) => (
                inline ? 
                <code className={className} {...props}>{children}</code> :
                <code className={cn("block text-sm p-4", className)} {...props}>{children}</code>
              )
            }}
          >
            {sampleMarkdown}
          </ReactMarkdown>
        </div>
      </main>
    </div>
  );
};

export default MarkdownTest;