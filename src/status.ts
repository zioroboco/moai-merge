import { parse } from "./parser"

export type PR = { author: string; title: string } & (
  | { singleCommit: false }
  | { singleCommit: true; commitMessage: string })

export type Status = {
  state: "success" | "failure"
  description: Description
}

export const success = (
  description: Description = Description.GenericSuccess
): Status => ({
  state: "success",
  description,
})

export const failure = (
  description: Description = Description.GenericFailure
): Status => ({
  state: "failure",
  description,
})

export enum Description {
  GenericSuccess = "Merge commit will inherit its conventional PR title.",
  GenericFailure = "Merge commit will not inherit its conventional PR title.",
  MultipleNonConventional = "Requires a conventional PR title.",
  SingleNonConventional = "Single commit requires a conventional commit message.",
  Mismatched = "Requires single commit message to match PR title.",
}

export const checkStatus = (pr: PR): Status => {
  if (pr.author.startsWith("dependabot")) return success()
  const parsedTitle = parse(pr.title)
  if (pr.singleCommit) {
    const parsedCommitMessage = parse(pr.commitMessage)
    if (!parsedCommitMessage.conventional) {
      return failure(Description.SingleNonConventional)
    }
    if (parsedCommitMessage.header !== pr.title) {
      return failure(Description.Mismatched)
    }
    return success()
  } else {
    if (!parsedTitle.conventional) {
      return failure(Description.MultipleNonConventional)
    }
    return success()
  }
}
