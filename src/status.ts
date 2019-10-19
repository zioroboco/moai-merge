import { parse } from "./parser"

export type PR = { title: string } & (
  | { singleCommit: false }
  | { singleCommit: true; commitMessage: string })

export type Status = {
  state: "success" | "pending"
  description: string
}

export const success = (
  description = "Merge commit will inherit the conventional PR title."
): Status => ({
  state: "success",
  description: description,
})

export const pending = (
  description = "Merge commit will not inherit a conventional PR title."
): Status => ({
  state: "pending",
  description,
})

export const checkStatus = (pr: PR): Status => {
  if (pr.singleCommit) {
    const { conventional } = parse(pr.commitMessage)
    if (!conventional) return pending()
    if (pr.commitMessage !== pr.title) return pending()
    return success()
  } else {
    const { conventional } = parse(pr.title)
    if (!conventional) return pending()
    return success()
  }
}
