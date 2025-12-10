/**
 * Code Validator - Valide et sanitize le code généré
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: string;
}

/**
 * Valide du code HTML
 */
export function validateHTML(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if code is not empty
  if (!code || code.trim().length === 0) {
    errors.push('Le code généré est vide');
    return { isValid: false, errors, warnings };
  }

  // Check for basic HTML structure
  if (!code.includes('<html')) {
    warnings.push('Pas de balise <html> détectée');
  }

  if (!code.includes('<head')) {
    warnings.push('Pas de balise <head> détectée');
  }

  if (!code.includes('<body')) {
    warnings.push('Pas de balise <body> détectée');
  }

  // Check for unclosed tags
  const openingTags = code.match(/<(?!\/)[\w-]+(?:\s[^>]*)?>/g) || [];
  const closingTags = code.match(/<\/[\w-]+>/g) || [];
  
  const openingTagNames = openingTags.map(tag => tag.match(/^<([\w-]+)/)?.[1]).filter(Boolean);
  const closingTagNames = closingTags.map(tag => tag.match(/^<\/([\w-]+)>/)?.[1]).filter(Boolean);

  // Self-closing tags
  const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link'];
  
  const unclosedTags = openingTagNames.filter(
    tag => !selfClosing.includes(tag || '') && 
    openingTagNames.filter(t => t === tag).length > closingTagNames.filter(t => t === tag).length
  );

  if (unclosedTags.length > 0) {
    warnings.push(`Balises potentiellement non fermées: ${unclosedTags.join(', ')}`);
  }

  // Check for dangerous code
  if (code.includes('<script>alert') || code.includes('javascript:')) {
    warnings.push('Code JavaScript potentiellement dangereux détecté');
  }

  // Check for inline styles abuse
  const inlineStylesCount = (code.match(/style\s*=\s*"/g) || []).length;
  if (inlineStylesCount > 10) {
    warnings.push(`Beaucoup de styles inline (${inlineStylesCount}). Considérez utiliser des classes CSS.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized: code
  };
}

/**
 * Valide du code CSS
 */
export function validateCSS(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!code || code.trim().length === 0) {
    // CSS vide n'est pas forcément une erreur
    return { isValid: true, errors, warnings };
  }

  // Check for unclosed braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;

  if (openBraces !== closeBraces) {
    errors.push(`Accolades non équilibrées: ${openBraces} ouvrantes, ${closeBraces} fermantes`);
  }

  // Check for common CSS errors
  if (code.includes(';;')) {
    warnings.push('Points-virgules doubles détectés');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized: code
  };
}

/**
 * Valide du code JavaScript
 */
export function validateJavaScript(code: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!code || code.trim().length === 0) {
    return { isValid: true, errors, warnings };
  }

  // Check for unclosed braces/brackets/parentheses
  const checks = [
    { open: '{', close: '}', name: 'accolades' },
    { open: '[', close: ']', name: 'crochets' },
    { open: '(', close: ')', name: 'parenthèses' }
  ];

  checks.forEach(({ open, close, name }) => {
    const openCount = (code.match(new RegExp(`\\${open}`, 'g')) || []).length;
    const closeCount = (code.match(new RegExp(`\\${close}`, 'g')) || []).length;

    if (openCount !== closeCount) {
      errors.push(`${name} non équilibrées: ${openCount} ouvrantes, ${closeCount} fermantes`);
    }
  });

  // Check for dangerous code
  if (code.includes('eval(')) {
    warnings.push('Usage de eval() détecté (potentiellement dangereux)');
  }

  if (code.includes('innerHTML') && !code.includes('textContent')) {
    warnings.push('Usage de innerHTML détecté. Considérez textContent pour éviter XSS.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitized: code
  };
}

/**
 * Sanitize du code HTML (enlève scripts malveillants)
 */
export function sanitizeHTML(code: string): string {
  let sanitized = code;

  // Remove dangerous event handlers
  const dangerousEvents = ['onerror', 'onload', 'onclick', 'onmouseover'];
  dangerousEvents.forEach(event => {
    const regex = new RegExp(`${event}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove javascript: links
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: URLs (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  return sanitized;
}

/**
 * Valide un projet complet (HTML + CSS + JS)
 */
export function validateProject(html: string, css?: string, js?: string): ValidationResult {
  const htmlResult = validateHTML(html);
  const cssResult = css ? validateCSS(css) : { isValid: true, errors: [], warnings: [] };
  const jsResult = js ? validateJavaScript(js) : { isValid: true, errors: [], warnings: [] };

  return {
    isValid: htmlResult.isValid && cssResult.isValid && jsResult.isValid,
    errors: [
      ...htmlResult.errors.map(e => `HTML: ${e}`),
      ...cssResult.errors.map(e => `CSS: ${e}`),
      ...jsResult.errors.map(e => `JS: ${e}`)
    ],
    warnings: [
      ...htmlResult.warnings.map(w => `HTML: ${w}`),
      ...cssResult.warnings.map(w => `CSS: ${w}`),
      ...jsResult.warnings.map(w => `JS: ${w}`)
    ],
    sanitized: sanitizeHTML(html)
  };
}

/**
 * Génère un rapport de validation
 */
export function generateValidationReport(result: ValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return '✅ **Code valide** - Aucun problème détecté';
  }

  let report = '';

  if (!result.isValid) {
    report += '❌ **Erreurs détectées**\n\n';
    result.errors.forEach((error, i) => {
      report += `${i + 1}. ${error}\n`;
    });
    report += '\n';
  }

  if (result.warnings.length > 0) {
    report += '⚠️  **Avertissements**\n\n';
    result.warnings.forEach((warning, i) => {
      report += `${i + 1}. ${warning}\n`;
    });
  }

  return report;
}
