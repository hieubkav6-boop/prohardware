'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { HeroRuntimeSection } from './sections/HeroRuntimeSection';

// SSR-enabled: các section này không dùng browser API ở top-level
// → Next.js render HTML ngay trong SSR, giảm CLS và FCP
const AboutSection = dynamic(
  () => import('../AboutSection').then((mod) => ({ default: mod.AboutSection })),
  { loading: () => null }
);
const BlogSection = dynamic(
  () => import('../BlogSection').then((mod) => ({ default: mod.BlogSection })),
  { loading: () => null }
);
const BenefitsRuntimeSection = dynamic(
  () => import('./sections/BenefitsRuntimeSection').then((mod) => ({ default: mod.BenefitsRuntimeSection })),
  { loading: () => null }
);
const StatsRuntimeSection = dynamic(
  () => import('./sections/StatsRuntimeSection').then((mod) => ({ default: mod.StatsRuntimeSection })),
  { loading: () => null }
);
const FaqRuntimeSection = dynamic(
  () => import('./sections/FaqRuntimeSection').then((mod) => ({ default: mod.FaqRuntimeSection })),
  { loading: () => null }
);
const CtaRuntimeSection = dynamic(
  () => import('./sections/CtaRuntimeSection').then((mod) => ({ default: mod.CtaRuntimeSection })),
  { loading: () => null }
);
const FeaturesRuntimeSection = dynamic(
  () => import('./sections/FeaturesRuntimeSection').then((mod) => ({ default: mod.FeaturesRuntimeSection })),
  { loading: () => null }
);
const ClientsRuntimeSection = dynamic(
  () => import('./sections/ClientsRuntimeSection').then((mod) => ({ default: mod.ClientsRuntimeSection })),
  { loading: () => null }
);
const ProcessRuntimeSection = dynamic(
  () => import('./sections/ProcessRuntimeSection').then((mod) => ({ default: mod.ProcessRuntimeSection })),
  { loading: () => null }
);
const CaseStudySection = dynamic(
  () => import('../CaseStudySection').then((mod) => ({ default: mod.CaseStudySection })),
  { loading: () => null }
);
const ContactSection = dynamic(
  () => import('../ContactSection').then((mod) => ({ default: mod.ContactSection })),
  { loading: () => null }
);
const TeamSection = dynamic(
  () => import('../TeamSection').then((mod) => ({ default: mod.TeamSection })),
  { loading: () => null }
);
const PricingSection = dynamic(
  () => import('../PricingSection').then((mod) => ({ default: mod.PricingSection })),
  { loading: () => null }
);
const ServiceListSection = dynamic(
  () => import('../ServiceListSection').then((mod) => ({ default: mod.ServiceListSection })),
  { loading: () => null }
);
const ProductListSection = dynamic(
  () => import('../ProductListSection').then((mod) => ({ default: mod.ProductListSection })),
  { loading: () => null }
);
const ProductGridSection = dynamic(
  () => import('../ProductGridSection').then((mod) => ({ default: mod.ProductGridSection })),
  { loading: () => null }
);
const HomepageCategoryHeroSection = dynamic(
  () => import('../HomepageCategoryHeroSection').then((mod) => ({ default: mod.HomepageCategoryHeroSection })),
  { loading: () => null }
);
const VoucherPromotionsSection = dynamic(
  () => import('../VoucherPromotionsSection').then((mod) => ({ default: mod.VoucherPromotionsSection })),
  { loading: () => null }
);
const VideoRuntimeSection = dynamic(
  () => import('./sections/VideoRuntimeSection').then((mod) => ({ default: mod.VideoRuntimeSection })),
  { loading: () => null }
);
const PokemonChampionsRuntimeSection = dynamic(
  () => import('./sections/PokemonChampionsRuntimeSection').then((mod) => ({ default: mod.PokemonChampionsRuntimeSection })),
  { ssr: false, loading: () => null }
);

// SSR disabled: các component này cần browser API ngay khi mount
// (SpeedDial: position:fixed viewport, Popup: overlay, Countdown: window timer, Career: lazy form)
const CareerSection = dynamic(
  () => import('../CareerSection').then((mod) => ({ default: mod.CareerSection })),
  { ssr: false, loading: () => null }
);
const CountdownSectionWrapper = dynamic(
  () => import('../CountdownSectionWrapper').then((mod) => ({ default: mod.CountdownSectionWrapper })),
  { ssr: false, loading: () => null }
);
const PopupSection = dynamic(
  () => import('../PopupSection').then((mod) => ({ default: mod.PopupSection })),
  { ssr: false, loading: () => null }
);
const SpeedDialSection = dynamic(
  () => import('../SpeedDialSection').then((mod) => ({ default: mod.SpeedDialSection })),
  { ssr: false, loading: () => null }
);

export const homeComponentRegistry: Record<string, ComponentType<any>> = {
  About: AboutSection,
  Blog: BlogSection,
  Benefits: BenefitsRuntimeSection,
  Career: CareerSection,
  CaseStudy: CaseStudySection,
  Clients: ClientsRuntimeSection,
  Contact: ContactSection,
  Countdown: CountdownSectionWrapper,
  CTA: CtaRuntimeSection,
  FAQ: FaqRuntimeSection,
  Features: FeaturesRuntimeSection,
  Hero: HeroRuntimeSection,
  HomepageCategoryHero: HomepageCategoryHeroSection,
  PokemonChampions: PokemonChampionsRuntimeSection,
  Pricing: PricingSection,
  Popup: PopupSection,
  Process: ProcessRuntimeSection,
  Stats: StatsRuntimeSection,
  ProductGrid: ProductGridSection,
  ProductList: ProductListSection,
  ServiceList: ServiceListSection,
  SpeedDial: SpeedDialSection,
  Team: TeamSection,
  Video: VideoRuntimeSection,
  VoucherPromotions: VoucherPromotionsSection,
};
