import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    while (row.firstElementChild) a.append(row.firstElementChild);
    const link = a.querySelector('a').href;
    const text = a.querySelector('a').innerHTML;
    const bgDivs = a.querySelectorAll('div:first-child');
    bgDivs.forEach((i) => {
      if (i.querySelector('picture')) {
        const img = i.querySelector('picture');
        const bgImg = document.createElement('div');
        bgImg.className = 'bg-image';
        bgImg.append(img);
        a.innerHTML = text;
        a.append(bgImg);
        a.classList.add('bg-img');
      } else {
        const className = i.innerText.toLowerCase();
        a.classList.add(className);
        a.textContent = '';
        a.innerHTML = text;
      }
    });

    a.href = link;
    li.append(a);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
