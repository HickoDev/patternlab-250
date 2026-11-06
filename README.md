# PatternLab

A local practice workspace for the NeetCode 250. Search the problem library, follow the 125-day study plan, and write and test JavaScript in your browser. The catalog, instructions, examples, fonts, and code runner are bundled with the app.

## Run locally

Install Node.js 22 or newer, then run these commands in a terminal with access to this private repository.

```sh
git clone https://github.com/HickoDev/patternlab-250.git
cd patternlab-250
npm start
```

Open [PatternLab on your computer](http://127.0.0.1:4173). Press Ctrl+C in the terminal to stop the server. Subsequent sessions only need `npm start` from the repository directory. The server listens on the loopback interface. To change the port in PowerShell, run `$env:PORT = '4180'` before starting it.

## Practice

- **Practice dashboard** shows all 250 problems across 18 topics. Search by name or topic, filter by difficulty or completion, and bookmark problems for review.
- **Study plan** pairs two problems per day. Start or continue from the dashboard. In a guided session the arrows follow the plan order. From the library they follow catalog order.
- **Practice room** includes an original short prompt, sample inputs and outputs, a JavaScript editor, private notes, and links to the source platforms. Examples explain the local interface for pointer structures, stateful classes, and in-place updates.
- **Run samples** executes your solution in an isolated browser worker with a four-second limit. Each case shows its result and any returned value or error. These are practice examples. Use the linked platform for official submissions and its full judge.
- **Mark solved** records your own completion decision. Drafts, notes, bookmarks, and completion live in this browser’s local storage. Reopen the same address in the same browser profile to continue. Clearing site data deletes these records.

Use `/` to focus library search and Ctrl+Enter (Cmd+Enter on macOS) to run samples from the editor. External references require internet access. The local practice workflow works offline once the project is on your computer.

## Development

```sh
npm test
```

The app uses browser modules and the built-in Node.js HTTP server. There are no package dependencies or build steps. The catalog and schedule are in `dist/data/catalog.json`. The sample adapters and comparison rules are in `dist/js/judge.js`.

## Credits

The problem titles, topics, difficulty labels, platform links, and study order come from [ascherj/neetcode-250-guide at b15487d](https://github.com/ascherj/neetcode-250-guide/tree/b15487d825d2cf8823eb40d4bb8229a6d9bb8975). The upstream README identifies the guide as MIT-licensed. Its example calendar has 129 numbered days. PatternLab keeps its sequence of 250 problems and pairs the eight final single-problem days to produce 125 two-problem days. See [third-party notices](THIRD_PARTY_NOTICES.md).

PatternLab is an independent study tool. NeetCode and LeetCode are referenced as the sources of the problem collections and official problem pages.
