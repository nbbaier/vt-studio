import { Check, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

interface TagSelectorProps {
	availableTags: { tag: string; color?: string | null }[];
	selectedTags: string[];
	onSelectTag: (tag: string) => void;
	onCreateTag?: (tag: string) => void;
	triggerButton?: React.ReactNode;
}

export function TagSelector({
	availableTags,
	selectedTags,
	onSelectTag,
	onCreateTag,
	triggerButton,
}: TagSelectorProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const handleSelect = (tag: string) => {
		onSelectTag(tag);
		setSearch("");
	};

	const handleCreateNew = () => {
		if (search.trim() && onCreateTag) {
			onCreateTag(search.trim());
			setSearch("");
		}
	};

	const filteredTags = availableTags.filter((t) =>
		t.tag.toLowerCase().includes(search.toLowerCase()),
	);

	const showCreateOption =
		onCreateTag &&
		search.trim() &&
		!availableTags.some((t) => t.tag.toLowerCase() === search.toLowerCase());

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{triggerButton || (
					<button
						type="button"
						className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
					>
						<Plus size={12} />
						Add Tag
					</button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput
						placeholder="Search tags..."
						value={search}
						onValueChange={setSearch}
					/>
					<CommandList>
						<CommandEmpty>
							{showCreateOption ? "No tags found" : "No tags available"}
						</CommandEmpty>
						{filteredTags.length > 0 && (
							<CommandGroup>
								{filteredTags.map((t) => {
									const isSelected = selectedTags.includes(t.tag);
									return (
										<CommandItem
											key={t.tag}
											value={t.tag}
											onSelect={() => handleSelect(t.tag)}
											className="cursor-pointer"
										>
											<div
												className={cn(
													"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-neutral-300",
													isSelected &&
														"bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
												)}
											>
												{isSelected && <Check size={12} weight="bold" />}
											</div>
											<span className="flex-1">{t.tag}</span>
										</CommandItem>
									);
								})}
							</CommandGroup>
						)}
						{showCreateOption && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={handleCreateNew}
										className="cursor-pointer"
									>
										<Plus size={14} className="mr-2" />
										Create "{search}"
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
