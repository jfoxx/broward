import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function toggleNav() {
  const body = document.querySelector('body');
  const nav = document.getElementById('nav');
  const button = nav.querySelector('button');
  if (nav.ariaExpanded === 'false') {
    nav.ariaExpanded = 'true';
    button.innerText = 'CLOSE';
    body.classList.add('nav-open');
  } else {
    nav.ariaExpanded = 'false';
    button.innerText = 'MENU';
    body.classList.remove('nav-open');
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.ariaExpanded = 'false';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['sections', 'brand'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const toggleBtn = document.createElement('button');
    toggleBtn.innerText = 'MENU';
    toggleBtn.addEventListener('click', toggleNav);
    navSections.prepend(toggleBtn);

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.setAttribute('aria-expanded', 'false');
      navSection.addEventListener('click', () => {
        if (navSection.getAttribute('aria-expanded') === 'false') {
          navSection.setAttribute('aria-expanded', 'true');
        } else {
          navSection.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const search = document.createElement('img');
  search.src = ('../../icons/search.svg');
  tools.append(search);
  nav.append(tools);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
