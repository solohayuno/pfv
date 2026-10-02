
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EnrollmentForm from '@/components/app/enrollment-form';
import type { Locale } from '@/lib/i18n-config';
import { LanguageSelector } from '@/components/app/language-selector';

// --- CONTROL DE ACCESO ---
// Cambia esta variable a 'false' para desactivar el acceso privado y mostrar el formulario directamente.
// Cambia a 'true' para requerir que los usuarios inicien sesión.
const PRIVATE_ACCESS_ENABLED = false;
// -------------------------

// This is a simplified approach. In a real app, you'd use a more robust auth system.
const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('is_authenticated') === 'true';
};

export default function HomeClient({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: any;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(!PRIVATE_ACCESS_ENABLED);

  useEffect(() => {
    setIsClient(true);
    if (PRIVATE_ACCESS_ENABLED) {
      if (isAuthenticated()) {
        setIsAuthorized(true);
      } else {
        // Redirect to the new, localized login page
        router.replace(`/${lang}/login`);
      }
    }
  }, [router, lang]);

  if (!isClient || !isAuthorized) {
    // You can add a loading spinner here
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex justify-end">
          <LanguageSelector
            lang={lang}
            dictionary={dictionary.languageSelector}
          />
        </div>
        <header className="text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {dictionary.page.title}
          </h1>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            {dictionary.page.description}
          </p>
        </header>
        <EnrollmentForm dictionary={dictionary} lang={lang} />
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <a 
          href="https://wa.me/18292556327" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          {dictionary.footer.poweredBy}
        </a>
      </footer>
    </main>
  );
}
