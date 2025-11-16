import { Copy } from "@phosphor-icons/react";

interface CopyableTextProps {
	text: string;
}

export default function CopyableText({ text }: CopyableTextProps) {
	return (
		<button
			type="button"
			className="bg-secondary inline-flex cursor-pointer items-center border-0 p-1 px-2 font-mono"
			onClick={() => navigator.clipboard.writeText(text)}
		>
			{text} <Copy className="ml-2 h-4 w-4" />
		</button>
	);
}
