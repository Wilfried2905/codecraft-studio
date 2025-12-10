/**
 * Git Service (Server-side)
 * GitHub API integration for commit/push
 */

export interface GitHubCommitData {
  owner: string
  repo: string
  branch: string
  files: Array<{ path: string; content: string }>
  message: string
  token: string
}

export async function commitToGitHub(data: GitHubCommitData): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    // Get current SHA of branch
    const refRes = await fetch(`https://api.github.com/repos/${data.owner}/${data.repo}/git/refs/heads/${data.branch}`, {
      headers: { Authorization: `token ${data.token}` }
    })
    
    if (!refRes.ok) throw new Error('Branch not found')
    
    const refData = await refRes.json()
    const currentSHA = refData.object.sha
    
    // Get current tree
    const commitRes = await fetch(`https://api.github.com/repos/${data.owner}/${data.repo}/git/commits/${currentSHA}`, {
      headers: { Authorization: `token ${data.token}` }
    })
    
    const commitData = await commitRes.json()
    const baseTree = commitData.tree.sha
    
    // Create blobs for each file
    const blobs = await Promise.all(
      data.files.map(async (file) => {
        const blobRes = await fetch(`https://api.github.com/repos/${data.owner}/${data.repo}/git/blobs`, {
          method: 'POST',
          headers: {
            Authorization: `token ${data.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: file.content,
            encoding: 'utf-8'
          })
        })
        const blobData = await blobRes.json()
        return { path: file.path, sha: blobData.sha }
      })
    )
    
    // Create new tree
    const treeRes = await fetch(`https://api.github.com/repos/${data.owner}/${data.repo}/git/trees`, {
      method: 'POST',
      headers: {
        Authorization: `token ${data.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base_tree: baseTree,
        tree: blobs.map(b => ({
          path: b.path,
          mode: '100644',
          type: 'blob',
          sha: b.sha
        }))
      })
    })
    
    const treeData = await treeRes.json()
    
    // Create commit
    const newCommitRes = await fetch(`https://api.github.com/repos/${data.owner}/${data.repo}/git/commits`, {
      method: 'POST',
      headers: {
        Authorization: `token ${data.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: data.message,
        tree: treeData.sha,
        parents: [currentSHA]
      })
    })
    
    const newCommitData = await newCommitRes.json()
    
    // Update ref
    await fetch(`https://api.github.com/repos/${data.owner}/${data.repo}/git/refs/heads/${data.branch}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${data.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sha: newCommitData.sha
      })
    })
    
    return {
      success: true,
      url: `https://github.com/${data.owner}/${data.repo}/commit/${newCommitData.sha}`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
