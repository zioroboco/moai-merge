import { parse } from "../src/parser"

const FAIL_NONCONVENTIONAL = "commit parsed as non-conventional"

const type = "feat"
const scope = "some-package"
const subject = "add some feature"

describe("parsing conventional commits", () => {
  describe("with type, scope and subject", () => {
    const commit = `${type}(${scope}): ${subject}`
    const parsed = parse(commit)
    if (!parsed.conventional) throw new Error(FAIL_NONCONVENTIONAL)

    it("extracts all properties", () => {
      expect(parsed.type).toBe(type)
      expect(parsed.subject).toBe(subject)
      expect(parsed.scope).toBe(scope)
    })
  })

  describe("with type and subject", () => {
    const commit = `${type}: ${subject}`
    const parsed = parse(commit)
    if (!parsed.conventional) throw new Error(FAIL_NONCONVENTIONAL)

    it("extracts all properties", () => {
      expect(parsed.type).toBe(type)
      expect(parsed.subject).toBe(subject)
    })

    it("returns null scope", () => {
      expect(parsed.scope).toBeNull()
    })
  })
})

describe("parsing invalid commits", () => {
  const invalidCommits = [
    `${subject}`,
    `${type}:`,
    `${type}: `,
    `${type}(${scope}):`,
    `${type}(${scope}): `,
    `${type}:${subject}`,
    `nonsense: ${subject}`,
    `FEAT: ${subject}`,
  ]

  invalidCommits.forEach(commit => {
    it("returns non-conventional", () => {
      const parsed = parse(commit)
      expect(parsed.conventional).toBe(false)
    })
  })
})
