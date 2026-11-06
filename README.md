# PatternLab

A local practice workspace for the NeetCode 250. Write Python or JavaScript, follow the 125-day study plan, and revisit problems in the Solve again queue.

## Run locally

Install Node.js 22 or newer, then run these commands in a terminal with access to this private repository.

```sh
git clone https://github.com/HickoDev/patternlab-250.git
cd patternlab-250
npm ci
npm start
```

Open [PatternLab on your computer](http://127.0.0.1:4173). Press Ctrl+C in the terminal to stop the server. Subsequent sessions only need `npm start` from the repository directory. The server listens on the loopback interface. To change the port in PowerShell, run `$env:PORT = '4180'` before starting it.

## Practice

- **Practice dashboard** groups all 250 problems into 18 collapsible topics. Each header shows how many problems you have solved out of the full topic. Search, filters, and bookmarks open matching sections automatically. Clearing the filters restores the topics you opened on the dashboard.
- **Study plan** pairs two problems per day. Start or continue from the dashboard. In a guided session the arrows follow the plan order. From the library they follow catalog order.
- **Practice room** supports Python 3 (Pyodide) and JavaScript. Use the language selector above the editor. Each language has its own saved draft. Use `solve(...)` for function problems or the starter's `Solution` methods for stateful problems. The runner supplies the node and callback interfaces in the examples. Standard-library modules bundled with Pyodide, such as `collections`, `heapq`, and `bisect`, run locally.
- **Solve again** adds a problem to a first-in, first-out review queue. Select **Retry** for a fresh draft in each language. **Finish review** removes it from the queue. The original solution and solved status are independent of retries.
- **Progress backup** exports a versioned JSON file containing completion, bookmarks, notes, original and retry drafts, and queue membership. Import previews the number of affected problems and conflicts. Only fields present in the backup replace local values. Changes commit in one IndexedDB transaction. Older per-problem browser records migrate on first launch.
- **Mark solved** records your own completion decision. Return to the same local address and browser profile, or export and import a backup to move your progress.

## Complexity and execution limits

Open **Complexity target & constraints** in a practice room. For 150 problems the source is NeetCode’s explicit recommended time and space target. For the other 100 the panel names a specific published NeetCode editorial method and shows its documented cost. The source link identifies which one applies. LeetCode numerical bounds, explicit performance requirements, and follow-ups are included where available from the public problem statement. **Reveal an approach** gives a hint and links to NeetCode's full solution. The snapshot was checked on November 6, 2026.

**Run samples** checks the displayed examples in an isolated browser worker. A suite has a four-second wall-clock limit. Python gets a separate 30-second startup budget. The results report elapsed milliseconds for each example, including its adapter and submission execution, excluding interpreter startup. These timings depend on the browser, machine and sample inputs.

Python’s WebAssembly linear memory has a hard **128 MiB** ceiling, shared by the interpreter and the submission. Results report the heap capacity reached, including the interpreter. JavaScript uses browser-managed memory and has no app-enforced heap cap or reported peak. Neither small-sample timings nor heap capacity establish an algorithm's Big-O complexity. Use the linked official judge for its hidden cases and platform-specific limits.

Use `/` to focus library search and Ctrl+Enter (Cmd+Enter on macOS) to run samples from the editor. After the initial `npm ci`, both languages work offline. Links to the source platforms require internet access.

## Development

```sh
npm test
```

The app uses browser modules and the built-in Node.js HTTP server. It serves the pinned Pyodide runtime from the local npm installation. The catalog and schedule are in `dist/data/catalog.json`. Source-attributed complexity data is in `dist/data/strategies.json`. Both languages share the answer comparisons in `dist/js/judge.js`. Python sample adapters live in `dist/python/judge.py`.

## Credits

The problem titles, topics, difficulty labels, platform links, and study order come from [ascherj/neetcode-250-guide at b15487d](https://github.com/ascherj/neetcode-250-guide/tree/b15487d825d2cf8823eb40d4bb8229a6d9bb8975). The upstream README identifies the guide as MIT-licensed. Its example calendar has 129 numbered days. PatternLab keeps its sequence of 250 problems and pairs the eight final single-problem days to produce 125 two-problem days. See [third-party notices](THIRD_PARTY_NOTICES.md).

PatternLab is an independent study tool. NeetCode and LeetCode are referenced as the sources of the problem collections and official problem pages.
