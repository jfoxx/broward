import { fetchPlaceholders, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const homeLink = `${window.location.origin}/`;

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

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > a');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = homeLink;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
    } while (menuItem);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  const placeholders = await fetchPlaceholders();
  const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homePlaceholder, url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs[crumbs.length - 1].url = null;
  }
  crumbs[crumbs.length - 1]['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
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
  const brandLink = document.createElement('a');
  brandLink.href = homeLink;
  brandLink.innerHTML = navBrand.innerHTML;
  navBrand.textContent = '';
  navBrand.append(brandLink);

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

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    const hero = document.querySelector('.hero-container');
    if (hero) {
      hero.after(await buildBreadcrumbs());
    }
  }
}
