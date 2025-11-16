import { cn } from "@/lib/utils";

export function CloudflareIcon({ className }: { className?: string }) {
	return (
		<svg
			className={cn("h-12 w-12 shrink-0", className)}
			viewBox="0 0 25 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Cloudflare Icon</title>
			<rect x="5.5" y="18" width="14" height="2" fill="currentColor"></rect>
			<rect x="19.5" y="16" width="2" height="2" fill="currentColor"></rect>
			<rect x="21.5" y="12" width="2" height="4" fill="currentColor"></rect>
			<rect x="3.5" y="16" width="2" height="2" fill="currentColor"></rect>
			<rect x="1.5" y="12" width="2" height="4" fill="currentColor"></rect>
			<rect x="3.5" y="10" width="2" height="2" fill="currentColor"></rect>
			<rect x="5.5" y="8" width="6" height="2" fill="currentColor"></rect>
			<rect x="7.5" y="6" width="2" height="2" fill="currentColor"></rect>
			<rect x="9.5" y="4" width="6" height="2" fill="currentColor"></rect>
			<rect x="15.5" y="6" width="2" height="2" fill="currentColor"></rect>
			<rect x="17.5" y="8" width="2" height="2" fill="currentColor"></rect>
			<rect x="19.5" y="10" width="2" height="2" fill="currentColor"></rect>
			<rect x="15.5" y="12" width="2" height="2" fill="currentColor"></rect>
			<rect x="9.5" y="10" width="2" height="2" fill="currentColor"></rect>
			<rect x="11.5" y="12" width="2" height="2" fill="currentColor"></rect>
			<rect x="17.5" y="10" width="2" height="2" fill="currentColor"></rect>
		</svg>
	);
}

export function ValtownIcon({ className }: { className?: string }) {
	return (
		<svg
			className={cn("h-12 w-12 shrink-0", className)}
			viewBox="80 85 230 225"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Val Town Icon</title>
			<g>
				<path
					d="M265.026 271.002C257.83 271.002 251.994 268.767 247.518 264.293C243.038 259.821 240.802 253.841 240.802 246.363V184.761H226.364V161.881H240.802V128H268.548V161.881H298.5V184.761H268.548V241.521C268.548 245.921 270.604 248.123 274.716 248.123H295.856V271.002H265.026Z"
					fill="currentColor"
				/>
				<path
					d="M204.362 174.325L158.23 250.768H154.266V178.601C154.266 169.37 146.776 161.887 137.536 161.887H126.518V253.01C126.518 262.95 134.586 271.01 144.536 271.01H163.396C173.396 271.01 182.638 265.682 187.64 257.03L242.664 161.887H226.404C217.384 161.887 209.02 166.606 204.362 174.325Z"
					fill="currentColor"
				/>
				<path
					d="M99.9939 161.887H127.8V184.769H99.9939V161.887Z"
					fill="currentColor"
				/>
			</g>
		</svg>
	);
}

export function SQLiteIcon({ className }: { className?: string }) {
	return (
		<svg
			className={cn("h-12 w-12 shrink-0", className)}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>SQLite Icon</title>
			<path
				d="M4.08339 2.5014H8.83338L8.83342 4.08471H5.66673L5.66664 5.66801H4.08334L4.08339 8.8348L2.5 8.83462V4.08471H4.08339V2.5014Z"
				fill="currentColor"
			></path>
			<path
				d="M13.5834 13.5847V12.0014H12L12 13.5847H13.5834Z"
				fill="currentColor"
			></path>
			<path
				d="M15.1668 15.168L15.1666 16.7513H16.75V15.168H15.1668Z"
				fill="currentColor"
			></path>
			<path
				d="M15.1668 15.168V13.5847H13.5834L13.5834 15.168H15.1668Z"
				fill="currentColor"
			></path>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M7.25003 8.83462L4.08339 8.8348V12.0014H5.66664V13.5847H7.25003V15.168H8.83342V16.7513L10.4166 16.7515V18.3348H13.5834V19.9181H16.75V18.3348H18.3334V19.9181H19.9167V21.5014H21.5V19.9181H19.9167V18.3348H18.3334V16.7513H19.9167V13.5847H18.3334L18.3333 10.4181H16.75L16.75 8.8348L15.1668 8.83462V7.25132H13.5834V5.66801H12V4.08471H8.83342L8.83338 7.25132H7.24999V5.66801H5.66664V7.25132H7.24999L7.25003 8.83462ZM7.25003 8.83462L8.75383 8.8348V10.4181H10.3372V8.8348L8.83338 8.83462V7.25132H10.4168V5.66801H12L12 7.25132H13.5834V8.8348H12L12 10.4181H10.4166V12.0014H8.83333V13.5847H7.25003L7.24999 12.0014H5.66664V10.4181H7.24999L7.25003 8.83462ZM12 12.0014H10.4166L10.4167 13.5847H8.83333L8.83342 15.168H10.4168L10.4166 16.7515H13.5834L13.5834 18.3348H16.75V16.7513H18.3334V13.5847H16.75V10.4181H15.1666L15.1668 8.83462L13.5834 8.8348V10.4181H12V12.0014Z"
				fill="currentColor"
			></path>
		</svg>
	);
}
