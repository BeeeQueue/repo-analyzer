import { homedir } from "os"
import { resolve } from "path"
import { copyFileSync, writeFileSync } from "fs"
import open from "open"
import log from "log-update"

import {
  checkoutCommit,
  cloneDirToCache,
  getCommitData,
  getNumberOfCommits,
  run,
  setCwd
} from "@/git"
import { ClocData, ClocResponse, Output } from "@/types"

const clocPath = require.resolve("cloc")
const cachePath = resolve(homedir(), ".repo-analyzer")
const repoPath = resolve(cachePath, "repo")
const outputPath = resolve(cachePath, "output")

let output: Output = []
let numberOfCommits: number

export const analyzeRepo = (dir: string) => {
  cloneDirToCache(dir, repoPath)
  setCwd(repoPath)
  checkoutCommit("master")

  const lastCommitData = getCommitData()
  numberOfCommits = getNumberOfCommits()

  for (let i = 0; i < numberOfCommits; i++) {
    checkoutCommit(`${lastCommitData.sha}~${i}`)

    analyzeCommit(i)

    writeFileSync(
      resolve(outputPath, "data.js"),
      `let data = ${JSON.stringify(output)}`
    )
  }

  copyFile("index.html")
  copyFile("script.js")
  open(resolve(outputPath, "index.html"))

  log("100% - Finished!")
}

const analyzeCommit = (index: number) => {
  const commitData = getCommitData()
  const clocData = getClocData()

  logProgress(commitData.name, index, numberOfCommits)

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

const copyFile = (fileName: string) =>
  copyFileSync(
    resolve(__dirname, "..", "template", fileName),
    resolve(outputPath, fileName)
  )

const logProgress = (commitName: string, progress: number, total: number) => {
  const progressPercent = progress / total

  log(`${Math.ceil(progressPercent * 100)}% - Parsing "${commitName}"...`)
}
