/**
 * Script de test automatique pour le système AI Developer
 * Usage: node test-ai-developer.js
 */

const API_BASE = 'http://localhost:3000/api'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testHealthCheck() {
  log('\n🔍 Test 1: Health Check', 'blue')
  try {
    const response = await fetch(`${API_BASE}/health`)
    const data = await response.json()
    
    if (response.ok && data.status === 'ok') {
      log('✅ Health check passed', 'green')
      return true
    } else {
      log('❌ Health check failed', 'red')
      return false
    }
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, 'red')
    return false
  }
}

async function testGeneratePlaceholder() {
  log('\n🔍 Test 2: Generate avec Mode Placeholder', 'blue')
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Crée une landing page moderne pour une startup SaaS',
        agent: 'design'
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success && data.code) {
      log('✅ Génération placeholder réussie', 'green')
      log(`   - Code généré: ${data.code.length} caractères`, 'yellow')
      log(`   - Agent: ${data.agent}`, 'yellow')
      log(`   - Placeholder: ${data.placeholder ? 'Oui' : 'Non'}`, 'yellow')
      return true
    } else {
      log('❌ Génération placeholder échouée', 'red')
      log(`   - Erreur: ${data.error || 'Unknown'}`, 'red')
      return false
    }
  } catch (error) {
    log(`❌ Génération error: ${error.message}`, 'red')
    return false
  }
}

async function testGenerateWithInvalidInput() {
  log('\n🔍 Test 3: Validation Input (prompt vide)', 'blue')
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: ''
      })
    })
    
    const data = await response.json()
    
    if (response.status === 400 && data.error) {
      log('✅ Validation fonctionne (prompt requis)', 'green')
      return true
    } else {
      log('❌ Validation échouée (devrait rejeter prompt vide)', 'red')
      return false
    }
  } catch (error) {
    log(`❌ Test validation error: ${error.message}`, 'red')
    return false
  }
}

async function testFileUpload() {
  log('\n🔍 Test 4: Upload Fichier (simulation)', 'blue')
  try {
    // Créer un fichier texte simulé
    const textContent = 'Ceci est un test de contenu texte pour CodeCraft Studio'
    const blob = new Blob([textContent], { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', blob, 'test.txt')
    
    const response = await fetch(`${API_BASE}/parse-file`, {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    if (response.ok && data.success && data.content) {
      log('✅ Upload fichier réussi', 'green')
      log(`   - Fichier: ${data.fileName}`, 'yellow')
      log(`   - Type: ${data.fileType}`, 'yellow')
      log(`   - Taille: ${(data.fileSize / 1024).toFixed(2)} KB`, 'yellow')
      log(`   - Contenu extrait: ${data.content.substring(0, 50)}...`, 'yellow')
      return true
    } else {
      log('❌ Upload fichier échoué', 'red')
      return false
    }
  } catch (error) {
    log(`❌ Upload error: ${error.message}`, 'red')
    log(`   Note: FormData may not be available in Node.js < 18`, 'yellow')
    return false
  }
}

async function testVariations() {
  log('\n🔍 Test 5: Génération Variations', 'blue')
  try {
    const sampleCode = '<!DOCTYPE html><html><body><h1>Test</h1></body></html>'
    
    const response = await fetch(`${API_BASE}/variations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: sampleCode,
        prompt: 'Landing page SaaS'
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success && data.variations && data.variations.length === 3) {
      log('✅ Génération variations réussie', 'green')
      log(`   - Nombre de variations: ${data.variations.length}`, 'yellow')
      data.variations.forEach((v, i) => {
        log(`   - Style ${i + 1}: ${v.style}`, 'yellow')
      })
      return true
    } else {
      log('❌ Génération variations échouée', 'red')
      return false
    }
  } catch (error) {
    log(`❌ Variations error: ${error.message}`, 'red')
    return false
  }
}

async function runAllTests() {
  log('\n🚀 Démarrage des tests automatiques...', 'blue')
  log('='.repeat(60), 'blue')
  
  const results = {
    passed: 0,
    failed: 0,
    total: 5
  }
  
  // Run tests
  const tests = [
    testHealthCheck,
    testGeneratePlaceholder,
    testGenerateWithInvalidInput,
    testFileUpload,
    testVariations
  ]
  
  for (const test of tests) {
    const passed = await test()
    if (passed) {
      results.passed++
    } else {
      results.failed++
    }
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'blue')
  log('\n📊 Résumé des Tests:', 'blue')
  log(`   Total: ${results.total}`, 'yellow')
  log(`   Réussis: ${results.passed}`, 'green')
  log(`   Échoués: ${results.failed}`, results.failed > 0 ? 'red' : 'green')
  
  const percentage = ((results.passed / results.total) * 100).toFixed(1)
  log(`\n   Score: ${percentage}%`, percentage === '100.0' ? 'green' : 'yellow')
  
  if (results.failed === 0) {
    log('\n✅ Tous les tests sont passés !', 'green')
  } else {
    log('\n⚠️  Certains tests ont échoué', 'yellow')
  }
  
  log('\n' + '='.repeat(60), 'blue')
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red')
  process.exit(1)
})
