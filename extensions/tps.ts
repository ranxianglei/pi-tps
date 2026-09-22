/**
 * TPS - notify the assistant output speed (tokens/sec) after each assistant message.
 * Placed in ~/.pi/agent/extensions/ (auto-discovered, hot-reloadable via /reload).
 */

import type { AssistantMessage } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function resolveMaxRate(): number {
	const raw = Number(process.env.PI_TPS_MAX_RATE);
	return Number.isFinite(raw) && raw >= 100 ? raw : 1500;
}

function formatRate(rate: number): string {
	return rate >= 1000 ? `${(rate / 1000).toFixed(1)}k` : rate.toFixed(1);
}

export default function (pi: ExtensionAPI) {
	// Real token generation tops out far below this for a single stream, so
	// higher values are measurement artifacts (instant/cached replies, or a
	// zero-length window). Show them as a lower bound instead of a fake number.
	const maxRate = resolveMaxRate();
	let start = 0; // Date.now() at message_start for the in-flight assistant message
	let updates = 0; // stream deltas observed; 0 ⇒ no streaming happened for this message

	pi.on("message_start", async (event) => {
		if (event.message.role !== "assistant") return;
		start = Date.now();
		updates = 0;
	});

	pi.on("message_update", async (event) => {
		if (event.message.role !== "assistant" || !start) return;
		updates++;
	});

	pi.on("message_end", async (event, ctx) => {
		if (event.message.role !== "assistant" || !start) return;
		const m = event.message as AssistantMessage;
		const now = Date.now();
		const out = m.usage?.output ?? 0;
		// Streamed messages: window spans message_start..message_end (includes
		// time-to-first-token). Some provider paths finalize without any
		// streaming deltas — there pi emits message_start milliseconds before
		// message_end, so dividing by that window fabricates thousands of tok/s;
		// use the message object's own timestamp (set when the request began).
		const secs = updates > 0 ? (now - start) / 1000 : (now - m.timestamp) / 1000;
		start = 0;
		if (secs > 0 && out > 0) {
			const rate = out / secs;
			const shown = rate > maxRate ? `>${formatRate(maxRate)}` : formatRate(rate);
			const text = ctx.ui.theme.fg("success", `⚡ out ${out} tok · ${shown} tok/s`);
			ctx.ui.notify(text, "info");
		}
	});
}
