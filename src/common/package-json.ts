import fs from 'node:fs/promises'
import path from 'node:path'

interface PackageJson {
  name: string
  version: string
}

export const packageJson: PackageJson = JSON.parse(
  await fs.readFile(path.join(import.meta.dirname, '../../package.json'), {
    encoding: 'utf8',
  })
)
