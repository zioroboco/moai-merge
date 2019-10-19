const convetionalCommitsParser = require("conventional-commits-parser")

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
  return !subject || !type
    ? { conventional: false }
    : {
        conventional: true,
        type,
        subject,
        scope,
      }
}
