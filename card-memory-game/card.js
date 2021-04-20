const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://freesvg.org/img/jean_victor_balin_card_coeur.png', // 紅心 https://image.flaticon.com/icons/svg/105/105220.svg
  'https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Card_diamond.svg/191px-Card_diamond.svg.png', // 方塊 https://image.flaticon.com/icons/svg/105/105212.svg
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const GAME_STATES = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const PLAYER_STATES = {
  FirstPlayer: "FirstPlayer",
  SecondPlayer: "SecondPlayer",
}

const model = {
  revealedCards: [],

  revealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  player1: {
    name: "Player 1",
    score: 0,
    triedTimes: 0,
  },
  player2: {
    name: "Player 2",
    score: 0,
    triedTimes: 0,
  }
}

const view = {
  // Tips: 省略屬性名稱
  // 注意這裡的語法，當物件的屬性與函式/變數名稱相同時，可以省略不寫
  getCardElement(index) {
    return `
    <div data-index="${index}" class="card back data-${index}"></div>
    `
  },

  getCardContent(index) {
    const num = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${num}</p>
      <img src="${symbol}" alt="PokerCard"/>
      <p>${num}</p>
    `
  },

  renderRed(index) {
    if (Math.floor(index / 13) === 1 || Math.floor(index / 13) === 2) {
      document.querySelector(`.data-${index}`).classList.add('red')
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('');
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
        console.log(controller.currentState, model.revealedCards)
      })
    })
    indexes.forEach(index => this.renderRed(index))
  },

  flipCards(...cards) {
    cards.map(card => {
      // 如果背面回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return 
      }
      // 如果正面回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11: 
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  pairCards(...cards) {
    cards.map(card => {card.classList.add('paired')})
  },

  renderScore(score) {
    switch (controller.currentState) {
      case GAME_STATES.FirstCardAwaits:
        document.querySelector(".score1").innerText = `Score: ${score}`;
        document.querySelector(".score2").innerText = `Score: ${score}`;
        break
      case GAME_STATES.SecondCardAwaits:
        switch (controller.currentPlayer) {
          case PLAYER_STATES.FirstPlayer:
            document.querySelector(".score1").innerText = `Score: ${score}`;
            break
          case PLAYER_STATES.SecondPlayer:
            document.querySelector(".score2").innerText = `Score: ${score}`;
            break
        }
        break
    } 
  },

  renderTriedTimes(times) {
    switch (controller.currentState) {
      case GAME_STATES.FirstCardAwaits:
        document.querySelector(".times1").innerText = `You've tried: ${times} times`;
        document.querySelector(".times2").innerText = `You've tried: ${times} times`;
        break
      case GAME_STATES.SecondCardAwaits:
        switch (controller.currentPlayer) {
          case PLAYER_STATES.FirstPlayer:
            document.querySelector(".times1").innerText = `You've tried: ${times} times`;
            break
          case PLAYER_STATES.SecondPlayer:
            document.querySelector(".times2").innerText = `You've tried: ${times} times`;
            break
        }
        break        
    } 
  },

  renderSpeakerBoard(player) {
    const speaker = document.querySelector('.speaker')
    speaker.innerHTML = `<h3>Now is ${player}'s turn!</h3>`
  },
  
  appendTrueAnimation(...cards) {
    cards.map(card => {
      card.classList.add("true")
      card.addEventListener('animationend', event => 
      event.target.classList.remove('true'), {
        once: true
      })
    })
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong")
      card.addEventListener('animationend', event => 
      event.target.classList.remove('wrong'), {
        once: true
      })
    })
  },

  showGameFinished (winner) {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Game Finished!</p>
      <div class="box">
        <div class="finisher">
          <p>${model.player1.name}</p>
          <p>Score: ${model.player1.score}</p>
          <p>Total tried: ${model.player1.triedTimes} times</p>
        </div>
        <div class="finisher">
          <p>${model.player2.name}</p>
          <p>Score: ${model.player2.score}</p>
          <p>Total tried: ${model.player2.triedTimes} times</p>
        </div>
      </div>
      <p class="result">${winner} wins!</p>
      <button class="again">Play Again</button>
    `
    const header = document.querySelector('#header')
    header.before(div)
    if (winner === 0) {
      document.querySelector('result').innerText = "It's Dual"
    }
  },
}

const utility = {
  // 洗牌演算法：Fisher-Yates Shuffle
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const controller = {
  currentState: GAME_STATES.FirstCardAwaits,
  currentPlayer: PLAYER_STATES.FirstPlayer,
  
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
    view.renderSpeakerBoard(model.player1.name)
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATES.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATES.SecondCardAwaits
        break

      case GAME_STATES.SecondCardAwaits:
        switch (this.currentPlayer) {
          case PLAYER_STATES.FirstPlayer:
            view.renderTriedTimes(++model.player1.triedTimes)
            view.flipCards(card)
            model.revealedCards.push(card)
            if (model.revealedCardsMatched()) {
              view.renderScore(model.player1.score += 10)
              this.currentState = GAME_STATES.CardsMatched
              view.appendTrueAnimation(...model.revealedCards)
              setTimeout(() => {view.pairCards(...model.revealedCards)
              model.revealedCards = []
              this.currentState = GAME_STATES.FirstCardAwaits}, 1000)
              if (model.player1.score + model.player2.score === 260) {
                this.currentState = GAME_STATES.GameFinished
                this.checkWinner()
                this.playAgain()
                return
              }
            } else {
              this.currentState = GAME_STATES.CardsMatchFailed
              this.currentPlayer = PLAYER_STATES.SecondPlayer
              view.renderSpeakerBoard(model.player2.name)
              view.appendWrongAnimation(...model.revealedCards)
              setTimeout(this.resetCards, 1000)
            }
            break

          case PLAYER_STATES.SecondPlayer:
            view.renderTriedTimes(++model.player2.triedTimes)
            view.flipCards(card)
            model.revealedCards.push(card)
            if (model.revealedCardsMatched()) {
              view.renderScore(model.player2.score += 10)
              this.currentState = GAME_STATES.CardsMatched
              view.appendTrueAnimation(...model.revealedCards)
              setTimeout(() => {view.pairCards(...model.revealedCards)
              model.revealedCards = []
              this.currentState = GAME_STATES.FirstCardAwaits}, 1000)
              if (model.player1.score + model.player2.score === 260) {
                this.currentState = GAME_STATES.GameFinished
                this.checkWinner()
                this.playAgain()
                return
              }
            } else {
              this.currentState = GAME_STATES.CardsMatchFailed
              this.currentPlayer = PLAYER_STATES.FirstPlayer
              view.renderSpeakerBoard(model.player1.name)
              view.appendWrongAnimation(...model.revealedCards)
              setTimeout(this.resetCards, 1000)
            }
            break
        }
          
        

        
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATES.FirstCardAwaits
  },

  playAgain() {
    const again = document.querySelector(".again")
    again.addEventListener('click', event => {
      event.target.parentElement.remove()
      this.currentState = GAME_STATES.FirstCardAwaits
      this.currentPlayer = PLAYER_STATES.FirstPlayer
      this.generateCards()
      this.resetBoard(0)
    })
  },

  resetBoard(zero) {
    model.player1.score = zero
    model.player2.score = zero
    model.player1.triedTimes = zero
    model.player2.triedTimes = zero
    view.renderScore(zero)
    view.renderTriedTimes(zero)
  },

  checkWinner() {
    const score1 = model.player1.score
    const score2 = model.player2.score
    const triedT1 = model.player1.triedTimes
    const triedT2 = model.player2.triedTimes
    if (score1 > score2) {
      view.showGameFinished(model.player1.name)
    } else if (score2 > score1) {
      view.showGameFinished(model.player2.name)
    } else if (score1 === score2) {
      if (triedT1 < triedT2) {
        view.showGameFinished(model.player1.name)
      } else if (triedT2 < triedT1) {
        view.showGameFinished(model.player2.name)
      } else {
        view.showGameFinished(0)
      }
    }
  }
}

controller.generateCards()

