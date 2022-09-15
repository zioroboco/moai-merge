import { parse } from "./parser"

export type PR = { title: string; labels?: string[] }

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
  MultipleNonConventional = "PR title must be a conventional commit message.",
  SingleNonConventional = "Single commit requires a conventional commit message.",
  Mismatched = "Requires single commit message to match PR title.",
}

export const checkStatus = (pr: PR): Status => {
  const parsedTitle = parse(pr.title)

  // Assume that all dependabot / renovate PRs are using conventional commit
  if (pr.labels.includes("dependencies")) {
    return success()
  }

  if (!parsedTitle.conventional) {
    return failure(Description.MultipleNonConventional)
  }

  return success()
}
