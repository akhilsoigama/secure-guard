export function walkAst(node: any, visitors: { enter?: (node: any, parent: any) => void; leave?: (node: any, parent: any) => void }, parent: any = null) {
  if (!node || typeof node !== 'object') return;

  if (visitors.enter) {
    visitors.enter(node, parent);
  }

  for (const key of Object.keys(node)) {
    if (key === 'parent') continue; // Avoid circular
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === 'object' && typeof item.type === 'string') {
          walkAst(item, visitors, node);
        }
      }
    } else if (child && typeof child === 'object' && typeof child.type === 'string') {
      walkAst(child, visitors, node);
    }
  }

  if (visitors.leave) {
    visitors.leave(node, parent);
  }
}
