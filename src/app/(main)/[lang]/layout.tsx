import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';

// This is not ideal, but it's a simple way to get the dictionary for the metadata.
// In a real app, you might want to use a different approach for generating dynamic metadata.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return {
    title: dictionary.page.title,
    description: dictionary.page.description,
  };
}

export default function MainLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
