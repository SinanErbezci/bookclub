const starRatings = document.querySelectorAll('.rating-star i');
const ratingInput = document.querySelector('.rating-star input');
const submitBtn = document.getElementById('review-submit');
const feedbackForm = document.querySelector('.form-feedback');
const reviewForm = document.getElementById('review-form');

// Modal review elements
const readReviewBtns = document.querySelectorAll('#read-review');
const reviewWriter = document.querySelector("#modal-username");
const reviewText = document.querySelector("#reviewmodal-text");
const reviewStar = document.querySelector("#modal-star");
// Modal list element
const listBtns = document.querySelectorAll("#list-button");
const listName = document.querySelector("#listModalLabel");
const listBody = document.querySelector("#list-content")
var listBooks;


document.addEventListener('DOMContentLoaded', () => {

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


    readReviewBtns.forEach( (elem) => {
        elem.addEventListener('click', (item) => {
            reviewWriter.innerHTML = item.target.dataset.username;
            reviewText.innerHTML = item.target.parentElement.previousElementSibling.innerHTML;
            let rating = item.target.parentElement.previousElementSibling.previousElementSibling.querySelector(".star-inner").dataset.rating
            ratingCheck(false, rating)
        })
    })

    listBtns.forEach((elem) => {
        elem.addEventListener('click', (item) => {
            listName.innerHTML = item.target.innerHTML;
            fillContent(item.target.parentElement.dataset.listid);
        })
    })
    
    ratingCheck(true, null);

});

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

function listContent(picSrc, bookId, bookName, authorId, authorName) {
    return `
    <div class="col d-flex align-items-strecth justify-content-center">
<div class="card text-center mx-2 bg-primary shadow">
<img class="card-img-top book-cover mx-auto" src="${picSrc}" alt="book cover">
    <div class="d-flex card-body flex-column justify-content-end " style="max-width:200px;">
        <div class="twoliner">
            <a class="book-link fw-bolder fs-5 text-center" href="/browse/books/${bookId}">${bookName}</a>
        </div>
        <a href="/browse/authors/${authorId}" class="book-link text-center">${authorName}</a>
    </div>
</div>
</div>
    `
}

async function fillContent(listId){
    const response = await fetch(`/listing?q=${listId}`)
    const books = await response.json();
    let content_begin = '<div class="row gx-2 gy-2 row-cols-1  row-cols-md-2 flex-nowrap">';
    let contento = "";
    for (const book of Object.values(books)) {
        contento += listContent(book.pic_src, book.id, book.book_name, book.author_id, book.author_name)
    }
    let full_content = content_begin + contento + "</div>"
    listBody.innerHTML = full_content;
}