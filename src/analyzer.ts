import { writeFileSync } from "fs"
import { resolve } from "path"
import log from "log-update"
import { languages } from "lang-map"

import {
  getDiff,
  getFirstCommit,
  getCommitAfter,
  getNumberOfCommits,
  setCwd,
  getCommitData,
} from "@/git"
import { Commit, Data, Diff, Totals } from "@/types"

const outputPath = resolve(__dirname, "..", "template")

const configFileRegex = /^\.\w+$/
const fileRegex = /^\w+$/

export class RepoAnalyzer {
  private readonly dir: string
  private readonly numberOfCommits: number

  private readonly firstCommit: Commit

  private currentCommit: Commit
  private currentIndex: number

  private previousCommit: Commit

  private data: Data[] = []

  constructor(dir: string) {
    setCwd(dir)

    this.dir = dir
    this.firstCommit = getFirstCommit()
    this.numberOfCommits = getNumberOfCommits()

    this.currentCommit = this.firstCommit
    this.currentIndex = this.numberOfCommits - 1

    this.previousCommit = {
      hash: "4b825dc642cb6eb9a060e54bf8d69288fbee4904",
      index: this.numberOfCommits,
    }
  }

  public run() {
    console.log(`Analyzing ${this.dir} (${this.numberOfCommits} commits)...`)

    while (this.currentIndex > 0) {
      log(
        `${this.numberOfCommits - this.currentIndex} / ${this.numberOfCommits}`
      )

      this.analyzeCommit()

      this.goToNextCommit()
    }

    writeFileSync(
      resolve(outputPath, "data.js"),
      `const DATA = ${JSON.stringify(this.data)}`
    )
  }

  private analyzeCommit() {
    const baseData = getCommitData(this.currentCommit.hash)
    const diff = getDiff(this.currentCommit, this.previousCommit)
    const totals = this.getTotals(diff)

    this.data.push({
      hash: this.currentCommit.hash,
      ...baseData,
      diff,
      totals,
    })
  }

  private getTotals(diff: Diff): Totals {
    return Object.entries(diff).reduce((accum, [filename, diffNum]) => {
      const language = RepoAnalyzer.getLanguage(filename)

      return {
        ...accum,
        [language]: (accum[language] ?? 0) + diffNum,
      }
    }, this.data[this.data.length - 1]?.totals ?? {})
  }

  private goToNextCommit() {
    this.previousCommit = this.currentCommit
    this.currentIndex--
    this.currentCommit = getCommitAfter(this.previousCommit.index)
  }

  private static getLanguage(filename: string) {
    if (configFileRegex.test(filename)) return "dotfile"
    if (fileRegex.test(filename)) return "file"

    const language = languages(filename.slice(filename.lastIndexOf(".")))

    return Array.isArray(language) ? language[0] : language
  }
}
