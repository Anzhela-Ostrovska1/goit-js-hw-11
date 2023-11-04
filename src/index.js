import axios from 'axios';
import Notiflix from 'notiflix';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const inputElement = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');

form.addEventListener('submit', onFormSubmit);
inputElement.addEventListener('input', inputValue);
loadMore.addEventListener('click', onLoadMoreClick);

let searchName = '';
let page = 1;
let received = 0;

function inputValue(evt) {
  searchName = evt.currentTarget.value;
}

function clearGallery() {
  gallery.innerHTML = '';
  received = 0;
  page = 1;
  loadMore.classList.add('load-more-hidden');
}

async function onFormSubmit(evt) {
  evt.preventDefault();
  clearGallery();
  try {
    const pictures = await fetchPictures(page);

    received += pictures.data.hits.length;

    gallery.insertAdjacentHTML('beforeend', createMarkup(pictures.data.hits));

    showBigImg();

    if (pictures.data.hits.length === 0) {
      Notiflix.Notify.failure(
        "Were sorry, but you've reached the end of search results."
      );
    } else {
      Notiflix.Notify.success(
        `Hooray! We found ${pictures.data.totalHits} images`
      );
      if (received < pictures.data.totalHits) {
        loadMore.classList.remove('load-more-hidden');
      } else {
        addEndOfImagesMessage();
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMoreClick() {
  page += 1;

  try {
    const pictures = await fetchPictures(page);
    received += pictures.data.hits.length;

    gallery.insertAdjacentHTML('beforeend', createMarkup(pictures.data.hits));

    if (received >= pictures.data.totalHits) {
      loadMore.classList.add('load-more-hidden');
      addEndOfImagesMessage();
    }

    smoothScroll();

    showBigImg();
  } catch (eror) {
    console.log(eror);
  }
}

function showBigImg() {
  let bigImg = new SimpleLightbox('.big-img');
  bigImg.refresh();
}

function smoothScroll() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  const cardHeightValue = parseInt(cardHeight, 10);
  window.scrollBy({
    top: cardHeightValue * 2,
    behavior: 'smooth',
  });
}

function addEndOfImagesMessage() {
  const pElement = document.createElement('p');
  pElement.textContent =
    "We're sorry, but you've reached the end of search results.";
  pElement.classList.add('endResults-text');
  gallery.appendChild(pElement);
}

async function fetchPictures(page = 1) {
  axios.defaults.baseURL = 'https://pixabay.com/api/';
  const API_KEY = '40230641-302a0b52d2e6bfc5ca13bc736';

  const params = new URLSearchParams({
    key: API_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: '40',
    page,
  });

  const response = await axios.get(`?${params}&q=${searchName}`);
  if (response.status !== 200) {
    throw new Error(resp.statusText);
  }
  return response;
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `
    <div class="photo-card">
    <a class="big-img" href="${largeImageURL}"><img class="gallery_image"src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
    <div class="info">
      <p class="info-item">
        <b>Likes </b>${likes}
      </p>
      <p class="info-item">
        <b>Views </b>${views}
      </p>
      <p class="info-item">
        <b>Comments </b>${comments}
      </p>
      <p class="info-item">
        <b>Downloads </b>${downloads}
      </p>
   
    </div>
  </div>`
    )
    .join('');
}
