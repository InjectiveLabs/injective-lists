import { exec } from 'child_process'

export function execShellCommand(cmd: any) {
  return new Promise((resolve) => {
    exec(cmd, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.warn(error)
      }

      resolve(stdout ? stdout : stderr)
    })
  })
}
