const navLinks = document.querySelectorAll(".nav-links .nav-menu");
const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

menuOpenButton.addEventListener("click" ,() => {
    document.body.classList.toggle("show-mobile-menu");
    document.body.classList.contains("show-mobile-menu");
})
menuCloseButton.addEventListener("click" ,() =>  menuOpenButton.click())

navLinks.forEach(link => {
    link.addEventListener("click", () => menuOpenButton.click());

});