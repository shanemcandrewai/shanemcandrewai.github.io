window.onload = () => {
  const uploadInput = document.getElementById('uploadInput');
  uploadInput.addEventListener(
    'change',
    () => {
    // Calculate total size
      let numberOfBytes = 0;
      for (const file of uploadInput.files) {
        numberOfBytes += file.size;
      }

      // Approximate to the closest prefixed unit
      const units = [
        'B',
        'KiB',
        'MiB',
        'GiB',
        'TiB',
        'PiB',
        'EiB',
        'ZiB',
        'YiB',
      ];
      const exponent = Math.min(
        Math.floor(Math.log(numberOfBytes) / Math.log(1024)),
        units.length - 1,
      );
      const approx = numberOfBytes / 1024 ** exponent;
      const output = exponent === 0
        ? `${numberOfBytes} bytes`
        : `${approx.toFixed(3)} ${
          units[exponent]
        } (${numberOfBytes} bytes)`;

      document.getElementById('fileNum').textContent = uploadInput.files.length;
      document.getElementById('fileSize').textContent = output;
    },
    false,
  );
};
