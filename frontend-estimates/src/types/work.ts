export interface WorkItem {
  id: number;
  name: string;
  bachelorNormal: string;
  bachelorSpecial: string;
  master: string;
  active: boolean;
}

export interface WorkFormData {
  name: string;
  bachelorNormal: string;
  bachelorSpecial: string;
  master: string;
}