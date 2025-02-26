# Walnut Starter Project

![walnut banner](assets/walnut_banner.png)

### Overview

A good example to get you started with using `stype`. The app is centered around
a walnut with a secret number inside.

Every time you shake the walnut, this number increments. Every time you hit the
walnut, the shell gets closer to cracking. You can only look at the number once
the shell is cracked.

### Local Development

#### Prerequisites
Make sure you have the `seismic-foundry` suite of dev tools installed. See the installation instructions [here](https://docs.seismic.systems/onboarding/publish-your-docs).


#### Installing dependencies
Make sure you have [bun](https://bun.sh/docs/installation) installed.
Install the dependencies for the project by running:

```bash
bun install
```
from the root directory.

#### Setting up the contracts

Go to the [`contracts` directory](packages/contracts/) and follow the instructions in the [`contracts` README](packages/contracts/README.md) to set up the `Walnut` contract.

#### Setting up and running the CLI

Then, go to the [`cli` directory](packages/cli/) and follow the instructions in the [`cli` README](packages/cli/README.md) to set up and run the CLI.

