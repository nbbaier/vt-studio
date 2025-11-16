"use server";

// Val Town-only migration: StarbaseQuery has been removed
// This tracking functionality is disabled until a Val Town-compatible solution is implemented
import type { TrackEventItem } from "../../../lib/tracking";

// Val Town-only migration: Parameters kept for API compatibility but no longer used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function insertTrackingRecord(
	_deviceId: string,
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
