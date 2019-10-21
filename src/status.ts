import { parse } from "./parser"

export type PR = { title: string } & (
  | { singleCommit: false }
  | { singleCommit: true; commitMessage: string })

export type Status = {
  state: "success" | "pending"
  description: Description
}

export const success = (
  description: Description = Description.GenericSuccess
): Status => ({
  state: "success",
  description,
})

export const pending = (
  description: Description = Description.GenericPending
): Status => ({
  state: "pending",
  description,
})

export enum Description {
  GenericSuccess = "Merge commit will inherit its conventional PR title.",
  GenericPending = "Merge commit will not inherit its conventional PR title.",
  MultipleNonConventional = "Requires a conventional PR title.",
  SingleNonConventional = "Requires a conventional commit message.",
  Mismatched = "Requires commit message to match PR title.",
}

export const checkStatus = (pr: PR): Status => {
  const parsedTitle = parse(pr.title)
  if (pr.singleCommit) {
    const parsedCommitMessage = parse(pr.commitMessage)
    if (!parsedCommitMessage.conventional) {
      return pending(Description.SingleNonConventional)
    }
    if (parsedCommitMessage.header !== pr.title) {
      return pending(Description.Mismatched)
    }
    return success()
  } else {
    if (!parsedTitle.conventional) {
      return pending(Description.MultipleNonConventional)
    }
    return success()
  }
}
