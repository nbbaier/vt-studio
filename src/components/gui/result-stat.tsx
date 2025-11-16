import type { DatabaseResultStat } from "@/drivers/base-driver";

export default function ResultStats({ stats }: { stats: DatabaseResultStat }) {
	return (
		<div className="flex p-2 text-sm">
			{stats.queryDurationMs !== null && (
				<div className="border-r px-2">
					<span className="font-semibold">Query Duration</span>:{" "}
					{stats.queryDurationMs}ms
				</div>
			)}

			{!!stats.rowsRead && (
				<div className="border-r px-2">
					<span className="font-semibold">Rows Read</span>: {stats.rowsRead}
				</div>
			)}

			{!!stats.rowsWritten && (
				<div className="border-r px-2">
					<span className="font-semibold">Rows Written</span>:{" "}
					{stats.rowsWritten}
				</div>
			)}

			{!!stats.rowsAffected && (
				<div className="px-2">
					<span className="font-semibold">Affected Rows</span>:{" "}
					{stats.rowsAffected}
				</div>
			)}
		</div>
	);
}
