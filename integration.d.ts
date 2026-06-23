import { AstroIntegration } from 'astro';

type DevRelishOptions = {
    /** Mount path for DevRelish routes. Defaults to the site root. */
    base?: `/${string}`;
};
declare function devRelish(options?: DevRelishOptions): AstroIntegration;

export { devRelish as default };
