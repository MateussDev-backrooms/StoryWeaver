export interface Beat {
	id: string;
	title: string;
	content: string;
	time: number;
	duration: number;
}

export interface Lane {
	id: string;
	name: string;
	color: string;
	group: string;
	beats: Beat[];
}

export interface Link {
	id: string;
	from: string;
	to: string;
}

export interface Marker {
	id: string;
	time: number;
	name: string;
	color: string;
	description: string;
}

export interface Section {
	id: string;
	name: string;
	color: string;
	startMarkerId: string;
	endMarkerId: string;
}

export interface Project {
	schemaVersion: number;
	id: string;
	name: string;
	color: string;
	icon: string;
	createdAt: string;
	lanes: Lane[];
	links: Link[];
	markers: Marker[];
	sections: Section[];
}
