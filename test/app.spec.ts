import Octokit from "@octokit/rest"
import nock from "nock"
import { GitHubAPI } from "probot/lib/github"
import { APP_NAME, PullRequestContext, updateStatus } from "../src/app"
import { Description, failure, PR, success } from "../src/status"

nock.disableNetConnect()

const HEAD_SHA = "c0ffee"

const makeContext = ({ author, title }: Partial<PR>): PullRequestContext => ({
  repo: params => ({ owner: "zioroboco", repo: "moai-merge", ...params }),
  github: new Octokit() as GitHubAPI,
  payload: {
    pull_request: {
      number: 1,
      title,
      // @ts-ignore
      user: {
        login: author,
      },
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
  context: PullRequestContext
  commits?: string[]
  expected: any
}) => {
  const scope = makeScope(params.commits, params.expected)
  await updateStatus(params.context)
  expect(scope.isDone()).toBe(true)
}

describe("multiple non-conventional commits", () => {
  const commits = ["commit-one", "commit-two"]

  describe("with a non-conventional PR title", () => {
    const context = makeContext({ title: "title" })

    it("resolves failure", async () => {
      const expected = failure(Description.MultipleNonConventional)
      await test({ commits, context, expected })
    })
  })

  describe("with a conventional PR title", () => {
    const context = makeContext({ title: "feat: title" })

    it("resolves success", async () => {
      const expected = success()
      await test({ commits, context, expected })
    })
  })
})

describe("a single non-conventional commit", () => {
  const commits = ["commit"]

  describe("with a non-conventional PR title", () => {
    const context = makeContext({ title: "title" })

    it("resolves failure", async () => {
      const expected = failure(Description.SingleNonConventional)
      await test({ commits, context, expected })
    })
  })

  describe("with a conventional PR title", () => {
    const context = makeContext({ title: "feat: title" })

    it("resolves failure", async () => {
      const expected = failure(Description.SingleNonConventional)
      await test({ commits, context, expected })
    })
  })
})

describe("a single conventional commit", () => {
  const commits = ["feat: commit"]

  describe("with a non-conventional PR title", () => {
    const context = makeContext({ title: "title" })

    it("resolves failure", async () => {
      const expected = failure(Description.Mismatched)
      await test({ commits, context, expected })
    })
  })

  describe("with a non-matching conventional PR title", () => {
    const context = makeContext({ title: "feat: title" })

    it("resolves failure", async () => {
      const expected = failure(Description.Mismatched)
      await test({ commits, context, expected })
    })
  })

  describe("with a matching conventional PR title", () => {
    const context = makeContext({ title: "feat: commit" })

    it("resolves failure", async () => {
      const expected = success()
      await test({ commits, context, expected })
    })
  })
})

describe("a single non-conventional commit with GitHub update commits", () => {
  const commits = ["commit", "Merge branch 'master' into some-branch"]

  describe("with a conventional PR title", () => {
    const context = makeContext({ title: "feat: commit" })

    it("resolves failure", async () => {
      const expected = failure(Description.SingleNonConventional)
      await test({ commits, context, expected })
    })
  })
})

describe("when the author is dependabot", () => {
  const logins = ["dependabot", "dependabot-preview"]

  describe("irrespective of what's in the branch/PR", () => {
    const commits = ["yowza", "blammo"]
    const title = "blep"

    it("resolves success", async () => {
      const expected = success()
      logins.forEach(async author => {
        const context = makeContext({ author, title })
        await test({ commits, context, expected })
      })
      expect.assertions(logins.length)
    })
  })
})
