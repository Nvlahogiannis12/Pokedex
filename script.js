//Fetches the Region Name for each thing in Regions.JSON in order to Create Buttons
fetch("regions.json")
  .then((response) => response.json())
  .then((data) => {
    const container = document.getElementById("list");

    data.forEach((item, index) => {
      const button = document.createElement("button");
      button.textContent = item.name;

      button.addEventListener("click", () => {
        calcCells(item.numbers);
        //alert(index)
        //findCellIndex(index)
      });

      container.appendChild(button);
    });
  })
  .catch((error) => console.error("Error loading JSON:", error));

//Generates the New Height of the grid based on how many pokemon in the Region
function calcCells(regionI) {
  let newH = Math.ceil(regionI / 12);
  mapGrid(newH, 12);
}

function mapGrid(height, width) {
  const container = document.getElementById("griding");
  container.innerHTML = ""; // Clear previous grid if any
  container.style.display = "grid";
  container.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  container.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

  let cellIndex = 1;

  for (let i = 0; i < height; i++) {
    for (let q = 0; q < width; q++) {
      let tile = document.createElement("div");

      tile.classList.add("grid-cell");

      // Left → right index
      tile.dataset.index = cellIndex;
      tile.textContent = cellIndex; // optional LINE

      container.appendChild(tile);

      cellIndex++;
    }
  }
}
/*
function findCellIndex(numberJSON) {
  alert(regions.name);
}
  */
