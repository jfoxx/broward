import ffetch from '../../scripts/ffetch.js';
import convertExcelDate from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

const allentries = await ffetch('/query-index.json').all();
function filterItems(arr, query) {
  return arr.filter((el) => el.template.includes(query));
}

/* eslint-disable prefer-const */

function runCarousel(block) {
  const carousel = block.querySelector('ul');
  carousel.classList.add('panel-1');
  const panels = Math.ceil(carousel.children.length / 3);
  const nextButton = block.querySelector('.nextButton button');
  const prevButton = block.querySelector('.prevButton button');
  nextButton.addEventListener('click', function () {
    let currPanel = Number(carousel.className.replace('panel-', ''));
    currPanel += 1;
    prevButton.removeAttribute('disabled');
    if (currPanel < panels) {
      carousel.className = `panel-${currPanel}`;
      this.removeAttribute('disabled');
    } else {
      carousel.className = `panel-${panels}`;
      this.setAttribute('disabled', 'disabled');
    }
  });
  prevButton.addEventListener('click', function () {
    let currPanel = Number(carousel.className.replace('panel-', ''));
    currPanel -= 1;
    nextButton.removeAttribute('disabled');
    if (currPanel > 1) {
      carousel.className = `panel-${currPanel}`;
      this.removeAttribute('disabled');
    } else {
      carousel.className = 'panel-1';
      this.setAttribute('disabled', 'disabled');
    }
  });
}

function setCarousel(block) {
  const buttons = document.createElement('ul');
  buttons.className = 'carousel-buttons';
  const nextButton = document.createElement('li');
  const prevButton = document.createElement('li');
  nextButton.className = 'nextButton';
  prevButton.className = 'prevButton';
  const btnNext = document.createElement('button');
  const btnPrev = document.createElement('button');
  btnPrev.setAttribute('disabled', 'disabled');
  nextButton.append(btnNext);
  prevButton.append(btnPrev);
  buttons.append(prevButton, nextButton);
  block.append(buttons);
  runCarousel(block);
}

function closeModal() {
  const modal = document.getElementById('news-modal');
  const body = document.querySelector('body');
  const content = modal.querySelector('div.modal-content');
  modal.classList.remove('is-open');
  body.classList.remove('modal-open');
  content.textContent = '';
}

async function showModal(url) {
  const modalDiv = document.getElementById('news-modal');
  const content = modalDiv.querySelector('.modal-content');
  const body = document.querySelector('body');
  const fragment = await loadFragment(url);
  while (fragment.firstElementChild) content.append(fragment.firstElementChild);
  modalDiv.classList.add('is-open');
  body.classList.add('modal-open');
}

export default function decorate(block) {
  const base = block.firstElementChild;
  const template = base.firstElementChild.innerText;
  //  const limit = base.lastElementChild.innerText;
  const list = document.createElement('ul');
  list.id = 'list';
  const match = filterItems(allentries, template);
  match.forEach((i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    // a.href = i.path;
    a.addEventListener('click', () => {
      showModal(i.path);
    });
    const img = document.createElement('img');
    img.src = i.image;
    if (img) a.append(img);
    const title = document.createElement('p');
    title.innerText = i.title;
    a.append(title);
    const date = document.createElement('span');
    date.innerText = convertExcelDate(i.pubdate);
    a.append(date);
    li.append(a);
    list.append(li);
  });
  block.textContent = '';
  block.append(list);
  const modal = document.createElement('div');
  modal.id = 'news-modal';
  const closeButton = document.createElement('button');
  closeButton.innerText = 'CLOSE';
  closeButton.addEventListener('click', closeModal, false);
  modal.append(closeButton);
  const contentDiv = document.createElement('div');
  contentDiv.className = 'modal-content';
  modal.prepend(contentDiv);
  const body = document.querySelector('body');
  body.append(modal);
  setCarousel(block);
}
