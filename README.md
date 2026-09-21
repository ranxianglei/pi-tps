# @ranxianglei/pi-tps

A tiny [pi](https://pi.dev) extension — 极简 tps 小工具：shows the assistant output speed after each response.

After every assistant message, pi pops a notification like:

```
⚡ out 342 tok · 87.3 tok/s
```

(`out N tok` = tokens generated in that message, `N tok/s` = average output speed over the whole message including time-to-first-token.)

## Install

```bash
# from npm
pi install npm:@ranxianglei/pi-tps

# one-off trial (no install)
pi -e npm:@ranxianglei/pi-tps
```

Uninstall:

```bash
pi remove npm:@ranxianglei/pi-tps
```

Requires a pi build where extensions are auto-discovered (default). No other dependencies.

## Notes

- Speed is measured per assistant message via `message_start`/`message_end` and `usage.output`; it is an average over the whole message, not a live per-second counter.
- Displayed with the theme's `success` color; change `fg("success", ...)` in `extensions/tps.ts` to any other token (`accent`, `warning`, ...).
- If your frontend does not render footer status, the notification (`ctx.ui.notify`) path shown here works in both TUI and RPC/ACP mode.

## License

MIT
