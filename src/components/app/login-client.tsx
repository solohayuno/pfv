'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { checkEmailAccess } from '@/app/actions';
import type { Locale } from '@/lib/i18n-config';

// This is a simplified approach. In a real app, you'd use a more robust auth system.
const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('is_authenticated') === 'true';
};

export default function LoginClient({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: any;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isAuthenticated()) {
      router.replace(`/${lang}`);
    }
  }, [router, lang, isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { hasAccess } = await checkEmailAccess(email);
      if (hasAccess) {
        // In a real app, you'd use a more secure method like session cookies or JWT.
        localStorage.setItem('is_authenticated', 'true');
        router.push(`/${lang}`);
      } else {
        toast({
          variant: 'destructive',
          title: dictionary.login.toast.error.title,
          description: dictionary.login.toast.error.description,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: dictionary.login.toast.error.title,
        description: dictionary.login.toast.error.description,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isClient) {
    return null; // Or a loading spinner
  }

  if (isAuthenticated()) {
    return null; // Or a loading spinner while redirecting
  }
  
  if (!dictionary) return <div>Loading...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline">{dictionary.login.title}</CardTitle>
          <CardDescription>{dictionary.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{dictionary.login.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? dictionary.login.loadingButton
                : dictionary.login.submitButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
