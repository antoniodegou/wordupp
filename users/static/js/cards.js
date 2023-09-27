  // Define your colors
  const colors = ["var(--pink)", "var(--red)", "var(--yellow)"];

  // Grab all elements with the class 'download-icon'
  const downloadIcons = document.querySelectorAll('.download-icon');
  
  // Loop through each element and set a random color
  downloadIcons.forEach((icon) => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    icon.style.color = randomColor;
  });