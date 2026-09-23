export interface Beat {
  id: string;
  title: string;
  content: string;   // markdown, unused in the card for now
  time: number;      // THE truth. unitless for now.
}

export interface Lane {
  id: string;
  name: string;
  color: string;       // hex; used for header dot, arrow color, beat accent
  beats: Beat[];
}

export interface Link {
  id: string;
  from: string;   // beat id
  to: string;     // beat id
}

export interface Project {
  title: string;
  lanes: Lane[];
  links: Link[];
}