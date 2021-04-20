const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;

const movies = [];
let filterMovies = [];
const favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
let displayformat = 0; // 0 => showcard, 1 => showlist
let pageformat = 0; // 0 => allmoviespage, 1 => favoritespage
let page = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const displayFormat = document.querySelector(".switch-format");
const title = document.querySelector(".navbar-brand");
const home = document.querySelector(".home");
const favorite = document.querySelector(".favorite");

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderMovieCard(getMoviesByPage(1));
    renderPaginator(movies.length);
  })
  .catch((err) => console.log(err));

// 函式
function renderMovieCard(data) {
  let rawHTML = "";
  data.forEach((item) => {
    // title, image, id
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${
            POSTER_URL + item.image
          }" class="card-img-top" alt="Movie Poster" />
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie mt-1" data-toggle="modal" data-target="#movie-modal" data-id="${
              item.id
            }">More</button>
            <button class="btn btn-info btn-add-favorite num-${
              item.id
            } mt-1" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>
    `;
  });
  dataPanel.innerHTML = rawHTML;
  data.forEach((item) => {
    if (CheckFavorite(item.id)) {
      let favorite = document.querySelector(`.num-${item.id}`);
      favorite.innerHTML = `<i class="fas fa-star fa-lg"></i>`;
      favorite.classList.replace("btn-info", "btn-dark");
    }
  });
}

function renderMovieList(data) {
  let rawHTML = '<ul class="list-group list-group-flush">';
  data.forEach((item) => {
    rawHTML += `
    <li class="list-group-item">
      <div class="title-group"> 
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster" />${item.title}
      </div>  
      <div class="button-group">
        <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${
          item.id
        }">More</button>
        <button class="btn btn-info btn-add-favorite num-${item.id}" data-id="${
      item.id
    }">+</button>
      </div>
    </li>
    `;
  });
  rawHTML += "</ul>";
  dataPanel.innerHTML = rawHTML;
  data.forEach((item) => {
    if (CheckFavorite(item.id)) {
      let favorite = document.querySelector(`.num-${item.id}`);
      favorite.innerHTML = `<i class="fas fa-star fa-lg"></i>`;
      favorite.classList.replace("btn-info", "btn-dark");
    }
  });
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = `<li class="page-item active" data-item><a class="page-link" href="#" data-page="1">1</a></li>`;
  for (let page = 2; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item" data-item><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  const data = movies[id - 1];
  modalTitle.innerText = data.title;
  modalDate.innerText = "Release date: " + data.release_date;
  modalDescription.innerText = data.description;
  modalImage.innerHTML = `<img src="${
    POSTER_URL + data.image
  }" alt="movie-poster" class="img-fluid">`;
}

function addToFavorite(id) {
  const movie = movies.find((movie) => movie.id === id);
  favoriteMovies.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));
}

function getMoviesByPage(page) {
  const data = filterMovies.length ? filterMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function CheckFavorite(id) {
  if (!favoriteMovies) {
    return;
  } else if (favoriteMovies.some((movie) => movie.id === id)) {
    const result = true;
    return result;
  }
}

function removeFromFavorite(id) {
  if (!favoriteMovies) return;

  const movieIndex = favoriteMovies.findIndex((movie) => movie.id === id);
  if (movieIndex === -1) return;

  favoriteMovies.splice(movieIndex, 1);

  localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));

  if (pageformat === 0) {
    if (displayformat === 0) {
      renderMovieCard(getMoviesByPage(page));
    } else {
      renderMovieList(getMoviesByPage(page));
    }
  } else {
    if (displayformat === 0) {
      renderMovieCard(favoriteMovies);
      removeNoNeed() 
    } else {
      renderMovieList(favoriteMovies);
      removeNoNeed() 
    }
  }
}

function removeNoNeed() {
  searchForm.classList.add("d-none");
  paginator.innerHTML = "";
}

// 監聽器
dataPanel.addEventListener("click", function onPanelClicked(event) {
  const movie = event.target;
  if (movie.matches(".btn-show-movie")) {
    showMovieModal(movie.dataset.id);
  } else if (movie.matches(".btn-info")) {
    addToFavorite(Number(movie.dataset.id));
    movie.innerHTML = `<i class="fas fa-star fa-lg"></i>`;
    movie.classList.replace("btn-info", "btn-dark");
  } else if (movie.matches(".btn-dark")) {
    removeFromFavorite(Number(movie.dataset.id));
  } else if (movie.matches(".fa-star")) {
    removeFromFavorite(Number(movie.parentElement.dataset.id))
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  const key = searchInput.value;
  page = 1
  filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (!keyword.length) {
    alert("Enter keyword!");
  } else if (filterMovies.length === 0) {
    alert("Cannot find movies with keyword: " + key);
    if (displayformat === 0) {
      renderMovieCard(getMoviesByPage(page));
      renderPaginator(movies.length);
    } else {
      renderMovieList(getMoviesByPage(page));
      renderPaginator(movies.length);
    }
  } else {
    if (displayformat === 0) {
      renderMovieCard(getMoviesByPage(page));
      renderPaginator(filterMovies.length);
    } else {
      renderMovieList(getMoviesByPage(page));
      renderPaginator(filterMovies.length);
    }
  }
  searchInput.value = "";
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  // 清除active
  const pageItems = document.querySelectorAll("[data-item]");
  pageItems.forEach((item) => {
    item.classList = "page-item";
  });
  const item = event.target; // 在當下頁面加上active
  item.parentElement.classList.add("active");
 
  if (item.tagName !== "A") return;
  page = Number(item.dataset.page);
  if (displayformat === 0) {
    renderMovieCard(getMoviesByPage(page));
  } else {
    renderMovieList(getMoviesByPage(page));
  }
  return page;
});

displayFormat.addEventListener("click", function onSwitchFormatClicked(event) {
  const icon = event.target;
  if (icon.matches(".fa-th")) {
    icon.nextElementSibling.classList.remove("active");
    icon.classList.add("active");
    displayformat = 0;
    if (pageformat === 0) {
      renderMovieCard(getMoviesByPage(page));
    } else {
      renderMovieCard(favoriteMovies);
      removeNoNeed()
    }
  } else {
    icon.previousElementSibling.classList.remove("active");
    icon.classList.add("active");
    displayformat = 1;
    if (pageformat === 0) {
      renderMovieList(getMoviesByPage(page));
    } else {
      renderMovieList(favoriteMovies);
      removeNoNeed()
    }
  }
});

title.addEventListener("click", () => {
  pageformat = 0;
  filterMovies = [];
  if (displayformat === 0) {
    renderMovieCard(getMoviesByPage(1));
    searchForm.classList.remove("d-none");
    renderPaginator(movies.length);
  } else {
    renderMovieList(getMoviesByPage(1));
    searchForm.classList.remove("d-none");
    renderPaginator(movies.length);
  }
});

home.addEventListener("click", () => {
  pageformat = 0;
  filterMovies = [];
  if (displayformat === 0) {
    renderMovieCard(getMoviesByPage(1));
    searchForm.classList.remove("d-none");
    renderPaginator(movies.length);
  } else {
    renderMovieList(getMoviesByPage(1));
    searchForm.classList.remove("d-none");
    renderPaginator(movies.length);
  }
});

favorite.addEventListener("click", () => {
  pageformat = 1;
  if (displayformat === 0) {
    renderMovieCard(favoriteMovies);
    removeNoNeed()
  } else {
    renderMovieList(favoriteMovies);
    removeNoNeed()
  }
});

