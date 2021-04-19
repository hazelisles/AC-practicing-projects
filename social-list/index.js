const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";
const BASE_COUNTRY_URL = "https://restcountries.eu/"
const COUNTRY_V_URL = BASE_COUNTRY_URL + "rest/v2/all"
const PHOTO_BASE_URL = "https://api.pexels.com/v1"
const PHOTO_SETTING_URL = PHOTO_BASE_URL + "/search?query=model-face&orientation=square&per_page=50&page="
const api_key = '563492ad6f9170000100000197cffe5f583c4866a627c3edb949cc95'

const friends = []
const photos = []
let filterName = []
const countries = []
const friendsperPage = 20
const dataPanel = document.querySelector("#data-panel")
const paginator = document.querySelector("#paginator")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")

for (let pageNum = 1; pageNum < 5; pageNum++) {
  axios.get(PHOTO_SETTING_URL + `${pageNum}`, {
  headers: {
    authorization: api_key,
  }
})
  .then((res) => {
    photos.push(...res.data.photos) 
  })
  .catch((error) => { console.log(error) })
}

axios
  .get(INDEX_URL)
  .then((response) => {
    friends.push(...response.data.results);
    changePhoto()
    renderFriendsList(getFriendsByPage(1));
    renderPaginator(friends.length);
    CheckFavorite(friends)
  })  
  .catch((err) => console.log(err));
  
axios
  .get(COUNTRY_V_URL)
  .then((response) => {
    countries.push(...response.data)
  })
  .catch((err) => console.log(err))  

function renderFriendsList(data) {
  let friendHTML = "";
  data.forEach((item) => {
    const src = checkRegion(item.region).flag
    const nation = checkRegion(item.region).name
    friendHTML += `
    <div class="card mx-auto my-2 h-100" style="width: 200px;">
      <div class="card">
          <div class="btn-top">              
            <button class="btn btn-danger material-icons btn-sm btn-add-favorite num-${item.id}" data-id="${item.id}">favorite</button>
          </div>
          <img src="${item.avatar}" class="card-img-top img-show-detail" alt="Friend Photo" style="cursor: pointer" data-toggle="modal" data-target="#friendmodal" data-id="${item.id}">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <div class="card-text">
              <img src="${src}" alt="" class="flag">
              <div class="text">${nation}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  dataPanel.innerHTML = friendHTML;
  data.forEach((item) => {
    if (CheckFavorite(item.id)) {
      let favorite = document.querySelector(`.num-${item.id}`)
      favorite.classList.replace("btn-danger","active")
    }
  })
}

// render paginator
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount/friendsperPage)
  let rawHTML = `<li class="page-item active" data-item><a class="page-link" href="#" data-page="1">1</a></li>`;
  for (let page = 2; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item" data-item><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}
// get friendsbyPage
function getFriendsByPage(page) {
  const data = filterName.length ? filterName : friends
  const startIndex = (page - 1) * friendsperPage
  return data.slice(startIndex, startIndex + friendsperPage)
}

function showFriendModal(id) {
  const modalTitle = document.querySelector('#friend-modal-title')
  const modalImage = document.querySelector('#friend-modal-image')
  const modalDetail = document.querySelector('#friend-modal-detail')
  const data = friends[id-601]
  const nation = checkRegion(data.region).name
  const detail = `
       <p>Email: ${data.email}</p>
       <p>Gender: ${data.gender}</p>
       <p>Age: ${data.age}</p>
       <p>Region: ${nation}</p>
       <p>Birthday: ${data.birthday}</p>
  `
  
  modalTitle.innerText = data.name + " " + data.surname
  modalDetail.innerHTML = detail
  modalImage.innerHTML = `<img src="${data.avatar}" alt="Friend Photo" class="friend-image">`
}

// GetFlags
function checkRegion(item) {
  const net = countries.find((country) => {
    return item === country.alpha2Code
  })
  return net
}

// ChangePhotos
function changePhoto() {
  for (let i = 0; i < photos.length; i++) {
    friends[i].avatar = photos[i].src.portrait
  }
}

// searchForm
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  const key = searchInput.value
   
  filterName = friends.filter((name) => 
    name.name.toLowerCase().includes(keyword)
  ) 

  if (!keyword.length) {
    alert('Enter keyword!')
  } else if (filterName.length === 0) {
    alert('Cannot find name with keyword: ' + key)
    renderFriendsList(getFriendsByPage(1))
    renderPaginator(friends.length)
  } else {
    renderFriendsList(getFriendsByPage(1))
    renderPaginator(filterName.length)
  }

  searchInput.value = ""
})

// AddtoFavorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []
  const friend = friends.find((friend) => friend.id === id)
  if (list.some((friend) => friend.id === id)) {
    return alert('Already in the Close friends')
  }
  list.push(friend)
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
}

// CheckFavorite
function CheckFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []
  
  if (!list) {
    return
  } else if (list.some((friend) => friend.id === id)) {
    const result = true
    return result  
  }
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.img-show-detail')) {
    showFriendModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
    event.target.classList.remove("btn-danger")
    event.target.classList.add("active")
  }

})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 清除active
  const pageItems = document.querySelectorAll("[data-item]");
  pageItems.forEach((item) => {
    item.classList = "page-item";
  });
  const item = event.target; // 在當下頁面加上active
  item.parentElement.classList.add("active");

  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderFriendsList(getFriendsByPage(page))
})
