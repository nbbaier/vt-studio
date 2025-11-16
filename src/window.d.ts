declare global {
	interface Window {
		showOuterbaseDialog: Record<
			string,
			(props: {
				component: FunctionComponent;
				options: unknown;
				resolve: (props: unknown) => void;
				defaultCloseValue: unknown;
			}) => void
		>;
		showOpenFilePicker?: (options?: {
			types?: Array<{
				description?: string;
				accept: Record<string, string[]>;
			}>;
			excludeAcceptAllOption?: boolean;
			multiple?: boolean;
		}) => Promise<FileSystemFileHandle[]>;
		showSaveFilePicker?: (options?: {
			types?: Array<{
				description?: string;
				accept: Record<string, string[]>;
			}>;
			excludeAcceptAllOption?: boolean;
			suggestedName?: string;
		}) => Promise<FileSystemFileHandle>;
		showDirectoryPicker?: (options?: {
			mode?: "read" | "readwrite";
			startIn?:
				| FileSystemHandle
				| "documents"
				| "downloads"
				| "music"
				| "pictures"
				| "videos";
		}) => Promise<FileSystemDirectoryHandle>;
	}
}

export {};
