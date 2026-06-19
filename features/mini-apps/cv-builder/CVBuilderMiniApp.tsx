"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Wrench,
  Sliders,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Eye,
  Sun,
  Moon,
  Minimize2,
  MoveHorizontal,
  Terminal,
  TrendingUp,
  Megaphone,
  Stethoscope,
  Palette,
  Package,
  Compass,
  Scale
} from "lucide-react";
import { CVData, CVSettings, WorkExperience, Project, Education, SkillGroup, Language, Certification } from "./types/cv";
import { SAMPLE_TEMPLATES } from "./data/samples";
import { toast } from "./lib/toast";
import { DEFAULT_SETTINGS } from "./data/sample";
import { CVPreview } from "./components/CVPreview";
import { SettingsImageUploader } from "@/app/admin/components/SettingsImageUploader";
import type { Id } from "@/convex/_generated/dataModel";
import { AiCVImportDialog } from "./components/AiCVImportDialog";
import "./CVBuilder.css";

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("công nghệ") || cat.includes("it")) {
    return <Terminal className="w-4 h-4 text-blue-500 flex-shrink-0" />;
  }
  if (cat.includes("kinh doanh") || cat.includes("bán hàng") || cat.includes("tài chính") || cat.includes("kế toán") || cat.includes("ngân hàng")) {
    return <TrendingUp className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
  }
  if (cat.includes("marketing") || cat.includes("quảng cáo") || cat.includes("truyền thông")) {
    return <Megaphone className="w-4 h-4 text-orange-500 flex-shrink-0" />;
  }
  if (cat.includes("y tế") || cat.includes("sức khỏe") || cat.includes("nha khoa")) {
    return <Stethoscope className="w-4 h-4 text-rose-500 flex-shrink-0" />;
  }
  if (cat.includes("kỹ thuật") || cat.includes("sản xuất") || cat.includes("cơ khí")) {
    return <Wrench className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  }
  if (cat.includes("giáo dục") || cat.includes("đào tạo")) {
    return <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0" />;
  }
  if (cat.includes("thiết kế") || cat.includes("sáng tạo") || cat.includes("mỹ thuật")) {
    return <Palette className="w-4 h-4 text-purple-500 flex-shrink-0" />;
  }
  if (cat.includes("hành chính") || cat.includes("trợ lý") || cat.includes("nhân sự") || cat.includes("tuyển dụng")) {
    return <Briefcase className="w-4 h-4 text-slate-500 flex-shrink-0" />;
  }
  if (cat.includes("logistics") || cat.includes("nhập khẩu") || cat.includes("vận tải")) {
    return <Package className="w-4 h-4 text-sky-500 flex-shrink-0" />;
  }
  if (cat.includes("du lịch") || cat.includes("khách sạn") || cat.includes("hàng không") || cat.includes("dịch vụ")) {
    return <Compass className="w-4 h-4 text-cyan-500 flex-shrink-0" />;
  }
  if (cat.includes("luật") || cat.includes("pháp lý")) {
    return <Scale className="w-4 h-4 text-red-500 flex-shrink-0" />;
  }
  return <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />;
};

export function CVBuilderMiniApp({
  appName = "CV Builder Mini App",
  editable = false,
  standalone = false,
  userId,
}: {
  appName?: string;
  editable?: boolean;
  standalone?: boolean;
  userId?: any;
}) {
  const _unused = { appName, editable, standalone, userId };
  const [data, setData] = useState<CVData>(SAMPLE_TEMPLATES[0].data);
  const [settings, setSettings] = useState<CVSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"profile" | "experience" | "projects" | "skills" | "education" | "styling">("profile");
  const [zoom, setZoom] = useState<number>(0.8);
  const [mounted, setMounted] = useState(false);


  // Read from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedData = localStorage.getItem("cv_builder_data");
    const savedSettings = localStorage.getItem("cv_builder_settings");
    const savedTheme = localStorage.getItem("cv_theme") as "light" | "dark";
    
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch {
        setData(SAMPLE_TEMPLATES[0].data);
      }
    } else {
      setData(SAMPLE_TEMPLATES[0].data);
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("light");
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("cv_builder_data", JSON.stringify(data));
  }, [data, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("cv_builder_settings", JSON.stringify(settings));
  }, [settings, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("cv_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  // Handle dynamic page orientation style for printing
  useEffect(() => {
    if (!mounted) return;
    const styleId = "print-orientation-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@page { size: A4 ${settings.orientation}; margin: 0; }`;
  }, [settings.orientation, mounted]);

  // Autocomplete Search CV mẫu
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTemplates = SAMPLE_TEMPLATES.filter((tpl) =>
    tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tpl.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectTemplate = (tpl: typeof SAMPLE_TEMPLATES[0]) => {
    const prevData = JSON.parse(JSON.stringify(data));
    setData(tpl.data);
    setSearchQuery("");
    setShowDropdown(false);
    toast.success(`Đã nạp CV mẫu ngành "${tpl.name}"`, {
      action: {
        label: "Hoàn tác",
        onClick: () => {
          setData(prevData);
          toast.info("Đã khôi phục dữ liệu CV trước đó");
        }
      },
      duration: 5000,
    });
  };

  // Reset về CV trống
  const handleReset = () => {
    const prevData = JSON.parse(JSON.stringify(data));
    setData({
      personalInfo: {
        name: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        github: "",
        linkedin: "",
        avatar: "",
      },
      summary: "",
      workExperience: [],
      projects: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
      customSections: [],
    });
    toast.warning("Đã xóa toàn bộ nội dung CV", {
      action: {
        label: "Hoàn tác",
        onClick: () => {
          setData(prevData);
          toast.info("Đã khôi phục dữ liệu CV trước đó");
        }
      },
      duration: 5000,
    });
  };



  // Handle personal info changes
  const handlePersonalInfoChange = (field: keyof CVData["personalInfo"], value: string) => {
    setData({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  // Kinh nghiệm làm việc CRUD
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: generateId(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      techStack: [],
    };
    setData({
      ...data,
      workExperience: [...data.workExperience, newExp],
    });
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setData({
      ...data,
      workExperience: data.workExperience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    setData({
      ...data,
      workExperience: data.workExperience.filter((exp) => exp.id !== id),
    });
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= data.workExperience.length) return;
    const newItems = [...data.workExperience];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(nextIndex, 0, moved);
    setData({ ...data, workExperience: newItems });
  };

  // Projects CRUD
  const addProject = () => {
    const newProj: Project = {
      id: generateId(),
      title: "",
      role: "",
      description: "",
      link: "",
      techStack: [],
    };
    setData({
      ...data,
      projects: [...data.projects, newProj],
    });
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setData({
      ...data,
      projects: data.projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    });
  };

  const removeProject = (id: string) => {
    setData({
      ...data,
      projects: data.projects.filter((proj) => proj.id !== id),
    });
  };

  const moveProject = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= data.projects.length) return;
    const newItems = [...data.projects];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(nextIndex, 0, moved);
    setData({ ...data, projects: newItems });
  };

  // Education CRUD
  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      school: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      grade: "",
      description: "",
    };
    setData({
      ...data,
      education: [...data.education, newEdu],
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setData({
      ...data,
      education: data.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    setData({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    });
  };

  const moveEducation = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= data.education.length) return;
    const newItems = [...data.education];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(nextIndex, 0, moved);
    setData({ ...data, education: newItems });
  };

  // Skills CRUD
  const addSkillGroup = () => {
    const newGrp: SkillGroup = {
      id: generateId(),
      category: "",
      skills: [],
    };
    setData({
      ...data,
      skills: [...data.skills, newGrp],
    });
  };

  const updateSkillGroup = (id: string, category: string, skillsString: string) => {
    const skillsArray = skillsString.split(",").map((s) => s.trim()).filter((s) => s !== "");
    setData({
      ...data,
      skills: data.skills.map((grp) =>
        grp.id === id ? { ...grp, category, skills: skillsArray } : grp
      ),
    });
  };

  const removeSkillGroup = (id: string) => {
    setData({
      ...data,
      skills: data.skills.filter((grp) => grp.id !== id),
    });
  };

  const moveSkillGroup = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= data.skills.length) return;
    const newItems = [...data.skills];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(nextIndex, 0, moved);
    setData({ ...data, skills: newItems });
  };

  // Languages CRUD
  const addLanguage = () => {
    const newLang: Language = {
      id: generateId(),
      name: "",
      proficiency: "",
    };
    setData({
      ...data,
      languages: [...data.languages, newLang],
    });
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setData({
      ...data,
      languages: data.languages.map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang
      ),
    });
  };

  const removeLanguage = (id: string) => {
    setData({
      ...data,
      languages: data.languages.filter((lang) => lang.id !== id),
    });
  };

  // Certifications CRUD
  const addCertification = () => {
    const newCert: Certification = {
      id: generateId(),
      name: "",
      issuer: "",
      date: "",
    };
    setData({
      ...data,
      certifications: [...data.certifications, newCert],
    });
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setData({
      ...data,
      certifications: data.certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    });
  };

  const removeCertification = (id: string) => {
    setData({
      ...data,
      certifications: data.certifications.filter((cert) => cert.id !== id),
    });
  };

  // Settings handlers
  const updateSetting = (key: keyof CVSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateMultipleSettings = (updates: Partial<CVSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };



  const triggerPDFDownload = async () => {
    const toastId = toast.info("Đang chuẩn bị và tạo file PDF trực tiếp...", { duration: 20000 });
    
    // Target the visible preview element that has correct screen rendering
    const element = document.getElementById("cv-print-area");
    if (!element) {
      toast.dismiss(toastId);
      toast.error("Không tìm thấy nội dung CV để tải! Vui lòng thử lại.");
      return;
    }

    // Save original styles to restore them afterward
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;
    const originalBgImage = element.style.backgroundImage;
    const hadShadow = element.classList.contains("shadow-2xl");
    
    try {
      // Force scale to 1.0 and disable transitions immediately to capture raw A4 dimensions
      element.style.transition = "none";
      element.style.transform = "scale(1.0)";
      element.style.backgroundImage = "none";
      if (hadShadow) {
        element.classList.remove("shadow-2xl");
      }

      // Temporarily hide all page-break overlays during capture to prevent capturing visual gaps
      const overlays = element.querySelectorAll<HTMLElement>(".page-break-overlay");
      overlays.forEach(o => o.style.display = "none");

      // Small delay to ensure the browser has updated layout values
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Dynamically import local libraries to prevent SSR errors and avoid CDN network failures
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      // Generate canvas from element
      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution for clear text printing
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false
      });

      const isPortrait = settings.orientation === "portrait";
      const format = "a4";
      const orientation = isPortrait ? "p" : "l";
      
      // Initialize jsPDF page matching A4 orientation
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: format,
        compress: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate how many PDF pages we need based on the aspect ratio of A4 page
      // Subtract a small 20px tolerance to prevent subpixel rounding errors from creating an extra page
      const pageHeightInPixels = (imgWidth * pdfHeight) / pdfWidth;
      const totalPages = Math.max(1, Math.ceil((imgHeight - 20) / pageHeightInPixels));

      if (totalPages <= 1) {
        // Single page export
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      } else {
        // Multi-page export (slicing the canvas)
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidth;
        pageCanvas.height = pageHeightInPixels;
        const ctx = pageCanvas.getContext("2d");
        
        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          if (ctx) {
            // Fill background white
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, imgWidth, pageHeightInPixels);
            
            // Draw the slice from the main canvas
            const sourceY = i * pageHeightInPixels;
            const sourceHeight = Math.min(pageHeightInPixels, imgHeight - sourceY);
            
            ctx.drawImage(
              canvas,
              0, sourceY, imgWidth, sourceHeight, // source rectangle
              0, 0, imgWidth, sourceHeight        // destination rectangle
            );
            
            const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
            pdf.addImage(pageImgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
          }
        }
      }
      
      const cleanedName = data.personalInfo.name ? data.personalInfo.name.trim().replace(/\s+/g, "_") : "UngVien";
      const filename = `CV_${cleanedName}.pdf`;
      
      pdf.save(filename);
      
      toast.dismiss(toastId);
      toast.success("Tải xuống CV thành công!");
    } catch (error: any) {
      console.error("PDF download error object:", error);
      if (error && typeof error === "object") {
        console.error("Error Message:", error.message || "No message");
        console.error("Error Name:", error.name || "No name");
        console.error("Error Stack:", error.stack || "No stack");
      }
      toast.dismiss(toastId);
      toast.error("Tải trực tiếp thất bại! Vui lòng thử lại hoặc chụp màn hình.");
    } finally {
      // Always restore original styles
      element.style.transition = originalTransition;
      element.style.transform = originalTransform;
      element.style.backgroundImage = originalBgImage;
      if (hadShadow) {
        element.classList.add("shadow-2xl");
      }

      // Restore page-break overlays visibility
      const overlays = element.querySelectorAll<HTMLElement>(".page-break-overlay");
      overlays.forEach(o => o.style.display = "");
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 text-white font-outfit">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-slate-700 rounded-full animate-spin" />
          <p className="text-slate-400">Đang tải ứng dụng tạo CV...</p>
        </div>
      </div>
    );
  }

  const tabList = [
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "experience", label: "Kinh nghiệm", icon: Briefcase },
    { id: "projects", label: "Dự án", icon: FolderGit2 },
    { id: "skills", label: "Kỹ năng & Ngôn ngữ", icon: Wrench },
    { id: "education", label: "Học vấn", icon: GraduationCap },
    { id: "styling", label: "Thiết kế", icon: Sliders },
  ] as const;

  const singleColors = [
    { label: "Xanh Hải Quân (Classic Navy)", value: "#1e3a8a" },
    { label: "Xanh Hoàng Gia (Royal Blue)", value: "#2563eb" },
    { label: "Xám Than (Charcoal Gray)", value: "#334155" },
    { label: "Xanh Mòng Két (Teal Green)", value: "#0f766e" },
    { label: "Xanh Lục Bảo (Emerald)", value: "#059669" },
    { label: "Tím Quý Phái (Deep Purple)", value: "#6d28d9" },
    { label: "Đỏ Đô (Bordeaux Red)", value: "#991b1b" },
    { label: "Nâu Bronze (Warm Bronze)", value: "#7c2d12" },
    { label: "Xám Xanh (Slate Gray)", value: "#475569" },
    { label: "Hồng Mận (Plum Rose)", value: "#be185d" },
  ];

  const colorPairs = [
    { label: "Navy & Gold (Sang Trọng)", primary: "#1e3a8a", secondary: "#b45309" },
    { label: "Slate & Mint (Công Nghệ)", primary: "#1e293b", secondary: "#10b981" },
    { label: "Teal & Coral (Sáng Tạo)", primary: "#0d9488", secondary: "#f97316" },
    { label: "Charcoal & Amber (Kinh Doanh)", primary: "#334155", secondary: "#d97706" },
    { label: "Royal & Sky (Monochrome)", primary: "#1d4ed8", secondary: "#60a5fa" },
    { label: "Burgundy & Rose (Thời Trang)", primary: "#881337", secondary: "#fda4af" },
    { label: "Forest & Sage (Tự Nhiên)", primary: "#064e3b", secondary: "#a7f3d0" },
    { label: "Indigo & Lavender (Hiện Đại)", primary: "#4338ca", secondary: "#c084fc" },
    { label: "Brown & Cream (Cổ Điển)", primary: "#451a03", secondary: "#fde047" },
    { label: "Ink Black & Slate (Tối Giản)", primary: "#090d16", secondary: "#94a3b8" },
  ];



  return (
    <div className={`flex-1 flex flex-col h-screen overflow-hidden font-outfit transition-colors duration-200 ${
      theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      {/* Top Navbar */}
      <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2 flex items-center justify-between flex-shrink-0 z-10 shadow-sm dark:shadow-lg transition-colors duration-200">
        <div className="flex items-center">
          <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            Xây CV
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Light/Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all duration-200"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          {/* Autocomplete Search CV mẫu */}
          <div className="relative text-left" ref={dropdownRef}>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 w-64">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm CV mẫu..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="bg-transparent border-none outline-none text-xs w-full text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-1.5 w-[720px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                  Chọn CV ngành nghề ({filteredTemplates.length})
                </div>
                {filteredTemplates.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 dark:text-slate-500 text-center">
                    Không tìm thấy ngành nghề nào
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50/50 dark:bg-slate-950/20">
                    {filteredTemplates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                        className="text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2.5 transition-colors duration-150 border border-slate-100/80 dark:border-slate-800/80 rounded-md bg-white dark:bg-slate-900 w-full"
                      >
                        {getCategoryIcon(tpl.category)}
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate w-full" title={tpl.name}>
                            {tpl.name}
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate w-full" title={tpl.category}>
                            {tpl.category}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <AiCVImportDialog
            onApply={(aiData) => {
              setData(aiData);
              toast.success("Đã khởi tạo dữ liệu CV từ AI thành công!");
            }}
            currentData={data}
          />
          <button
            onClick={handleReset}
            title="Xóa toàn bộ dữ liệu CV"
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-red-50 dark:bg-slate-850 dark:hover:bg-red-950/40 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-300 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer transition-all duration-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa CV</span>
          </button>
          <button
            onClick={triggerPDFDownload}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg shadow-md hover:shadow-indigo-500/20 cursor-pointer transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Tải PDF</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor Form Panel */}
        <div className="no-print w-full md:w-[38%] lg:w-[36%] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex-shrink-0 transition-colors duration-200">
          {/* Tab Selection */}
          <nav className="flex w-full border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50 dark:bg-slate-925 transition-colors duration-200">
            {tabList.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`flex-1 flex items-center justify-center py-3.5 border-b-2 cursor-pointer transition-all duration-200 active:scale-98 ${
                    active
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-200 ${active ? "text-blue-600 dark:text-blue-400 scale-110" : "text-slate-400 dark:text-slate-500 hover:scale-108"}`} />
                </button>
              );
            })}
          </nav>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-700 dark:text-slate-300 transition-colors duration-200">
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-5">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Thông tin cá nhân
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Họ và tên</label>
                    <input
                      type="text"
                      value={data.personalInfo.name}
                      onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all duration-200"
                    />
                  </div>
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vị trí công việc</label>
                    <input
                      type="text"
                      value={data.personalInfo.title}
                      onChange={(e) => handlePersonalInfoChange("title", e.target.value)}
                      placeholder="Ví dụ: Lập trình viên Front-End"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={data.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                      placeholder="Ví dụ: nguyenvana@gmail.com"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all duration-200"
                    />
                  </div>
                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Số điện thoại</label>
                    <input
                      type="text"
                      value={data.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                      placeholder="Ví dụ: 0987654321"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all duration-200"
                    />
                  </div>

                  {/* Location */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Địa chỉ / Thành phố</label>
                    <input
                      type="text"
                      value={data.personalInfo.location}
                      onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                      placeholder="Ví dụ: Cầu Giấy, Hà Nội"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all duration-200"
                    />
                  </div>
                  {/* Website */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Website</label>
                    <input
                      type="text"
                      value={data.personalInfo.website}
                      onChange={(e) => handlePersonalInfoChange("website", e.target.value)}
                      placeholder="Ví dụ: nguyenvana.dev"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all duration-200"
                    />
                  </div>

                  {/* GitHub */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">GitHub</label>
                    <input
                      type="text"
                      value={data.personalInfo.github}
                      onChange={(e) => handlePersonalInfoChange("github", e.target.value)}
                      placeholder="Ví dụ: github.com/nguyenvana"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all duration-200"
                    />
                  </div>
                  {/* LinkedIn */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">LinkedIn</label>
                    <input
                      type="text"
                      value={data.personalInfo.linkedin}
                      onChange={(e) => handlePersonalInfoChange("linkedin", e.target.value)}
                      placeholder="Ví dụ: linkedin.com/in/nguyenvana"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Profile Picture Upload */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ảnh đại diện</span>
                  <SettingsImageUploader
                    value={data.personalInfo.avatar || ""}
                    storageId={data.personalInfo.avatarStorageId as Id<'_storage'> ?? undefined}
                    onChange={(url, storageId) => {
                      setData((prev) => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          avatar: url || "",
                          avatarStorageId: storageId ?? undefined,
                        },
                      }));
                    }}
                    folder="cv-builder"
                    previewSize="sm"
                    smartLogoCrop={false}
                  />
                </div>

                {/* Professional Summary */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Giới thiệu bản thân</label>
                  <textarea
                    rows={4}
                    value={data.summary}
                    onChange={(e) => setData({ ...data, summary: e.target.value })}
                    placeholder="Tóm tắt ngắn gọn về kinh nghiệm, thế mạnh và mục tiêu nghề nghiệp của bạn..."
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none transition-all duration-200 resize-y min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {/* EXPERIENCE TAB */}
            {activeTab === "experience" && (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-400" /> Kinh nghiệm làm việc
                  </h2>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm công việc</span>
                  </button>
                </div>

                {data.workExperience.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors duration-200">
                    <Briefcase className="w-8 h-8 opacity-40" />
                    <p className="text-xs font-medium">Chưa có kinh nghiệm làm việc nào được thêm.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.workExperience.map((job, idx) => (
                      <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3 relative group transition-colors duration-200">
                        {/* Control buttons */}
                        <div className="flex items-center gap-1.5 absolute top-4 right-4">
                          <button
                            onClick={() => moveExperience(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveExperience(idx, "down")}
                            disabled={idx === data.workExperience.length - 1}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeExperience(job.id)}
                            className="p-1 hover:bg-red-950/30 text-red-500 hover:text-red-400 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Vị trí công việc</label>
                            <input
                              type="text"
                              value={job.position}
                              onChange={(e) => updateExperience(job.id, "position", e.target.value)}
                              placeholder="Ví dụ: Lập trình viên Lead"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Công ty / Tổ chức</label>
                            <input
                              type="text"
                              value={job.company}
                              onChange={(e) => updateExperience(job.id, "company", e.target.value)}
                              placeholder="Ví dụ: VNG Corporation"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Địa điểm làm việc</label>
                            <input
                              type="text"
                              value={job.location}
                              onChange={(e) => updateExperience(job.id, "location", e.target.value)}
                              placeholder="Ví dụ: TP. Hồ Chí Minh"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Công nghệ sử dụng (cách nhau bởi dấu phẩy)</label>
                            <input
                              type="text"
                              value={job.techStack.join(", ")}
                              onChange={(e) =>
                                updateExperience(
                                  job.id,
                                  "techStack",
                                  e.target.value.split(",").map((s) => s.trim()).filter((s) => s !== "")
                                )
                              }
                              placeholder="Ví dụ: React, Next.js, Node.js"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Ngày bắt đầu</label>
                            <input
                              type="text"
                              value={job.startDate}
                              onChange={(e) => updateExperience(job.id, "startDate", e.target.value)}
                              placeholder="Ví dụ: 2023-05 hoặc Tháng 5, 2023"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Ngày kết thúc</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                disabled={job.current}
                                value={job.current ? "" : job.endDate}
                                onChange={(e) => updateExperience(job.id, "endDate", e.target.value)}
                                placeholder="Ví dụ: 2024-12 hoặc Hiện tại"
                               className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors duration-200 disabled:opacity-40"
                              />
                              <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={job.current}
                                  onChange={(e) => updateExperience(job.id, "current", e.target.checked)}
                                  className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-blue-500 w-4 h-4"
                                />
                                <span>Hiện tại</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Mô tả công việc & Thành tựu chính</label>
                          <textarea
                            rows={3}
                            value={job.description}
                            onChange={(e) => updateExperience(job.id, "description", e.target.value)}
                            placeholder="Sử dụng dấu • ở đầu dòng để liệt kê các thành tựu..."
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none resize-y transition-colors duration-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === "projects" && (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-blue-400" /> Dự án tiêu biểu
                  </h2>
                  <button
                    onClick={addProject}
                    className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm dự án</span>
                  </button>
                </div>

                {data.projects.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors duration-200">
                    <FolderGit2 className="w-8 h-8 opacity-40" />
                    <p className="text-xs font-medium">Chưa có dự án nào được thêm.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.projects.map((proj, idx) => (
                      <div key={proj.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3 relative group transition-colors duration-200">
                        <div className="flex items-center gap-1.5 absolute top-4 right-4">
                          <button
                            onClick={() => moveProject(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveProject(idx, "down")}
                            disabled={idx === data.projects.length - 1}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeProject(proj.id)}
                            className="p-1 hover:bg-red-950/30 text-red-500 hover:text-red-400 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tên dự án</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => updateProject(proj.id, "title", e.target.value)}
                              placeholder="Ví dụ: Hệ thống quản lý công việc"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Vai trò</label>
                            <input
                              type="text"
                              value={proj.role}
                              onChange={(e) => updateProject(proj.id, "role", e.target.value)}
                              placeholder="Ví dụ: Lập trình viên Full-Stack"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Đường dẫn dự án (URL / Link)</label>
                            <input
                              type="text"
                              value={proj.link}
                              onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                              placeholder="Ví dụ: github.com/username/project"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Công nghệ sử dụng (cách nhau bởi dấu phẩy)</label>
                            <input
                              type="text"
                              value={proj.techStack.join(", ")}
                              onChange={(e) =>
                                updateProject(
                                  proj.id,
                                  "techStack",
                                  e.target.value.split(",").map((s) => s.trim()).filter((s) => s !== "")
                                )
                              }
                              placeholder="Ví dụ: Next.js, Tailwind CSS, PostgreSQL"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Mô tả dự án</label>
                          <textarea
                            rows={3}
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                            placeholder="Mô tả chi tiết về chức năng dự án và đóng góp của bạn..."
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none resize-y transition-colors duration-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SKILLS & LANGS TAB */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                {/* Kỹ năng chuyên môn Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-400" /> Kỹ năng chuyên môn
                    </h2>
                    <button
                      onClick={addSkillGroup}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg cursor-pointer transition-all duration-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm nhóm</span>
                    </button>
                  </div>

                  {data.skills.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl transition-colors duration-200">
                      <p className="text-xs font-medium">Chưa có nhóm kỹ năng nào được thêm.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.skills.map((grp, idx) => (
                        <div key={grp.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl relative flex items-center gap-4 transition-colors duration-200">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 pr-16">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Nhóm kỹ năng</label>
                              <input
                                type="text"
                                value={grp.category}
                                onChange={(e) => updateSkillGroup(grp.id, e.target.value, grp.skills.join(", "))}
                                placeholder="Ví dụ: Công nghệ Front-End"
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Các kỹ năng (cách nhau bằng dấu phẩy)</label>
                              <input
                                type="text"
                                value={grp.skills.join(", ")}
                                onChange={(e) => updateSkillGroup(grp.id, grp.category, e.target.value)}
                                placeholder="Ví dụ: React, Next.js, Tailwind CSS"
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1 absolute top-3 right-3">
                            <button
                              onClick={() => moveSkillGroup(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveSkillGroup(idx, "down")}
                              disabled={idx === data.skills.length - 1}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeSkillGroup(grp.id)}
                              className="p-1 hover:bg-red-950/30 text-red-500 hover:text-red-400 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Languages Section */}
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-5">
                  <div className="flex justify-between items-center pb-2">
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Ngôn ngữ
                    </h2>
                    <button
                      onClick={addLanguage}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg cursor-pointer transition-all duration-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm ngôn ngữ</span>
                    </button>
                  </div>

                  {data.languages.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl transition-colors duration-200">
                      <p className="text-xs font-medium">Chưa có ngôn ngữ nào được thêm.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.languages.map((lang) => (
                        <div key={lang.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl relative flex items-center gap-2 transition-colors duration-200">
                          <div className="flex-1 grid grid-cols-2 gap-2 pr-6">
                            <input
                              type="text"
                              value={lang.name}
                              onChange={(e) => updateLanguage(lang.id, "name", e.target.value)}
                              placeholder="Ví dụ: Tiếng Anh"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors duration-200"
                            />
                            <input
                              type="text"
                              value={lang.proficiency}
                              onChange={(e) => updateLanguage(lang.id, "proficiency", e.target.value)}
                              placeholder="Ví dụ: Thành thạo (IELTS 7.0)"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors duration-200"
                            />
                          </div>
                          <button
                            onClick={() => removeLanguage(lang.id)}
                            className="p-1 hover:bg-red-950/30 text-red-500 hover:text-red-400 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications Section */}
                <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-5">
                  <div className="flex justify-between items-center pb-2">
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Chứng chỉ
                    </h2>
                    <button
                      onClick={addCertification}
                      className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg cursor-pointer transition-all duration-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm chứng chỉ</span>
                    </button>
                  </div>

                  {data.certifications.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl transition-colors duration-200">
                      <p className="text-xs font-medium">Chưa có chứng chỉ nào được thêm.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.certifications.map((cert) => (
                        <div key={cert.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl relative flex items-center gap-2 transition-colors duration-200">
                          <div className="flex-1 grid grid-cols-3 gap-2 pr-6">
                            <input
                              type="text"
                              value={cert.name}
                              onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                              placeholder="Ví dụ: AWS Developer Associate"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors duration-200"
                            />
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                              placeholder="Ví dụ: Amazon Web Services"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors duration-200"
                            />
                            <input
                              type="text"
                              value={cert.date}
                              onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                              placeholder="Ví dụ: 2024-03"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors duration-200"
                            />
                          </div>
                          <button
                            onClick={() => removeCertification(cert.id)}
                            className="p-1 hover:bg-red-950/30 text-red-500 hover:text-red-400 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EDUCATION TAB */}
            {activeTab === "education" && (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-400" /> Quá trình học tập
                  </h2>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg cursor-pointer transition-all duration-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm học vấn</span>
                  </button>
                </div>

                {data.education.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors duration-200">
                    <GraduationCap className="w-8 h-8 opacity-40" />
                    <p className="text-xs font-medium">Chưa có thông tin học vấn nào được thêm.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.education.map((edu, idx) => (
                      <div key={edu.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3 relative group transition-colors duration-200">
                        <div className="flex items-center gap-1.5 absolute top-4 right-4">
                          <button
                            onClick={() => moveEducation(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveEducation(idx, "down")}
                            disabled={idx === data.education.length - 1}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className="p-1 hover:bg-red-950/30 text-red-500 hover:text-red-400 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Trường học / Đại học</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                              placeholder="Ví dụ: Đại học Bách Khoa"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Bằng cấp / Khóa học</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                              placeholder="Ví dụ: Cử nhân"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Chuyên ngành</label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy}
                              onChange={(e) => updateEducation(edu.id, "fieldOfStudy", e.target.value)}
                              placeholder="Ví dụ: Khoa học máy tính"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Địa điểm</label>
                            <input
                              type="text"
                              value={edu.location}
                              onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                              placeholder="Ví dụ: Hà Nội, Việt Nam"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Điểm số / GPA</label>
                            <input
                              type="text"
                              value={edu.grade || ""}
                              onChange={(e) => updateEducation(edu.id, "grade", e.target.value)}
                              placeholder="Ví dụ: GPA: 3.5 / 4.0"
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none transition-colors duration-200"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Thời gian học</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                                placeholder="Bắt đầu: e.g. 2016-09"
                                className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors duration-200"
                              />
                              <input
                                type="text"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                                placeholder="Kết thúc: e.g. 2020-05"
                                className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors duration-200"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Mô tả chi tiết / Giải thưởng / Hoạt động</label>
                          <textarea
                            rows={2}
                            value={edu.description || ""}
                            onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                            placeholder="Thông tin thêm về giải thưởng, học bổng, đề tài tốt nghiệp..."
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white outline-none resize-y transition-colors duration-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STYLING & SETTINGS TAB */}
            {activeTab === "styling" && (
              <div className="space-y-6">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Bố cục & Thiết kế
                </h2>

                {/* Template Style */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mẫu thiết kế CV</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(["modern", "professional", "creative", "elegant", "technical", "bold", "bordered", "sidebar", "retro", "accent"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => updateSetting("template", style)}
                        className={`text-xs font-semibold py-3 border rounded-xl cursor-pointer transition-all duration-200 capitalize ${
                          settings.template === style
                            ? "bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-md font-bold"
                            : "bg-slate-500/5 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 hover:border-slate-350 dark:hover:border-slate-700"
                        }`}
                      >
                        {style === "modern"
                          ? "Hiện đại"
                          : style === "professional"
                          ? "Chuyên nghiệp"
                          : style === "creative"
                          ? "Sáng tạo"
                          : style === "elegant"
                          ? "Tinh tế"
                          : style === "technical"
                          ? "Kỹ thuật"
                          : style === "bold"
                          ? "Báo chí"
                          : style === "bordered"
                          ? "Khung viền"
                          : style === "sidebar"
                          ? "Cột dọc"
                          : style === "retro"
                          ? "Dòng thời gian"
                          : "Điểm nhấn"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Palette */}
                <div className="space-y-4">
                  {/* Single Colors */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                      10 Màu Đơn Phổ Biến
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {singleColors.map((c) => {
                        const isSelected = settings.primaryColor === c.value && 
                          (!settings.secondaryColor || settings.secondaryColor === settings.primaryColor);
                        return (
                          <button
                            key={c.value}
                            onClick={() => {
                              updateMultipleSettings({
                                primaryColor: c.value,
                                secondaryColor: c.value,
                              });
                            }}
                            style={{ backgroundColor: c.value }}
                            title={c.label}
                            className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "border-blue-500 dark:border-white scale-110 shadow-md"
                                : "border-transparent dark:border-slate-800 hover:scale-105"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Pairs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                      10 Cặp Màu Chuyên Nghiệp (Chính & Phụ)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {colorPairs.map((pair, idx) => {
                        const isSelected = settings.primaryColor === pair.primary && settings.secondaryColor === pair.secondary;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              updateMultipleSettings({
                                primaryColor: pair.primary,
                                secondaryColor: pair.secondary,
                              });
                            }}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-550 dark:border-blue-450 shadow-sm"
                                : "bg-slate-500/5 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/60"
                            }`}
                          >
                            <div className="flex -space-x-1.5 flex-shrink-0">
                              <div
                                className="w-5 h-5 rounded-full border border-white dark:border-slate-900 shadow-sm"
                                style={{ backgroundColor: pair.primary }}
                              />
                              <div
                                className="w-5 h-5 rounded-full border border-white dark:border-slate-900 shadow-sm"
                                style={{ backgroundColor: pair.secondary }}
                              />
                            </div>
                            <div className="text-[10px] font-bold truncate text-slate-600 dark:text-slate-400">
                              {pair.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Pickers */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                      Tùy chỉnh màu sắc riêng
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Primary Color Picker */}
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting("primaryColor", e.target.value)}
                          className="w-8 h-8 bg-transparent border-0 cursor-pointer p-0 rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase leading-none mb-0.5">Chủ đạo</span>
                          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-405 uppercase leading-none font-semibold">{settings.primaryColor}</span>
                        </div>
                      </div>

                      {/* Secondary Color Picker */}
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.secondaryColor || settings.primaryColor}
                          onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                          className="w-8 h-8 bg-transparent border-0 cursor-pointer p-0 rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase leading-none mb-0.5">Màu Phụ</span>
                          <span className="text-[10px] font-mono text-slate-650 dark:text-slate-405 uppercase leading-none font-semibold">{settings.secondaryColor || settings.primaryColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography Font */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phông chữ</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "vietnam", label: "Be Vietnam Pro (Chuẩn Việt)" },
                      { value: "inter", label: "Inter (Hiện đại, tối giản)" },
                      { value: "roboto", label: "Roboto (Thân thiện, phổ biến)" },
                      { value: "montserrat", label: "Montserrat (Hình học sắc nét)" },
                      { value: "nunito", label: "Nunito (Tròn trịa, dễ đọc)" },
                      { value: "quicksand", label: "Quicksand (Bo tròn, trẻ trung)" },
                      { value: "opensans", label: "Open Sans (Đọc lướt nhanh)" },
                      { value: "manrope", label: "Manrope (Độc đáo, cân đối)" },
                      { value: "lora", label: "Lora (Thanh lịch, có chân)" },
                      { value: "merriweather", label: "Merriweather (Ấm áp, trang trọng)" },
                    ].map((f) => (
                      <button
                        key={f.value}
                        onClick={() => updateSetting("fontFamily", f.value)}
                        className={`text-xs font-semibold py-2.5 px-3 border rounded-xl text-left cursor-pointer transition-all duration-200 ${
                          settings.fontFamily === f.value
                            ? "bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                            : "bg-slate-500/5 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orientation Setting */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Khổ giấy in</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "portrait", label: "Khổ dọc (A4 Portrait)" },
                      { value: "landscape", label: "Khổ ngang (A4 Landscape)" },
                    ].map((o) => (
                      <button
                        key={o.value}
                        onClick={() => updateSetting("orientation", o.value)}
                        className={`text-xs font-semibold py-2.5 px-3 border rounded-xl text-center cursor-pointer transition-all duration-200 ${
                          settings.orientation === o.value
                            ? "bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                            : "bg-slate-500/5 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing & Padding */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Giãn dòng & Khoảng cách</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["super-compact", "compact", "normal", "loose", "roomy", "spacious"] as const).map((space) => (
                      <button
                        key={space}
                        onClick={() => updateSetting("spacing", space)}
                        className={`text-xs font-semibold py-2.5 border rounded-xl cursor-pointer transition-all duration-200 text-center ${
                          settings.spacing === space
                            ? "bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                            : "bg-slate-500/5 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200"
                        }`}
                      >
                        {space === "super-compact"
                          ? "Khít nhất"
                          : space === "compact"
                          ? "Thu gọn"
                          : space === "normal"
                          ? "Vừa phải"
                          : space === "loose"
                          ? "Rộng rãi"
                          : space === "roomy"
                          ? "Thoáng"
                          : "Rộng nhất"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showAvatar}
                      onChange={(e) => updateSetting("showAvatar", e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-blue-500 w-4 h-4"
                    />
                    <span>Hiển thị ảnh đại diện trên CV</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live preview panel */}
        <div className="flex-1 flex flex-col bg-slate-200 overflow-hidden relative">
          {/* Zoom & Preview Controls Toolbar */}
          <div className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between flex-shrink-0 shadow-sm transition-colors duration-200">
            <span className="text-slate-400 dark:text-slate-500">
              <Eye className="w-4 h-4" />
            </span>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              {/* Fit button - show full A4 */}
              <button
                onClick={() => {
                  const isPortrait = settings.orientation === "portrait";
                  // Estimate container width ~60% of viewport, subtract padding
                  const containerWidth = window.innerWidth * 0.62 - 48;
                  const pageWidthMm = isPortrait ? 210 : 297;
                  const pageWidthPx = pageWidthMm * 3.7795;
                  setZoom(Math.min(1.2, Math.max(0.3, containerWidth / pageWidthPx)));
                }}
                className="flex items-center justify-center p-2 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/20 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all duration-200 active:scale-95"
                title="Vừa màn hình - Hiển thị toàn bộ tờ A4"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              {/* Full width button */}
              <button
                onClick={() => {
                  const isPortrait = settings.orientation === "portrait";
                  const containerWidth = window.innerWidth * 0.62 - 48;
                  const pageWidthMm = isPortrait ? 210 : 297;
                  const pageWidthPx = pageWidthMm * 3.7795;
                  setZoom(Math.min(1.5, containerWidth / pageWidthPx * 1.1));
                }}
                className="flex items-center justify-center p-2 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/20 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-all duration-200 active:scale-95"
                title="Đầy ngang - Căn đầy chiều ngang"
              >
                <MoveHorizontal className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                <button
                  onClick={() => setZoom(Math.max(0.3, zoom - 0.05))}
                  disabled={zoom <= 0.3}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 text-xs font-extrabold cursor-pointer w-4 text-center"
                >
                  −
                </button>
                <input
                  type="range"
                  min="0.3"
                  max="1.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-20 accent-blue-600 dark:accent-blue-500 cursor-pointer h-1 rounded outline-none"
                />
                <button
                  onClick={() => setZoom(Math.min(1.5, zoom + 0.05))}
                  disabled={zoom >= 1.5}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 text-xs font-extrabold cursor-pointer w-4 text-center"
                >
                  +
                </button>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-7 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Actual preview page wrapper */}
          <CVPreview data={data} settings={settings} zoom={zoom} />
        </div>
      </div>
    </div>
  );
}
