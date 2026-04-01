const followBtn = document.querySelector("#follow");

followBtn.addEventListener("click", follow);

function follow() {		
    // API Call
    const id = this.dataset.userid;

    // Animation
    if (this.innerHTML == "Follow") {
        fetch(`/follow/${id}`, {
            method: "POST",
            body: JSON.stringify({
                text: 'follow'
              })
        })
        this.classList.replace("btn-outline-primary", "btn-primary");
        this.innerHTML = "Following";
    }
    else {
        fetch(`/follow/${id}`, {
            method: "POST",
            body: JSON.stringify({
                text: 'unfollow'
              })
              
        })
        this.classList.replace("btn-primary", "btn-outline-primary");
        this.innerHTML = "Follow";
      }
    } 