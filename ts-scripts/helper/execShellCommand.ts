export function execShellCommand(cmd: any) {
  const exec = require('child_process').exec

  return new Promise((resolve) => {
    exec(cmd, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.warn(error)
      }

      resolve(stdout ? stdout : stderr)
    })
  })
}
