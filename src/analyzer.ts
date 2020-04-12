import { resolve } from "path"

import { getFirstCommit, getHashAfter, getNumberOfCommits, setCwd } from "@/git"

const outputPath = resolve(__dirname, "..", "template")

export class RepoAnalyzer {
  private readonly dir: string
  private readonly numberOfCommits: number

  private readonly firstCommitHash: string

  private currentCommitHash: string
  private currentIndex: number

  private nextCommitHash: string | null

  constructor(dir: string) {
    setCwd(dir)

    this.dir = dir
    this.firstCommitHash = getFirstCommit()
    this.numberOfCommits = getNumberOfCommits()

    this.currentCommitHash = this.firstCommitHash
    this.currentIndex = this.numberOfCommits - 1

    this.nextCommitHash = getHashAfter(this.currentIndex)
  }

  public run() {
    console.log(`Analyzing ${this.dir} (${this.numberOfCommits} commits)...`)

    while (this.nextCommitHash != null && this.nextCommitHash.length > 0) {
      console.log({
        index: this.currentIndex,
        current: this.currentCommitHash,
        next: this.nextCommitHash,
      })

      this.goToNextCommit()
    }
  }

  private goToNextCommit() {
    if (this.nextCommitHash == null) return

    const nextHash = getHashAfter(this.currentIndex)

    this.currentIndex--
    this.currentCommitHash = this.nextCommitHash
    this.nextCommitHash = nextHash
  }
}
