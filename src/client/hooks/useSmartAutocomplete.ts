import { useEffect, useRef } from 'react';
import type * as Monaco from 'monaco-editor';

interface SmartAutocompleteConfig {
  enabled: boolean;
  aiSuggestions?: boolean;
}

// HTML/CSS/JS snippets and completions
const htmlSnippets = [
  {
    label: 'html5',
    kind: 27, // Snippet
    insertText: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${1:Document}</title>
</head>
<body>
    \${2}
</body>
</html>`,
    documentation: 'HTML5 boilerplate'
  },
  {
    label: 'div',
    kind: 27,
    insertText: '<div class="${1:className}">\n\t${2}\n</div>',
    documentation: 'Div element with class'
  },
  {
    label: 'button',
    kind: 27,
    insertText: '<button class="${1:className}" onclick="${2:handleClick}">\n\t${3:Button Text}\n</button>',
    documentation: 'Button element with onclick'
  },
  {
    label: 'input',
    kind: 27,
    insertText: '<input type="${1:text}" class="${2:className}" placeholder="${3:Enter text}" />',
    documentation: 'Input element'
  },
  {
    label: 'form',
    kind: 27,
    insertText: '<form onsubmit="${1:handleSubmit}">\n\t${2}\n</form>',
    documentation: 'Form element with onsubmit'
  }
];

const cssSnippets = [
  {
    label: 'flex-center',
    kind: 27,
    insertText: 'display: flex;\njustify-content: center;\nalign-items: center;',
    documentation: 'Flexbox center alignment'
  },
  {
    label: 'grid-auto',
    kind: 27,
    insertText: 'display: grid;\ngrid-template-columns: repeat(auto-fit, minmax(${1:250px}, 1fr));\ngap: ${2:1rem};',
    documentation: 'Responsive grid layout'
  },
  {
    label: 'transition-all',
    kind: 27,
    insertText: 'transition: all ${1:0.3s} ${2:ease};',
    documentation: 'Smooth transition'
  },
  {
    label: 'shadow-lg',
    kind: 27,
    insertText: 'box-shadow: 0 10px 25px rgba(0, 0, 0, 0.${1:1});',
    documentation: 'Large box shadow'
  }
];

const jsSnippets = [
  {
    label: 'fetch-api',
    kind: 27,
    insertText: `fetch('\${1:url}')
  .then(response => response.json())
  .then(data => {
    \${2:// Handle data}
  })
  .catch(error => {
    \${3:console.error('Error:', error);}
  });`,
    documentation: 'Fetch API with error handling'
  },
  {
    label: 'async-fetch',
    kind: 27,
    insertText: `async function \${1:fetchData}() {
  try {
    const response = await fetch('\${2:url}');
    const data = await response.json();
    \${3:// Handle data}
  } catch (error) {
    console.error('Error:', error);
  }
}`,
    documentation: 'Async/await fetch'
  },
  {
    label: 'addEventListener',
    kind: 27,
    insertText: `document.querySelector('\${1:selector}').addEventListener('\${2:click}', (event) => {
  \${3:// Handle event}
});`,
    documentation: 'Add event listener'
  },
  {
    label: 'create-element',
    kind: 27,
    insertText: `const \${1:element} = document.createElement('\${2:div}');
\${1:element}.className = '\${3:className}';
\${1:element}.textContent = '\${4:content}';
\${5:parent}.appendChild(\${1:element});`,
    documentation: 'Create and append DOM element'
  }
];

// Tailwind CSS class suggestions
const tailwindClasses = [
  // Layout
  'flex', 'inline-flex', 'grid', 'inline-grid', 'hidden', 'block', 'inline-block',
  // Flexbox
  'justify-center', 'justify-between', 'justify-around', 'items-center', 'items-start', 'items-end',
  // Spacing
  'p-4', 'px-4', 'py-4', 'pt-4', 'pr-4', 'pb-4', 'pl-4',
  'm-4', 'mx-4', 'my-4', 'mt-4', 'mr-4', 'mb-4', 'ml-4',
  'gap-4', 'space-x-4', 'space-y-4',
  // Sizing
  'w-full', 'w-1/2', 'w-screen', 'h-full', 'h-screen', 'max-w-lg', 'max-w-xl', 'max-w-2xl',
  // Colors
  'bg-white', 'bg-slate-800', 'bg-teal-500', 'text-white', 'text-slate-300',
  // Borders
  'border', 'border-2', 'border-slate-700', 'rounded', 'rounded-lg', 'rounded-full',
  // Typography
  'text-sm', 'text-base', 'text-lg', 'text-xl', 'font-bold', 'font-medium',
  // Effects
  'shadow', 'shadow-lg', 'hover:bg-slate-700', 'transition-colors'
];

export const useSmartAutocomplete = (
  editor: Monaco.editor.IStandaloneCodeEditor | null,
  monaco: typeof Monaco | null,
  config: SmartAutocompleteConfig = { enabled: true }
) => {
  const disposablesRef = useRef<Monaco.IDisposable[]>([]);

  useEffect(() => {
    if (!editor || !monaco || !config.enabled) return;

    // Clear previous disposables
    disposablesRef.current.forEach(d => d.dispose());
    disposablesRef.current = [];

    // Register HTML completion provider
    const htmlProvider = monaco.languages.registerCompletionItemProvider('html', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = htmlSnippets.map(snippet => ({
          ...snippet,
          range,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }));

        // Add Tailwind class suggestions for class attributes
        const lineContent = model.getLineContent(position.lineNumber);
        if (lineContent.includes('class="') || lineContent.includes("class='")) {
          const tailwindSuggestions = tailwindClasses.map(className => ({
            label: className,
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: className,
            range,
            documentation: `Tailwind CSS class: ${className}`
          }));
          suggestions.push(...tailwindSuggestions);
        }

        return { suggestions };
      }
    });

    // Register CSS completion provider
    const cssProvider = monaco.languages.registerCompletionItemProvider('css', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = cssSnippets.map(snippet => ({
          ...snippet,
          range,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }));

        return { suggestions };
      }
    });

    // Register JavaScript completion provider
    const jsProvider = monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = jsSnippets.map(snippet => ({
          ...snippet,
          range,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }));

        return { suggestions };
      }
    });

    // Register hover provider for documentation
    const hoverProvider = monaco.languages.registerHoverProvider('html', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const snippet = htmlSnippets.find(s => s.label === word.word);
        if (snippet && snippet.documentation) {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
            contents: [
              { value: `**${snippet.label}**` },
              { value: snippet.documentation }
            ]
          };
        }
        return null;
      }
    });

    disposablesRef.current.push(htmlProvider, cssProvider, jsProvider, hoverProvider);

    // Cleanup
    return () => {
      disposablesRef.current.forEach(d => d.dispose());
      disposablesRef.current = [];
    };
  }, [editor, monaco, config.enabled]);

  return {
    enabled: config.enabled,
    snippetsCount: htmlSnippets.length + cssSnippets.length + jsSnippets.length
  };
};
