export function renderImage(node) {
  const img = document.createElement('img');

  if (node.content) {
    img.src = node.content;
  }

  img.style.maxWidth = '100%';
  img.style.maxHeight = '100%';
  img.style.display = 'block';

  return img;
}
