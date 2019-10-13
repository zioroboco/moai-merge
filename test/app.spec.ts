import Octokit from "@octokit/rest"
import nock from "nock"
import { GitHubAPI } from "probot/lib/github"
import { PullRequestContext, updateStatus } from "../src/app"

nock.disableNetConnect()

const HEAD_SHA = "c0ffee"

const makeContext = (title: string): PullRequestContext => ({
  repo: params => ({ owner: "zioroboco", repo: "moai-merge", ...params }),
  github: new Octokit() as GitHubAPI,
  payload: {
    pull_request: {
      number: 1,
      title,
      // @ts-ignore
      head: {
        sha: HEAD_SHA,
      },
    },
  },
})

const makeScope = (commits: string[], expected: "success" | "pending") =>
  nock("https://api.github.com")
    .get("/repos/zioroboco/moai-merge/pulls/1/commits")
    .reply(200, commits.map(message => ({ commit: { message } })))
    .post(`/repos/zioroboco/moai-merge/statuses/${HEAD_SHA}`, {
      state: expected,
      context: "moai-merge",
    })
    .reply(200)

const setup = (params: {
  title: string
  commits: string[]
  expected: "success" | "pending"
}) => ({
  context: makeContext(params.title),
  scope: makeScope(params.commits, params.expected),
})

describe("a single commit", () => {
  const title = "title"
  const commits = ["feat: one"]

  describe("when conventional", () => {
    it("resolves to success", async () => {
      const expected = "success"

      const { context, scope } = setup({ title, commits, expected })
      await updateStatus(context)
      expect(scope.isDone()).toBe(true)
    })
  })

  describe("when non-conventional", () => {
    it("resolves to pending", async () => {
      const commits = ["one"]
      const expected = "pending"

      const { context, scope } = setup({ title, commits, expected })
      await updateStatus(context)
      expect(scope.isDone()).toBe(true)
    })
  })
})

describe("multiple commits", () => {
  const commits = ["one", "two"]

  describe("with a conventional PR title", () => {
    const title = "feat: title"

    it("resolves to success", async () => {
      const expected = "success"

      const { context, scope } = setup({ title, commits, expected })
      await updateStatus(context)
      expect(scope.isDone()).toBe(true)
    })
  })

  describe("without a conventional PR title", () => {
    const title = "title"

    it("resolves to pending", async () => {
      const expected = "pending"

      const { context, scope } = setup({ title, commits, expected })
      await updateStatus(context)
      expect(scope.isDone()).toBe(true)
    })
  })
})
