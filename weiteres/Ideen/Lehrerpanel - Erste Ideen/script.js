var toggleButtons = document.querySelectorAll("[data-toggle]");
toggleButtons.forEach(element => {
    element.addEventListener("click" , () => toggleContent(element.getAttribute("data-toggle")));
});

var containers;
containers = document.querySelectorAll(".content > div");
// console.log(containers);


function toggleContent(containerName) {
    containers.forEach(element => {
        element.classList.remove("hidden");
        element.classList.add("hidden");
        
        if (element.classList.contains(containerName)) {
            element.classList.remove("hidden")
        }
    })

}

