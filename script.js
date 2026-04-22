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
    fetch("regions.json").then((res) => res.json()),
    fetch("altForms.json").then((res) => res.json()),
  ])
    .then(([regions, altForms]) => {
      regionsData = regions;
      formData = altForms;

      // Prepare Mega/Gigantamax lists
      megaList = Object.entries(formData.Mega).map(([name, id]) => ({
        name,
        id: Number(id),
      }));

      gigantamaxList = Object.entries(formData.Gmax).map(([name, id]) => ({
        name,
        id: Number(id),
      }));

      const container = document.getElementById("list");
      container.innerHTML = "<h2>Regions</h2>";

      // Region buttons
      regions.forEach((item, index) => {
        const button = document.createElement("button");
        button.classList.add("region-button");
        button.textContent = item.name;

        button.addEventListener("click", () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
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
      window.toggleFilter = function (filterType) {
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
      window.menuToggleFilt = function () {
        howToMenu.classList.add("d-none");

        filterSettings.classList.toggle("d-none");
        setSidebarOpen(false);
        updateOverlay();
      };

      window.menuToggleHowTo = function () {
        filterSettings.classList.add("d-none");

        howToMenu.classList.toggle("d-none");
        setSidebarOpen(false);
        updateOverlay();
      };
    })
    .catch((error) => console.error("Error loading JSON:", error));
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
      tile.setAttribute("data-bs-toggle", "modal");
      tile.setAttribute("data-bs-target", "#staticBackdrop");

      container.appendChild(tile);

      createdCount++;

      // Pokémon Cries
      tile.addEventListener("click", async () => {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokeID}/`,
        );
        const data = await response.json();

        // Get species data for genus/category
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();

        let safeNames = [
          "ho-oh",
          "porygon-z",
          "type-null",
          "jangmo-o",
          "hakamo-o",
          "kommo-o",
          "tapu-koko",
          "tapu-lele",
          "tapu-bulu",
          "tapu-fini",
          "wo-chien",
          "chien-pao",
          "ting-lu",
          "chi-yu",
          "great-tusk",
          "scream-tail",
          "brute-bonnet",
          "flutter-mane",
          "slither-wing",
          "sandy-shocks",
          "roaring-moon",
          "iron-valiant",
          "iron-treads",
          "iron-bundle",
          "iron-hands",
          "iron-jugulis",
          "iron-moth",
          "iron-thorns",
          "walking-wake",
          "iron-leaves",
          "iron-boulder",
          "iron-crown",
          "gouging-fire",
          "raging-bolt",
        ];
        function formatName(name) {
          // 1. Special mega / gmax / primal cases first
          if (name.includes("-mega-y")) {
            return name.replace("-mega-y", "-megay");
          }

          if (name.includes("-mega-x")) {
            return name.replace("-mega-x", "-megax");
          }

          if (name.includes("-mega-z")) {
            return name.replace("-mega-z", "-megaz");
          }

          if (
            name.includes("-mega") ||
            name.includes("-gmax") ||
            name.includes("-primal") ||
            name.includes("-eternamax")
          ) {
            return name;
          }

          // 2. safeNames rule (remove hyphen entirely)
          if (safeNames.includes(name)) {
            return name.replace(/-/g, "");
          }

          // 3. default rule: cut at first hyphen for all other names
          if (name.includes("-")) {
            return name.substring(0, name.indexOf("-"));
          }

          return name;
        }
        data.name = formatName(data.name);

        const cry = new Audio(data.cries.latest);
        cry.play();

        if (shinyToggle && highClassFilter)
          setTimeout(() => newShine.play(), 1500);
        else if (shinyToggle) setTimeout(() => shine.play(), 1500);

        //name display
        // Determine filtered image
        let displayImg;
        let fallbackImg;

        if (shinyToggle) {
          displayImg = `https://play.pokemonshowdown.com/sprites/ani-shiny/${data.name}.gif`;
          fallbackImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${data.id}.png`;
        } else {
          displayImg = `https://play.pokemonshowdown.com/sprites/ani/${data.name}.gif`;
          fallbackImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
        }

        let displayName =
          data.name.charAt(0).toUpperCase() + data.name.slice(1);
        formatDisplayName(data.name);

        function formatDisplayName(name) {
          const displayNameMap = {
            "mr-mime": "Mr. Mime",
            "mr-rime": "Mr. Rime",
            "mime-jr": "Mime Jr.",
            "type-null": "Type: Null",
            "porygon-z": "Porygon2",
            "nidoran-m": "Nidoran♂",
            "nidoran-f": "Nidoran♀",
            "farfetch-d": "Farfetch'd",
            "ho-oh": "Ho-Oh",
            "jangmo-o": "Jangmo-o",
            "hakamo-o": "Hakamo-o",
            "kommo-o": "Kommo-o",
            "tapu-koko": "Tapu Koko",
            "tapu-lele": "Tapu Lele",
            "tapu-bulu": "Tapu Bulu",
            "tapu-fini": "Tapu Fini",
            "wo-chien": "Wo-Chien",
            "chien-pao": "Chien-Pao",
            "ting-lu": "Ting-Lu",
            "chi-yu": "Chi-Yu",
            "great-tusk": "Great Tusk",
            "scream-tail": "Scream Tail",
            "brute-bonnet": "Brute Bonnet",
            "flutter-mane": "Flutter Mane",
            "slither-wing": "Slither Wing",
            "sandy-shocks": "Sandy Shocks",
            "roaring-moon": "Roaring Moon",
            "iron-valiant": "Iron Valiant",
            "iron-treads": "Iron Treads",
            "iron-bundle": "Iron Bundle",
            "iron-hands": "Iron Hands",
            "iron-jugulis": "Iron Jugulis",
            "iron-moth": "Iron Moth",
            "iron-thorns": "Iron Thorns",
            "walking-wake": "Walking Wake",
            "iron-leaves": "Iron Leaves",
            "iron-boulder": "Iron Boulder",
            "iron-crown": "Iron Crown",
            "gouging-fire": "Gouging Fire",
            "raging-bolt": "Raging Bolt",
          };

          // Check display name map first
          if (displayNameMap[name]) {
            displayName = displayNameMap[name];
            return;
          }

          if (name.includes("gmax")) {
            name = name.replace("-gmax", "");
            displayName =
              "Gigantamax " + name.charAt(0).toUpperCase() + name.slice(1);
          }
          if (name.includes("eternamax")) {
            name = name.replace("-eternamax", "");
            displayName =
              "Eternamax " + name.charAt(0).toUpperCase() + name.slice(1);
          }

          if (name.includes("-megax")) {
            name = name.replace("-megax", "");
            displayName =
              "Mega " + name.charAt(0).toUpperCase() + name.slice(1) + " X";
          }

          if (name.includes("-megay")) {
            name = name.replace("-megay", "");
            displayName =
              "Mega " + name.charAt(0).toUpperCase() + name.slice(1) + " Y";
          }
          if (name.includes("-megaz")) {
            name = name.replace("-megaz", "");
            displayName =
              "Mega " + name.charAt(0).toUpperCase() + name.slice(1) + " Z";
          }
          if (name.includes("mega")) {
            name = name.replace("-mega", "");
            displayName =
              "Mega " + name.charAt(0).toUpperCase() + name.slice(1);
          }
          if (name.includes("primal")) {
            name = name.replace("-primal", "");
            displayName =
              "Primal " + name.charAt(0).toUpperCase() + name.slice(1);
          }

          // alert(displayName);
        }
        

        //Detects Forms and adds them to an array to be displayed in the modal
let forms = [];
detectForms(displayName);

function detectForms(baseName) {
  forms = [];
  
  forms.push({ 
    type: "Base Form",
    name: `${baseName}` ,
    img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`
  });
  // Check for Mega Evolution
  const megaKey = `Mega ${baseName}`;
  if (formData.Mega && formData.Mega[megaKey]) {
    forms.push({
      type: "Mega Evolution",
      name: megaKey,
      img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formData.Mega[megaKey]}.png`,
    });
  }
  
  // Check for Gigantamax
  const gmaxKey = `Gigantamax ${baseName}`;
  if (formData.Gmax && formData.Gmax[gmaxKey]) {
    forms.push({
      type: "Gigantamax",
      name: gmaxKey,
      img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${formData.Gmax[gmaxKey]}.png`,
    });
  }
  
  // Check for misc forms (e.g., regional variants)
  if (formData.miscForms) {
    Object.entries(formData.miscForms).forEach(([key, id]) => {
      if (key.toLowerCase().includes(data.name.toLowerCase())) {
        forms.push({
          type: "Special Form",
          name: key,
          img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        });
      }
    });
  }
  
}

        const categoryObj = speciesData.genera.find(
          (item) => item.language.name === "en",
        );
        const category = categoryObj ? categoryObj.genus : "Unknown";

        // Modal Display
        document.getElementById("modal").innerHTML = `
<div class="modal-content">
  <div class="modal-header">
    <h1 class="modal-title fs-5" id="exampleModalLabel">
      #${pokeID} - ${displayName}
    </h1>
    <p class="pokemonCategory">${category}</p>
    <div class="typeContainer">
      ${data.types
        .map(
          (typeInfo) =>
            `<p class="${typeInfo.type.name}">${typeInfo.type.name}</p>`,
        )
        .join("")}
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
  </div>

  <div class="modal-body">
    <div class="dataNameImgContainer">
      <img 
        class="dataNameImg" 
        src="${displayImg}"
        onerror="this.src='${fallbackImg}'"
      >
    </div>
    
    ${forms.length > 0 ? `
      <div id="formsSection" class="${forms.length === 1 ? 'd-none' : ''} formsSection">
        <div class="formsContainer">
          ${forms.map(form => `
            <div style="text-align: center;">
              <img src="${form.img}" alt="${form.name}" style="width: 65px; height: 65px; object-fit: contain;" onerror="this.style.display='none'">
              <p style="font-size: 12px; margin: 5px 0;">${form.name}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  </div>

  <div class="modal-footer">
    <button type="button" class="btn-modalclose" data-bs-dismiss="modal">
      Close
    </button>
  </div>
</div>`;


        // Add click event listener for the image to play cry
        const imgElement = document.querySelector(".dataNameImg");
        if (imgElement) {
          imgElement.addEventListener("click", () => cry.play());
        }

        const modal = new bootstrap.Modal(
          document.getElementById("exampleModal"),
        );
        modal.show();
      });
      // Pokémon Image & Try again if its an error

      let img = document.createElement("img");
      img.onerror = function () {
        if (!this.dataset.retry) {
          this.dataset.retry = "1";
          this.src = this.src + "?retry=" + Date.now();
        } else {
          this.src = "imgs/TransparentPokeball.png";
        }
      };

      if (shinyToggle && highClassFilter)
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokeID}.png`;
      else if (highClassFilter)
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeID}.png`;
      else if (shinyToggle)
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokeID}.png`;
      else
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeID}.png`;

      setTimeout(() => {
        img.src = url;
      }, createdCount * 5);

      img.setAttribute("onerror", "this.src='imgs/TransparentPokeball.png'");

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
