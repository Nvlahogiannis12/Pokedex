//Fetches the Region Name for each thing in Regions.JSON in order to Create Buttons
let regionsData = []; // store the JSON globally

fetch("regions.json")
  .then((response) => response.json())
  .then((data) => {
    regionsData = data; // store globally for later use

    const container = document.getElementById("list");

    data.forEach((item, index) => {
      const button = document.createElement("button");
      button.textContent = item.name;

      button.addEventListener("click", () => {
        // calculate the previous total before this region
        let prevTotal = 0;
        for (let i = 0; i < index; i++) {
          prevTotal += Number(regionsData[i].numbers);
        }

  let startNumber = prevTotal + 1;
  let endNumber = prevTotal + Number(item.numbers);
  // Filter the tiles so only this region is visible

        // send previous total + 1 and current region count to create the grid
        calcCells(Number(item.numbers), prevTotal + 1);
        filterRegionTiles(startNumber, endNumber);
      });

      container.appendChild(button);
    });
  })
  .catch((error) => console.error("Error loading JSON:", error));

//Generates the New Height of the grid based on how many pokemon in the Region
function calcCells(regionI, startNumber) {
  let newH = Math.ceil(regionI / 12);
  mapGrid(newH, 12, startNumber);
}

//creates the grid
function mapGrid(height, width, startNumber) {
  const container = document.getElementById("griding");
  container.innerHTML = ""; // Clear previous grid if any
  container.style.display = "grid";
  container.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  container.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

  let cellIndex = startNumber; // start at previous total + 1

  for (let i = 0; i < height; i++) {
    for (let q = 0; q < width; q++) {
      let tile = document.createElement("div");

      //colours the cells with border and makes it a tile
      tile.classList.add("grid-cell");

      // Left → right index
      tile.dataset.index = cellIndex;
      tile.id = cellIndex; //sets the id of the tile
      //tile.textContent = cellIndex; // makes the pokedex number visible on the tile for testing

      container.appendChild(tile);
      tile.style.backgroundImage = `url("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${cellIndex}.png")`;
      cellIndex++;
    }
  }
}

// Function to hide tiles that aren't in the region
function filterRegionTiles(start, end) {
  const tiles = document.querySelectorAll(".grid-cell"); // all tiles

  tiles.forEach(tile => {
    const index = Number(tile.dataset.index);

    if (index < start || index > end) {
      tile.remove() // hide tiles not in region
    } else {
      tile.style.display = "block"; // show tiles in region
    }
  });
}