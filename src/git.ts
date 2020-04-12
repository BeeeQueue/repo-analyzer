import { spawnSync } from "child_process"
import { resolve } from "path"
import debug from "debug"
import { CommitData, LOC } from "@/types"

const log = {
  info: debug("analyzer:info"),
  debug: debug("analyzer:debug"),
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
  log.debug(`\n${command} ${args.join(" ")}`)

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

  log.debug(`"${output}"`)

  return output
}

export const getFirstCommit = () =>
  run("git", ["rev-list", "--max-parents=0", "HEAD"])

export const getHashAfter = (index: number) =>
  run("git", ["rev-list", "--max-count=1", `--skip=${index}`, "HEAD"])

export const cloneDirToCache = (dir: string, to: string) => {
  run("rm", ["-rf", to])

  run("git", ["clone", dir, to])
}

export const checkoutCommit = (commit: string) =>
  run("git", ["checkout", commit])

export const getCommitData = (sha: string): CommitData => {
  const result = run("git", ["show", "--quiet", "--format='%H %aI %s'", sha])
  const match = result.match(/([\w\d]+) ([\w-:+]+) (.+)/)!

  return {
    sha: match[1],
    date: new Date(match[2]),
    name: match[3],
  }
}

export const getLoc = (lastLoc: LOC): LOC => {}

export const getNumberOfCommits = (): number =>
  Number(run("git", ["rev-list", "--count", "master"]))
