import { WebhookPayloadPullRequest } from "@octokit/webhooks"
import { Application, Context, Octokit } from "probot"
import { checkStatus, PR } from "./status"

export const APP_NAME = "Moai"

export type PullRequestContext = Context<WebhookPayloadPullRequest>
export type CommitsResponse = Octokit.PullsListCommitsResponseItem[]

const singleCommitBranch = (commitsResponse: CommitsResponse): boolean => {
  if (commitsResponse.length <= 1) return true
  const masterMergeCommitPrefix = `Merge branch \'master\' into`
  const mergeCommitsFromMaster = commitsResponse.filter(({ commit }) =>
    commit.message.startsWith(masterMergeCommitPrefix)
  )
  return mergeCommitsFromMaster.length === commitsResponse.length - 1
}

const analysePR = async (context: PullRequestContext): Promise<PR> => {
  const { data } = await context.github.pulls.listCommits(
    context.repo({ pull_number: context.payload.pull_request.number })
  )
  const { title, user } = context.payload.pull_request
  return {
    title,
    author: user.login,
    ...(singleCommitBranch(data)
      ? { singleCommit: true, commitMessage: data[0].commit.message }
      : { singleCommit: false }),
  }
}

export const updateStatus = async (context: PullRequestContext) => {
  const pr = await analysePR(context)
  const status = checkStatus(pr)
  await context.github.repos.createStatus(
    context.repo({
      sha: context.payload.pull_request.head.sha,
      context: APP_NAME,
      ...status,
    })
  )
}

export default (app: Application) => {
  app.on("pull_request.opened", updateStatus)
  app.on("pull_request.edited", updateStatus)
  app.on("pull_request.synchronize", updateStatus)
}
