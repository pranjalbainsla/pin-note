import DOMPurify from "dompurify";

export default function getCleanHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["strong", "em", "code", "br", "p", "div"],
    ALLOWED_ATTR: [],
  });
}
