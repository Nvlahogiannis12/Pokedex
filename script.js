let shinyToggle = false;
let highClassFilter = false;
let currentRegionStart = null;
let currentRegionCount = null;
let MegaGraph = false;
let GigantamaxGraph = false;
let megaList = [];
let gigantamaxList = [];
let formData = [];
const shine = new Audio("audio/Shiny.mp3");
const newShine = new Audio("audio/New_Shiny.mp3");

// Store regions globally
let regionsData = [];

fetching();

function fetching() {
  Promise.all([
    fetch("regions.json").then(res => res.json()),
    fetch("altForms.json").then(res => res.json())
  ])
  .then(([regions, altForms]) => {

    regionsData = regions;
    formData = altForms;

    // Prepare Mega/Gigantamax lists
    megaList = Object.entries(formData.Mega).map(([name, id]) => ({
      name,
      id: Number(id)
    }));

    gigantamaxList = Object.entries(formData.Gmax).map(([name, id]) => ({
      name,
      id: Number(id)
    }));

    const container = document.getElementById("list");
    container.innerHTML = "<h2>Regions</h2>";

    // Region buttons
    regions.forEach((item, index) => {
      const button = document.createElement("button");
      button.classList.add("region-button");
      button.textContent = item.name;

      button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        clickGeneration(index, item, "Normal");
      });

      container.appendChild(button);
    });

    // Sidebar & overlay logic
    const menuIcon = document.getElementById("menuIcon");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("pageOverlay");
    const openPokedexButton = document.getElementById("openPokedexButton");
    const howToMenu = document.getElementById("howToMenu");
    const filterSettings = document.getElementById("filterSettings");

    // Overlay Click (Close Everything)
overlay.addEventListener("click", () => {
  setSidebarOpen(false);
  howToMenu.classList.add("d-none");
  filterSettings.classList.add("d-none");
  updateOverlay();
});

    let isSidebarOpen = false;

    // Sidebar Open / Close
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

    // Menu Icon Click
    menuIcon.addEventListener("click", () => {
      filterSettings.classList.add("d-none");
      howToMenu.classList.add("d-none");
      setSidebarOpen(!isSidebarOpen);
    });

    // Overlay Click (Close Everything)
    overlay.addEventListener("click", () => {
      setSidebarOpen(false);
      howToMenu.classList.add("d-none");
      filterSettings.classList.add("d-none");
    });

    // Open Pokedex Button
    if (openPokedexButton) {
      openPokedexButton.addEventListener("click", () => {
        setSidebarOpen(true);
      });
    }

    // Filter toggles update current grid (Mega/Gmax or normal)
    window.toggleFilter = function(filterType) {
      if (filterType === "Shiny") shinyToggle = !shinyToggle;
      else if (filterType === "Enhanced") highClassFilter = !highClassFilter;

      // rebuild current grid
      if (currentRegionStart !== null) {
        calcCells(currentRegionCount, currentRegionStart);
      }
      // rebuild Mega/Gmax grid if showing
      else if (MegaGraph) calcCells(megaList.length, 0);
      else if (GigantamaxGraph) calcCells(gigantamaxList.length, 0);
    };

  function updateOverlay() {
  const isOpen =
    !filterSettings.classList.contains("d-none") ||
    !howToMenu.classList.contains("d-none");

  overlay.classList.toggle("visible", isOpen);
  overlay.classList.toggle("hidden", !isOpen);
}

    // Filter Menu Toggle
    window.menuToggleFilt = function() {
  howToMenu.classList.add("d-none");

  filterSettings.classList.toggle("d-none");
 setSidebarOpen(false); 
  updateOverlay();
};

window.menuToggleHowTo = function() {
  filterSettings.classList.add("d-none");

  howToMenu.classList.toggle("d-none");
 setSidebarOpen(false); 
  updateOverlay();
};



  })
  .catch(error => console.error("Error loading JSON:", error));
}


// Handles clicking Regions / Mega / Gigantamax
function clickGeneration(index, item, Type) {
  // Hide the instructions whenever any grid loads
  const instructions = document.getElementById("instructions");
  if (instructions) instructions.classList.add("d-none");

  // Reset special form flags for normal regions
  if (Type === "Normal") {
    MegaGraph = false;
    GigantamaxGraph = false;

    // Calculate the start number based on previous regions
    let prevTotal = 0;
    for (let i = 0; i < index; i++) {
      prevTotal += Number(regionsData[i].numbers);
    }
    const startNumber = prevTotal + 1;
    const endNumber = prevTotal + Number(item.numbers);

    currentRegionStart = startNumber;
    currentRegionCount = Number(item.numbers);

    // Build the grid
    calcCells(currentRegionCount, currentRegionStart);
    filterRegionTiles(startNumber, endNumber);
  }

  // Load Mega Pokémon
  else if (Type === "Mega") {
    MegaGraph = true;
    GigantamaxGraph = false;
    currentRegionStart = 0;
    currentRegionCount = megaList.length;

    calcCells(currentRegionCount, currentRegionStart);
  }

  // Load Gigantamax Pokémon
  else if (Type === "Gigantamax") {
    GigantamaxGraph = true;
    MegaGraph = false;
    currentRegionStart = 0;
    currentRegionCount = gigantamaxList.length;

    calcCells(currentRegionCount, currentRegionStart);
  }

  // Close the sidebar automatically if it's open
  if (sidebar && sidebar.classList.contains("open")) {
    setSidebarOpen(false);
  }
}



// Generates the new grid height based on number of Pokémon
function calcCells(regionI, startNumber) {
  const screenWidth = window.innerWidth;
  const width = screenWidth < 768 ? 5 : 9;

  if (MegaGraph) {
    let newH = Math.ceil(megaList.length / width);
    mapGrid(newH, width, 0, megaList.length);
    return;
  }

  if (GigantamaxGraph) {
    let newH = Math.ceil(gigantamaxList.length / width);
    mapGrid(newH, width, 0, gigantamaxList.length);
    return;
  }

  let newH = Math.ceil(regionI / width);
  mapGrid(newH, width, startNumber, regionI);
}


// Creates the grid
function mapGrid(height, width, startNumber, totalCount) {
  const container = document.getElementById("griding");
  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  container.style.gridTemplateColumns = `repeat(${width}, 1fr)`;

  let createdCount = 0;

  for (let i = 0; i < height; i++) {
    for (let q = 0; q < width; q++) {
      if (createdCount >= totalCount) break;

      let tile = document.createElement("div");
      tile.classList.add("grid-cell");

      let pokeID;

      if (MegaGraph) pokeID = megaList[createdCount].id;
      else if (GigantamaxGraph) pokeID = gigantamaxList[createdCount].id;
      else pokeID = startNumber + createdCount;

      tile.dataset.index = pokeID;
      tile.id = pokeID;
      container.appendChild(tile);

      createdCount++;

      // Pokémon Cries
      tile.addEventListener("click", async () => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeID}/`);
        const data = await response.json();
        
        let safeNames = ["ho-oh", "porygon-z", "type-null", "jangmo-o", "hakamo-o", "kommo-o", "tapu-koko", "tapu-lele", "tapu-bulu", "tapu-fini", "wo-chien", "chien-pao", "ting-lu", "chi-yu",];

        if (safeNames.includes(data.name)) {
          data.name = data.name.replace("-", "");
        } else if (data.name.includes("-")) {
          data.name = data.name.substring(0, data.name.indexOf('-'));
        }

        const cry = new Audio(`https://play.pokemonshowdown.com/audio/cries/${data.name}.mp3`);
        cry.play();

        if (shinyToggle && highClassFilter) setTimeout(() => newShine.play(), 1500);
        else if (shinyToggle) setTimeout(() => shine.play(), 1500);
      });

      // Pokémon Image
      let img = document.createElement("img");

      if (shinyToggle && highClassFilter) img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokeID}.png`;
      else if (highClassFilter) img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeID}.png`;
      else if (shinyToggle) img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokeID}.png`;
      else img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeID}.png`;

      img.onerror = function () {
  this.onerror = null;
  this.src = "imgs/TransparentPokeball.png";
  };

      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";

      tile.appendChild(img);
    }
    if (createdCount >= totalCount) break;
  }
}


// Filters the grid to show only Pokémon in the region
function filterRegionTiles(start, end) {
  const tiles = document.querySelectorAll(".grid-cell");

  tiles.forEach((tile) => {
    const index = Number(tile.dataset.index);
    if (index < start || index > end) tile.remove();
    else tile.style.display = "block";
  });
}


// Special Evolution Viewer
function SpecialEvo(evoType) {
  if (evoType === "Mega") {
    MegaGraph = true;
    GigantamaxGraph = false;
    currentRegionStart = null;
    currentRegionCount = null;
    calcCells(megaList.length, 0);
  } else if (evoType === "Gigantamax") {
    GigantamaxGraph = true;
    MegaGraph = false;
    currentRegionStart = null;
    currentRegionCount = null;
    calcCells(gigantamaxList.length, 0);
  }
}

//Back To Top
document.addEventListener("DOMContentLoaded", function () {
  const backToTopBtn = document.getElementById("backToTopBtn");

  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 50) {
      backToTopBtn.classList.add("show");
    } else {
      backToTopBtn.classList.remove("show");
    }
  });

  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});