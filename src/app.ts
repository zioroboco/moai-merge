import { WebhookPayloadPullRequest } from "@octokit/webhooks"
import { Application, Context } from "probot"
import { parse } from "./parser"

export type PullRequestContext = Context<WebhookPayloadPullRequest>

const getLastCommit = async (context: PullRequestContext) => {
  const { data } = await context.github.pulls.listCommits(
    context.repo({ pull_number: context.payload.pull_request.number })
  )
  return parse(data[0].commit.message)
}

export const updateStatus = async (context: PullRequestContext) => {
  const lastCommit = await getLastCommit(context)
  await context.github.repos.createStatus(
    context.repo({
      sha: context.payload.pull_request.head.sha,
      state: lastCommit.conventional ? "success" : "failure",
      context: "moai-merge",
    })
  )
}

export default (app: Application) => {
  app.on("pull_request.opened", updateStatus)
  app.on("pull_request.edited", updateStatus)
  app.on("pull_request.synchronize", updateStatus)
}
