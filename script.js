const allFruitGroups = [
    "image/apple_group.png",
    "image/banana_group.png",
    "image/cherry_group.png",
    "image/lemon_group.png",
    "image/melon_group.png",
    "image/orange_group.png",
    "image/peach_group.png",
    "image/pineapple_group.png",
    "image/plum_group.png",
    "image/strawberry_group.png"
];
const allFruits = [
    "image/apple_1.png",
    "image/banana_1.png",
    "image/cherry_1.png",
    "image/lemon_1.png",
    "image/melon_1.png",
    "image/orange_1.png",
    "image/peach_1.png",
    "image/pineapple_1.png",
    "image/plum_1.png",
    "image/strawberry_1.png"
];

const fruitsToMove = document.querySelectorAll(".fruitToMove");
const fruitGroupPool = document.querySelectorAll(".fruitGroup");
const fruitCells = document.querySelectorAll(".fruitCell");
const baskets = document.querySelectorAll(".basket");
const winDiv = document.querySelector(".overlay");

const errorSound = document.getElementById("error");
const popOutSound = document.getElementById("popOut");
const putDownSound = document.getElementById("putDown");
const selectSound = document.getElementById("select");
const slideSound = document.getElementById("slide");
const winSound = document.getElementById("win"); 

let basketsState = [0,0,0];
let basketIndex = -1;
let clickedBasketIndex = -1;
let clickedFruitIndex = -1;
let shuffleFruitsArray = [];
let isMoving = false;
let currentFruitPosition;
let targetPosition;
let fruitCellPosition;

// a gyümölcs kiválasztása
function SelectFruit({target: clickedFruit}){
    if (!isMoving){
      clickedFruitIndex = parseInt(clickedFruit.getAttribute("fruit-index"));
      
      RemoveSelection();

      clickedFruit.classList.add("clickedFruit");

      selectSound.play();
    }
}

// a kijelőlés megszüntetése
function RemoveSelection(){
  fruitGroupPool.forEach(fruitGroup => {
      fruitGroup.classList.remove("clickedFruit");
  });

  fruitsToMove.forEach(fruit =>{
    if (fruit.classList.contains("moved")){
      fruit.classList.remove("clickedFruit");
  }})
}

// gyümölcs poziciónáló
function FruitAlignment(){
  let isFirstFruit = true;
  let isTwoFruitInABasket = false;
  let gap = 15;
  
  fruitsToMove.forEach(fruit =>{
    if (fruit.classList.contains("moved") && (basketsState[parseInt(fruit.getAttribute("basket-index"))] === 2)){
      targetPosition = baskets[parseInt(fruit.getAttribute("basket-index"))].getBoundingClientRect();  
      currentFruitPosition = fruit.getBoundingClientRect();
      fruitCellPosition = fruitCells[parseInt(fruit.getAttribute("fruit-index"))].getBoundingClientRect();

      let basketHalfMiddle = (targetPosition.right-targetPosition.left)/4;

      if (isFirstFruit && fruit.getAttribute("basket-position") === "middle"){
        fruit.style.left = `${LeftPosition(targetPosition, currentFruitPosition, fruitCellPosition) + basketHalfMiddle - gap}px`;
        fruit.setAttribute("basket-position", "right");
        isFirstFruit = false;
      }
      else if(fruit.getAttribute("basket-position") === "middle"){
        fruit.style.left = `${LeftPosition(targetPosition, currentFruitPosition, fruitCellPosition) - basketHalfMiddle + gap}px`;
        fruit.setAttribute("basket-position", "left");
        isFirstFruit = true;
        isTwoFruitInABasket = true;
        isMoving = true;
      }
    }
  })
  if (isTwoFruitInABasket){
    slideSound.play();

    setTimeout(function(){
      isMoving = false;
    }, 1500);
  }
}

// a kosár közepének kiszámítása
function LeftPosition(targetPos, currentFruitPos, fruitCellPos){
    return parseInt((targetPos.left - fruitCellPos.left - ((currentFruitPos.right-currentFruitPos.left)/2) + ((targetPos.right - targetPos.left)/2)));
}

// a gyümölcs mozgása
function FruitMovement(clickedFruitIdx, clickedBasketIdx){
    fruitCellPosition = fruitCells[clickedFruitIdx].getBoundingClientRect();
    targetPosition = baskets[clickedBasketIdx].getBoundingClientRect();
    currentFruitPosition = fruitsToMove[clickedFruitIdx].getBoundingClientRect();
    
    let moveTop = parseInt(targetPosition.top - fruitCellPosition.top - ((currentFruitPosition.bottom - currentFruitPosition.top)/2) + ((targetPosition.bottom-targetPosition.top)/2));
    let moveLeft = LeftPosition(targetPosition, currentFruitPosition, fruitCellPosition);

    fruitsToMove[clickedFruitIdx].style.top = `${moveTop}px`;
    fruitsToMove[clickedFruitIdx].style.left = `${moveLeft}px`;
} 


// a gyümölcs mozgatása a kosárba
function MoveFruitToBasket({target: clickedBasket}){
    
    clickedBasketIndex = parseInt(clickedBasket.getAttribute("basket-index"));

    if ((clickedFruitIndex >= 0) && (basketsState[clickedBasketIndex] < 2) && (!isMoving) && (parseInt(fruitsToMove[clickedFruitIndex].getAttribute("basket-index")) !== clickedBasketIndex)){
        isMoving = true;
        if(!fruitsToMove[clickedFruitIndex].classList.contains("moved"))
        {
          fruitsToMove[clickedFruitIndex].classList.remove("isHidden"); 
          fruitsToMove[clickedFruitIndex].classList.add("pointer");
          fruitsToMove[clickedFruitIndex].classList.add("moved");
          fruitsToMove[clickedFruitIndex].addEventListener("click", SelectFruit);
          fruitsToMove[clickedFruitIndex].setAttribute("basket-index", clickedBasketIndex.toString());
          fruitsToMove[clickedFruitIndex].setAttribute("basket-position", "middle");
          fruitsToMove[clickedFruitIndex].setAttribute("id","movedFruitImg");
        }
        else{
          RemoveSelection();
          if (fruitsToMove[clickedFruitIndex].getAttribute("basket-position") !== "middle"){
            fruitsToMove[clickedFruitIndex].setAttribute("basket-position", "middle");
            
            fruitsToMove.forEach(fruit =>{
                if (fruit.getAttribute("basket-index") === fruitsToMove[clickedFruitIndex].getAttribute("basket-index")){
                    fruit.setAttribute("basket-position", "middle");
                    FruitMovement(fruit.getAttribute("fruit-index"), fruit.getAttribute("basket-index"));
                }
            })
          }

          basketIndex = parseInt(fruitsToMove[clickedFruitIndex].getAttribute("basket-index"));
          basketsState[basketIndex]--;
          fruitsToMove[clickedFruitIndex].setAttribute("basket-index", clickedBasketIndex.toString());
        }
        
        FruitMovement(clickedFruitIndex,clickedBasketIndex);
        
        fruitsToMove[clickedFruitIndex].classList.add("popOut");
        popOutSound.play();
        
        setTimeout(function(){
          putDownSound.play();          

          setTimeout(function(){
            fruitsToMove[clickedFruitIndex].classList.remove("popOut");
            clickedFruitIndex = -1;
            RemoveSelection();
            isMoving = false;
            FruitAlignment();

            BasketsCheck();

          }, 250);
        }, 1750);
        
        fruitGroupPool[clickedFruitIndex].removeEventListener("click", SelectFruit);
        fruitGroupPool[clickedFruitIndex].classList.remove("clickedFruit");
        fruitGroupPool[clickedFruitIndex].classList.remove("pointer");
        fruitGroupPool[clickedFruitIndex].classList.add("grayFruit");

        basketsState[clickedBasketIndex]++;
    }
    else if ((clickedFruitIndex >= 0) && (basketsState[clickedBasketIndex] === 2) && !isMoving || (parseInt(fruitsToMove[clickedFruitIndex].getAttribute("basket-index")) === clickedBasketIndex)){
        errorSound.play();
    }
}

// kosarak ellenőrzése
function BasketsCheck(){
    let winCounter = 0;
    for(let i = 0; i < basketsState.length;i++){
        if (basketsState[i] === 2){
            winCounter++;
        }
    }
    if (winCounter === 3){
        Win();
    }
}

// a játék vége: nyertél
function Win(){
    setTimeout(function(){
      isMoving = true;
      
      winDiv.classList.remove("isHidden");
      
      winSound.play();
      
      setTimeout(function(){
        ResetGame();
      }, 3000);
    }, 1600);
}

// random gyümölcs generálás
function ShuffleFruits() {
  let max = 10;
  shuffleFruitsArray = [];
 
  for (let i = 0; i < fruitsToMove.length; i++) {
    let number =  Math.floor(Math.random() * max);
    let check = shuffleFruitsArray.includes(number);
   
    if(check === false){
       shuffleFruitsArray.push(number);
    }
    else{
      while(check === true){
        number = Math.floor(Math.random() * max);
        check = shuffleFruitsArray.includes(number);
        
         if(check === false){
           shuffleFruitsArray.push(number);
         }
      }
    }
  }
 
  for (let i = 0; i < fruitsToMove.length; i++){
    fruitsToMove[i].setAttribute("src", allFruits[shuffleFruitsArray[i]]);
        fruitGroupPool[i].setAttribute("src", allFruitGroups[shuffleFruitsArray[i]]);
  }
}

// a játék újraindítása
function ResetGame(){
  fruitsToMove.forEach(fruit => {
    fruit.style.top = "0";
    fruit.style.left = "0";
    fruit.classList.remove("pointer");
    fruit.classList.remove("moved");
    fruit.classList.add("isHidden");
    fruit.removeEventListener("click", SelectFruit);
    fruit.setAttribute("basket-index", "-1");
    fruit.setAttribute("basket-position", "none");
  })
  fruitGroupPool.forEach(fruitGroup => {
    fruitGroup.addEventListener("click", SelectFruit);
    fruitGroup.classList.add("pointer");
    fruitGroup.classList.remove("grayFruit");
  })
  basketsState = [0,0,0];
  ShuffleFruits();
  setTimeout(function(){
    isMoving = false;
    winDiv.classList.add("isHidden");
  },1500)
}

baskets.forEach(basket => {
  basket.addEventListener("click", MoveFruitToBasket)});

ResetGame();
