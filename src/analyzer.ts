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
import { Commit, Data, Totals } from "@/types"

const outputPath = resolve(__dirname, "..", "template")

export class RepoAnalyzer {
  private readonly dir: string
  private readonly numberOfCommits: number

  private readonly firstCommit: Commit

  private currentCommit: Commit
  private currentIndex: number

  private previousCommit: Commit

  // private totals: Totals = {}
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

    while (
      this.currentIndex > 0 &&
      this.currentIndex > this.numberOfCommits - 3
    ) {
      log(
        `${this.numberOfCommits - this.currentIndex} / ${this.numberOfCommits}`
      )

      this.analyzeCommit()

      this.goToNextCommit()
    }
  }

  private analyzeCommit() {
    const baseData = getCommitData(this.currentCommit.hash)
    const diff = getDiff(this.currentCommit, this.previousCommit)

    this.data.push({
      ...baseData,
      diff,
    })
  }

  private goToNextCommit() {
    this.previousCommit = this.currentCommit
    this.currentIndex--
    this.currentCommit = getCommitAfter(this.previousCommit.index)
  }
}
