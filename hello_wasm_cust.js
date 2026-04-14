console.log("wasm loaded");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// var scale = 1.0;
canvas.addEventListener('click', function () {
  // scale *= 1.1;
  canvas.style.transformOrigin = "top left";
  // canvas.style.transform = "scale(" + scale + ")";
  canvas.style.transform = "scale(2)";
  console.log("checkers_cust.js scaled");

});

console.log("checkers_cust.js finished");