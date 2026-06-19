import React from "react";
import { CVData, CVSettings } from "../types/cv";
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, FolderGit2, Wrench, Facebook, Youtube, Instagram, Link as LinkIcon, Palette } from "lucide-react";

// Local SVG icons for reliability across Lucide versions
const Github: React.FC<any> = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Linkedin: React.FC<any> = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Viblo: React.FC<any> = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M20 6L12 18L4 6" />
  </svg>
);

export const getSocialIcon = (url: string, style?: React.CSSProperties, className?: string) => {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes("github.com")) {
    return <Github className={className} style={style} />;
  }
  if (lowercaseUrl.includes("linkedin.com")) {
    return <Linkedin className={className} style={style} />;
  }
  if (lowercaseUrl.includes("viblo.asia")) {
    return <Viblo className={className} style={style} />;
  }
  if (lowercaseUrl.includes("facebook.com") || lowercaseUrl.includes("fb.com")) {
    return <Facebook className={className} style={style} />;
  }
  if (lowercaseUrl.includes("youtube.com") || lowercaseUrl.includes("youtu.be")) {
    return <Youtube className={className} style={style} />;
  }
  if (lowercaseUrl.includes("instagram.com")) {
    return <Instagram className={className} style={style} />;
  }
  if (lowercaseUrl.includes("behance.net") || lowercaseUrl.includes("dribbble.com")) {
    return <Palette className={className} style={style} />;
  }
  return <LinkIcon className={className} style={style} />;
};

export const getSocialLabel = (url: string): string => {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes("github.com")) return "GitHub";
  if (lowercaseUrl.includes("linkedin.com")) return "LinkedIn";
  if (lowercaseUrl.includes("viblo.asia")) return "Viblo";
  if (lowercaseUrl.includes("facebook.com") || lowercaseUrl.includes("fb.com")) return "Facebook";
  if (lowercaseUrl.includes("youtube.com") || lowercaseUrl.includes("youtu.be")) return "YouTube";
  if (lowercaseUrl.includes("instagram.com")) return "Instagram";
  if (lowercaseUrl.includes("behance.net")) return "Behance";
  if (lowercaseUrl.includes("dribbble.com")) return "Dribbble";
  return "Portfolio";
};

interface TemplateProps {
  data: CVData;
  settings: CVSettings;
}

// Utility to convert hex color to rgba for soft backgrounds
export const hexToRgba = (hex: string, alpha: number): string => {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((char) => char + char).join("");
  }
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Font family mapper — returns actual CSS font-family string for reliable inline-style switching
export const getFontFamily = (font: CVSettings["fontFamily"]): string => {
  switch (font) {
    case "vietnam":     return "var(--font-vietnam), 'Be Vietnam Pro', sans-serif";
    case "inter":       return "var(--font-inter), 'Inter', sans-serif";
    case "roboto":      return "var(--font-roboto), 'Roboto', sans-serif";
    case "montserrat":  return "var(--font-montserrat), 'Montserrat', sans-serif";
    case "nunito":      return "var(--font-nunito), 'Nunito', sans-serif";
    case "quicksand":   return "var(--font-quicksand), 'Quicksand', sans-serif";
    case "opensans":    return "var(--font-opensans), 'Open Sans', sans-serif";
    case "manrope":     return "var(--font-manrope), 'Manrope', sans-serif";
    case "lora":        return "var(--font-lora), 'Lora', serif";
    case "merriweather":return "var(--font-merriweather), 'Merriweather', serif";
    default:            return "var(--font-vietnam), 'Be Vietnam Pro', sans-serif";
  }
};

// Keep class-based for backwards compat (editor UI)
export const getFontClass = (font: CVSettings["fontFamily"]) => {
  const map: Record<string, string> = {
    vietnam: "font-vietnam", inter: "font-inter", roboto: "font-roboto",
    montserrat: "font-montserrat", nunito: "font-nunito", quicksand: "font-quicksand",
    opensans: "font-opensans", manrope: "font-manrope", lora: "font-lora",
    merriweather: "font-merriweather",
  };
  return map[font] ?? "font-vietnam";
};

// Spacing mapper
export const getSpacingClasses = (spacing: CVSettings["spacing"]) => {
  switch (spacing) {
    case "super-compact":
      return {
        sectionGap: "space-y-1.5",
        itemGap: "space-y-1",
        paddingY: "py-0.5",
        marginY: "my-0.5",
        textGap: "gap-0.5",
      };
    case "compact":
      return {
        sectionGap: "space-y-2.5",
        itemGap: "space-y-1.5",
        paddingY: "py-0.5",
        marginY: "my-0.5",
        textGap: "gap-1",
      };
    case "normal":
      return {
        sectionGap: "space-y-4",
        itemGap: "space-y-2.5",
        paddingY: "py-1.5",
        marginY: "my-1.5",
        textGap: "gap-1.5",
      };
    case "loose":
      return {
        sectionGap: "space-y-5.5",
        itemGap: "space-y-3.5",
        paddingY: "py-2.5",
        marginY: "my-2.5",
        textGap: "gap-2",
      };
    case "roomy":
      return {
        sectionGap: "space-y-7",
        itemGap: "space-y-4.5",
        paddingY: "py-3.5",
        marginY: "my-3.5",
        textGap: "gap-2.5",
      };
    case "spacious":
      return {
        sectionGap: "space-y-9",
        itemGap: "space-y-5.5",
        paddingY: "py-4.5",
        marginY: "my-4.5",
        textGap: "gap-3",
      };
  }
};

// Clean bullet point renderer with word-wrapping
const renderDescription = (text: string) => {
  if (!text) return null;
  const lines = text.split("\n").map(l => l.trim()).filter(l => l !== "");
  return (
    <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-350 break-words whitespace-normal mt-1 leading-relaxed text-[10.5px]">
      {lines.map((line, i) => {
        const cleanLine = line.replace(/^[•\-*]\s*/, "");
        return <li key={i}>{cleanLine}</li>;
      })}
    </ul>
  );
};


// Helper: render technologies as minimal inline text
const renderTechStack = (tech: string[], isMono = false) => {
  if (!tech || tech.length === 0) return null;
  return (
    <p
      className={`text-[9px] mt-1 leading-relaxed text-slate-500 ${
        isMono ? "font-mono" : ""
      }`}
    >
      <span className="font-semibold" style={{ opacity: 0.7 }}>Stack:</span>{" "}
      {tech.map((t, idx) => (
        <span key={idx}>
          {idx > 0 && <span className="mx-0.5 text-slate-300 select-none">·</span>}
          <span>{t}</span>
        </span>
      ))}
    </p>
  );
};


/* ==========================================
   1. MODERN CLEAN TEMPLATE (Hiện đại)
   ========================================== */
export const ModernMinimalistTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacing = getSpacingClasses(settings.spacing);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between" style={{ fontFamily }}>
      <div>
        {/* Header Section */}
        <header className="border-b pb-4 flex justify-between items-start gap-4" style={{ borderColor: settings.primaryColor }}>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: settings.primaryColor }}>
              {data.personalInfo.name || "Họ và tên"}
            </h1>
            <p className="text-md font-semibold text-slate-600 tracking-wide uppercase">
              {data.personalInfo.title || "Vị trí công việc"}
            </p>
            {data.summary && (
              <p className="text-[11px] text-slate-550 mt-2 leading-relaxed break-words whitespace-normal">
                {data.summary}
              </p>
            )}
          </div>
          {hasAvatar && (
            <div className="w-[90px] h-[135px] border overflow-hidden flex-shrink-0 rounded-none" style={{ borderColor: settings.primaryColor }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
            </div>
          )}
        </header>

        {/* Two-Column Content Grid */}
        <div className="grid grid-cols-12 gap-5 mt-4 flex-1">
          {/* Left Column: Side Info */}
          <aside className="col-span-4 space-y-4 border-r border-slate-100 pr-3">
            {/* Contact Details */}
            <div className="space-y-2 text-[10.5px] text-slate-600">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: settings.primaryColor }}>
                Liên hệ
              </h3>
              {data.personalInfo.email && (
                <div className="flex items-center gap-1.5 break-words whitespace-normal">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />
                  <span>{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-1.5 break-words whitespace-normal">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-1.5 break-words whitespace-normal">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo.website && (
                <a href={data.personalInfo.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 break-words whitespace-normal hover:underline">
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />
                  <span>{data.personalInfo.website}</span>
                </a>
              )}
              {data.personalInfo.github && (
                <a href={data.personalInfo.github.startsWith('http') ? data.personalInfo.github : `https://${data.personalInfo.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 break-words whitespace-normal hover:underline">
                  {getSocialIcon(data.personalInfo.github, { color: secondaryColor }, "w-3.5 h-3.5 flex-shrink-0")}
                  <span>{data.personalInfo.github}</span>
                </a>
              )}
              {data.personalInfo.linkedin && (
                <a href={data.personalInfo.linkedin.startsWith('http') ? data.personalInfo.linkedin : `https://${data.personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 break-words whitespace-normal hover:underline">
                  {getSocialIcon(data.personalInfo.linkedin, { color: secondaryColor }, "w-3.5 h-3.5 flex-shrink-0")}
                  <span>{data.personalInfo.linkedin}</span>
                </a>
              )}
            </div>

            {/* Technical Skills */}
            {data.skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1 border-slate-100" style={{ color: settings.primaryColor }}>
                  Kỹ năng
                </h3>
                {data.skills.map((grp) => (
                  <div key={grp.id} className="space-y-0.5 avoid-break">
                    <span className="text-[9.5px] font-bold text-slate-700 block">{grp.category}</span>
                    <p className="text-[9.5px] text-slate-600 leading-relaxed break-words whitespace-normal">
                      {grp.skills.join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1 border-slate-100" style={{ color: settings.primaryColor }}>
                  Ngôn ngữ
                </h3>
                <div className="space-y-1 text-[10px]">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-slate-700 avoid-break">
                      <span className="font-semibold break-words whitespace-normal">{lang.name}</span>
                      <span className="text-slate-500 break-words whitespace-normal">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {data.certifications.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider border-b pb-1 border-slate-100" style={{ color: settings.primaryColor }}>
                  Chứng chỉ
                </h3>
                <div className="space-y-2 text-[10px] text-slate-700">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="space-y-0.5 avoid-break">
                      <p className="font-bold leading-tight break-words whitespace-normal">{cert.name}</p>
                      <p className="text-slate-550 text-[9.5px] break-words whitespace-normal">{cert.issuer} • {cert.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Right Column: Work & Projects & Education */}
          <main className="col-span-8 space-y-4">
            {/* Work Experience */}
            {data.workExperience.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-1" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Kinh nghiệm làm việc
                </h2>
                <div className={spacing.itemGap}>
                  {data.workExperience.map((job) => (
                    <div key={job.id} className="avoid-break">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[11px] font-extrabold text-slate-800 break-words whitespace-normal">
                          {job.position}
                        </span>
                        <span className="text-[9.5px] font-semibold text-slate-500 flex-shrink-0 pl-4">
                          {job.startDate} — {job.current ? "Hiện tại" : job.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] font-bold break-words whitespace-normal" style={{ color: settings.primaryColor }}>
                          {job.company}
                        </span>
                        {job.location && (
                          <span className="text-[9.5px] font-medium text-slate-400 flex-shrink-0 pl-4">
                            {job.location}
                          </span>
                        )}
                      </div>
                      {renderDescription(job.description)}
                      {renderTechStack(job.techStack)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Projects */}
            {data.projects.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-1" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Dự án tiêu biểu
                </h2>
                <div className={spacing.itemGap}>
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="avoid-break">
                      <div className="flex flex-wrap justify-between items-baseline mb-0.5 gap-x-4">
                        <span className="text-[11px] font-bold text-slate-800 break-words whitespace-normal">
                          {proj.title} {proj.role && <span className="text-slate-550 font-normal">({proj.role})</span>}
                        </span>
                        {proj.link && (
                          <span className="text-[9.5px] text-blue-600 hover:underline break-words whitespace-normal">
                            {proj.link}
                          </span>
                        )}
                      </div>
                      {renderDescription(proj.description)}
                      {renderTechStack(proj.techStack)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education History */}
            {data.education.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-1" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Học vấn
                </h2>
                <div className={spacing.itemGap}>
                  {data.education.map((edu) => (
                    <div key={edu.id} className="avoid-break">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[11px] font-bold text-slate-800 break-words whitespace-normal">
                          {edu.degree} trong {edu.fieldOfStudy}
                        </span>
                        <span className="text-[9.5px] font-semibold text-slate-500 flex-shrink-0">
                          {edu.startDate} — {edu.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                        <span className="font-semibold break-words whitespace-normal">{edu.school} {edu.location ? `• ${edu.location}` : ""}</span>
                        {edu.grade && <span className="font-medium break-words whitespace-normal">{edu.grade}</span>}
                      </div>
                      {edu.description && <p className="text-[10px] text-slate-500 italic break-words whitespace-normal">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};


/* ==========================================
   2. CLASSIC PROFESSIONAL TEMPLATE (Chuyên nghiệp)
   ========================================== */
export const ProfessionalEditorialTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacing = getSpacingClasses(settings.spacing);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  // Render horizontal inline contact details
  const renderContactInfo = () => {
    const info = [];
    if (data.personalInfo.phone) info.push(data.personalInfo.phone);
    if (data.personalInfo.email) info.push(data.personalInfo.email);
    if (data.personalInfo.location) info.push(data.personalInfo.location);
    if (data.personalInfo.website) info.push(data.personalInfo.website.replace(/^https?:\/\//, ""));
    if (data.personalInfo.github) info.push(data.personalInfo.github);
    if (data.personalInfo.linkedin) info.push(data.personalInfo.linkedin);

    return (
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[10px] text-slate-600 font-medium max-w-[85%] mx-auto mt-2 break-words whitespace-normal">
        {info.map((item, idx) => (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-slate-400 select-none">•</span>}
            <span className="break-words whitespace-normal">{item}</span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between" style={{ fontFamily }}>
      <div>
        {/* Header Block */}
        <header className="text-center border-b pb-4 border-slate-200 relative">
          {hasAvatar && (
            <div className="w-[90px] h-[135px] mx-auto mb-3 border rounded-none overflow-hidden" style={{ borderColor: settings.primaryColor }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: settings.primaryColor }}>
            {data.personalInfo.name || "Họ và tên"}
          </h1>
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mt-1">
            {data.personalInfo.title || "Vị trí công việc"}
          </p>
          {renderContactInfo()}
          {data.summary && (
            <p className="text-[11px] text-slate-600 mt-2 max-w-[90%] mx-auto leading-relaxed italic break-words whitespace-normal">
              {data.summary}
            </p>
          )}
        </header>

        {/* Content Section */}
        <div className="space-y-4 mt-4">
          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-black uppercase tracking-wider border-b pb-0.5 text-left" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                Kinh nghiệm làm việc
              </h2>
              <div className={spacing.itemGap}>
                {data.workExperience.map((job) => (
                  <div key={job.id} className="grid grid-cols-12 gap-3 items-start avoid-break">
                    {/* Date/Company column */}
                    <div className="col-span-3 text-left">
                      <p className="text-[10px] font-bold text-slate-550 uppercase">{job.startDate} — {job.current ? "Hiện tại" : job.endDate}</p>
                      <p className="text-[11px] font-extrabold text-slate-800 break-words whitespace-normal leading-tight mt-0.5">{job.company}</p>
                      {job.location && <p className="text-[9px] font-semibold text-slate-500 mt-0.5 break-words whitespace-normal">{job.location}</p>}
                    </div>
                    {/* Description column */}
                    <div className="col-span-9 text-left">
                      <p className="text-[11px] font-extrabold text-slate-800 break-words whitespace-normal">{job.position}</p>
                      {renderDescription(job.description)}
                      {renderTechStack(job.techStack)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Key Projects */}
          {data.projects.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-black uppercase tracking-wider border-b pb-0.5 text-left" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                Dự án tiêu biểu
              </h2>
              <div className={spacing.itemGap}>
                {data.projects.map((proj) => (
                  <div key={proj.id} className="grid grid-cols-12 gap-3 items-start avoid-break">
                    <div className="col-span-3 text-left">
                      <p className="text-[11px] font-extrabold text-slate-800 break-words whitespace-normal leading-tight">{proj.title}</p>
                      {proj.link && <p className="text-[9px] text-blue-600 hover:underline break-words whitespace-normal mt-0.5">{proj.link}</p>}
                    </div>
                    <div className="col-span-9 text-left">
                      <p className="text-[11px] font-extrabold text-slate-800 break-words whitespace-normal">{proj.role}</p>
                      {renderDescription(proj.description)}
                      {renderTechStack(proj.techStack)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Grid layout for Skills & Education */}
          <div className="grid grid-cols-2 gap-5">
            {/* Skills & Langs column */}
            <div className="space-y-4">
              {data.skills.length > 0 && (
                <section className={spacing.sectionGap}>
                  <h2 className="text-xs font-black uppercase tracking-wider border-b pb-0.5 text-left" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                    Kỹ năng
                  </h2>
                  <div className="space-y-2">
                    {data.skills.map((grp) => (
                      <div key={grp.id} className="text-left text-[10px] avoid-break">
                        <span className="font-bold text-slate-700 block mb-0.5">{grp.category}</span>
                        <p className="text-slate-600 break-words whitespace-normal leading-relaxed">
                          {grp.skills.join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.languages.length > 0 && (
                <section className={spacing.sectionGap}>
                  <h2 className="text-xs font-black uppercase tracking-wider border-b pb-0.5 text-left" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                    Ngôn ngữ
                  </h2>
                  <div className="space-y-1.5 text-left text-[10px]">
                    {data.languages.map((lang) => (
                      <div key={lang.id} className="flex justify-between border-b border-dashed border-slate-100 pb-0.5 avoid-break">
                        <span className="font-semibold text-slate-700 break-words whitespace-normal">{lang.name}</span>
                        <span className="text-slate-500 break-words whitespace-normal">{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Education History column */}
            <div className="space-y-4">
              {data.education.length > 0 && (
                <section className={spacing.sectionGap}>
                  <h2 className="text-xs font-black uppercase tracking-wider border-b pb-0.5 text-left" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                    Học văn
                  </h2>
                  <div className={spacing.itemGap}>
                    {data.education.map((edu) => (
                      <div key={edu.id} className="text-left text-[10px] avoid-break">
                        <div className="flex justify-between items-baseline font-bold text-slate-800">
                          <span className="break-words whitespace-normal">{edu.degree}</span>
                          <span className="text-[9px] text-slate-500 font-semibold flex-shrink-0">{edu.startDate} — {edu.endDate}</span>
                        </div>
                        <p className="text-slate-700 font-medium break-words whitespace-normal mt-0.5">{edu.school}</p>
                        <p className="text-slate-500 text-[9.5px] break-words whitespace-normal">{edu.fieldOfStudy} {edu.grade ? `• ${edu.grade}` : ""}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {data.certifications.length > 0 && (
                <section className={spacing.sectionGap}>
                  <h2 className="text-xs font-black uppercase tracking-wider border-b pb-0.5 text-left" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                    Chứng chỉ
                  </h2>
                  <div className={spacing.itemGap}>
                    {data.certifications.map((cert) => (
                      <div key={cert.id} className="text-left text-[10px] avoid-break">
                        <p className="font-bold text-slate-800 break-words whitespace-normal leading-tight">{cert.name}</p>
                        <p className="text-slate-550 text-[9px] break-words whitespace-normal mt-0.5">{cert.issuer} • {cert.date}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/* ==========================================
   3. CREATIVE FLAT TEMPLATE (Sáng tạo)
   ========================================== */
export const CreativeTechnicalTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacing = getSpacingClasses(settings.spacing);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between rounded-none overflow-hidden" style={{ fontFamily }}>
      <div>
        {/* Large Flat Solid Block Header */}
        <header className="p-5 text-white flex justify-between items-center gap-4 rounded-none select-none" style={{ backgroundColor: settings.primaryColor }}>
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight leading-none uppercase">
              {data.personalInfo.name || "Họ và tên"}
            </h1>
            <p className="text-xs font-extrabold tracking-widest text-white/90 uppercase mt-2">
              {data.personalInfo.title || "Vị trí công việc"}
            </p>
            {data.summary && (
              <p className="text-[10.5px] text-white/80 mt-2.5 leading-relaxed max-w-[95%] break-words whitespace-normal">
                {data.summary}
              </p>
            )}
          </div>
          {hasAvatar && (
            <div className="w-[90px] h-[135px] bg-white/10 p-1 rounded-none flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover rounded-none" />
            </div>
          )}
        </header>

        {/* Content Layout below Header */}
        <div className="grid grid-cols-12 gap-5 p-5 pt-4">
          {/* Left Column */}
          <aside className="col-span-4 space-y-4">
            {/* Contact Details */}
            <div className="space-y-2.5 text-[10px] text-slate-650 bg-slate-50 p-3 border rounded-none" style={{ borderColor: `${secondaryColor}40` }}>
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider mb-1" style={{ color: settings.primaryColor }}>
                Liên hệ
              </h3>
              {data.personalInfo.phone && (
                <div className="flex items-center gap-1.5 break-words whitespace-normal">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.email && (
                <div className="flex items-center gap-1.5 break-words whitespace-normal">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />
                  <span className="break-words">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-1.5 break-words whitespace-normal">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo.website && (
                <a href={data.personalInfo.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 break-words whitespace-normal hover:underline">
                  <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: secondaryColor }} />
                  <span className="break-words">{data.personalInfo.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {data.personalInfo.github && (
                <a href={data.personalInfo.github.startsWith('http') ? data.personalInfo.github : `https://${data.personalInfo.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 break-words whitespace-normal hover:underline">
                  {getSocialIcon(data.personalInfo.github, { color: secondaryColor }, "w-3.5 h-3.5 flex-shrink-0")}
                  <span className="break-words">{data.personalInfo.github}</span>
                </a>
              )}
              {data.personalInfo.linkedin && (
                <a href={data.personalInfo.linkedin.startsWith('http') ? data.personalInfo.linkedin : `https://${data.personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 break-words whitespace-normal hover:underline">
                  {getSocialIcon(data.personalInfo.linkedin, { color: secondaryColor }, "w-3.5 h-3.5 flex-shrink-0")}
                  <span className="break-words">{data.personalInfo.linkedin}</span>
                </a>
              )}
            </div>

            {/* Technical Skills */}
            {data.skills.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider border-l-4 pl-1.5 rounded-none" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Kỹ năng
                </h3>
                {data.skills.map((grp) => (
                  <div key={grp.id} className="space-y-0.5 avoid-break">
                    <span className="text-[9.5px] font-bold text-slate-700 block">{grp.category}</span>
                    <p className="text-[9px] text-slate-600 leading-relaxed break-words whitespace-normal">
                      {grp.skills.join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider border-l-4 pl-1.5 rounded-none" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Ngôn ngữ
                </h3>
                <div className="space-y-1 text-[9.5px] text-slate-700">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between avoid-break">
                      <span className="font-semibold break-words whitespace-normal">{lang.name}</span>
                      <span className="text-slate-500 break-words whitespace-normal">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Right Column */}
          <main className="col-span-8 space-y-4.5">
            {/* Work Experience */}
            {data.workExperience.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-0.5 text-left" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Kinh nghiệm làm việc
                </h2>
                <div className={spacing.itemGap}>
                  {data.workExperience.map((job) => (
                    <div key={job.id} className="avoid-break">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[11px] font-extrabold text-slate-800 break-words whitespace-normal">
                          {job.position}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase flex-shrink-0 pl-4">
                          {job.startDate} — {job.current ? "Hiện tại" : job.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] font-bold break-words whitespace-normal" style={{ color: settings.primaryColor }}>
                          {job.company}
                        </span>
                        {job.location && (
                          <span className="text-[9px] font-semibold text-slate-400 flex-shrink-0 pl-4">
                            {job.location}
                          </span>
                        )}
                      </div>
                      {renderDescription(job.description)}
                      {renderTechStack(job.techStack)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Projects */}
            {data.projects.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-0.5 text-left" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Dự án tiêu biểu
                </h2>
                <div className={spacing.itemGap}>
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="avoid-break">
                      <div className="flex flex-wrap justify-between items-baseline mb-0.5 gap-x-4">
                        <span className="text-[11px] font-bold text-slate-800 break-words whitespace-normal">
                          {proj.title} {proj.role && <span className="text-slate-550 font-normal">({proj.role})</span>}
                        </span>
                        {proj.link && <span className="text-[9px] text-blue-600 hover:underline break-words whitespace-normal">{proj.link}</span>}
                      </div>
                      {renderDescription(proj.description)}
                      {renderTechStack(proj.techStack)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education History */}
            {data.education.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-0.5 text-left" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Học vấn
                </h2>
                <div className={spacing.itemGap}>
                  {data.education.map((edu) => (
                    <div key={edu.id} className="avoid-break">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[11px] font-bold text-slate-800 break-words whitespace-normal">
                          {edu.degree} - {edu.fieldOfStudy}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-550 flex-shrink-0">
                          {edu.startDate} — {edu.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span className="font-semibold break-words whitespace-normal">{edu.school} {edu.location ? `• ${edu.location}` : ""}</span>
                        {edu.grade && <span className="font-medium break-words whitespace-normal">{edu.grade}</span>}
                      </div>
                      {edu.description && <p className="text-[10px] text-slate-500 italic mt-0.5 break-words whitespace-normal">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};


/* ==========================================
   4. ELEGANT EXECUTIVE TEMPLATE (Tinh tế)
   ========================================== */
export const ElegantExecutiveTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between" style={{ fontFamily }}>
      <div>
        {/* Top Header Grid */}
        <header className="flex justify-between items-start border-b pb-4 border-slate-200">
          <div className="flex-1">
            <h1 className="text-3xl font-light tracking-tight text-slate-900 leading-tight">
              {data.personalInfo.name || "Họ và tên"}
            </h1>
            <p className="text-xs font-bold tracking-widest uppercase mt-1" style={{ color: settings.primaryColor }}>
              {data.personalInfo.title || "Vị trí công việc"}
            </p>
            {data.summary && (
              <p className="text-[10.5px] text-slate-500 mt-2.5 leading-relaxed max-w-[90%] break-words whitespace-normal">
                {data.summary}
              </p>
            )}
          </div>
          <div className="text-right text-[10px] text-slate-600 space-y-1 pl-4 flex-shrink-0 max-w-[280px]">
            {data.personalInfo.phone && <p className="break-words whitespace-normal">SĐT: {data.personalInfo.phone}</p>}
            {data.personalInfo.email && <p className="break-words whitespace-normal">Email: {data.personalInfo.email}</p>}
            {data.personalInfo.location && <p className="break-words whitespace-normal">{data.personalInfo.location}</p>}
            {data.personalInfo.website && <p className="break-words whitespace-normal">{data.personalInfo.website}</p>}
            {data.personalInfo.github && <p className="break-words whitespace-normal">{getSocialLabel(data.personalInfo.github)}: {data.personalInfo.github}</p>}
            {data.personalInfo.linkedin && <p className="break-words whitespace-normal">{getSocialLabel(data.personalInfo.linkedin)}: {data.personalInfo.linkedin}</p>}
          </div>
          {hasAvatar && (
            <div className="w-[90px] h-[135px] border ml-4 overflow-hidden flex-shrink-0 rounded-none" style={{ borderColor: settings.primaryColor }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
            </div>
          )}
        </header>

        {/* Asymmetrical Spacing Layout */}
        <div className="mt-4 space-y-5">
          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <section className="grid grid-cols-12 gap-4">
              <div className="col-span-3 text-left">
                <h2 className="text-xs font-black uppercase tracking-wider border-l-4 pl-2.5 rounded-none" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Kinh nghiệm
                </h2>
              </div>
              <div className="col-span-9 space-y-4">
                {data.workExperience.map((job) => (
                  <div key={job.id} className="space-y-0.5 text-left avoid-break">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-[11px] font-extrabold text-slate-800 break-words whitespace-normal">
                        {job.position}
                      </h3>
                      <span className="text-[9.5px] font-bold text-slate-500 flex-shrink-0 pl-4">
                        {job.startDate} — {job.current ? "Hiện tại" : job.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[10px] font-bold break-words whitespace-normal" style={{ color: settings.primaryColor }}>
                        {job.company}
                      </span>
                      {job.location && (
                        <span className="text-[9px] font-semibold text-slate-400 flex-shrink-0 pl-4">
                          {job.location}
                        </span>
                      )}
                    </div>
                    {renderDescription(job.description)}
                    {renderTechStack(job.techStack)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <section className="grid grid-cols-12 gap-4">
              <div className="col-span-3 text-left">
                <h2 className="text-xs font-black uppercase tracking-wider border-l-4 pl-2.5 rounded-none" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Dự án
                </h2>
              </div>
              <div className="col-span-9 space-y-4">
                {data.projects.map((proj) => (
                  <div key={proj.id} className="space-y-0.5 text-left avoid-break">
                    <div className="flex flex-wrap justify-between items-baseline gap-x-4">
                      <h3 className="text-[11px] font-extrabold text-slate-800 break-words whitespace-normal">
                        {proj.title} {proj.role && <span className="text-slate-555 font-normal">({proj.role})</span>}
                      </h3>
                      {proj.link && <span className="text-[9px] text-blue-600 hover:underline break-words whitespace-normal">{proj.link}</span>}
                    </div>
                    {renderDescription(proj.description)}
                    {renderTechStack(proj.techStack)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section className="grid grid-cols-12 gap-4">
              <div className="col-span-3 text-left">
                <h2 className="text-xs font-black uppercase tracking-wider border-l-4 pl-2.5 rounded-none" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Học vấn
                </h2>
              </div>
              <div className="col-span-9 space-y-3">
                {data.education.map((edu) => (
                  <div key={edu.id} className="space-y-0.5 text-left avoid-break">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-[11px] font-extrabold text-slate-800 break-words whitespace-normal">
                        {edu.degree} - {edu.fieldOfStudy}
                      </h3>
                      <span className="text-[9px] font-bold text-slate-500 flex-shrink-0">{edu.startDate} — {edu.endDate}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span className="font-semibold break-words whitespace-normal">{edu.school} {edu.location ? `• ${edu.location}` : ""}</span>
                      {edu.grade && <span className="font-medium break-words whitespace-normal">{edu.grade}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills & Certs */}
          <section className="grid grid-cols-12 gap-4">
            <div className="col-span-3 text-left">
              <h2 className="text-xs font-black uppercase tracking-wider border-l-4 pl-2.5 rounded-none" style={{ color: settings.primaryColor, borderColor: settings.primaryColor }}>
                Kỹ năng & Khác
              </h2>
            </div>
            <div className="col-span-9 grid grid-cols-2 gap-4 text-[10px]">
              {/* Left Skills */}
              <div className="space-y-2 text-left">
                {data.skills.map((grp) => (
                  <div key={grp.id} className="space-y-0.5">
                    <span className="font-bold text-slate-700 block">{grp.category}</span>
                    <p className="text-slate-600 break-words whitespace-normal leading-relaxed">{grp.skills.join(' · ')}</p>
                  </div>
                ))}
              </div>
              {/* Right Langs & Certs */}
              <div className="space-y-2 text-left">
                {data.languages.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Ngôn ngữ</span>
                    {data.languages.map((lang) => (
                      <p key={lang.id} className="text-slate-650 break-words whitespace-normal avoid-break">
                        {lang.name}: <span className="text-slate-500">{lang.proficiency}</span>
                      </p>
                    ))}
                  </div>
                )}
                {data.certifications.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Chứng chỉ</span>
                    {data.certifications.map((cert) => (
                      <p key={cert.id} className="text-slate-650 break-words whitespace-normal leading-tight avoid-break">
                        {cert.name} ({cert.date})
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


/* ==========================================
   5. TECHNICAL MINIMALIST TEMPLATE (Kỹ thuật)
   ========================================== */
export const TechnicalMinimalistTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacing = getSpacingClasses(settings.spacing);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between" style={{ fontFamily }}>
      <div>
        {/* Terminal Header Style */}
        <header className="border-b pb-3 text-left" style={{ borderColor: secondaryColor }}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {data.personalInfo.name || "Họ và tên"}
              </h1>
              <p className="text-[11px] font-bold tracking-wider uppercase mt-1" style={{ color: settings.primaryColor }}>
                {data.personalInfo.title || "Vị trí công việc"}
              </p>
            </div>
            {hasAvatar && (
              <div className="w-[90px] h-[135px] border border-slate-300 overflow-hidden flex-shrink-0 rounded-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          
          {data.summary && (
            <p className="text-[10.5px] text-slate-650 mt-2 leading-relaxed break-words whitespace-normal">
              {data.summary}
            </p>
          )}

          {/* Quick Contact Bar */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9.5px] text-slate-500 mt-2 pt-1 border-t border-slate-100 break-words whitespace-normal">
            {data.personalInfo.email && <span className="break-words whitespace-normal">Email: {data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span className="break-words whitespace-normal">SĐT: {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span className="break-words whitespace-normal">Địa chỉ: {data.personalInfo.location}</span>}
            {data.personalInfo.website && <span className="break-words whitespace-normal">Website: {data.personalInfo.website}</span>}
            {data.personalInfo.github && <span className="break-words whitespace-normal">{getSocialLabel(data.personalInfo.github)}: {data.personalInfo.github}</span>}
            {data.personalInfo.linkedin && <span className="break-words whitespace-normal">{getSocialLabel(data.personalInfo.linkedin)}: {data.personalInfo.linkedin}</span>}
          </div>
        </header>

        {/* Content columns */}
        <div className="mt-4 space-y-4">
          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-0.5 text-slate-900">
                Kinh nghiệm làm việc
              </h2>
              <div className={spacing.itemGap}>
                {data.workExperience.map((job) => (
                  <div key={job.id} className="text-left avoid-break">
                    <div className="flex justify-between items-baseline text-[10.5px]">
                      <span className="font-bold text-slate-800 break-words whitespace-normal">
                        {job.position}
                      </span>
                      <span className="text-[9px] text-slate-550 font-semibold flex-shrink-0 pl-4">
                        [{job.startDate} ~ {job.current ? "Hiện tại" : job.endDate}]
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[9.5px] mb-1">
                      <span className="font-bold break-words whitespace-normal" style={{ color: settings.primaryColor }}>
                        {job.company}
                      </span>
                      {job.location && (
                        <span className="text-[9px] text-slate-450 flex-shrink-0 pl-4">
                          {job.location}
                        </span>
                      )}
                    </div>
                    <div className="pl-3 mt-1">
                      {renderDescription(job.description)}
                    </div>
                    <div className="pl-3">{renderTechStack(job.techStack, false)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-0.5 text-slate-900">
                Dự án tiêu biểu
              </h2>
              <div className={spacing.itemGap}>
                {data.projects.map((proj) => (
                  <div key={proj.id} className="text-left avoid-break">
                    <div className="flex flex-wrap justify-between items-baseline text-[10.5px] gap-x-4">
                      <span className="font-bold text-slate-800 break-words whitespace-normal">
                        {proj.title} {proj.role && <span className="text-slate-555 font-normal">({proj.role})</span>}
                      </span>
                      {proj.link && <span className="text-[9px] text-blue-600 hover:underline break-words whitespace-normal">{proj.link}</span>}
                    </div>
                    <div className="pl-3 mt-1">
                      {renderDescription(proj.description)}
                    </div>
                    <div className="pl-3">{renderTechStack(proj.techStack, false)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education & Skills Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column: Education */}
            {data.education.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5 text-slate-900" style={{ borderColor: secondaryColor }}>
                  Học vấn
                </h2>
                <div className={spacing.itemGap}>
                  {data.education.map((edu) => (
                    <div key={edu.id} className="text-[10px] text-left avoid-break">
                      <p className="font-bold text-slate-800 break-words whitespace-normal">{edu.school}</p>
                      <p className="text-slate-650 break-words whitespace-normal">{edu.degree} - {edu.fieldOfStudy}</p>
                      <p className="text-slate-500 text-[9px] break-words whitespace-normal">{edu.startDate} - {edu.endDate} {edu.grade ? `| ${edu.grade}` : ""}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Right Column: Skills */}
            {data.skills.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-0.5 text-slate-900" style={{ borderColor: secondaryColor }}>
                  Kỹ năng chuyên môn
                </h2>
                <div className="space-y-2 text-[10px] text-left">
                  {data.skills.map((grp) => (
                    <div key={grp.id} className="space-y-0.5 avoid-break">
                      <span className="font-bold text-slate-700 block">{grp.category}</span>
                      <p className="text-slate-600 break-words whitespace-normal leading-relaxed">{grp.skills.join(' · ')}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   6. BOLD EDITORIAL TEMPLATE (Báo chí)
   ========================================== */
export const BoldEditorialTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacing = getSpacingClasses(settings.spacing);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between border-t-8" style={{ fontFamily, borderColor: settings.primaryColor }}>
      <div className="p-1">
        {/* Header Block */}
        <header className="border-b-4 border-double pb-4 mb-4" style={{ borderColor: settings.primaryColor }}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-black uppercase tracking-tight leading-none text-slate-900 mb-1">
                {data.personalInfo.name || "Họ và tên"}
              </h1>
              <p className="text-sm font-extrabold uppercase tracking-widest text-slate-600 mb-3" style={{ color: settings.primaryColor }}>
                {data.personalInfo.title || "Vị trí công việc"}
              </p>
              {data.summary && (
                <p className="text-[10.5px] text-slate-600 leading-relaxed break-words whitespace-normal border-l-2 pl-3 italic border-slate-300">
                  {data.summary}
                </p>
              )}
            </div>
            {hasAvatar && (
              <div className="w-[90px] h-[135px] border-2 overflow-hidden flex-shrink-0" style={{ borderColor: settings.primaryColor }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          
          {/* Quick Contact Bar */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9.5px] text-slate-500 font-bold uppercase mt-3 pt-2 border-t border-dashed border-slate-200">
            {data.personalInfo.email && <span>Email: {data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>SĐT: {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>Địa chỉ: {data.personalInfo.location}</span>}
            {data.personalInfo.website && <span>Website: {data.personalInfo.website}</span>}
            {data.personalInfo.github && <span>{getSocialLabel(data.personalInfo.github)}: {data.personalInfo.github}</span>}
            {data.personalInfo.linkedin && <span>{getSocialLabel(data.personalInfo.linkedin)}: {data.personalInfo.linkedin}</span>}
          </div>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-12 gap-5">
          {/* Main Column */}
          <main className="col-span-8 space-y-4">
            {/* Work Experience */}
            {data.workExperience.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-1" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Kinh nghiệm làm việc
                </h2>
                <div className={spacing.itemGap}>
                  {data.workExperience.map((job) => (
                    <div key={job.id} className="avoid-break">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[11px] font-black text-slate-800">{job.position}</span>
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase flex-shrink-0 pl-4">
                          {job.startDate} — {job.current ? "Hiện tại" : job.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[10px] font-extrabold" style={{ color: settings.primaryColor }}>{job.company}</span>
                        {job.location && <span className="text-[9px] font-semibold text-slate-400 flex-shrink-0 pl-4">{job.location}</span>}
                      </div>
                      {renderDescription(job.description)}
                      {renderTechStack(job.techStack)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Key Projects */}
            {data.projects.length > 0 && (
              <section className={spacing.sectionGap}>
                <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-1" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Dự án tiêu biểu
                </h2>
                <div className={spacing.itemGap}>
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="avoid-break">
                      <div className="flex flex-wrap justify-between items-baseline mb-0.5 gap-x-4">
                        <span className="text-[11px] font-black text-slate-800">
                          {proj.title} {proj.role && <span className="text-slate-550 font-normal">({proj.role})</span>}
                        </span>
                        {proj.link && <span className="text-[9.5px] text-blue-600 hover:underline">{proj.link}</span>}
                      </div>
                      {renderDescription(proj.description)}
                      {renderTechStack(proj.techStack)}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar Column */}
          <aside className="col-span-4 space-y-4 border-l pl-4 border-slate-200">
            {/* Skills */}
            {data.skills.length > 0 && (
              <section className={spacing.sectionGap}>
                <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Kỹ năng
                </h3>
                <div className="space-y-2">
                  {data.skills.map((grp) => (
                    <div key={grp.id} className="space-y-0.5 avoid-break">
                      <span className="text-[9.5px] font-bold text-slate-700 block">{grp.category}</span>
                      <p className="text-[9.5px] text-slate-655 leading-relaxed">{grp.skills.join(' · ')}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <section className={spacing.sectionGap}>
                <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Học vấn
                </h3>
                <div className={spacing.itemGap}>
                  {data.education.map((edu) => (
                    <div key={edu.id} className="avoid-break">
                      <p className="text-[10px] font-bold text-slate-800">{edu.degree}</p>
                      <p className="text-[9.5px] font-semibold text-slate-600">{edu.school}</p>
                      <p className="text-[8.5px] font-bold text-slate-400 uppercase">{edu.startDate} — {edu.endDate}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <section className={spacing.sectionGap}>
                <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Ngôn ngữ
                </h3>
                <div className="space-y-1 text-[9.5px]">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-slate-700 avoid-break">
                      <span className="font-bold">{lang.name}</span>
                      <span className="text-slate-500">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {data.certifications.length > 0 && (
              <section className={spacing.sectionGap}>
                <h3 className="text-xs font-black uppercase tracking-wider border-b pb-1" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                  Chứng chỉ
                </h3>
                <div className="space-y-2 text-[9px]">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="avoid-break">
                      <p className="font-bold text-slate-700 leading-tight">{cert.name}</p>
                      <p className="text-slate-400 font-semibold">{cert.issuer} • {cert.date}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   7. MINIMALIST BORDERED TEMPLATE (Khung viền)
   ========================================== */
export const MinimalistBorderedTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacing = getSpacingClasses(settings.spacing);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between" style={{ fontFamily }}>
      <div className="space-y-4">
        {/* Header Block inside a Border Box */}
        <header className="border border-slate-200 p-4 relative bg-slate-550/5">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tight" style={{ color: settings.primaryColor }}>
                {data.personalInfo.name || "Họ và tên"}
              </h1>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                {data.personalInfo.title || "Vị trí công việc"}
              </p>
              {data.summary && (
                <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                  {data.summary}
                </p>
              )}
            </div>
            {hasAvatar && (
              <div className="w-[80px] h-[120px] border overflow-hidden flex-shrink-0" style={{ borderColor: settings.primaryColor }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          {/* Contact Bar */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-500 font-medium mt-3 pt-2 border-t border-slate-100">
            {data.personalInfo.email && <span>Email: {data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>SĐT: {data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>Địa chỉ: {data.personalInfo.location}</span>}
            {data.personalInfo.website && <span>Website: {data.personalInfo.website}</span>}
            {data.personalInfo.github && <span>{getSocialLabel(data.personalInfo.github)}: {data.personalInfo.github}</span>}
            {data.personalInfo.linkedin && <span>{getSocialLabel(data.personalInfo.linkedin)}: {data.personalInfo.linkedin}</span>}
          </div>
        </header>

        {/* Sections in Borders */}
        {data.workExperience.length > 0 && (
          <section className="border border-slate-200 p-4">
            <h2 className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: settings.primaryColor }}>
              Kinh nghiệm làm việc
            </h2>
            <div className={spacing.itemGap}>
              {data.workExperience.map((job) => (
                <div key={job.id} className="avoid-break border-l-2 pl-3 border-slate-200">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[10.5px] font-bold text-slate-800">{job.position}</span>
                    <span className="text-[9px] font-bold text-slate-400">{job.startDate} — {job.current ? "Hiện tại" : job.endDate}</span>
                  </div>
                  <p className="text-[9.5px] font-extrabold" style={{ color: secondaryColor }}>{job.company}</p>
                  {renderDescription(job.description)}
                  {renderTechStack(job.techStack)}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section className="border border-slate-200 p-4">
            <h2 className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: settings.primaryColor }}>
              Dự án tiêu biểu
            </h2>
            <div className={spacing.itemGap}>
              {data.projects.map((proj) => (
                <div key={proj.id} className="avoid-break border-l-2 pl-3 border-slate-200">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[10.5px] font-bold text-slate-800">{proj.title}</span>
                    {proj.link && <span className="text-[9px] text-blue-600 hover:underline">{proj.link}</span>}
                  </div>
                  {renderDescription(proj.description)}
                  {renderTechStack(proj.techStack)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom grid (Education & Skills) */}
        <div className="grid grid-cols-2 gap-4">
          {data.education.length > 0 && (
            <section className="border border-slate-200 p-4">
              <h2 className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: settings.primaryColor }}>
                Học vấn
              </h2>
              <div className={spacing.itemGap}>
                {data.education.map((edu) => (
                  <div key={edu.id} className="avoid-break">
                    <p className="text-[10px] font-bold text-slate-800">{edu.degree}</p>
                    <p className="text-[9.5px] font-semibold text-slate-600">{edu.school}</p>
                    <p className="text-[8.5px] text-slate-400 font-bold">{edu.startDate} — {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills.length > 0 && (
            <section className="border border-slate-200 p-4">
              <h2 className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: settings.primaryColor }}>
                Kỹ năng
              </h2>
              <div className="space-y-2">
                {data.skills.map((grp) => (
                  <div key={grp.id} className="avoid-break text-[9.5px]">
                    <span className="font-bold text-slate-700 block mb-0.5">{grp.category}</span>
                    <p className="text-slate-600 leading-tight">{grp.skills.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   8. SIDEBAR COLUMNS TEMPLATE (Cột dọc)
   ========================================== */
export const SidebarColumnsTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacing = getSpacingClasses(settings.spacing);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between" style={{ fontFamily }}>
      <div className="grid grid-cols-12 h-full min-h-[inherit]">
        {/* Left Sidebar (33% Width) */}
        <aside className="col-span-4 p-4 text-white flex flex-col gap-5" style={{ backgroundColor: settings.primaryColor }}>
          <div className="space-y-5">
            {/* Header / Avatar */}
            <div className="text-center">
              {hasAvatar && (
                <div className="w-[80px] h-[120px] mx-auto mb-3 border border-white/20 overflow-hidden bg-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
                </div>
              )}
              <h1 className="text-xl font-black uppercase tracking-tight leading-tight">{data.personalInfo.name}</h1>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">{data.personalInfo.title}</p>
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-[9.5px] border-t border-white/10 pt-3">
              <h3 className="text-[10px] font-extrabold uppercase tracking-wider mb-2">Liên hệ</h3>
              {data.personalInfo.email && <p className="break-all">Email: {data.personalInfo.email}</p>}
              {data.personalInfo.phone && <p>SĐT: {data.personalInfo.phone}</p>}
              {data.personalInfo.location && <p>Địa chỉ: {data.personalInfo.location}</p>}
              {data.personalInfo.website && <p className="break-all">{data.personalInfo.website}</p>}
              {data.personalInfo.github && <p className="break-all">{getSocialLabel(data.personalInfo.github)}: {data.personalInfo.github}</p>}
              {data.personalInfo.linkedin && <p className="break-all">{getSocialLabel(data.personalInfo.linkedin)}: {data.personalInfo.linkedin}</p>}
            </div>

            {/* Skills */}
            {data.skills.length > 0 && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <h3 className="text-[10px] font-extrabold uppercase tracking-wider mb-2">Kỹ năng</h3>
                {data.skills.map((grp) => (
                  <div key={grp.id} className="avoid-break text-[9px] space-y-0.5">
                    <span className="font-bold opacity-90 block">{grp.category}</span>
                    <p className="opacity-75">{grp.skills.join(', ')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Content Area (67% Width) */}
        <main className="col-span-8 p-4 pl-5 space-y-4.5 bg-white h-full">
          {/* Summary */}
          {data.summary && (
            <div className="avoid-break">
              <p className="text-[10.5px] text-slate-600 leading-relaxed border-l-2 pl-3 border-slate-200">
                {data.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-0.5" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                Kinh nghiệm làm việc
              </h2>
              <div className={spacing.itemGap}>
                {data.workExperience.map((job) => (
                  <div key={job.id} className="avoid-break">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10.5px] font-bold text-slate-800">{job.position}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex-shrink-0 pl-4">{job.startDate} — {job.current ? "Hiện tại" : job.endDate}</span>
                    </div>
                    <p className="text-[9.5px] font-extrabold" style={{ color: settings.primaryColor }}>{job.company}</p>
                    {renderDescription(job.description)}
                    {renderTechStack(job.techStack)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-0.5" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                Dự án tiêu biểu
              </h2>
              <div className={spacing.itemGap}>
                {data.projects.map((proj) => (
                  <div key={proj.id} className="avoid-break">
                    <div className="flex flex-wrap justify-between items-baseline mb-0.5">
                      <span className="text-[10.5px] font-bold text-slate-800">{proj.title}</span>
                      {proj.link && <span className="text-[9px] text-blue-600 hover:underline">{proj.link}</span>}
                    </div>
                    {renderDescription(proj.description)}
                    {renderTechStack(proj.techStack)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-0.5" style={{ color: settings.primaryColor, borderColor: secondaryColor }}>
                Học vấn
              </h2>
              <div className={spacing.itemGap}>
                {data.education.map((edu) => (
                  <div key={edu.id} className="avoid-break">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10.5px] font-bold text-slate-800">{edu.degree}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{edu.startDate} — {edu.endDate}</span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 font-semibold">{edu.school} {edu.location ? `• ${edu.location}` : ""}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

/* ==========================================
   9. RETRO TYPOGRAPHIC TEMPLATE (Tân cổ điển)
   ========================================== */
export const RetroTypographicTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacing = getSpacingClasses(settings.spacing);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between" style={{ fontFamily }}>
      <div className="space-y-4.5">
        {/* Modern Neo-Classical Header */}
        <header className="flex justify-between items-stretch gap-5 border-b pb-4 border-slate-200">
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">
              {data.personalInfo.name || "Họ và tên"}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-wider mt-2.5 px-2.5 py-1 inline-block w-fit text-white rounded-sm" style={{ backgroundColor: settings.primaryColor }}>
              {data.personalInfo.title || "Vị trí công việc"}
            </p>
            {data.summary && (
              <p className="text-[10px] text-slate-600 mt-3 leading-relaxed max-w-[95%]">
                {data.summary}
              </p>
            )}
          </div>
          
          <div className="flex flex-col justify-between items-end gap-3 text-right">
            {hasAvatar && (
              <div className="w-[75px] h-[100px] overflow-hidden border border-slate-200 rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="space-y-1 text-[9.5px] text-slate-500 font-semibold">
              {data.personalInfo.email && <div className="flex items-center justify-end gap-1.5"><span>{data.personalInfo.email}</span><Mail className="w-3.5 h-3.5 text-slate-400" /></div>}
              {data.personalInfo.phone && <div className="flex items-center justify-end gap-1.5"><span>{data.personalInfo.phone}</span><Phone className="w-3.5 h-3.5 text-slate-400" /></div>}
              {data.personalInfo.location && <div className="flex items-center justify-end gap-1.5"><span>{data.personalInfo.location}</span><MapPin className="w-3.5 h-3.5 text-slate-400" /></div>}
              {data.personalInfo.website && <div className="flex items-center justify-end gap-1.5"><span>{data.personalInfo.website}</span><Globe className="w-3.5 h-3.5 text-slate-400" /></div>}
            </div>
          </div>
        </header>

        {/* Timeline Layout */}
        {data.workExperience.length > 0 && (
          <section className={spacing.sectionGap}>
            <div className="flex items-center gap-2 border-b pb-1 border-slate-150">
              <Briefcase className="w-4 h-4" style={{ color: settings.primaryColor }} />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Kinh nghiệm làm việc
              </h2>
            </div>
            
            <div className="border-l-2 ml-2 pl-5 space-y-4 border-slate-200 mt-2">
              {data.workExperience.map((job) => (
                <div key={job.id} className="relative avoid-break">
                  {/* Timeline Dot */}
                  <span className="absolute left-[-27px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: settings.primaryColor }} />
                  
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11px] font-bold text-slate-800">{job.position}</span>
                    <span className="text-[9px] font-bold text-slate-400">{job.startDate} — {job.current ? "Hiện tại" : job.endDate}</span>
                  </div>
                  <p className="text-[9.5px] font-extrabold" style={{ color: secondaryColor }}>{job.company}</p>
                  
                  {renderDescription(job.description)}
                  {renderTechStack(job.techStack)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Timeline */}
        {data.projects.length > 0 && (
          <section className={spacing.sectionGap}>
            <div className="flex items-center gap-2 border-b pb-1 border-slate-150">
              <FolderGit2 className="w-4 h-4" style={{ color: settings.primaryColor }} />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Dự án tiêu biểu
              </h2>
            </div>
            
            <div className="border-l-2 ml-2 pl-5 space-y-4 border-slate-200 mt-2">
              {data.projects.map((proj) => (
                <div key={proj.id} className="relative avoid-break">
                  {/* Timeline Dot */}
                  <span className="absolute left-[-27px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: secondaryColor }} />
                  
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11px] font-bold text-slate-800">{proj.title}</span>
                    {proj.link && <span className="text-[9px] text-blue-600 hover:underline">{proj.link}</span>}
                  </div>
                  
                  {renderDescription(proj.description)}
                  {renderTechStack(proj.techStack)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Skills */}
        <div className="grid grid-cols-2 gap-5 pt-1">
          {data.education.length > 0 && (
            <section className={spacing.sectionGap}>
              <div className="flex items-center gap-2 border-b pb-1 border-slate-150">
                <GraduationCap className="w-4 h-4" style={{ color: settings.primaryColor }} />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Học vấn
                </h2>
              </div>
              <div className="space-y-3 mt-2">
                {data.education.map((edu) => (
                  <div key={edu.id} className="avoid-break text-[9.5px]">
                    <div className="flex justify-between items-baseline font-bold text-slate-800">
                      <span>{edu.degree}</span>
                      <span className="text-[8.5px] text-slate-450 font-semibold">{edu.startDate} — {edu.endDate}</span>
                    </div>
                    <p className="text-slate-600">{edu.school}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills.length > 0 && (
            <section className={spacing.sectionGap}>
              <div className="flex items-center gap-2 border-b pb-1 border-slate-150">
                <Wrench className="w-4 h-4" style={{ color: settings.primaryColor }} />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Kỹ năng
                </h2>
              </div>
              <div className="space-y-2 mt-2">
                {data.skills.map((grp) => (
                  <div key={grp.id} className="avoid-break text-[9.5px]">
                    <span className="font-bold text-slate-700 block mb-0.5">{grp.category}</span>
                    <p className="text-slate-650 leading-relaxed">{grp.skills.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   10. MODERN ACCENT GRID TEMPLATE (Điểm nhấn)
   ========================================== */
export const ModernAccentGridTemplate: React.FC<TemplateProps> = ({ data, settings }) => {
  const fontFamily = getFontFamily(settings.fontFamily);
  const spacing = getSpacingClasses(settings.spacing);
  const hasAvatar = settings.showAvatar && data.personalInfo.avatar;
  const secondaryColor = settings.secondaryColor || settings.primaryColor;

  return (
    <div className="w-full h-full text-slate-800 flex flex-col justify-between" style={{ fontFamily }}>
      <div className="space-y-4">
        {/* Modern Accent Header */}
        <header className="flex justify-between items-start gap-4 border-l-8 pl-4 py-1" style={{ borderColor: settings.primaryColor }}>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight mb-0.5 text-slate-900">
              {data.personalInfo.name || "Họ và tên"}
            </h1>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              {data.personalInfo.title || "Vị trí công việc"}
            </p>
            {data.summary && (
              <p className="text-[10px] text-slate-600 leading-relaxed max-w-[95%]">
                {data.summary}
              </p>
            )}
          </div>
          {hasAvatar && (
            <div className="w-[80px] h-[120px] overflow-hidden flex-shrink-0 rounded-none border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.personalInfo.avatar} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
            </div>
          )}
        </header>

        {/* Contact details bar */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-bold uppercase text-slate-500 bg-slate-50 p-2.5 border-t border-b border-slate-100">
          {data.personalInfo.email && <span>Email: {data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>SĐT: {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>Địa chỉ: {data.personalInfo.location}</span>}
          {data.personalInfo.website && <span>Website: {data.personalInfo.website}</span>}
          {data.personalInfo.github && <span>{getSocialLabel(data.personalInfo.github)}: {data.personalInfo.github}</span>}
          {data.personalInfo.linkedin && <span>{getSocialLabel(data.personalInfo.linkedin)}: {data.personalInfo.linkedin}</span>}
        </div>

        {/* Work Experience with Left Accent Stripe */}
        {data.workExperience.length > 0 && (
          <section className={spacing.sectionGap}>
            <h2 className="text-xs font-black uppercase tracking-wider border-l-4 pl-2" style={{ color: settings.primaryColor, borderColor: settings.primaryColor }}>
              Kinh nghiệm làm việc
            </h2>
            <div className={spacing.itemGap}>
              {data.workExperience.map((job) => (
                <div key={job.id} className="avoid-break bg-slate-50/50 p-3 border border-slate-200/60 border-l-4" style={{ borderLeftColor: secondaryColor }}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[10.5px] font-bold text-slate-800">{job.position}</span>
                    <span className="text-[9px] font-semibold text-slate-500">{job.startDate} — {job.current ? "Hiện tại" : job.endDate}</span>
                  </div>
                  <p className="text-[9.5px] font-extrabold" style={{ color: settings.primaryColor }}>{job.company}</p>
                  {renderDescription(job.description)}
                  {renderTechStack(job.techStack)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects with Left Accent Stripe */}
        {data.projects.length > 0 && (
          <section className={spacing.sectionGap}>
            <h2 className="text-xs font-black uppercase tracking-wider border-l-4 pl-2" style={{ color: settings.primaryColor, borderColor: settings.primaryColor }}>
              Dự án tiêu biểu
            </h2>
            <div className={spacing.itemGap}>
              {data.projects.map((proj) => (
                <div key={proj.id} className="avoid-break bg-slate-50/50 p-3 border border-slate-200/60 border-l-4" style={{ borderLeftColor: secondaryColor }}>
                  <div className="flex flex-wrap justify-between items-baseline mb-0.5">
                    <span className="text-[10.5px] font-bold text-slate-800">{proj.title}</span>
                    {proj.link && <span className="text-[9px] text-blue-600 hover:underline">{proj.link}</span>}
                  </div>
                  {renderDescription(proj.description)}
                  {renderTechStack(proj.techStack)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Skills grid */}
        <div className="grid grid-cols-2 gap-4">
          {data.education.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-black uppercase tracking-wider border-l-4 pl-2" style={{ color: settings.primaryColor, borderColor: settings.primaryColor }}>
                Học vấn
              </h2>
              <div className={spacing.itemGap}>
                {data.education.map((edu) => (
                  <div key={edu.id} className="avoid-break bg-slate-50/50 p-3 border border-slate-200/60 border-l-4 text-[9.5px]" style={{ borderLeftColor: secondaryColor }}>
                    <p className="font-bold text-slate-800">{edu.degree}</p>
                    <p className="text-slate-650 mt-0.5">{edu.school}</p>
                    <p className="text-slate-400 font-semibold">{edu.startDate} — {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills.length > 0 && (
            <section className={spacing.sectionGap}>
              <h2 className="text-xs font-black uppercase tracking-wider border-l-4 pl-2" style={{ color: settings.primaryColor, borderColor: settings.primaryColor }}>
                Kỹ năng
              </h2>
              <div className="space-y-2">
                {data.skills.map((grp) => (
                  <div key={grp.id} className="avoid-break bg-slate-50/50 p-3 border border-slate-200/60 border-l-4 text-[9.5px]" style={{ borderLeftColor: secondaryColor }}>
                    <span className="font-bold text-slate-700 block mb-0.5">{grp.category}</span>
                    <p className="text-slate-600 leading-normal">{grp.skills.join(' · ')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
