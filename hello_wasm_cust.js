console.log("wasm loading");
const importObject = {
  my_namespace: {
    imported_func: arg => {
      console.log(arg);
    }
  }
};

WebAssembly.instantiateStreaming(fetch("hello_wasm.wasm"), importObject)
  .then(obj => {
    obj.instance.exports.exported_func();
  });
