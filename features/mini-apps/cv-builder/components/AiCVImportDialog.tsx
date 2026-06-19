'use client';

import React, { useMemo, useState } from 'react';
import { Bot, Check, Copy, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { AiDirectGeneratePanel } from '@/app/admin/components/AiDirectGenerateButton';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  cn,
} from '@/app/admin/components/ui';
import { CVData } from '../types/cv';
import { DEVELOPER_SAMPLE_DATA } from '../data/sample';

export type ParseResult = {
  item: CVData | null;
  errors: string[];
};

export function escapeControlCharacters(str: string): string {
  let result = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === '"' && !isEscaped) {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      if (char === '\\') {
        isEscaped = !isEscaped;
        result += char;
      } else {
        if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else {
          const code = char.charCodeAt(0);
          if (code < 32) {
            result += '\\u' + code.toString(16).padStart(4, '0');
          } else {
            result += char;
          }
        }
        isEscaped = false;
      }
    } else {
      result += char;
    }
  }
  return result;
}

export function parseAiCV(raw: string): ParseResult {
  const errors: string[] = [];
  if (!raw.trim()) {
    return { item: null, errors: [] };
  }

  try {
    // Clean markdown code blocks
    let cleaned = raw.trim();
    const fenced = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    cleaned = fenced?.[1]?.trim() ?? cleaned;

    const parsed = JSON.parse(escapeControlCharacters(cleaned));

    // Kiểm tra cấu trúc CVData tối thiểu
    if (!parsed) {
      errors.push("Dữ liệu trống hoặc không hợp lệ");
      return { item: null, errors };
    }

    // Nếu bọc trong key "cv" hoặc "data", lấy ra
    let data = parsed;
    if (parsed.cv) {
      data = parsed.cv;
    } else if (parsed.data) {
      data = parsed.data;
    }

    if (typeof data !== 'object') {
      errors.push("Dữ liệu phải là một object chứa các trường của CV");
      return { item: null, errors };
    }

    // Kiểm tra personalInfo
    if (!data.personalInfo || typeof data.personalInfo !== 'object') {
      errors.push("Thiếu thông tin cá nhân (personalInfo)");
    } else {
      if (!data.personalInfo.name) errors.push("Thiếu tên ứng viên trong personalInfo");
      if (!data.personalInfo.title) errors.push("Thiếu chức danh (title) ứng tuyển trong personalInfo");
    }

    // Các trường khác nên là array
    const arrays: (keyof CVData)[] = ['workExperience', 'projects', 'education', 'skills', 'languages', 'certifications'];
    arrays.forEach(key => {
      if (data[key] && !Array.isArray(data[key])) {
        errors.push(`Trường ${key} phải là một mảng`);
      }
    });

    if (errors.length > 0) {
      return { item: null, errors };
    }

    // Chuẩn hóa và điền mặc định cho các trường thiếu
    const normalized: CVData = {
      personalInfo: {
        name: String(data.personalInfo.name || ''),
        title: String(data.personalInfo.title || ''),
        email: String(data.personalInfo.email || ''),
        phone: String(data.personalInfo.phone || ''),
        location: String(data.personalInfo.location || ''),
        website: String(data.personalInfo.website || ''),
        github: String(data.personalInfo.github || ''),
        linkedin: String(data.personalInfo.linkedin || ''),
        avatar: String(data.personalInfo.avatar || ''),
        avatarStorageId: data.personalInfo.avatarStorageId ? String(data.personalInfo.avatarStorageId) : undefined,
      },
      summary: String(data.summary || ''),
      workExperience: Array.isArray(data.workExperience) ? data.workExperience.map((w: any, idx: number) => ({
        id: w.id || `w_${idx + 1}`,
        company: String(w.company || ''),
        position: String(w.position || ''),
        location: String(w.location || ''),
        startDate: String(w.startDate || ''),
        endDate: String(w.endDate || ''),
        current: Boolean(w.current),
        description: String(w.description || ''),
        techStack: Array.isArray(w.techStack) ? w.techStack.map(String) : [],
      })) : [],
      projects: Array.isArray(data.projects) ? data.projects.map((p: any, idx: number) => ({
        id: p.id || `p_${idx + 1}`,
        title: String(p.title || ''),
        role: String(p.role || ''),
        description: String(p.description || ''),
        link: String(p.link || ''),
        techStack: Array.isArray(p.techStack) ? p.techStack.map(String) : [],
      })) : [],
      education: Array.isArray(data.education) ? data.education.map((e: any, idx: number) => ({
        id: e.id || `e_${idx + 1}`,
        school: String(e.school || ''),
        degree: String(e.degree || ''),
        fieldOfStudy: String(e.fieldOfStudy || ''),
        location: String(e.location || ''),
        startDate: String(e.startDate || ''),
        endDate: String(e.endDate || ''),
        current: Boolean(e.current),
        grade: e.grade ? String(e.grade) : undefined,
        description: e.description ? String(e.description) : undefined,
      })) : [],
      skills: Array.isArray(data.skills) ? data.skills.map((s: any, idx: number) => ({
        id: s.id || `s_${idx + 1}`,
        category: String(s.category || ''),
        skills: Array.isArray(s.skills) ? s.skills.map(String) : [],
      })) : [],
      languages: Array.isArray(data.languages) ? data.languages.map((l: any, idx: number) => ({
        id: l.id || `l_${idx + 1}`,
        name: String(l.name || ''),
        proficiency: String(l.proficiency || ''),
      })) : [],
      certifications: Array.isArray(data.certifications) ? data.certifications.map((c: any, idx: number) => ({
        id: c.id || `c_${idx + 1}`,
        name: String(c.name || ''),
        issuer: String(c.issuer || ''),
        date: String(c.date || ''),
        link: c.link ? String(c.link) : undefined,
      })) : [],
      customSections: Array.isArray(data.customSections) ? data.customSections.map((cs: any, idx: number) => ({
        id: cs.id || `cs_${idx + 1}`,
        title: String(cs.title || ''),
        content: String(cs.content || ''),
      })) : [],
    };

    return { item: normalized, errors: [] };
  } catch (err: any) {
    errors.push(`JSON không hợp lệ: ${err.message}`);
    return { item: null, errors };
  }
}

const TECHNICAL_PROMPT = `
Bạn là chuyên gia tư vấn viết CV chuyên nghiệp (CV Builder AI).
Nhiệm vụ của bạn là tạo ra một dữ liệu JSON chứa thông tin CV hoàn chỉnh dựa trên các yêu cầu và chi tiết do người dùng cung cấp.

Quy tắc sinh nội dung CV:
1. Thông tin cá nhân: Điền đầy đủ các thông tin cá nhân cơ bản như Họ tên, chức danh, email, số điện thoại, địa chỉ (nếu người dùng có cung cấp). Nếu thiếu, hãy tự suy luận các thông tin phụ hợp lý hoặc để trống.
2. Tóm tắt sự nghiệp (summary): Viết một đoạn tóm tắt sự nghiệp (khoảng 3-4 câu) cực kỳ ấn tượng, giới thiệu thế mạnh bản thân, số năm kinh nghiệm và lý do phù hợp với doanh nghiệp đang apply.
3. Kinh nghiệm làm việc (workExperience):
   - Tạo danh sách các công việc chi tiết.
   - Trường description: Phải viết dưới dạng các gạch đầu dòng (sử dụng ký tự '•' ở đầu dòng, phân cách các gạch đầu dòng bằng '\\n').
   - Mỗi gạch đầu dòng mô tả nhiệm vụ, công nghệ sử dụng, và đặc biệt là ĐẦU RA/KẾT QUẢ ĐẠT ĐƯỢC (ưu tiên có số liệu phần trăm, số lượng, hiệu suất cụ thể).
   - Điền techStack tương ứng với công nghệ dùng trong công việc đó.
4. Dự án (projects): Tạo 1-2 dự án tiêu biểu thể hiện rõ năng lực, mô tả vai trò, nhiệm vụ và techStack.
5. Học vấn (education): Tạo thông tin trường học, ngành học, thời gian tương ứng.
6. Kỹ năng (skills): Gom nhóm các kỹ năng một cách logic (Ví dụ: "Lập trình", "Frameworks", "Hệ cơ sở dữ liệu & Cloud", "Kỹ năng mềm").
7. Định dạng ngày tháng: Dùng dạng YYYY-MM (Ví dụ: "2023-05", "2021-03"). Nếu công việc hiện tại, dùng "Present" cho endDate và đặt current=true.

BẮT BUỘC trả về đúng cấu trúc JSON sau đây, không có bất kỳ văn bản giải thích nào khác ngoài JSON:
{
  "personalInfo": {
    "name": "Họ và Tên",
    "title": "Chức danh công việc ứng tuyển (Ví dụ: Senior Frontend Engineer)",
    "email": "email@example.com",
    "phone": "0901234567",
    "location": "Thành phố, Việt Nam",
    "website": "Link website cá nhân hoặc portfolio nếu có",
    "github": "github.com/username",
    "linkedin": "linkedin.com/in/username",
    "avatar": ""
  },
  "summary": "Đoạn tóm tắt sự nghiệp chuyên nghiệp ngắn gọn và ấn tượng...",
  "workExperience": [
    {
      "id": "w1",
      "company": "Tên công ty",
      "position": "Chức vụ/Vị trí",
      "location": "Địa điểm",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM hoặc Present",
      "current": true,
      "description": "• Mô tả nhiệm vụ và thành tựu 1\\n• Mô tả nhiệm vụ và thành tựu 2",
      "techStack": ["React", "TypeScript"]
    }
  ],
  "projects": [
    {
      "id": "p1",
      "title": "Tên dự án",
      "role": "Vai trò (Ví dụ: Developer chính)",
      "description": "Mô tả ngắn gọn về dự án và kết quả đạt được",
      "link": "github.com/project",
      "techStack": ["Next.js", "Tailwind CSS"]
    }
  ],
  "education": [
    {
      "id": "e1",
      "school": "Tên trường Đại học/Cao đẳng",
      "degree": "Bằng cấp (Ví dụ: Kỹ sư/Cử nhân)",
      "fieldOfStudy": "Chuyên ngành",
      "location": "Địa điểm",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "grade": "GPA: X/Y (tùy chọn)",
      "description": "Chi tiết học tập/Học bổng nếu có"
    }
  ],
  "skills": [
    {
      "id": "s1",
      "category": "Tên nhóm kỹ năng",
      "skills": ["Kỹ năng 1", "Kỹ năng 2"]
    }
  ],
  "languages": [
    {
      "id": "l1",
      "name": "Tên ngôn ngữ",
      "proficiency": "Trình độ (Ví dụ: Native hoặc IELTS 7.0)"
    }
  ],
  "certifications": [
    {
      "id": "c1",
      "name": "Tên chứng chỉ",
      "issuer": "Tổ chức cấp",
      "date": "YYYY-MM",
      "link": "Link chứng chỉ nếu có"
    }
  ]
}
`;

export function AiCVImportDialog({
  onApply,
  buttonClassName,
  buttonLabel = 'Nhập AI',
}: {
  onApply: (item: CVData) => void;
  currentData?: CVData;
  buttonClassName?: string;
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [lastCopied, setLastCopied] = useState<'prompt' | 'sample' | null>(null);

  const prompt = useMemo(() => TECHNICAL_PROMPT.trim(), []);
  const sample = useMemo(() => JSON.stringify(DEVELOPER_SAMPLE_DATA, null, 2), []);
  const result = useMemo(() => parseAiCV(rawInput), [rawInput]);
  const canApply = rawInput.trim().length > 0 && Boolean(result.item) && result.errors.length === 0;

  const copyText = async (value: string, type: 'prompt' | 'sample') => {
    await navigator.clipboard.writeText(value);
    setLastCopied(type);
    toast.success(type === 'prompt' ? 'Đã copy prompt kỹ thuật' : 'Đã copy JSON mẫu');
    window.setTimeout(() => setLastCopied(null), 1500);
  };

  const applyItem = () => {
    if (result.item) {
      onApply(result.item);
      setOpen(false);
      setRawInput('');
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(
          'flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-blue-50 dark:bg-slate-805 dark:hover:bg-blue-950/30 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer transition-all duration-200',
          buttonClassName
        )}
        onClick={() => setOpen(true)}
      >
        <Bot size={14} /> {buttonLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[94vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 text-left">Khởi tạo CV thông minh bằng AI</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-left">
              Nhập các yêu cầu ứng tuyển (Mô tả công việc - JD, Doanh nghiệp) và thông tin kinh nghiệm cá nhân để ChatJPT sinh dữ liệu CV tối ưu nhất.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] mt-2 text-left">
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/20">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <FileText size={14} /> Prompt kỹ thuật
                  </Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={() => void copyText(prompt, 'prompt')}>
                    {lastCopied === 'prompt' ? <Check size={12} /> : <Copy size={12} />}
                    Copy
                  </Button>
                </div>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 dark:bg-slate-950/50 p-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400 font-mono">
                  {prompt}
                </pre>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/20">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">JSON cấu trúc mẫu</Label>
                  <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={() => void copyText(sample, 'sample')}>
                    {lastCopied === 'sample' ? <Check size={12} /> : <Copy size={12} />}
                    Copy
                  </Button>
                </div>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 dark:bg-slate-950/50 p-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400 font-mono">
                  {sample}
                </pre>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-805 dark:text-slate-200">Thông tin ứng tuyển & Kinh nghiệm</Label>
                <AiDirectGeneratePanel
                  prompt={prompt}
                  sessionId="cv-builder-ai-import"
                  onGenerated={setRawInput}
                  placeholder="Ví dụ: Tạo CV cho Nguyễn Văn A, ứng tuyển vị trí Senior Node.js Engineer tại VNG Corporation.
Kinh nghiệm chính:
- 3 năm làm backend Node.js, tối ưu hóa database MongoDB.
- Thiết kế hệ thống microservices chịu tải cao.
Mục tiêu: thể hiện được thế mạnh về giải quyết bottleneck và performance."
                  buttonLabel="Tạo bằng ChatJPT"
                  description="Hãy điền vị trí công việc, tên doanh nghiệp ứng tuyển (JD) và tóm tắt kinh nghiệm chính để ChatJPT sinh nhanh dữ liệu CV phù hợp."
                />
                <div className="mt-2 space-y-1">
                  <Label className="text-xs font-medium text-slate-550">Dán kết quả JSON (hoặc tự sửa đổi)</Label>
                  <textarea
                    className="min-h-56 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-[11px] leading-4 text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder={sample}
                    value={rawInput}
                    onChange={(event) => setRawInput(event.target.value)}
                  />
                </div>
              </div>

              {rawInput.trim().length > 0 && (
                <div className={cn(
                  'rounded-lg border p-3 text-xs leading-4',
                  result.errors.length > 0
                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300'
                    : 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/20 dark:text-green-300'
                )}>
                  {result.errors.length > 0 ? (
                    <ul className="space-y-1">
                      {result.errors.map((error, idx) => (
                        <li key={idx} className="flex gap-1.5">
                          <X size={12} className="mt-0.5 shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center gap-1.5 font-medium">
                      <Check size={14} />
                      JSON CV hợp lệ, sẵn sàng áp dụng.
                    </div>
                  )}
                </div>
              )}

              {result.item && result.errors.length === 0 && (
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Xem trước CV được sinh</div>
                  <div className="mt-1.5 space-y-1 text-xs">
                    <div><span className="font-semibold text-slate-600 dark:text-slate-350">Họ tên:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{result.item.personalInfo.name}</span></div>
                    <div><span className="font-semibold text-slate-600 dark:text-slate-350">Chức danh:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{result.item.personalInfo.title}</span></div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500 mt-1">
                      <span>💼 {result.item.workExperience.length} Công việc</span>
                      <span>🚀 {result.item.projects.length} Dự án</span>
                      <span>🎓 {result.item.education.length} Học vấn</span>
                      <span>⚡ {result.item.skills.length} Nhóm kỹ năng</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-xs">
              Đóng
            </Button>
            <Button type="button" variant="accent" disabled={!canApply} onClick={applyItem} className="text-xs">
              Áp dụng vào CV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
