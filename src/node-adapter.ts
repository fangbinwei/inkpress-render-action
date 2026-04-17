import { readFile, readdir, stat, access } from 'fs/promises'
import { join } from 'path'
import type { FileSystemAdapter } from 'inkpress-renderer'

export function createNodeAdapter(basePath: string): FileSystemAdapter {
  return {
    async readFile(path: string): Promise<Buffer> {
      return readFile(join(basePath, path))
    },
    async readText(path: string): Promise<string> {
      return readFile(join(basePath, path), 'utf-8')
    },
    async listFiles(dir: string): Promise<string[]> {
      const fullDir = join(basePath, dir)
      const entries = await readdir(fullDir, { withFileTypes: true, recursive: true })
      return entries
        .filter(e => e.isFile())
        .map(e => {
          const entryDir = e.parentPath || e.path
          return join(dir, entryDir.slice(fullDir.length), e.name).replace(/\\/g, '/')
        })
    },
    async exists(path: string): Promise<boolean> {
      try {
        await access(join(basePath, path))
        return true
      } catch {
        return false
      }
    },
    async stat(path: string): Promise<{ mtime: number; size: number }> {
      const s = await stat(join(basePath, path))
      return { mtime: s.mtimeMs, size: s.size }
    },
  }
}
