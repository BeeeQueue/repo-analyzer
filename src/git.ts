import { spawnSync } from "child_process"
import { resolve } from "path"
import debug from "debug"
import { CommitData } from "@/types"

const log = {
  info: debug("analyzer:info"),
  debug: debug("analyzer:debug")
}
let cwd = resolve(".")

export const setCwd = (path: string) => {
  cwd = path
}

export const run = (
  command: string,
  args: string[],
  options: { cwd: string } = { cwd }
) => {
  log.debug(`\n${command} ${args}`)

  const result = spawnSync(command, args, options)

  if (result.error) {
    throw new Error(result.error.message)
  }

  const output = result.output
    .toString()
    .trim()
    .slice(1, -1) // For some reason every result starts and ends with a comma
    .trim()

  if (output.includes("error: ") || output.includes("fatal: ")) {
    throw new Error(output)
  }

  log.debug(`${output}`)

  return output
}

export const cloneDirToCache = (dir: string, to: string) => {
  run("rm", ["-rf", to])

  run("git", ["clone", dir, to])
}

export const checkoutCommit = (commit: string) => {
  run("git", ["checkout", commit])

  console.log(`Checked out ${commit}`)
}

export const getCommitData = (): CommitData => {
  const result = run("git", ["show", "--quiet", "--format='%H %aI %s'"])
  const match = result.match(/([\w\d]+) ([\w-:+]+) (.+)/)!

  return {
    sha: match[1],
    date: new Date(match[2]),
    name: match[3]
  }
}

export const getFilesOfCommit = (commit: string): string[] =>
  run("git", ["ls-tree", "--name-only", "-r", commit]).split("\n")

export const getNumberOfCommits = (): number =>
  Number(run("git", ["rev-list", "--count", "master"]))
