'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';

export function LanguageSelector({ lang, dictionary }: { lang: string, dictionary: any }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLang: string) => {
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
  };
  return (
    <div>
      <Select onValueChange={handleLanguageChange} defaultValue={lang}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={dictionary.placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{dictionary.english}</SelectItem>
          <SelectItem value="es">{dictionary.spanish}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
