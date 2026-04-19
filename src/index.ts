import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import * as core from '@actions/core'
import { DefaultTheme, renderSite } from 'inkpress-renderer'
import { createNodeAdapter } from './node-adapter'

async function run(): Promise<void> {
  try {
    const vaultPath = core.getInput('vault-path', { required: true })
    const publishDirs = core
      .getInput('publish-dirs', { required: true })
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const outputDir = core.getInput('output-dir', { required: true })
    const uploadMode = core.getInput('upload-mode') || 'html'
    const deadLinkPolicy = core.getInput('dead-link-policy') || 'silent'

    // Validate inputs
    if (publishDirs.length === 0) {
      core.setFailed('publish-dirs must contain at least one directory')
      return
    }
    if (uploadMode !== 'html' && uploadMode !== 'html+md') {
      core.setFailed(
        `Invalid upload-mode "${uploadMode}". Must be "html" or "html+md"`,
      )
      return
    }
    if (deadLinkPolicy !== 'silent' && deadLinkPolicy !== 'marked') {
      core.setFailed(
        `Invalid dead-link-policy "${deadLinkPolicy}". Must be "silent" or "marked"`,
      )
      return
    }

    core.info(
      `Rendering vault at ${vaultPath}, dirs: ${publishDirs.join(', ')}`,
    )

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

    const resolvedOutputDir = resolve(outputDir)
    for (const file of result.files) {
      const dest = resolve(join(outputDir, file.relativePath))
      if (
        !dest.startsWith(`${resolvedOutputDir}/`) &&
        dest !== resolvedOutputDir
      ) {
        core.warning(
          `Skipping file with path escaping output directory: ${file.relativePath}`,
        )
        continue
      }
      mkdirSync(dirname(dest), { recursive: true })
      writeFileSync(dest, file.content)
    }

    const reportPath = join(outputDir, 'publish-report.json')
    writeFileSync(reportPath, JSON.stringify(result.report, null, 2))

    core.setOutput('rendered-count', String(result.report.rendered))
    core.setOutput('dead-link-count', String(result.report.deadLinks.length))
    core.setOutput('report-path', reportPath)

    core.info(
      `Rendered ${result.report.rendered} pages, ${result.report.deadLinks.length} dead links`,
    )

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
