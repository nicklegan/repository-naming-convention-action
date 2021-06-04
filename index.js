/**
 * Repository Naming Convention Action.
 */
const path = require('path')
const core = require('@actions/core')
const github = require('@actions/github')
const dayjs = require('dayjs')
const stringify = require('csv-stringify/lib/sync')

// get org repos
async function getConventionrepos(octokit, org, conventionrepos) {
  const orgrepos = await octokit.paginate(octokit.repos.listForOrg, {
    org
  })

  // filter repos by set regex string
  for (const orgrepo of orgrepos) {
    const { name, login, created_at } = orgrepo
    const regex = core.getInput('regex')
    const flags = core.getInput('flags')
    const re = new RegExp(regex, flags)

    if (re.test(name) === true) continue

    conventionrepos.push({ org, login, name, created_at })
  }
}

// prepare parameters for report push back
;(async () => {
  try {
    const reportPath = core.getInput('report-path', { required: false }) || 'reports/incorrect-naming-convention-report.csv'
    const committerName = core.getInput('committer-name', { required: false }) || 'github-actions'
    const committerEmail = core.getInput('committer-email', { required: false }) || 'github-actions@github.com'
    const filePath = path.join(process.env.GITHUB_WORKSPACE, reportPath)
    const { dir } = path.parse(filePath)

    if (dir.indexOf(process.env.GITHUB_WORKSPACE) < 0) {
      throw new Error(`${reportPath} is not an allowed path`)
    }

    const token = core.getInput('token', { required: true })
    const octokit = new github.getOctokit(token)
    const { owner, repo } = github.context.repo

    const conventionrepos = [
      {
        name: 'Incorrect repository name',
        created_at: 'Date created'
      }
    ]

    // prepare the list of repos matching the API
    await getConventionrepos(octokit, owner, conventionrepos)

    const csv = stringify(conventionrepos, {})
    const date = dayjs().format('YYYY-MM-DD')

    const opts = {
      owner,
      repo,
      path: reportPath,
      message: `${date} Incorrect naming report`,
      content: Buffer.from(csv).toString('base64'),
      committer: {
        name: committerName,
        email: committerEmail
      }
    }

    // try to get the sha, if the file already exists
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: reportPath
      })

      if (data && data.sha) {
        opts.sha = data.sha
      }
    } catch (err) {}

    // push the report back to the repo
    await octokit.repos.createOrUpdateFileContents(opts)
  } catch (err) {
    core.setFailed(err.message)
  }
})()
