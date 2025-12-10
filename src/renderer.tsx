import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CodeCraft Studio - IDE Conversationnel</title>
        <meta name="description" content="IDE conversationnel avec système multi-agents pour générer du code" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {import.meta.env.PROD ? (
          <>
            <script type="module" src="/static/client.js"></script>
            <link href="/static/style.css" rel="stylesheet" />
          </>
        ) : (
          <>
            <script type="module" src="/src/client/main.tsx"></script>
          </>
        )}
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  )
})
