import * as core from '@actions/core'
import * as github from '@actions/github'

export const uploadImageToGithub = async (
  imageContent: string,
  imagePath: string
) => {
  try {
    // create commit
    const branch = core.getInput('branch') || 'main'
    const token = core.getInput('token')
    const octokit = github.getOctokit(token)

    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    // get latest ref
    const {data: refData} = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    })
    const commitSha = refData.object.sha
    const latestCommit = await octokit.rest.git.getCommit({
      commit_sha: commitSha,
      owner,
      repo
    })
    const latestSha = latestCommit.data.sha

    const {data: blobData} = await octokit.rest.git.createBlob({
      owner,
      repo,
      encoding: 'base64',
      content: imageContent
    })

    const {data: blobTree} = await octokit.rest.git.createTree({
      owner,
      repo,
      tree: [
        {
          type: 'blob',
          sha: blobData.sha,
          mode: '100644',
          path: imagePath
        }
      ],
      base_tree: latestSha
    })

    const {data: newCommit} = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: 'chore: update peerlist.io image',
      parents: [latestSha],
      tree: blobTree.sha
    })

    await octokit.rest.git.updateRef({
      ref: `heads/${branch}`,
      sha: newCommit.sha,
      owner,
      repo
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }
}
