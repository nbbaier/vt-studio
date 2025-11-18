import { Tag as TagIcon } from "@phosphor-icons/react";
import { useStudioContext } from "@/context/driver-provider";
import { useTableTags, useTags } from "@/hooks/use-table-tags";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";
import { TagBadge } from "./tag-badge";
import { TagSelector } from "./tag-selector";

interface TagManagerDialogProps {
	tableName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TagManagerDialog({
	tableName,
	open,
	onOpenChange,
}: TagManagerDialogProps) {
	const { databaseDriver } = useStudioContext();
	const { tags, createTag } = useTags(databaseDriver);
	const { tableTags, addTagToTable, removeTagFromTable } = useTableTags(
		databaseDriver,
		tableName,
	);

	const selectedTags = tableTags.map((t) => t.tag);

	const handleSelectTag = async (tag: string) => {
		if (selectedTags.includes(tag)) {
			await removeTagFromTable(tag);
		} else {
			await addTagToTable(tag);
		}
	};

	const handleCreateTag = async (tag: string) => {
		await createTag(tag);
		await addTagToTable(tag);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<TagIcon size={20} />
						Manage Tags for {tableName}
					</DialogTitle>
					<DialogDescription>
						Add tags to organize and filter your tables
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Current Tags */}
					<div>
						<h3 className="text-sm font-medium mb-2">Current Tags</h3>
						{tableTags.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{tableTags.map((t) => (
									<TagBadge
										key={t.tag}
										tag={t.tag}
										color={t.color}
										onRemove={() => removeTagFromTable(t.tag)}
										size="md"
									/>
								))}
							</div>
						) : (
							<p className="text-sm text-neutral-500">No tags added yet</p>
						)}
					</div>

					{/* Add Tags */}
					<div>
						<h3 className="text-sm font-medium mb-2">Add Tags</h3>
						<TagSelector
							availableTags={tags}
							selectedTags={selectedTags}
							onSelectTag={handleSelectTag}
							onCreateTag={handleCreateTag}
						/>
					</div>

					{/* All Available Tags */}
					{tags.length > 0 && (
						<div>
							<h3 className="text-sm font-medium mb-2">Available Tags</h3>
							<div className="flex flex-wrap gap-2">
								{tags
									.filter((t) => !selectedTags.includes(t.tag))
									.map((t) => (
										<button
											key={t.tag}
											type="button"
											onClick={() => addTagToTable(t.tag)}
											className="hover:opacity-80"
										>
											<TagBadge tag={t.tag} color={t.color} size="sm" />
										</button>
									))}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
