export const HEADLINE_REPLACE_TOKEN = '__REPLACE__';
export const HEADLINE_SECONDARY_REPLACE_TOKEN = '__REPLACE_2__';

export const HEADLINE_TEMPLATES = [
  '10 câu hỏi sẽ khiến cho __REPLACE__ của bạn xấu hổ',
  '13 sự thật tuyệt vời không ai dạy cho chúng ta về __REPLACE__',
  '3 bí mật mà __REPLACE__ của bạn không muốn cho bạn biết',
  '3 nguyên tắc bất di bất dịch để __REPLACE__',
  '30 điều bạn thường bỏ qua nhưng cực quan trọng trong __REPLACE__',
  '4 bí kíp “thần thánh” giúp __REPLACE__ dễ dàng hơn bao giờ hết',
  '5 cách nhanh chóng và dễ dàng để __REPLACE__',
  '7 sai lầm phổ biến khiến __REPLACE__ không hiệu quả',
  '9 dấu hiệu cho thấy bạn đang hiểu sai về __REPLACE__',
  '99% người dùng không biết về __REPLACE__',
  '__REPLACE__ như một chuyên gia trong 5 bước đơn giản',
  'Ai cũng nói về __REPLACE__, nhưng ít người biết điều này',
  'Bạn đã thật sự hiểu đúng về __REPLACE__ chưa?',
  'Bí quyết giúp __REPLACE__ hiệu quả hơn chỉ trong vài phút',
  'Cách ít người biết để __REPLACE__',
  'Cảnh báo: Những điều bạn phải biết về __REPLACE__',
  'Checklist __REPLACE__ giúp bạn tránh mất thời gian và tiền bạc',
  'Chuyên gia khuyên gì khi bắt đầu với __REPLACE__?',
  'Có nên __REPLACE__ ngay hôm nay? Đây là câu trả lời',
  'Đừng bắt đầu __REPLACE__ nếu bạn chưa đọc điều này',
  'Hướng dẫn __REPLACE__ từ A-Z cho người mới',
  'Làm sao để __REPLACE__ mà không mắc lỗi cơ bản?',
  'Lý do __REPLACE__ đang trở thành xu hướng đáng chú ý',
  'Một thay đổi nhỏ giúp __REPLACE__ tốt hơn rõ rệt',
  'Muốn __REPLACE__ hiệu quả? Hãy bắt đầu từ 5 điều này',
  'Những điều cần biết trước khi quyết định __REPLACE__',
  'Những hiểu lầm phổ biến về __REPLACE__ khiến nhiều người trả giá',
  'Sai lầm khi __REPLACE__ mà hầu hết mọi người đều mắc',
  'Sự thật phía sau __REPLACE__ không phải ai cũng nói cho bạn biết',
  'Tại sao __REPLACE__ quan trọng hơn bạn nghĩ?',
  'Tất cả những gì bạn cần biết về __REPLACE__ trong một bài viết',
  'Thử ngay cách này nếu bạn muốn __REPLACE__ nhanh hơn',
  'Top 5 mẹo giúp __REPLACE__ dễ áp dụng hơn',
  'Trước khi __REPLACE__, hãy kiểm tra 7 điểm này',
  'Vì sao nhiều người thất bại khi __REPLACE__?',
  'Xu hướng __REPLACE__ mới nhất bạn không nên bỏ lỡ',
  'Đây là cách __REPLACE__ thông minh hơn trong năm nay',
  'Công thức đơn giản giúp __REPLACE__ bớt rối và dễ làm hơn',
  'Nếu chỉ có 10 phút, hãy đọc hướng dẫn __REPLACE__ này',
  'Điều gì làm cho __REPLACE__ trở nên khác biệt?',
  'Cách biến __REPLACE__ thành lợi thế thực sự',
  'Những câu hỏi cần tự hỏi trước khi __REPLACE__',
] as const;

export const HEADLINE_DUAL_KEYWORD_TEMPLATES = [
  'So sánh __REPLACE__ và __REPLACE_2__: đâu là lựa chọn đáng cân nhắc?',
  'Làm sao kết hợp __REPLACE__ với __REPLACE_2__ để đạt hiệu quả tốt hơn?',
  '7 cách tận dụng __REPLACE__ và __REPLACE_2__ mà nhiều người bỏ qua',
  '__REPLACE__ hay __REPLACE_2__ quan trọng hơn? Đây là cách nhìn đúng',
  'Checklist __REPLACE__ và __REPLACE_2__ giúp bạn quyết định nhanh hơn',
  'Đừng chọn __REPLACE__ nếu bạn chưa hiểu rõ __REPLACE_2__',
  'Cách biến __REPLACE__ và __REPLACE_2__ thành lợi thế thực sự',
  'Những sai lầm thường gặp khi kết hợp __REPLACE__ với __REPLACE_2__',
  'Hướng dẫn __REPLACE__ theo góc nhìn __REPLACE_2__ cho người mới',
  'Vì sao __REPLACE__ và __REPLACE_2__ nên được xem cùng nhau?',
  'Top mẹo giúp __REPLACE__ hiệu quả hơn nhờ __REPLACE_2__',
  'Trước khi bắt đầu __REPLACE__, hãy kiểm tra __REPLACE_2__',
] as const;

const DEFAULT_HEADLINE_LIMIT = 8;
const MAX_HEADLINE_LIMIT = 12;

const normalizeKeyword = (keyword: string) => keyword.trim().replaceAll(/\s+/g, ' ');

const normalizeKeywords = (keywords: string | string[]) => (
  Array.isArray(keywords) ? keywords : [keywords]
)
  .map(normalizeKeyword)
  .filter(Boolean)
  .slice(0, 2);

const shuffleTemplates = (templates: readonly string[]) => {
  const items = [...templates];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
};

export function generateHeadlines(keywords: string | string[], limit = DEFAULT_HEADLINE_LIMIT): string[] {
  const normalizedKeywords = normalizeKeywords(keywords);
  const [primaryKeyword, secondaryKeyword] = normalizedKeywords;
  if (!primaryKeyword) {
    return [];
  }
  const topicPhrase = secondaryKeyword ? `${primaryKeyword} và ${secondaryKeyword}` : primaryKeyword;
  const templates = secondaryKeyword
    ? [...HEADLINE_DUAL_KEYWORD_TEMPLATES, ...HEADLINE_TEMPLATES]
    : [...HEADLINE_TEMPLATES];

  const safeLimit = Math.min(
    Math.max(1, Math.floor(Number.isFinite(limit) ? limit : DEFAULT_HEADLINE_LIMIT)),
    MAX_HEADLINE_LIMIT,
    templates.length,
  );
  const seen = new Set<string>();

  return shuffleTemplates(templates)
    .map((template) => {
      const primaryReplacement = template.includes(HEADLINE_SECONDARY_REPLACE_TOKEN)
        ? primaryKeyword
        : topicPhrase;
      return template
        .replaceAll(HEADLINE_REPLACE_TOKEN, primaryReplacement)
        .replaceAll(HEADLINE_SECONDARY_REPLACE_TOKEN, secondaryKeyword ?? topicPhrase);
    })
    .filter((headline) => {
      if (seen.has(headline)) {
        return false;
      }
      seen.add(headline);
      return true;
    })
    .slice(0, safeLimit);
}
