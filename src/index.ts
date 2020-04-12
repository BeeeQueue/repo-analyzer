import { resolve } from "path"
import program from "commander"

import { RepoAnalyzer } from "@/analyzer"
import { version } from "../package.json"

program
  .version(version)
  .arguments("[dir]")
  .description("Analyze a repository's language usage through its lifetime")
  .action((dir: string = ".") => {
    const analyzer = new RepoAnalyzer(resolve(dir))

    analyzer.run()
  })
  .parse(process.argv)
