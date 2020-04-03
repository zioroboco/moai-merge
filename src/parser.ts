const convetionalCommitsParser = require("conventional-commits-parser").sync

/** See: https://www.conventionalcommits.org/en/v1.0.0/ */
const angularPresetTypes = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "style",
  "test",
]

const customTypes = ["ops"]

const types = [...angularPresetTypes, ...customTypes]

export type MessageProperties =
  | { conventional: false }
  | {
      conventional: true
      header: string
      type: string
      subject: string
      scope?: string
    }

export const parse = (message: string): MessageProperties => {
  const { header, type, subject, scope } = convetionalCommitsParser(message)
  return !subject || !type || !types.includes(type)
    ? { conventional: false }
    : {
        conventional: true,
        header,
        type,
        subject,
        scope,
      }
}
