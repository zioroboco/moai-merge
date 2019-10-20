import { WebhookPayloadPullRequest } from "@octokit/webhooks"
import { Application, Context, Octokit } from "probot"
import { checkStatus, PR } from "./status"

export const APP_NAME = "Moai (dev)"

export type PullRequestContext = Context<WebhookPayloadPullRequest>
export type CommitsResponse = Octokit.PullsListCommitsResponseItem[]

type PullRequest = WebhookPayloadPullRequest["pull_request"]

/**
 * Reflects GitHub's logic for deciding whether to prioritise a commit message
 * over the PR title -- for example, in a squash-and-merge of a single commit.
 */
const singleCommitBranch = (
  commitsResponse: CommitsResponse,
  pr: PullRequest
): boolean => {
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

  const { title, labels } = context.payload.pull_request

  return singleCommitBranch(data, context.payload.pull_request)
    ? {
        singleCommit: true,
        commitMessage: data[0].commit.message,
        title,
        labels,
      }
    : {
        singleCommit: false,
        title,
        labels,
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
