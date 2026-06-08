import {
  GraduationCap,
  Award,
  Wrench,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type CategoryKey =
  | "academic_learning"
  | "course_certification"
  | "project"
  | "skill"
  | "milestone";

export const CATEGORIES: Record<
  CategoryKey,
  { label: string; icon: LucideIcon; colorVar: string; ringClass: string; bgClass: string; textClass: string }
> = {
  academic_learning: {
    label: "Academic Learning",
    icon: GraduationCap,
    colorVar: "var(--cat-academic)",
    ringClass: "ring-[color:var(--cat-academic)]",
    bgClass: "bg-[color:var(--cat-academic)]/12",
    textClass: "text-[color:var(--cat-academic)]",
  },
  course_certification: {
    label: "Course / Certification",
    icon: Award,
    colorVar: "var(--cat-course)",
    ringClass: "ring-[color:var(--cat-course)]",
    bgClass: "bg-[color:var(--cat-course)]/12",
    textClass: "text-[color:var(--cat-course)]",
  },
  project: {
    label: "Project / Design",
    icon: Wrench,
    colorVar: "var(--cat-project)",
    ringClass: "ring-[color:var(--cat-project)]",
    bgClass: "bg-[color:var(--cat-project)]/12",
    textClass: "text-[color:var(--cat-project)]",
  },
  skill: {
    label: "Skill",
    icon: Sparkles,
    colorVar: "var(--cat-skill)",
    ringClass: "ring-[color:var(--cat-skill)]",
    bgClass: "bg-[color:var(--cat-skill)]/12",
    textClass: "text-[color:var(--cat-skill)]",
  },
  milestone: {
    label: "Milestone",
    icon: Trophy,
    colorVar: "var(--cat-milestone)",
    ringClass: "ring-[color:var(--cat-milestone)]",
    bgClass: "bg-[color:var(--cat-milestone)]/12",
    textClass: "text-[color:var(--cat-milestone)]",
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];
