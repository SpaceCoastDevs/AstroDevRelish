import { AstroIntegration } from 'astro';

type DevRelishOptions = {
    /** Mount path for DevRelish routes. Defaults to the site root. */
    base?: `/${string}`;
    /**
     * Module that exports `db`, DevRelish schema tables, and Drizzle query helpers.
     * Defaults to DevRelish's libSQL client, but can point at a host-owned Drizzle adapter.
     */
    databaseModule?: string;
};
declare function devRelish(options?: DevRelishOptions): AstroIntegration;

export { type DevRelishOptions, devRelish as default };
