import { resolve } from "path"
import program from "commander"

import { analyzeRepo } from "@/analyzer"
import { version } from "../package.json"

program
  .version(version)
  .arguments("[dir]")
  .description("Analyze a repository's language usage through its lifetime")
  .action((dir: string = ".") => {
    analyzeRepo(resolve(dir))
  })
  .parse(process.argv)
