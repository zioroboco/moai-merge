import { WebhookPayloadPullRequest } from "@octokit/webhooks"
import { Application, Context } from "probot"
import { parse } from "./parser"

export type PullRequestContext = Context<WebhookPayloadPullRequest>

const parseMessage = async (context: PullRequestContext) => {
  const { data } = await context.github.pulls.listCommits(
    context.repo({ pull_number: context.payload.pull_request.number })
  )
  return data.length > 1
    ? parse(context.payload.pull_request.title)
    : parse(data[0].commit.message)
}

export const updateStatus = async (context: PullRequestContext) => {
  const { conventional } = await parseMessage(context)
  await context.github.repos.createStatus(
    context.repo({
      sha: context.payload.pull_request.head.sha,
      state: conventional ? "success" : "pending",
      context: "moai-merge",
    })
  )
}

export default (app: Application) => {
  app.on("pull_request.opened", updateStatus)
  app.on("pull_request.edited", updateStatus)
  app.on("pull_request.synchronize", updateStatus)
}
