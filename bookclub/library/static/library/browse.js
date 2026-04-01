const descP = document.getElementById('collapse-desc');
const showButton = document.querySelector('.show-more');
const starRatings = document.querySelectorAll('.rating-star i');
const ratingInput = document.querySelector('.rating-star input');
const submitBtn = document.getElementById('review-submit');
const feedbackForm = document.querySelector('.form-feedback');
const reviewForm = document.getElementById('review-form');

// Modal elements
const readReviewBtns = document.querySelectorAll('#read-review');
const reviewWriter = document.querySelector("#modal-username");
const reviewText = document.querySelector("#reviewmodal-text");
const reviewStar = document.querySelector("#modal-star");
// Popover
if (document.querySelector("#list-action")) {
    var popoverBtn = document.querySelector("#list-action");
    var userLists;
    var CSRF_TOKEN = document.querySelector("#csrf_token").innerHTML;    
    var BOOK_ID = window.location.pathname.split('/')[3];
    var LIST_ID = popoverBtn.dataset.listid;

}

document.addEventListener('DOMContentLoaded', () => {
    
    checkButton();
    
    window.addEventListener('resize', () => {
         checkButton();
    });

    showButton.addEventListener('click', readMoreLess);

    // Star Rating
    starRatings.forEach((item,index) => {
        item.addEventListener('click', () => {
            ratingInput.value = index + 1;
            starRatings.forEach( i => {
                i.classList.replace('bi-star-fill', 'bi-star')
                i.classList.remove('active')
            })
            for( let i = 0; i < starRatings.length; i++) {
                if (i <= index) {
                    starRatings[i].classList.replace('bi-star', 'bi-star-fill');
                    starRatings[i].classList.add('active')
                }
            }
        })
    });

    // Submit Check
    if (submitBtn !== null ){
    submitBtn.addEventListener('click', (event) => {
        event.preventDefault();
        feedbackForm.style.display = 'block';

        let a = document.getElementById('reviewform-text').value;
        if (ratingInput.value){
            if (a.length < 50) {
                feedbackForm.innerHTML = "Your review should be atleast 50 characters."
            }
            else if (a.length > 500) {
                feedbackForm.innerHTML = "Your review should not exceed 500 characters."
            }
            else {
                reviewForm.submit();
            }
        }
        else {      
            feedbackForm.innerHTML = "Please give a Star.";
        }
    })}

    readReviewBtns.forEach( (elem) => {
        elem.addEventListener('click', (item) => {
            reviewWriter.innerHTML = item.target.dataset.username;
            reviewText.innerHTML = item.target.parentElement.previousElementSibling.innerHTML;
            let rating = item.target.parentElement.previousElementSibling.previousElementSibling.querySelector(".star-inner").dataset.rating
            ratingCheck(false, rating)
        })
    })
    
    ratingCheck(true, null);

    async function gettingData() {
        await getUserLists();
        popoverInit()

        popoverBtn.addEventListener("click", () => {
            if (popoverBtn.innerHTML === "Remove from List"){
                popoverInit();
            }
            else{
                popoverInit();
                setTimeout(populateDrop, 200);
                setTimeout(createListPop, 200);
                
            }

        });

        window.addEventListener('click', (e) => {
            if(document.querySelector(".popover").contains(e.target)){
                return
            } else {
                closeAllPops();
            }
        });
    }
    gettingData();
});


    

function checkButton() {
    if (descP.scrollHeight > descP.clientHeight) {
        showButton.style.display = "block";}
    else {
        showButton.style.display = "none";
        descP.className = "mb-0 collapse";
        showButton.setAttribute('aria-expanded', "false");
        showButton.innerHTML = '<i class="bi bi-caret-down-fill"></i> Read more  <i class="bi bi-caret-down-fill">'   
    }
}

function readMoreLess() {
    if (showButton.getAttribute('aria-expanded') == "true") {
        showButton.innerHTML = '<i class="bi bi-caret-up-fill"></i> Read less  <i class="bi bi-caret-up-fill">'
    }
    else {
        showButton.innerHTML = '<i class="bi bi-caret-down-fill"></i> Read more  <i class="bi bi-caret-down-fill">'
    }
}

function ratingCheck(all, rate) {
    if (all === true) {
    let starsRatings = document.querySelectorAll('.star-inner');
    starsRatings.forEach( (elem) => {
        elem.style.width = `${Math.round(Number(elem.dataset.rating)*20)}%`
    })}
    else {
        reviewStar.style.width = `${Math.round(Number(rate)*20)}%`;
    }
}

function popoverInit() {
    if (popoverBtn.innerHTML === "Remove from List") {
        const popover =  bootstrap.Popover.getOrCreateInstance(popoverBtn, {
            html: true,
            title: "<h5>Remove from List</h5>",
            content: `<div class="text-center">
            <form action="/listing?q=remove" method="post">
            <input type="hidden" name="csrfmiddlewaretoken" value="${CSRF_TOKEN}">
            <input type="hidden" name="book" value="${BOOK_ID}">
            <input type="hidden" name="list" value="${LIST_ID}">
            <button type="submit" class='btn btn-primary'>Confirm ?</button>
            </form>
            </div>`,
            sanitize: false,
            trigger: "click manual"
        });
    }
    else{
        let dropItem = "";
        if (Object.entries(userLists).length > 0) {
            for (const item in userLists) {
                dropItem += `<li><button class="dropdown-item type="submit" name="list-id" value="${item}">${userLists[item]}</button></li>`
            }
        }
        // console.log(dropItem);
        let dropContent = `<div class='d-flex'>
                <form action="/listing?q=add" method="post">
                <input type="hidden" name="csrfmiddlewaretoken" value="${CSRF_TOKEN}">
                <input type="hidden" name="book" value="${BOOK_ID}">
                <div class='dropdown mx-2'>
                <button class='btn btn-primary dropdown-toggle' data-bs-toggle='dropdown' id='list-drop'>Add</button>
                <ul class="dropdown-menu">` + dropItem + `</ul></div></form>
                <div class='dropdown'>
                <button class='btn btn-secondary' id="create-list" data-bs-toggle='popover' rel='popover'>Create</button></div>
                </div>`
        // console.log(dropContent);
        const popover = bootstrap.Popover.getOrCreateInstance(popoverBtn, {
            html: true,
            title: "<h5>Add List or Create</h5>",
            content: dropContent,
            sanitize: false,
            trigger: 'click manual'
        });
    }}
    
function populateDrop(){
    const dropElem = document.querySelector("#list-drop");

    const dropBs = new bootstrap.Dropdown(dropElem);
}

function createListPop() {
    const createElem = document.querySelector("#create-list");
    const createPopover = new bootstrap.Popover(createElem, {
        html: true,
        sanitize: false,
        content: `<form action="/listing?q=create" method="post">
        <input type="hidden" name="csrfmiddlewaretoken" value="${CSRF_TOKEN}">
        <input type="hidden" name="book" value="${BOOK_ID}">
        <div class="input-group mb-3">
        <input type="text" name="list-name" class="form-control" placeholder="Name of new list" aria-label="Name of the new list" aria-describedby="button-addon2">
        <button class="btn btn-primary " type="submit" id="button-addon2"><i class="bi bi-check-lg"></i></button>
        </div></form>`, 
        placement: 'bottom',
    });
}

function closeAllPops() {
    const popElems = document.querySelectorAll('[data-bs-toggle="popover"]');
    popElems.forEach((item) => {
        let popBoot = bootstrap.Popover.getInstance(item);
        console.log(popBoot);
        popBoot.hide();
    })
}

async function getUserLists() {
    return fetch('/listing')
    .then(response => response.json())
    .then((responseData) => {
        userLists = responseData;
    })
    .catch(error => console.error('Error:', error));
}
