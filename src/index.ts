import { resolve } from "path"
import program from "commander"

import { analyzeCommitChunk } from "@/analyzer"
import { version } from "../package.json"

program
  .version(version)
  .arguments("[dir]")
  .description("Analyze a repository's language usage through its lifetime")
  .action((dir: string = ".") => {
    analyzeCommitChunk(resolve(dir))
  })
  .parse(process.argv)
