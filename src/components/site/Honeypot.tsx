import { forwardRef } from "react";

/**
 * A hidden field only scripted bots fill in — real visitors never see it or
 * tab into it. Pair with `checkHoneypot` in the submit handler: if it has a
 * value, treat the submission as sent without writing anything, so spam
 * scripts don't learn their request was rejected. Not a replacement for a
 * challenge like Turnstile, but a zero-dependency first layer against the
 * unattended form-flooding scripts that hit every public endpoint here.
 */
export const Honeypot = forwardRef<HTMLInputElement>(function Honeypot(_props, ref) {
  return (
    <input
      ref={ref}
      type="text"
      name="company_website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden"
    />
  );
});
