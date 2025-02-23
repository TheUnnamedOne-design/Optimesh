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


const swiper = new Swiper('.slider-wrapper', {
    loop: true,
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  let socket;
  const canvas = document.getElementById("screenCanvas");
  const ctx = canvas.getContext("2d");

  const defaultBackground = "url('tv-background.png')";
  canvas.style.backgroundImage = defaultBackground;
  canvas.style.backgroundSize = "cover"; 
  canvas.style.backgroundPosition = "center";

  function connectToServer() {
      const ip = document.getElementById("ipInput").value;
      if (!ip) {
          alert("Please enter a valid IP address!");
          return;
      }

      socket = new WebSocket(`ws://${ip}:8765`);
      socket.binaryType = "arraybuffer";

      socket.onmessage = (event) => {
          const blob = new Blob([event.data], { type: "image/png" });
          const img = new Image();
          img.src = URL.createObjectURL(blob);

          img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(img.src);
          };
      };

      socket.onclose = () => console.log("Connection closed");
  }

  function disconnectFromServer() {
    if (socket) {
        socket.close();
        console.log("Disconnected from server");
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.backgroundImage = defaultBackground;
}