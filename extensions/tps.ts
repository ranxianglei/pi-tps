/**
 * TPS - notify the assistant output speed (tokens/sec) after each assistant message.
 * Placed in ~/.pi/agent/extensions/ (auto-discovered, hot-reloadable via /reload).
 */

import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	let start = 0;

	pi.on("message_start", async (event) => {
		if (event.message.role === "assistant") start = Date.now();
	});

	pi.on("message_end", async (event, ctx) => {
		if (event.message.role !== "assistant" || !start) return;
		const m = event.message as AssistantMessage;
		const secs = (Date.now() - start) / 1000;
		if (secs > 0 && m.usage.output > 0) {
			const text = ctx.ui.theme.fg("success", `⚡ out ${m.usage.output} tok · ${(m.usage.output / secs).toFixed(1)} tok/s`);
			ctx.ui.notify(text, "info");
		}
		start = 0;
	});
}
