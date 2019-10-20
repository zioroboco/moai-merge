<div align="center">
  <h1>
    <p>🗿</p>
    <p>moai-merge</p>
  </h1>
  <p>
    An opinionated squash-based workflow for conventional PRs.
  </p>
  <img src="https://img.shields.io/circleci/project/github/zioroboco/moai-merge/master.svg"/>
  <img src="https://img.shields.io/uptimerobot/ratio/m783615916-0d5e348c3b840b241b2c59fe"/>
</div>
<br/>

Blocks any pull request which will not result in a [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) to the base branch when merged with a [squash and merge](https://help.github.com/en/articles/about-pull-request-merges#squash-and-merge-your-pull-request-commits) strategy using GitHub's default commit message.

It's rules are simple:

- For a branch containing multiple commits, the PR must have a conventional title.

- For a branch containing only a single commit...
  - ... the commit itself must have a conventional commit message, and...
  - ... for consistency, the PR title must match that message.
