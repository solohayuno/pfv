
import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n } from './lib/i18n-config';

function getLocale(request: NextRequest): string {
  try {
    const headers = new Headers(request.headers);
    const acceptLanguage = headers.get('accept-language');
    if (acceptLanguage) {
      headers.set('accept-language', acceptLanguage.replaceAll('_', '-'));
    }

    const headersObject = Object.fromEntries(headers.entries());
    const languages = new Negotiator({ headers: headersObject }).languages();
    const validLanguages = languages.filter((lang) => lang !== '*');
    if (validLanguages.length === 0) {
      return i18n.defaultLocale;
    }
    return match(validLanguages, i18n.locales, i18n.defaultLocale);
  } catch (error) {
    return i18n.defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/` and static files
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
