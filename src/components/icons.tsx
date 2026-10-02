import type { SVGProps } from "react";

export function CrossIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function DoveIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            {...props}
        >
            <path d="M10.43 5.24a5.6 5.6 0 0 1 8.82 2.47 5.2 5.2 0 0 1 -2.18 7.37c-3.6 1.84-9.28.3-11.8-4.43-2.5-4.7-1.1-10.32 3.16-12.28a4.67 4.67 0 0 1 6.51 1.4"/>
            <path d="M18 22s-2-2-4-3-4-2.5-4-4.5 1-4.5 3-4.5 4.5 2 4.5 4-2 3.5-2 5.5"/>
        </svg>
    );
}

export function ChaliceIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            {...props}
        >
            <path d="M12 4a4 4 0 0 1 4 4h-8a4 4 0 0 1 4-4Z"/>
            <path d="M12 8v10"/>
            <path d="M8 22h8"/>
            <path d="M7 14h10"/>
        </svg>
    );
}

export function MaleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 14h13" />
      <path d="M8 14v8" />
      <path d="M16 14v8" />
    </svg>
  );
}

export function FemaleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M12 11v11" />
      <path d="M9 18h6" />
      <path d="M6 14h12" />
    </svg>
  );
}
