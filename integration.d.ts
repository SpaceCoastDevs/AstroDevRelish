import { AstroIntegration } from 'astro';

type DevRelishOptions = {
    /** Mount path for DevRelish routes. Defaults to the site root. */
    base?: `/${string}`;
    /** Public site origin override. Defaults to Astro's site config, then the incoming request origin. */
    siteUrl?: string;
    /** Product/site name used in transactional emails. */
    siteName?: string;
    /** Public support/admin email shown in policy copy. */
    supportEmail?: string;
    /** Sender email address for transactional email. Defaults to RESEND_FROM, then supportEmail. */
    fromEmail?: string;
};
declare function devRelish(options?: DevRelishOptions): AstroIntegration;

export { devRelish as default };
