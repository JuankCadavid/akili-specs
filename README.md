<div align="center">

<pre>
 █████╗ ██╗  ██╗██╗██╗     ██╗
██╔══██╗██║ ██╔╝██║██║     ██║
███████║█████╔╝ ██║██║     ██║
██╔══██║██╔═██╗ ██║██║     ██║
██║  ██║██║  ██╗██║███████╗██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝
</pre>

# AKILI

Spec-driven development for AI coding assistants: plan the change, build it, test it, and learn from it.

<p>
  <a href="https://www.npmjs.com/package/akili-specs"><img alt="npm version" src="https://img.shields.io/npm/v/akili-specs?style=for-the-badge&label=npm"></a>
  <img alt="License MIT" src="https://img.shields.io/npm/l/akili-specs?style=for-the-badge&label=license&color=cfb600">
  <img alt="Node.js 18+" src="https://img.shields.io/badge/Node.js-18%2B-91c714?style=for-the-badge">
</p>

Works with Claude Code · OpenCode · Google Antigravity · OpenAI Codex CLI · Cursor · Grok Bot — on macOS, Linux and Windows

</div>

## What is AKILI?

AKILI adds slash commands and skills to your AI coding assistant.
It makes the assistant write a spec before it codes, then build the change, test it and check the work against that spec.
After each change, it learns what to do better next time.

**What you get**

- Shared project context that the assistant reads every session.
- Every change planned in writing and traceable to a requirement.
- Built-in review and tests before anything is called done.
- A method that learns from every finished change.
- Extras for security audits, video, diagrams and a growth track (`/akili-seo`, `/akili-marketing`): see the [overview](docs/overview.md).

| Term | Meaning |
|---|---|
| slash command | A prompt you type in your assistant, such as `/akili-propose`, that runs one step of the method. |
| skill | A reusable set of instructions the assistant loads when the work needs it, such as debugging or UI design. |
| spec | The folder of documents for one change: requirements, design and a task list, written before any code. |
| constitution | The project-wide baseline (product, design and technical docs, plus the guides the assistant reads), set up once. |

## How it works

<p align="center">
  <a href="https://raw.githubusercontent.com/JuankCadavid/akili-specs/master/assets/akili-flow.png">
    <picture>
    <source media="(prefers-reduced-motion: reduce)" srcset="https://raw.githubusercontent.com/JuankCadavid/akili-specs/master/assets/akili-flow.png">
    <img alt="The AKILI flow: set up the project once, then each change is proposed, specified, built, tested, validated and archived; seven commands run any time, among them a security audit and a pull-request review that can also run in CI; two of them, SEO and marketing, form a growth track."
         src="https://raw.githubusercontent.com/JuankCadavid/akili-specs/master/assets/akili-flow-animated.svg" width="900">
    </picture>
  </a>
</p>

- Set up the project once with `/akili-constitution`.
- Each change then runs propose, specify, execute, test, validate, archive.
- Some commands work any time, outside that path.
- The full flow is in [docs/flow.md](docs/flow.md).

## Install

### What you need

- Node.js 18 or newer
- Git
- One supported AI tool: Claude Code, OpenCode, Google Antigravity, OpenAI Codex CLI, Cursor or Grok Bot

### Install

```bash
npx akili-specs init
```

The wizard asks which tool to set up and whether to install globally or in this project.
With pnpm, run `pnpm dlx akili-specs init` instead.

### Check it worked

```bash
npx akili-specs doctor
```

Restart your AI tool, then type `/akili-` and the AKILI commands appear (in Codex, type `$akili-`).

Other tools, flags, manual install, updating and troubleshooting: see [docs/cli.md](docs/cli.md).

## Your first spec

Run these in your AI assistant, in order:

1. `/akili-constitution`: AKILI studies your project and writes the baseline docs and guides, such as `docs/prd.md`.
2. `/akili-propose <name>`: you describe the change and AKILI writes a short proposal, `proposal.md`.
3. `/akili-specify <spec-path>`: AKILI plans the change in `requirements.md`, `design.md` and `tasks.md`.
4. `/akili-execute <spec-path>`: AKILI builds the approved tasks one by one and logs the work in `execution.md`.
5. `/akili-test`, `/akili-validate`, then `/akili-archive` (each with the spec path): you get `test-report.md`, `validation-report.md`, then `archive-summary.md`.

Tiny copy or color change? Use `/akili-quick <change-name>` and skip the steps.
Coming back after a break? Run `/akili-resume` to see where each spec stands.
A worked example with real names is in [docs/flow.md](docs/flow.md#practical-example).

## Commands at a glance

### In your AI assistant

| Command | Use it to… |
|---|---|
| **Every change** | |
| [`/akili-constitution`](docs/commands/akili-constitution.md) | set up or repair the project baseline docs and the guides your assistant reads |
| [`/akili-propose <name>`](docs/commands/akili-propose.md) | write a short proposal that you review before full planning |
| [`/akili-specify <spec-path>`](docs/commands/akili-specify.md) | plan one bounded change: requirements, design and a task list |
| [`/akili-execute <spec-path>`](docs/commands/akili-execute.md) | build the approved tasks one by one, each independently checked |
| [`/akili-test <spec-path>`](docs/commands/akili-test.md) | write and run tests, and record the evidence |
| [`/akili-validate <spec-path>`](docs/commands/akili-validate.md) | check that the finished work matches the approved spec |
| [`/akili-archive <spec-path>`](docs/commands/akili-archive.md) | close a finished change and record what was learned |
| **Any time** | |
| [`/akili-quick <change-name>`](docs/commands/akili-quick.md) | make a trivial, low-risk change in one step; it escalates if the change is bigger |
| [`/akili-audit`](docs/commands/akili-audit.md) | check that the code still matches your product and design docs |
| [`/akili-resume`](docs/commands/akili-resume.md) | pick up after a break with a briefing on your active specs |
| [`/akili-seo <site-domain>`](docs/commands/akili-seo.md) | set up Google Search Console for a domain and audit its SEO |
| [`/akili-security [<path>…]`](docs/commands/akili-security.md) | audit your repository for security vulnerabilities; confirmed findings are routed to bug proposals. Not supported on native Windows (use WSL, Linux or macOS) |
| [`/akili-marketing <mode> [args]`](docs/commands/akili-marketing.md) | draft LinkedIn, Instagram and Facebook posts as Markdown files; it never publishes |
| [`/akili-review [<pr> \| <base>..<head> \| --staged]`](docs/commands/akili-review.md) | review a pull request or diff against its specs; posts one summary comment only when asked (`--comment`) or from CI; it never edits, approves or blocks |

### In your terminal

| Command | Use it to… |
|---|---|
| `akili init` | run the setup wizard |
| `akili install` | install the commands and skills without the wizard |
| `akili update` | update to the latest version and reinstall the files |
| `akili list` | list what the package ships |
| `akili doctor` | check that the expected files are installed; `--agents` checks that your project's agent instruction files are up to date (`--fix` updates them) |
| `akili routing` | choose which AI model runs each step ([model routing](docs/model-routing.md)) |
| `akili check-update` | print a line if a newer version is published |
| `akili notifications` | turn update announcements on or off (Claude Code only) |

Every option and example: [docs/cli.md](docs/cli.md).

## Learn more

| I want to… | Read |
|---|---|
| see every command, skill and install target in one place | [docs/overview.md](docs/overview.md) |
| browse all the docs | [docs/README.md](docs/README.md) |
| follow the whole flow, step by step | [docs/flow.md](docs/flow.md) |
| look up one command | [docs/commands/README.md](docs/commands/README.md) |
| look up one skill | [docs/skills/README.md](docs/skills/README.md) |
| use the terminal tool or fix an install | [docs/cli.md](docs/cli.md) |
| pick the AI model for each step | [docs/model-routing.md](docs/model-routing.md) |
| know how skills are chosen and kept | [docs/skills/governance.md](docs/skills/governance.md) |
| compare AKILI with OpenSpec | [docs/openspec-comparison.md](docs/openspec-comparison.md) |
| use AKILI from an MCP client with nothing installed (hosted AKILI MCP service, not live yet) | [akili.com.co](https://akili.com.co) |

## Contributing and license

Contributions: see [CONTRIBUTING.md](CONTRIBUTING.md); releases follow [docs/release-checklist.md](docs/release-checklist.md).
Created and maintained by **Juan Carlos Cadavid** — [jcadavid.com](https://jcadavid.com). Released under the [MIT License](LICENSE).
Every command and every agent template carries this authorship notice.
The license lets you use, modify and redistribute AKILI, provided the copyright and attribution notices are kept.
