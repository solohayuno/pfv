(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__8cd7cb9d._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[project]/src/lib/i18n-config.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "i18n": (()=>i18n)
});
const i18n = {
    defaultLocale: 'en',
    locales: [
        'en',
        'es'
    ]
};
}}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "middleware": (()=>middleware)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$formatjs$2f$intl$2d$localematcher$2f$lib$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@formatjs/intl-localematcher/lib/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$formatjs$2f$intl$2d$localematcher$2f$lib$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@formatjs/intl-localematcher/lib/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$negotiator$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/negotiator/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2d$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/i18n-config.ts [middleware-edge] (ecmascript)");
;
;
;
;
function getLocale(request) {
    const headers = new Headers(request.headers);
    const acceptLanguage = headers.get('accept-language');
    if (acceptLanguage) {
        headers.set('accept-language', acceptLanguage.replaceAll('_', '-'));
    }
    const headersObject = Object.fromEntries(headers.entries());
    const languages = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$negotiator$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"]({
        headers: headersObject
    }).languages();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$formatjs$2f$intl$2d$localematcher$2f$lib$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["match"])(languages, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2d$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["i18n"].locales, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2d$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["i18n"].defaultLocale);
}
function middleware(request) {
    const pathname = request.nextUrl.pathname;
    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2d$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["i18n"].locales.every((locale)=>!pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`);
    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url));
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    // Matcher ignoring `/_next/` and `/api/` and static files
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\..*).*)'
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__8cd7cb9d._.js.map