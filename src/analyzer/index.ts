import { homedir } from "os"
import { resolve } from "path"

import {
  checkoutCommit,
  cloneDirToCache,
  getCommitData,
  getNumberOfCommits,
  run,
  setCwd
} from "@/git"
import { ClocData, ClocResponse, Output } from "@/types"
import { writeFileSync } from "fs"

const clocPath = require.resolve("cloc")
const cachePath = resolve(homedir(), ".repo-analyzer")
const repoPath = resolve(cachePath, "repo")
const outputPath = resolve(cachePath, "output")

let output: Output = []

export const analyzeRepo = (dir: string) => {
  cloneDirToCache(dir, repoPath)
  setCwd(repoPath)
  checkoutCommit("master")

  const lastCommitData = getCommitData()
  const numberOfCommits = getNumberOfCommits()

  for (let i = 0; i < numberOfCommits; i++) {
    checkoutCommit(`${lastCommitData.sha}~${i}`)

    analyzeCommit()
    writeFileSync(resolve(outputPath, "data.json"), JSON.stringify(output))
  }
}

const analyzeCommit = () => {
  const commitData = getCommitData()
  const clocData = getClocData()

  output = [{ ...commitData, ...clocData }, ...output]
}

const getClocData = (): ClocData => {
  let result: ClocResponse

  try {
    const output = run(clocPath, ["--vcs=git", "--json"], { cwd: repoPath })
    result = JSON.parse(output)
  } catch (err) {
    return { data: null, error: true }
  }

  return { data: result, error: false }
}
