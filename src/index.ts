import * as core from '@actions/core'
import { renderSite, DefaultTheme } from 'inkpress-renderer'
import { createNodeAdapter } from './node-adapter'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

async function run(): Promise<void> {
  try {
    const vaultPath = core.getInput('vault-path', { required: true })
    const publishDirs = core.getInput('publish-dirs', { required: true })
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const outputDir = core.getInput('output-dir', { required: true })
    const uploadMode = (core.getInput('upload-mode') || 'html') as 'html' | 'html+md'
    const deadLinkPolicy = (core.getInput('dead-link-policy') || 'silent') as 'silent' | 'marked'

    core.info(`Rendering vault at ${vaultPath}, dirs: ${publishDirs.join(', ')}`)

    const result = await renderSite({
      vaultPath,
      publishDirs,
      theme: new DefaultTheme(),
      uploadMode,
      deadLinkPolicy,
      fs: createNodeAdapter(vaultPath),
      onProgress: (_phase: 'render', current: number, total: number) => {
        core.info(`[render] ${current}/${total}`)
      },
    })

    for (const file of result.files) {
      const dest = join(outputDir, file.relativePath)
      mkdirSync(dirname(dest), { recursive: true })
      writeFileSync(dest, file.content)
    }

    const reportPath = join(outputDir, 'publish-report.json')
    writeFileSync(reportPath, JSON.stringify(result.report, null, 2))

    core.setOutput('rendered-count', String(result.report.rendered))
    core.setOutput('dead-link-count', String(result.report.deadLinks.length))
    core.setOutput('report-path', reportPath)

    core.info(`Rendered ${result.report.rendered} pages, ${result.report.deadLinks.length} dead links`)

    if (result.report.deadLinks.length > 0) {
      core.warning(`Found ${result.report.deadLinks.length} dead links:`)
      for (const dl of result.report.deadLinks) {
        core.warning(`  ${dl.sourcePath}:${dl.line} -> ${dl.targetLink}`)
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    else core.setFailed('An unexpected error occurred')
  }
}

run()
