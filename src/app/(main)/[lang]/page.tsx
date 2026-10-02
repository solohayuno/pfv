import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n-config';
import HomeClient from '@/components/app/home-client';

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <HomeClient lang={lang} dictionary={dictionary} />;
}
