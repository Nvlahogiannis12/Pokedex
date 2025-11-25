mapGrid(16, 12);

function mapGrid(height, width) {

    const container = document.getElementById("griding");
  container.innerHTML = ""; // Clear previous grid if any
  container.style.display = "grid";
  container.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  container.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

  for (let i = 0; i < height; i++) {
    for (let q = 0; q < width; q++) {
      let tile = document.createElement("div");
      tile.id = `${i}_${q}`;
      tile.classList.add("grid-cell");

      // Store coordinates for later access
      tile.dataset.row = i;
      tile.dataset.col = q;

      container.appendChild(tile);
    }
  }
}