export type CommitData = { sha: string; date: Date; name: string }

type FileTypes = {
  SUM: {
    nFiles: number
    blank: number
    comment: number
    code: number
  }
  [key: string]:
    | undefined
    | {
        nFiles: number
        blank: number
        comment: number
        code: number
      }
}

export type ClocResponse = FileTypes & {
  header: {
    elapsed_seconds: number
    n_files: number
    n_lines: number
  }
}

export type ClocData =
  | { data: ClocResponse; error: false }
  | { data: null; error: true }

export type Output = Array<CommitData & ClocData>
