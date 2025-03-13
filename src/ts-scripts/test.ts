import { dirname, resolve } from 'node:path'
import { existsSync } from 'node:fs'

function findRootDirectory(currentDir: string): string {
  // Look for a marker file (e.g., package.json) to identify the root
  if (existsSync(resolve(currentDir, 'package.json'))) {
    return currentDir
  }
  // Move up one directory and check again
  const parentDir = dirname(currentDir)
  if (parentDir === currentDir) {
    throw new Error('Root directory not found')
  }

  return findRootDirectory(parentDir)
}

function main() {
  console.log('w??')
  console.log(findRootDirectory(__dirname))
}

main()
