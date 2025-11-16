import { produce } from "immer";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { type ChartValue, outerBaseUrl } from "./chart-type";

const PRESET_IMAGES = [
	"/assets/charts/outerbase1.png",
	"/assets/charts/outerbase2.png",
	"/assets/charts/outerbase3.png",
	"/assets/charts/outerbase4.png",
	"/assets/charts/outerbase5.png",
	"/assets/charts/outerbase6.png",
];

interface ChartBackgroundImageProps {
	onChange: Dispatch<SetStateAction<ChartValue>>;
}

export default function ChartBackGroundImage({
	onChange,
}: ChartBackgroundImageProps) {
	return (
		<div className="grid grid-cols-3 gap-2 pt-2">
			{PRESET_IMAGES.map((image, _index) => {
				return (
					<button
						key={image}
						type="button"
						className="relative cursor-pointer border-0 bg-transparent p-0"
						onClick={() => {
							onChange((prev) => {
								return produce(prev, (draft) => {
									draft.params.options.backgroundImage = image;
									draft.params.options.backgroundType = "image";
								});
							});
						}}
					>
						<Image
							src={outerBaseUrl + image}
							alt=""
							className="h-24 w-full rounded-lg object-cover"
							width={100}
							height={100}
						/>
					</button>
				);
			})}
		</div>
	);
}
