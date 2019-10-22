import { WebhookPayloadPullRequest } from "@octokit/webhooks"
import { Application, Context, Octokit } from "probot"
import { checkStatus, PR } from "./status"

export const APP_NAME = "Moai"

export type PullRequestContext = Context<WebhookPayloadPullRequest>
export type CommitsResponse = Octokit.PullsListCommitsResponseItem[]

const singleCommitBranch = (commitsResponse: CommitsResponse): boolean => {
  if (commitsResponse.length <= 1) return true
  const masterMergeCommitPrefix = `Merge branch \'master\' into`
  const mergeCommitsFromMaster = commitsResponse
    .map(({ commit }) => commit.message.startsWith(masterMergeCommitPrefix))
    .filter(a => a === true)
  return mergeCommitsFromMaster.length === commitsResponse.length - 1
}

const analysePR = async (context: PullRequestContext): Promise<PR> => {
  const { data } = await context.github.pulls.listCommits(
    context.repo({ pull_number: context.payload.pull_request.number })
  )
  const { title } = context.payload.pull_request
  return singleCommitBranch(data)
    ? { title, singleCommit: true, commitMessage: data[0].commit.message }
    : { title, singleCommit: false }
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
