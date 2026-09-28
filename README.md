# slopcheck

Zero-dependency CLI and linter to detect AI-generated slop, tells, buzzwords, and structural defects in text, markdown, and code comments.

## Features

- **Fast & Zero Dependencies**: Runs directly on Node.js standard library.
- **Vocabulary Checks**: Detects empty verbs and nouns (`delve`, `tapestry`, `game-changer`, `seamless`).
- **Punctuation Hygiene**: Flags forbidden em dashes (`—`), double-hyphens, and scare quotes.
- **Structural Tells**: Catches redundant header lists, false ranges, and negative parallelism.
- **Code Comment Cleaner**: Flags mechanical step commentary (`// Step 1: Validate input`).
- **CI/CD Ready**: Supports `--format=pretty`, `--format=json`, and `--format=github` annotations.

## Installation

```bash
npm install -g slopcheck
# or run directly with npx
npx slopcheck README.md
```

## CLI Usage

Scan markdown or text files:

```bash
slopcheck README.md docs/*.md
```

Scan standard input (pipes / pre-commit hooks):

```bash
git diff | slopcheck --stdin
```

Options:

```
  -f, --format <pretty|json|github>   Output format (default: pretty)
  -w, --warn-only                     Do not exit with code 1 on errors
  -s, --stdin                         Read input from standard input
  -v, --version                       Show version
  -h, --help                          Show help
```

## Programmatic API

```js
import { lintContent, lintFile } from "slopcheck";

const issues = lintContent("Let's delve into this code.", "example.md");
console.log(issues);
```

## License

MIT © [zlixv](https://github.com/zadamiman)
