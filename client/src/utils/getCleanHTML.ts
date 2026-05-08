import DOMPurify from "dompurify"; 

export default function getCleanHTML(el: HTMLDivElement): string {
  const raw = el.innerHTML.replace(/\u200B/g, "");
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ["strong", "em", "code", "br", "p", "div"],
    ALLOWED_ATTR: [], // no attributes needed
  });
}