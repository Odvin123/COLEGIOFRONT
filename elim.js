
  
  document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.getElementById("closeButton");
    const floatingImage = document.getElementById("floatingImage");

    if (closeButton && floatingImage) {
      closeButton.addEventListener("click", function () {
        floatingImage.style.display = "none";
      });
    }
  });
