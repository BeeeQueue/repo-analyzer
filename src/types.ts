export type Commit = {
  index: number
  hash: string
}

export type Totals = {
  [language: string]: number
}

export type Diff = {
  [filename: string]: number
}

export type Data = {
  hash: string
  message: string
  date: Date
  author: {
    name: string
    email: string | null
  }
  diff: Diff
  totals: Totals
}
