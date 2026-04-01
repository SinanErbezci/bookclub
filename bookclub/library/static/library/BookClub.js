/**
 * @typedef {Object} InstantSearchOptions
 * @property {URL} searchUrl
 * @property {string} queryParam
 * @property {Function} responseParser
 */
class InstantSearch {
    /**
     * Initialises the instant search bar. Retrieves and creates element.
     * 
     * @param {HTMLElement} instantSearch 
     * @param {InstantSearchOptions} options 
     */
    constructor(instantSearch, options) {
        this.options = options;
        this.elements = {
            main: instantSearch,
            input: instantSearch.querySelector("input"),
            resultsContainer: document.createElement("div")
        };

        this.elements.resultsContainer.classList.add("search-bar-results");
        this.elements.main.appendChild(this.elements.resultsContainer);

        this.addListeners();
    }

    addListeners() {
        let delay;

        this.elements.input.addEventListener("input", () => {
            clearTimeout(delay);

            const query = this.elements.input.value;
            
            console.log(query)
            delay = setTimeout(() => {
                if (query.length < 3) {
                    this.populateResults([]);
                    return;
                }

                this.performSearch(query).then(results => {
                    this.populateResults(results);
                });
            },500);
        });

        this.elements.input.addEventListener("focus", () => {
            this.elements.resultsContainer.classList.add("visible");
        });

        this.elements.input.addEventListener("blur", () => {
            this.elements.resultsContainer.classList.remove("visible");
        });
    }

    populateResults(results) {
        // Removing all existing results
        while (this.elements.resultsContainer.firstChild) {
            this.elements.resultsContainer.removeChild(this.elements.resultsContainer.firstChild);
        }


        if (Object.keys(results.book).length == 0 && Object.keys(results.author).length == 0 && Object.keys(results.genre).length == 0) {
            let noResultElement = document.createElement("p");
            noResultElement.className = "search-result m-0 text-center";
            noResultElement.innerHTML = "No result's been found."
            this.elements.resultsContainer.appendChild(noResultElement);
        }
        else {
        for (const [key,value] of Object.entries(results)) {
            if (Object.entries(value).length > 0) {
                for (const [title,id] of Object.entries(value)) {
                    let resultElement = document.createElement("div");
                    resultElement.className = "search-result";
                    this.elements.resultsContainer.appendChild(resultElement);
                    resultElement.innerHTML = this.createResultElement(key,title,id)
                }
            }}}

    }

    createResultElement(type,title,id) {
        let linkId;
        if (type === "book") {
            linkId = `./browse/books/${id}`;
        }
        else if (type === "genre") {
            linkId = `./browse/genres/${id}`;
        }
        else {
            linkId = `./browse/authors/${id}`;
        }

        const elementName = `
            <a href="${linkId}" class="search-result-title book-link">${title}</a>
            <span class="search-result-type ">${type}</span>
        `;

        return elementName;

    }
    performSearch(query) {
        const url = new URL(this.options.searchUrl.toString());

        url.searchParams.set(this.options.queryParam,query);

        this.setLoading(true);

        return fetch(url, {
            method: "get"
        }).then(response => {
            if (response.status !== 200) {
                throw new Error("Something went wrong with the search app.");
            }

            return response.json();
        }).then(responseData => {
            console.log(responseData);

            return this.options.responseParser(responseData);
        }).catch(error => {
            console.error(error);

            return [];
        }).finally(results => {
            this.setLoading(false);

            return results;
        });
    }

    setLoading(b) {
        this.elements.main.classList.toggle("search-bar-loading", b);
    }
}

export default InstantSearch;
