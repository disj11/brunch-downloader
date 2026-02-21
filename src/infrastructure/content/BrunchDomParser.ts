/** DOM 요소를 Markdown 문자열로 변환 */
export class BrunchDomParser {
  static toMarkdown(root: Element): string {
    const el = root.cloneNode(true) as Element;
    el.querySelectorAll(
      "script,style,iframe,.wrap_sns,.relate_article,.adsbygoogle,[class*='btn_'],.wrap_comment"
    ).forEach((n) => n.remove());
    return BrunchDomParser.nodeMd(el).replace(/\n{3,}/g, "\n\n").trim();
  }

  private static nodeMd(node: Node): string {
    let out = "";
    for (const c of node.childNodes) {
      if (c.nodeType === Node.TEXT_NODE) {
        const text = c.textContent ?? "";
        if (text.trim()) out += text;
        continue;
      }
      if (c.nodeType !== Node.ELEMENT_NODE) continue;

      const el = c as Element;
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim() ?? "";

      if (!text && !["img", "figure", "br", "hr"].includes(tag)) continue;

      switch (tag) {
        case "h1": out += `\n# ${text}\n\n`; break;
        case "h2": out += `\n## ${text}\n\n`; break;
        case "h3": out += `\n### ${text}\n\n`; break;
        case "h4": out += `\n#### ${text}\n\n`; break;
        case "h5":
        case "h6": out += `\n##### ${text}\n\n`; break;
        case "p": out += `\n${BrunchDomParser.nodeMd(el).trim()}\n`; break;
        case "br": out += "\n"; break;
        case "hr": out += "\n\n---\n\n"; break;
        case "strong":
        case "b": out += `**${text}**`; break;
        case "em":
        case "i": out += `*${text}*`; break;
        case "blockquote": {
          out += "\n" + text.split("\n").map((l) => `> ${l.trim()}`).join("\n") + "\n\n";
          break;
        }
        case "ul": {
          const lis = [...el.querySelectorAll(":scope > li")];
          out += "\n" + lis.map((li) => `- ${li.textContent?.trim() ?? ""}`).join("\n") + "\n\n";
          break;
        }
        case "ol": {
          const lis = [...el.querySelectorAll(":scope > li")];
          out += "\n" + lis.map((li, i) => `${i + 1}. ${li.textContent?.trim() ?? ""}`).join("\n") + "\n\n";
          break;
        }
        case "img": {
          const imgEl = el as HTMLImageElement;
          const src = imgEl.dataset["src"] || imgEl.src || "";
          if (src && !src.startsWith("data:")) out += `\n![${imgEl.alt || "image"}](${src})\n`;
          break;
        }
        case "figure": {
          el.querySelectorAll("img").forEach((img) => {
            const imgEl = img as HTMLImageElement;
            const src = imgEl.dataset["src"] || imgEl.src || "";
            if (src && !src.startsWith("data:")) out += `\n![${imgEl.alt || "image"}](${src})\n`;
          });
          const cap = el.querySelector("figcaption")?.textContent?.trim();
          if (cap) out += `*${cap}*\n`;
          out += "\n";
          break;
        }
        case "a": {
          const href = el.getAttribute("href") || "";
          const linkUrl = href
            ? href.startsWith("http") ? href : location.origin + href
            : "";
          out += linkUrl ? `[${text}](${linkUrl})` : text;
          break;
        }
        case "script":
        case "style": break;
        default: out += BrunchDomParser.nodeMd(el); break;
      }
    }
    return out;
  }
}
