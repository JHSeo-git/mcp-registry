import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest"

import { Env } from "./env"

const octokit = new Octokit({ auth: Env.GITHUB_TOKEN })

export type GitHubRepository = RestEndpointMethodTypes["repos"]["get"]["response"]

export async function getRepository(owner: string, repo: string) {
  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo,
  })

  const { data: branchData } = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch: repoData.default_branch,
  })

  return {
    ...repoData,
    headSha: branchData.commit.sha,
    commitMessage: branchData.commit.commit.message,
  }
}
