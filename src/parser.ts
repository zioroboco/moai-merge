const convetionalCommitsParser = require("conventional-commits-parser")

const angularPresetTypes = [
  "build",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "style",
  "test",
]

export type MessageProperties =
  | { conventional: false }
  | {
      conventional: true
      type: string
      subject: string
      scope?: string
    }

export const parse = (message: string): MessageProperties => {
  const { type, subject, scope } = convetionalCommitsParser.sync(message)
  return !subject || !type || !angularPresetTypes.includes(type)
    ? { conventional: false }
    : {
        conventional: true,
        type,
        subject,
        scope,
      }
}
