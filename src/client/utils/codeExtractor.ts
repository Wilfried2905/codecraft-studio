/**
 * Extract code from AI response (markdown code blocks or raw HTML)
 */
export function extractCode(text: string): string | null {
  // Try to extract HTML from markdown code block
  const htmlMatch = text.match(/```html\n([\s\S]*?)\n```/)
  if (htmlMatch) {
    return htmlMatch[1].trim()
  }
  
  // Try generic code block
  const codeMatch = text.match(/```\n([\s\S]*?)\n```/)
  if (codeMatch) {
    return codeMatch[1].trim()
  }
  
  // Check if entire response is HTML
  if (text.includes('<!DOCTYPE') || text.includes('<html')) {
    return text.trim()
  }
  
  // No code found
  return null
}

/**
 * Extract separate HTML, CSS, and JS from a single HTML file
 */
export function extractSeparatedCode(html: string): {
  html: string
  css: string
  js: string
} {
  let css = ''
  let js = ''
  
  // Extract CSS from <style> tags
  const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)
  if (styleMatches) {
    css = styleMatches
      .map(s => s.replace(/<\/?style[^>]*>/g, ''))
      .join('\n\n')
  }
  
  // Extract JS from <script> tags
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)
  if (scriptMatches) {
    js = scriptMatches
      .map(s => s.replace(/<\/?script[^>]*>/g, ''))
      .join('\n\n')
  }
  
  // Clean HTML (remove style and script tags, replace with links)
  let cleanHtml = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="style.css">')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '<script src="script.js"></script>')
  
  return { html: cleanHtml, css, js }
}

/**
 * Validate if string is valid HTML
 */
export function isValidHTML(str: string): boolean {
  const parser = new DOMParser()
  const doc = parser.parseFromString(str, 'text/html')
  return !doc.querySelector('parsererror')
}

/**
 * Minify HTML (basic)
 */
export function minifyHTML(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim()
}
