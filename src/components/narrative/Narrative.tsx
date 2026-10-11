import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../../store/store";
import type { Beat, Lane } from "../../types/types";
import { useModalStore } from "../../store/useModalStore";
import { RiDeleteBinLine } from "react-icons/ri";

interface BeatWithLane extends Beat {
	lane: Lane;
}

function groupByTime(beats: BeatWithLane[]) {
	let groups: BeatWithLane[][] = [];
	let current: BeatWithLane[] = [];
	let lastTime = null;

	for (const beat of beats) {
		const time = Math.round(beat.time * 4);
		if (lastTime === null || time === lastTime) {
			current.push(beat);
		} else {
			groups.push(current);
			current = [beat];
		}
		lastTime = time;
	}

	if (current.length > 0) {
		groups.push(current);
	}

	return groups;
}

export function Narrative() {
	//Get all beats and make sure to also save the lane they belong to
	const lanes = useStore((s) => s.project.lanes);
	const beats = useMemo(() => {
		const project = useStore.getState().project;
		return project.lanes
			.flatMap((lane) => lane.beats.map((beat) => ({ ...beat, lane })))
			.sort((a, b) => a.time - b.time);
	}, [lanes]);

	const beatGroups = useMemo(() => groupByTime(beats), [beats]);

	const [characterSelector, setCharacter] = useState("");
	const handleChange = (e: any) => {
		setCharacter(e.target.value);
	};

	const [beatTitle, setBeatTitle] = useState("");

	const bottomRef = useRef<HTMLDivElement>(null);
	const beatCount = beats.length;

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [beatCount]);

	const appendBeat = useStore((s) => s.appendBeat);

	return (
		<>
			<div className="frame mx-auto w-[90%] h-full">
				<div className="overflow-y-auto h-[93%]">
					<div className="w-full flex flex-row">
						<div className="w-full p-2">
							<h1 className="heading-3 text-center">Narrative</h1>
							{beatGroups.map((group) => {
								const rowKey = group[0].time;

								return (
									<div
										key={rowKey}
										className="flex flex-row w-full"
									>
										{group.map((beat) => (
											<div
												className="shading p-1 flex flex-row items-baseline w-full justify-between"
												key={beat.id + beat.time}
												onDoubleClick={() => {
													useModalStore
														.getState()
														.open("edit-beat", {
															laneId: beat.lane
																.id,
															beatId: beat.id,
														});
												}}
											>
												<div className="flex flex-row items-baseline gap-1">
													<span
														className="text-white p-1 shading mx-1"
														style={{
															backgroundColor:
																beat.lane.color,
														}}
													>
														@{beat.lane.name}
													</span>

													{beat.title}
												</div>

												<button className="btn"
                                                onClick={() => {
                                                    //Delete the beat
                                                    useStore
                                                        .getState()
                                                        .deleteBeat(
                                                            beat.lane.id,
                                                            beat.id,
                                                        );
                                                }}
                                                >
													<RiDeleteBinLine />
												</button>
											</div>
										))}
									</div>
								);
							})}
							<div ref={bottomRef} />
						</div>
					</div>
				</div>
				<div className="flex flex-row w-full p-2">
					<select
						className="panel"
						style={{
							backgroundColor: characterSelector
								? lanes.find((l) => l.id === characterSelector)
										?.color
								: "white",
						}}
						value={characterSelector}
						onChange={handleChange}
					>
						<option value="">Select a character</option>
						{lanes.map((lane) => (
							<option key={lane.id} value={lane.id}>
								{lane.name}
							</option>
						))}
					</select>
					<input
						className="input w-full h-15"
						type="text"
						value={beatTitle}
						placeholder="Add a new beat..."
						onChange={(e) => setBeatTitle(e.target.value)}
						onKeyDown={(e) => {
							if (e.key !== "Enter") return;
							if (!characterSelector) return;
							const laneId = characterSelector;
							//Select most recent beat of the project and add 1
							const project = useStore.getState().project;
							const lastBeat = project.lanes
								.flatMap((lane) => lane.beats)
								.sort((a, b) => b.time - a.time)[0];
							const newTime = lastBeat ? lastBeat.time + lastBeat.duration : 0;

							//Append the new beat to the last beat of the lane
							const lane = project.lanes.find(
								(l) => l.id === laneId,
							);
							if (!lane) return;
							const lastLaneBeat = lane.beats.sort(
								(a, b) => b.time - a.time,
							)[0];
							const newBeatId = useStore
								.getState()
								.appendBeat(laneId, newTime, lastLaneBeat?.id);

							//Apply title to the new beat
							useStore
								.getState()
								.updateBeat(newBeatId, { title: beatTitle });

							//Reset input
							setBeatTitle("");
						}}
					/>
				</div>
			</div>
		</>
	);
}
