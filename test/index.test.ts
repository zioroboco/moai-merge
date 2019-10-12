import nock from "nock"
import { Probot } from "probot"
import moaiMerge from "../src"
import payload from "./fixtures/issues.opened.json"

const issueCreatedBody = { body: ":moyai:" }

nock.disableNetConnect()

describe("moai-merge", () => {
  let probot: any

  beforeEach(() => {
    probot = new Probot({ id: 123, cert: "test" })
    const app = probot.load(moaiMerge)

    // just return a test token
    app.app = {
      getSignedJsonWebToken: () => Promise.resolve("test"),
    }
  })

  test("creates a comment when an issue is opened", async done => {
    // Test that we correctly return a test token
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })

    // Test that a comment is posted
    nock("https://api.github.com")
      .post("/repos/zioroboco/moai-merge/issues/1/comments", (body: any) => {
        done(expect(body).toMatchObject(issueCreatedBody))
        return true
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: "issues", payload })
  })
})
