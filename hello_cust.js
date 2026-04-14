// checkers_cust.js
// Module['onRuntimeInitialized'] = function () {
    console.log("wasm loaded ");
    const canvas = document.getElementById("canvas");
    const canvas2 = document.getElementById("canvas2");
    const ctx = canvas.getContext("2d");
    const ctx2 = canvas2.getContext("2d");
    ctx2.fillStyle = "green";
    ctx2.fillRect(10, 10, 150, 100);
    canvas.addEventListener('click', function(event) {
    ctx.scale(0.9, 0.9)
    console.log("canvas clicked")
    });
    canvas2.addEventListener('click', function(event) {
    ctx2.fillRect(10, 10, 150, 100);
    ctx2.scale(0.9, 0.9)
    console.log("canvas2 clicked")
    });
    console.log("checkers_cust.js finished")
// }

