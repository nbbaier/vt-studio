"use server";

import type { TrackEventItem } from "../../../lib/tracking";

// Val Town-only migration: Parameters kept for API compatibility but no longer used
export async function insertTrackingRecord(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_deviceId: string,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_events: TrackEventItem[],
) {
	// Val Town-only migration: Analytics tracking is disabled
	// TODO: Implement Val Town-compatible analytics tracking
	console.warn(
		"Analytics tracking is currently disabled during Val Town migration",
	);

	return {
		success: false,
		error: "Analytics tracking is disabled during Val Town migration",
	};
}
