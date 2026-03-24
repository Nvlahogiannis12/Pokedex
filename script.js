let shinyToggle = false;
let highClassFilter = false;
let currentRegionStart = null;
let currentRegionCount = null;

const shine = new Audio("audio/Shiny.mp3");
const newShine = new Audio("audio/New_Shiny.mp3");

//Fetches the Region Name for each thing in Regions.JSON in order to Create Buttons
let regionsData = []; // store the JSON globally
fetchin();
function fetchin(){
fetch("regions.json")
  .then((response) => response.json())
  .then((data) => {
    regionsData = data; // store globally for later use

    const container = document.getElementById("list");
    container.innerHTML = "<h2>Regions</h2>"
    data.forEach((item, index) => {
      const button = document.createElement("button");
      button.classList.add("region-button");
      button.textContent = item.name;

      button.addEventListener("click", () => {
        // calculate the previous total before this region
        document.getElementById("instructions").classList.add("d-none");
        let prevTotal = 0;
        for (let i = 0; i < index; i++) {
          prevTotal += Number(regionsData[i].numbers);
        }

        // Filter the tiles so only this region is visible
        let startNumber = prevTotal + 1;
        let endNumber = prevTotal + Number(item.numbers);
        currentRegionStart = prevTotal + 1;
        currentRegionCount = Number(item.numbers);

        calcCells(currentRegionCount, currentRegionStart);
        filterRegionTiles(startNumber, endNumber);

        // Close the sidebar menu after selecting a region
        if (sidebar.classList.contains("open")) {
          setSidebarOpen(false);
        }
      });
      container.appendChild(button);
    });
  })
  .catch((error) => console.error("Error loading JSON:", error));
}
//Generates the New Height of the grid based on how many pokemon in the Region
function calcCells(regionI, startNumber) {
   const screenWidth = window.innerWidth;

  if (screenWidth < 768) {
    let newH = Math.ceil(regionI / 5);
    mapGrid(newH, 5, startNumber, regionI);
  } else {
    let newH = Math.ceil(regionI / 9);
    mapGrid(newH, 9, startNumber, regionI);
  }
}

//creates the grid
function mapGrid(height, width, startNumber, totalCount = height * width) {
  const container = document.getElementById("griding");
  container.innerHTML = ""; // Clear previous grid if any
  container.style.display = "grid";
  container.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  container.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

  let cellIndex = startNumber; // start at previous total + 1
  let createdCount = 0;

  for (let i = 0; i < height; i++) {
    for (let q = 0; q < width; q++) {
      if (createdCount >= totalCount) break;

      let tile = document.createElement("div");

      //colours the cells with border and makes it a tile
      tile.classList.add("grid-cell");

      // Left → right index
      tile.dataset.index = cellIndex;
      tile.id = cellIndex; //sets the id of the tile
      //tile.textContent = cellIndex; // makes the pokedex number visible on the tile for testing

      container.appendChild(tile);
      createdCount++;

      async function getPokemonName(pokedexNumber) {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokedexNumber}/`,
        );
        const data = await response.json();
        return data.name;
      }
      //POKEMON CRIES
      // inside your mapGrid loop
      tile.addEventListener("click", async () => {
  const pokedexNumber = tile.dataset.index;
  const name = await getPokemonName(pokedexNumber);

  const cry = new Audio(
    `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`
  );

  cry.play(); // ALWAYS play cry

  if (shinyToggle && highClassFilter) {
    setTimeout(() => {
      newShine.play();
    }, 1500);

  } else if (shinyToggle) {
    setTimeout(() => {
      shine.play();
    }, 1500);
  }
});

      // Create the image element
      let img = document.createElement("img");
      if (shinyToggle == true && highClassFilter == true){
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${cellIndex}.png`;
      } else if(highClassFilter == true){
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${cellIndex}.png`;
      } else if (shinyToggle == true){
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${cellIndex}.png`;
      } else {
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${cellIndex}.png`;
      }
      img.alt = `Pokemon ${cellIndex}`;

      // Make sure the image fits inside the tile
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";

      tile.appendChild(img); // <--- THIS LINE ADDS THE IMAGE TO THE TILE

      cellIndex++;
    }
    if (createdCount >= totalCount) break;
  }
}

// Function to hide tiles that aren't in the region
function filterRegionTiles(start, end) {
  const tiles = document.querySelectorAll(".grid-cell"); // all tiles

  tiles.forEach((tile) => {
    const index = Number(tile.dataset.index);

    if (index < start || index > end) {
      tile.remove(); // hide tiles not in region
    } else {
      tile.style.display = "block"; // show tiles in region
    }
  });
}

// Grab elements
const menuIcon = document.getElementById("menuIcon");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("pageOverlay");
const links = document.querySelectorAll(".sidebar a");
let isSidebarOpen = false;
let productsInCart = [];
let cartList = [];

function setSidebarOpen(open) {
  if (open) {
    sidebar.classList.add("open");
    overlay.classList.remove("hidden");
    overlay.classList.add("visible");
  } else {
    sidebar.classList.remove("open");
    overlay.classList.remove("visible");
    overlay.classList.add("hidden");
  }
  isSidebarOpen = open;
}

// Event listener to handle clicking the menu icon
menuIcon.addEventListener("click", () => {
  const filterSettings = document.getElementById("filterSettings");
  filterSettings.classList.add("d-none");
  setSidebarOpen(!isSidebarOpen);
});

overlay.addEventListener("click", () => {
  setSidebarOpen(false);
});

// Open Pokedex button opens region sidebar
const openPokedexButton = document.getElementById("openPokedexButton");
if (openPokedexButton) {
  openPokedexButton.addEventListener("click", () => {
    setSidebarOpen(true);
  });
}

// Function to close the sidebar and navigate to a page
function selectPage(event) {
  event.preventDefault(); // Prevent the default link navigation to ensure the sidebar closes first
  const targetUrl = event.target.getAttribute("href"); // Get the target URL from the clicked link

  // Close the sidebar with a smooth transition
  setSidebarOpen(false);

  // Wait for the transition to complete before navigating
  setTimeout(() => {
    window.location.href = targetUrl; // Navigate to the new page after the sidebar closes
  }, 500); // Delay matches the CSS transition time (0.5s)
}

// Add event listeners to all sidebar links
links.forEach((link) => {
  link.addEventListener("click", selectPage);
});

//FILTER TOGGLE STUFF
function toggleFilter(filterType) {
  if (filterType === "Shiny") {
    shinyToggle = !shinyToggle;
  } else if (filterType === "Enhanced") {
    highClassFilter = !highClassFilter;
  }

  // ✅ rebuild ONLY grid (not whole JSON + buttons)
  if (currentRegionStart !== null) {
    calcCells(currentRegionCount, currentRegionStart);
  }
}

function menuToggleFilt(){
  const filterSettings = document.getElementById("filterSettings");
  const isHidden = filterSettings.classList.contains("d-none");
  filterSettings.classList.toggle("d-none");

  // If filter settings are now visible, close the sidebar and overlay
  if (!isHidden) {
    return;
  }

  // If we're opening filter settings, hide sidebar and overlay.
  setSidebarOpen(false);
}