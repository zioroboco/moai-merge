const convetionalCommitsParser = require("conventional-commits-parser")

export type ParsedCommit =
  | { conventional: false }
  | {
      conventional: true
      type: string
      subject: string
      scope?: string
    }

export const parse = (commit: string): ParsedCommit => {
  const { type, subject, scope } = convetionalCommitsParser.sync(commit)
  if (!subject || !type) return { conventional: false }
  return {
    conventional: true,
    type,
    subject,
    scope,
  }
}
