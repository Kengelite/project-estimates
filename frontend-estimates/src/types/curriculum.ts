export interface CurriculumItem {
  id: number;
  name: string;
  bachelorNormal: string;
  bachelorSpecial: string;
  master: string;
  active: boolean;
}

export interface CurriculumFormData {
  name: string;
  bachelorNormal: string;
  bachelorSpecial: string;
  master: string;
}