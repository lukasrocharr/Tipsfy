import { constants, existsSync, readdirSync } from 'node:fs'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const projectMetadata = new Set([
  'npm-shrinkwrap.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'yarn.lock',
  'bun.lock',
  'bun.lockb',
  'agents.md',
  'claude.md',
])
const projectConfiguration =
  /^(?:package(?:-lock)?\.json|(?:tsconfig|jsconfig)(?:\.[^.]+)*\.json|.*\.config\.[^.]+)$/i

function currentAssets(root, excludedDirectories) {
  const files = []
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name)
      if (entry.name.startsWith('.') && entry.name !== '.well-known') continue
      if (entry.isDirectory()) {
        if (
          excludedDirectories.has(filename) ||
          ['node_modules', 'dist', 'build', 'coverage'].includes(entry.name)
        )
          continue
        if (existsSync(path.join(filename, 'package.json'))) continue
        visit(filename)
      } else if (
        entry.isFile() &&
        !projectMetadata.has(entry.name.toLowerCase()) &&
        !projectConfiguration.test(entry.name)
      ) {
        files.push(path.relative(root, filename))
      }
    }
  }
  visit(root)
  return files
}

export function frontendAssets() {
  let root
  let excludedDirectories
  let outDir
  return {
    name: 'figma-frontend-import-assets',
    config(config) {
      root = path.resolve(config.root || '.')
      outDir = path.resolve(root, config.build?.outDir || 'dist')
      excludedDirectories = new Set([outDir, path.resolve(root, config.publicDir || 'public')])
      return {
        build: {
          rollupOptions: {
            input: currentAssets(root, excludedDirectories)
              .filter((file) => file.endsWith('.html'))
              .map((file) => path.resolve(root, file)),
          },
        },
      }
    },
    configResolved(config) {
      root = config.root
      outDir = path.resolve(root, config.build.outDir)
      excludedDirectories = new Set([outDir, config.publicDir])
    },
    async writeBundle() {
      for (const file of currentAssets(root, excludedDirectories)) {
        const target = path.resolve(outDir, file)
        await mkdir(path.dirname(target), { recursive: true })
        try {
          await copyFile(path.resolve(root, file), target, constants.COPYFILE_EXCL)
        } catch (error) {
          if (error.code !== 'EEXIST') throw error
        }
      }
    },
  }
}
