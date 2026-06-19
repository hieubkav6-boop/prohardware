import type { GeneratorRequest } from './types';

export const normalizeGeneratorKeyword = (value?: string) =>
  value?.trim().replaceAll(/\s+/g, ' ') ?? '';

export const getGeneratorKeywords = (request: GeneratorRequest) => {
  const sourceKeywords = request.keywords?.length
    ? request.keywords
    : [request.keyword, request.secondaryKeyword];

  return Array.from(new Set(
    sourceKeywords
      .map((keyword) => normalizeGeneratorKeyword(keyword))
      .filter(Boolean),
  )).slice(0, 2);
};

export const getGeneratorKeywordPhrase = (request: GeneratorRequest) => {
  const keywords = getGeneratorKeywords(request);
  if (keywords.length > 0) {
    return keywords.join(' và ');
  }
  return normalizeGeneratorKeyword(request.useCase);
};
