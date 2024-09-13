import { loadFragment } from "../fragment/fragment.js";

export default async function decorate(block) {
    const searchDiv = document.createElement('div');
    searchDiv.className = 'search-wrapper';
    const searchField = document.createElement('input');
    searchField.type='text';
    searchField.placeholder = 'Search Broward.org';
    searchDiv.append(searchField);

    // TODO - allow for static image

    const imgDiv = document.createElement('div');
    imgDiv.className = 'random-image';
   // const imagesPath = new URL(block.querySelector('a').href).pathname;
   // console.log(imagesPath);
   const imagesPath = '/util/random-image';
   console.log(imagesPath);
    const fragment = await loadFragment(imagesPath);
    while (fragment.firstElementChild) imgDiv.append(fragment.firstElementChild);
    const pictures = [...imgDiv.querySelectorAll('picture')];
    const index = Math.floor(Math.random() * pictures.length);
    imgDiv.textContent = '';
    imgDiv.append(pictures[index]);   
    

    block.textContent = '';
    block.append(imgDiv, searchDiv);


}