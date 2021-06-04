
# GitHub Repository Naming Convention Action

> A GitHub Action that generates a report with all repository names including the date of creation belonging to an organization not matching a set regex string.

## Workflow

The example [workflow](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions) below runs on a weekly [schedule](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#scheduled-events) and can be executed manually using a [workflow_dispatch](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#manual-events) event.

```yml
on:
  workflow_dispatch:
  schedule:
      - cron: '0 0 * * 0' # Once per week at midnight on Sunday

name: Incorrect Naming Convention Report

jobs:
  report:
    runs-on: ubuntu-latest

    steps:

      - name: Checkout
        uses: actions/checkout@v2

      - name: Create Incorrect Naming Convention Report
        uses: nicklegan/repository-naming-convention-action@main
        with:
          token: ${{ secrets.REPO_TOKEN }}
          regex: '^([a-z0-9]+)-([a-z0-9]+)$'
          flags: i
```

## GitHub secrets

| Name                  | Value                                   | Required |
| :------------         | :---------------------------------------| :------- |
| `REPO_TOKEN`          | A `repo` scoped [Personal Access Token] | `true`   |
| `ACTIONS_STEP_DEBUG`  | `true` [Enables diagnostic logging]     | `false`  |

## Action inputs

| Name             | Description                                                      | Default                                          | Required |
| :--------------- | :----------------------------------------------------------      | :----------------------------------------------- | :------- |
| `regex`          | A regex string matching correct repo naming conventions          | `^([a-z0-9]+)-([a-z0-9]+)$`                      | `true`   |
| `flags`          | Flag for repo naming regex string. e.g. 'i' for case-insensitive | `i`                                              | `false`  |
| `report-path`    | Path within the repository to create the report CSV file         | `reports/incorrect-naming-convention-report.csv` | `false`  |
| `committer-name` | The name of the committer to be displayed in the history         | `github-actions`                                 | `false`  |
| `committer-email`| The email of the committer to be displayed in the history        | `github-actions@github.com`                      | `false`  |

## Regex examples

Regex example 1: `####-####` (2 fixed groups separated by a dash).

- `^([a-z0-9]+)-([a-z0-9]+)$`

Regex example 2: `prefix-####-####-*` (3 groups separated by dashes starting with a prefix).
- `^(prefix)-([a-z0-9]+)-([a-z0-9]+)`

Regex example 3: `####-####-####-*` (3 groups containing names and numbers divided by dashes).

- `^([a-z0-9]+)-([a-z0-9]+)-([a-z0-9]+)`

As a default the `i` flag is recommended to allow matches to be case-insensitive

:bulb: For more info about regular expressions visit [Regular-Expressions.info](https://www.regular-expressions.info)


[Personal Access Token]: https://github.com/settings/tokens/new?scopes=repo&description=GitHub+Repository+Naming+Convention+Action 'Personal Access Token'

[Enables diagnostic logging]: https://docs.github.com/en/actions/managing-workflow-runs/enabling-debug-logging#enabling-runner-diagnostic-logging 'Enabling runner diagnostic logging'