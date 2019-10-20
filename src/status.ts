import { parse } from "./parser"

export type PR = { title: string } & (
  | { singleCommit: false }
  | { singleCommit: true; commitMessage: string })

export type Status = {
  state: "success" | "pending"
  description: Description
}

export enum Description {
  GenericSuccess = "Merge commit will inherit its PR title.",
  GenericPending = "Merge commit will not inherit a conventional PR title.",
  Mismatched = "PR title does not match its conventional commit message.",
  SingleNonConventional = "Push a conventional commit message or more commits.",
  MultipleNonConventional = "Requires a conventional PR title.",
}

export const success = (
  description: Description = Description.GenericSuccess
): Status => ({ state: "success", description })

export const pending = (
  description: Description = Description.GenericPending
): Status => ({ state: "pending", description })

export const checkStatus = (pr: PR): Status => {
  if (pr.singleCommit) {
    const { conventional } = parse(pr.commitMessage)
    if (!conventional) return pending(Description.SingleNonConventional)
    if (pr.commitMessage !== pr.title) return pending(Description.Mismatched)
    return success()
  } else {
    const { conventional } = parse(pr.title)
    if (!conventional) return pending(Description.MultipleNonConventional)
    return success()
  }
}
