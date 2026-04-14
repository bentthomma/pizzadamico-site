export function splitWords(root, opts = {}) {
  const { className = 'word', preserveInline = true } = opts;
  if (!root || root.dataset.split === 'done') return [];

  const collected = [];

  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (!text.trim()) continue;
        const frag = document.createDocumentFragment();
        const parts = text.split(/(\s+)/);
        for (const part of parts) {
          if (part.trim() === '') {
            frag.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement('span');
            span.className = className;
            span.textContent = part;
            frag.appendChild(span);
            collected.push(span);
          }
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && preserveInline) {
        walk(child);
      }
    }
  };

  walk(root);
  root.dataset.split = 'done';
  return collected;
}

export function revertSplit(root, className = 'word') {
  if (!root || root.dataset.split !== 'done') return;
  const spans = root.querySelectorAll(`span.${className}`);
  spans.forEach((s) => s.replaceWith(document.createTextNode(s.textContent)));
  root.normalize();
  delete root.dataset.split;
}
