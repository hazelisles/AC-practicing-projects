const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";
const BASE_COUNTRY_URL = "https://restcountries.eu/"
const COUNTRY_V_URL = BASE_COUNTRY_URL + "rest/v2/all"

const friends = JSON.parse(localStorage.getItem('favoriteFriends')) || []

const countries = []
const friendsperPage = 20
const dataPanel = document.querySelector("#data-panel")
  
axios
  .get(COUNTRY_V_URL)
  .then((response) => {
    countries.push(...response.data)
    renderFriendsList(friends)
  })
  .catch((err) => console.log(err))  

function renderFriendsList(data) {
  renderNumber(data)
  let friendHTML = "";
  let num = 0
  data.forEach((item) => {
    const src = checkRegion(item.region).flag
    const nation = checkRegion(item.region).name
    friendHTML += `
    <div class="card mx-auto my-2 h-100" style="width: 200px;">
      <div class="card">
          <div class="btn-top">              
            <button class="btn material-icons btn-sm btn-add-favorite active" data-id="${item.id}">favorite</button>
          </div>
          <img src="${item.avatar}" class="card-img-top img-show-detail" alt="Friend Photo" style="cursor: pointer" data-toggle="modal" data-target="#friendmodal" data-id="${num}">
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
    num++
  });
  dataPanel.innerHTML = friendHTML;
}

function showFriendModal(id) {
  const modalTitle = document.querySelector('#friend-modal-title')
  const modalImage = document.querySelector('#friend-modal-image')
  const modalDetail = document.querySelector('#friend-modal-detail')
  const data = friends[id]
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

// renderNumberofFavorite
function renderNumber(data) {
  const num = document.querySelector('.num-favorite')
  num.innerText = data.length
  if (!data.length) {
    num.innerText = '0'
  }
}

// RemoveFavorite
function removeFromFavorite(id) {
  if(!friends) return

  // 透過 id 找到要刪除朋友的 index
  const friendIndex = friends.findIndex((friend) => friend.id === id)
  if(friendIndex === -1) return

  // 刪除該朋友
  friends.splice(friendIndex, 1)

  // 存回 local storage
  localStorage.setItem('favoriteFriends', JSON.stringify(friends))

  // 更新頁面
  renderFriendsList(friends)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.img-show-detail')) {
    showFriendModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }

})
