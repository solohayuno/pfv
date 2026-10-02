
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n-config';
import LoginClient from '@/components/app/login-client';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  return <LoginClient lang={lang} dictionary={dictionary} />;
}
