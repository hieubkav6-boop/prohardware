export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  avatar: string; // Base64 or object URL
  avatarStorageId?: string; // Convex Storage ID
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string; // supporting markdown or newline-separated points
  techStack: string[];
}

export interface Project {
  id: string;
  title: string;
  role: string;
  description: string;
  link: string;
  techStack: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  grade?: string;
  description?: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  skills: string[];
}

export interface Language {
  id: string;
  name: string;
  proficiency: string; // Native, Professional, Intermediate, Elementary
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string; // markdown or plain text
}

export interface CVSettings {
  template: "modern" | "professional" | "creative" | "elegant" | "technical" | "bold" | "bordered" | "sidebar" | "retro" | "accent";
  primaryColor: string; // hex or tailwind class name
  secondaryColor?: string; // hex or tailwind class name
  fontFamily:
    | "vietnam"
    | "inter"
    | "roboto"
    | "montserrat"
    | "nunito"
    | "quicksand"
    | "opensans"
    | "manrope"
    | "lora"
    | "merriweather";
  spacing: "super-compact" | "compact" | "normal" | "loose" | "roomy" | "spacious";
  orientation: "portrait" | "landscape";
  showAvatar: boolean;
}

export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  projects: Project[];
  education: Education[];
  skills: SkillGroup[];
  languages: Language[];
  certifications: Certification[];
  customSections: CustomSection[];
}
