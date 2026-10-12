import type { Heading, Nodes, Root } from 'mdast';

function collectHeadings(node: Nodes): Heading[] {
  if (node.type === 'heading') return [node];
  return 'children' in node ? node.children.flatMap(collectHeadings) : [];
}

// Article headings sit beneath the lesson h1 and material h2, regardless of source syntax.
export function lessonHeadings() {
  return (tree: Root) => {
    const headings = collectHeadings(tree);
    const firstLevel = Math.min(...headings.map((heading) => heading.depth));
    for (const heading of headings)
      heading.depth = Math.min(6, heading.depth - firstLevel + 3) as Heading['depth'];
  };
}
