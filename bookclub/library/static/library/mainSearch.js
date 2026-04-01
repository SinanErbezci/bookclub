const bookOption = document.querySelector("#option1");
const authorOption = document.querySelector("#option2");
const genreOption = document.querySelector("#option3");

const thisPage = window.location.search;
const params = new URLSearchParams(thisPage);
const optionParam = params.get("option");

if (optionParam === "book" || optionParam === null){
    bookOption.setAttribute("checked", "");
}
else if (optionParam === "genre") {
    genreOption.setAttribute("checked", "");
}
else {
    authorOption.setAttribute("checked", "");
}

console.log(optionParam); 
