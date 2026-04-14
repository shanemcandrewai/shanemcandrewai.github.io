console.log("wasm loaded");
const canvas = document.getElementById("canvas");
const canvas2 = document.getElementById("canvas2");
const ctx = canvas.getContext("2d");
const ctx2 = canvas2.getContext("2d");
ctx2.fillStyle = "green";
ctx2.fillRect(10, 10, 110, 110);
canvas.addEventListener('click', function (event) {
    ctx.scale(1.1, 1.1)
    console.log("canvas clicked")
});
canvas2.addEventListener('click', function (event) {
    ctx2.scale(1.1, 1.1)
    ctx2.fillStyle = "green";
    ctx2.fillRect(10, 10, 110, 110);
    console.log("canvas2 clicked")
});
console.log("checkers_cust.js finished")

