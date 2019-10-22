import Octokit from "@octokit/rest"
import nock from "nock"
import { GitHubAPI } from "probot/lib/github"
import { APP_NAME, PullRequestContext, updateStatus } from "../src/app"
import { Description, pending, success } from "../src/status"

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

const makeScope = (commits: string[], expected: any) =>
  nock("https://api.github.com")
    .get("/repos/zioroboco/moai-merge/pulls/1/commits")
    .reply(200, commits.map(message => ({ commit: { message } })))
    .post(`/repos/zioroboco/moai-merge/statuses/${HEAD_SHA}`, {
      context: APP_NAME,
      ...expected,
    })
    .reply(200)

const test = async (params: {
  title: string
  commits: string[]
  expected: any
}) => {
  const context = makeContext(params.title)
  const scope = makeScope(params.commits, params.expected)
  await updateStatus(context)
  expect(scope.isDone()).toBe(true)
}

describe("multiple non-conventional commits", () => {
  const commits = ["commit-one", "commit-two"]

  describe("with a non-conventional PR title", () => {
    const title = "title"

    it("resolves pending", async () => {
      const expected = pending(Description.MultipleNonConventional)
      await test({ title, commits, expected })
    })
  })

  describe("with a conventional PR title", () => {
    const title = "feat: title"

    it("resolves success", async () => {
      const expected = success()
      await test({ title, commits, expected })
    })
  })
})

describe("a single non-conventional commit", () => {
  const commits = ["commit"]

  describe("with a non-conventional PR title", () => {
    const title = "title"

    it("resolves pending", async () => {
      const expected = pending(Description.SingleNonConventional)
      await test({ title, commits, expected })
    })
  })

  describe("with a conventional PR title", () => {
    const title = "feat: title"

    it("resolves pending", async () => {
      const expected = pending(Description.SingleNonConventional)
      await test({ title, commits, expected })
    })
  })
})

describe("a single conventional commit", () => {
  const commits = ["feat: commit"]

  describe("with a non-conventional PR title", () => {
    const title = "title"

    it("resolves pending", async () => {
      const expected = pending(Description.Mismatched)
      await test({ title, commits, expected })
    })
  })

  describe("with a non-matching conventional PR title", () => {
    const title = "feat: title"

    it("resolves pending", async () => {
      const expected = pending(Description.Mismatched)
      await test({ title, commits, expected })
    })
  })

  describe("with a matching conventional PR title", () => {
    const title = "feat: commit"

    it("resolves success", async () => {
      const expected = success()
      await test({ title, commits, expected })
    })
  })
})

describe("a single non-conventional commit with GitHub update commits", () => {
  const commits = ["commit", "Merge branch 'master' into some-branch"]

  describe("with a conventional PR title", () => {
    const title = "feat: commit"

    it("resolves pending", async () => {
      const expected = pending(Description.SingleNonConventional) //?
      await test({ title, commits, expected })
    })
  })
})
