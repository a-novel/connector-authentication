# Connector authentication

Client definitions for the authentication service.

[![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/agora_ecrivains)](https://twitter.com/agora_ecrivains)
[![Discord](https://img.shields.io/discord/1315240114691248138?logo=discord)](https://discord.gg/rp4Qr8cA)

<hr />

![GitHub repo file or directory count](https://img.shields.io/github/directory-file-count/a-novel/connector-authentication)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/a-novel/connector-authentication)

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/a-novel/connector-authentication/main.yaml)
[![codecov](https://codecov.io/gh/a-novel/connector-authentication/graph/badge.svg?token=1Keb1tbYbi)](https://codecov.io/gh/a-novel/connector-authentication)

![Coverage graph](https://codecov.io/gh/a-novel/connector-authentication/graphs/sunburst.svg?token=1Keb1tbYbi)

## Installation

> ⚠️ **Warning**: Even though the package is public, GitHub registry requires you to have a Personal Access Token
> with `repo` and `read:packages` scopes to pull it in your project. See
> [this issue](https://github.com/orgs/community/discussions/23386#discussioncomment-3240193) for more information.

Create a `.npmrc` file in the root of your project if it doesn't exist, and make sure it contains the following:

```ini
@a-novel:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${YOUR_PERSONAL_ACCESS_TOKEN}
```

Then, install the package using pnpm:

```bash
pnpm add react @tanstack/react-query @a-novel/connector-authentication
```

## Extra steps

This package requires the `VITE_AUTH_API` to be set in the environment. It must point to a valid instance of the
[authentication api](https://github.com/a-novel/service-authentication).
