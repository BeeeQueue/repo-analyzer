import { spawnSync } from "child_process"
import { resolve } from "path"
import debug from "debug"
import { Commit, Data, Diff } from "@/types"

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

export const getFirstCommit = () => ({
  hash: run("git", ["rev-list", "--max-parents=0", "HEAD"]),
  index: getNumberOfCommits() - 1,
})

export const getCommitAfter = (index: number) => ({
  index: index - 1,
  hash: run("git", ["rev-list", "--max-count=1", `--skip=${index}`, "HEAD"]),
})

const diffRegex = /(\d+)\s*(\d+)\s*(.*)/
export const getDiff = (current: Commit, previous: Commit): Diff => {
  const result = run("git", [
    "diff",
    "--minimal",
    "--numstat",
    previous.hash,
    current.hash,
  ])

  return result
    .split("\n")
    .map((diffStr) => diffRegex.exec(diffStr))
    .filter((match): match is RegExpExecArray => match != null)
    .reduce(
      (accum, [, added, deleted, filename]) => ({
        ...accum,
        [filename]: Number(added) - Number(deleted),
      }),
      {} as Diff
    )
}

export const getCommitData = (sha: string): Omit<Data, "diff" | "totals"> => {
  const result = run("git", [
    "show",
    "--quiet",
    "--format='%an %ae%n%ad%n%s'",
    sha,
  ])
  const [authorName, authorEmail, dateStr, message] = result.match(
    /(.+) (.+)\n(.+)\n(.+)/
  )!

  return {
    author: {
      name: authorName,
      email: authorEmail,
    },
    date: new Date(dateStr),
    message,
  }
}

export const getNumberOfCommits = (): number =>
  Number(run("git", ["rev-list", "--count", "master"]))
