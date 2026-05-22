# n8n-nodes-fluidx

Community n8n node for the **fluidX revXR THE EYE** API. Adds a single `fluidX` node that exposes:

| Resource     | Operations                                  |
| ------------ | ------------------------------------------- |
| Session      | Create, Get, Get All, Close, Close All      |
| Inbound Call | Create, Get, Cancel, End                    |
| SMS          | Send                                        |
| Email        | Send                                        |
| Media        | Get Info, Upsert Info, Get Summary          |

Once installed it appears in n8n's node search as **fluidX**.

## Install

### A) Via the community node UI (recommended)

In n8n: **Settings → Community Nodes → Install** and enter:

```
n8n-nodes-fluidx
```

### B) Local development against your n8n instance

```bash
git clone <this-repo> n8n-nodes-fluidx
cd n8n-nodes-fluidx
npm install
npm run build
# link it into your n8n custom-nodes folder
npm link
cd ~/.n8n/custom
npm link n8n-nodes-fluidx
# restart n8n
```

## Credentials

After install, create a new credential of type **fluidX API** with:

- **Base URL** — your fluidX root, e.g. `https://live.fluidx.digital`
- **API Key** — your tenant API key (sent as `x-api-key`)

The credential test hits `GET /api/healthz` against the configured Base URL.

## Build

```bash
npm install
npm run build      # compiles TS + copies SVG icons
npm run dev        # watch mode
npm run lint
```

Output goes to `dist/`. The `n8n` block in `package.json` points at
`dist/credentials/FluidXApi.credentials.js` and `dist/nodes/FluidX/FluidX.node.js`.

## Endpoints covered

| n8n Operation             | HTTP                                                            |
| ------------------------- | --------------------------------------------------------------- |
| Session → Create          | `POST /api/fx/ext/session/create`                               |
| Session → Get             | `GET /api/fx/ext/session?sessionId=`                            |
| Session → Get All         | `GET /api/fx/ext/session/all?status=&includeAll=`               |
| Session → Close           | `POST /api/fx/ext/session/close`                                |
| Session → Close All       | `POST /api/fx/ext/session/close/all`                            |
| Inbound Call → Create     | `POST /api/fx/ext/inbound/calls`                                |
| Inbound Call → Get        | `GET /api/fx/ext/inbound/calls/{id}` (header `x-call-token`)    |
| Inbound Call → Cancel     | `POST /api/fx/ext/inbound/calls/{id}/cancel`                    |
| Inbound Call → End        | `POST /api/fx/ext/inbound/calls/{id}/end`                       |
| SMS → Send                | `POST /api/fx/ext/sms/send`                                     |
| Email → Send              | `POST /api/fx/ext/email/send`                                   |
| Media → Get Info          | `GET /api/fx/ext/media/info?type=&id=`                          |
| Media → Upsert Info       | `POST /api/fx/ext/media/info`                                   |
| Media → Get Summary       | `GET /api/fx/ext/media/summary?sessionId=`                      |

## Releasing

Releases are managed locally with [`release-it`](https://github.com/release-it/release-it) and published from CI with npm provenance.

```bash
# interactive (asks which version bump to use)
npm run release

# non-interactive bumps
npm run release:patch
npm run release:minor
npm run release:major

# preview without changing anything
npm run release:dry
```

`release-it` will: run lint + build, bump the version in `package.json`, update `CHANGELOG.md` from conventional commits, commit, tag (`vX.Y.Z`), push, and create the GitHub release. The pushed tag triggers `.github/workflows/publish.yml`, which runs `npm publish` with provenance — required for n8n's verified-node program.

Prerequisites:

- Run on the `main` branch with a clean working tree.
- Authenticate with GitHub so a release can be created: either export `GITHUB_TOKEN`, or use `GITHUB_TOKEN="$(gh auth token)" npm run release`.
- The `NPM_TOKEN` secret must be set in the GitHub repo so the publish workflow can authenticate.

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `ci:`, `docs:`, etc.) so the changelog and version bump are derived correctly.

## License

MIT
