import Octokit from "@octokit/rest"
import nock from "nock"
import { GitHubAPI } from "probot/lib/github"
import { DeepPartial } from "ts-essentials"
import { PullRequestContext, updateStatus } from "../src/app"

nock.disableNetConnect()

const context: DeepPartial<PullRequestContext> = {
  repo: params => ({ owner: "zioroboco", repo: "moai-merge", ...params }),
  github: new Octokit() as GitHubAPI,
  payload: {
    pull_request: {
      number: 1,
      title: "More coffee",
      head: {
        sha: "c0ffee",
      },
    },
  },
}

it("updates status", async () => {
  const scope = nock("https://api.github.com")
    .get("/repos/zioroboco/moai-merge/pulls/1/commits")
    .reply(200, [{ commit: { message: "fix: address coffee shortage" } }])
    .post("/repos/zioroboco/moai-merge/statuses/c0ffee", {
      state: "success",
      context: "moai-merge",
    })
    .reply(200)

  await updateStatus(context as PullRequestContext)
  expect(scope.isDone()).toBe(true)
})
