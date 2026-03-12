//Fetches the Region Name for each thing in Regions.JSON in order to Create Buttons
let regionsData = []; // store the JSON globally


fetch("regions.json")
 .then((response) => response.json())
 .then((data) => {
   regionsData = data; // store globally for later use


   const container = document.getElementById("list");


   data.forEach((item, index) => {
     const button = document.createElement("button");
     button.classList.add("region-button");
     button.textContent = item.name;


     button.addEventListener("click", () => {
       // calculate the previous total before this region
       let prevTotal = 0;
       for (let i = 0; i < index; i++) {
         prevTotal += Number(regionsData[i].numbers);
       }


       // Filter the tiles so only this region is visible
       let startNumber = prevTotal + 1;
       let endNumber = prevTotal + Number(item.numbers);
       

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
 let newH = Math.ceil(regionI / 9);
 mapGrid(newH, 9, startNumber);
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

     
async function getPokemonName(pokedexNumber) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexNumber}/`);
  const data = await response.json();
  return data.name;
}

// inside your mapGrid loop
tile.addEventListener("click", async () => {
  const pokedexNumber = tile.dataset.index;
  const name = await getPokemonName(pokedexNumber);
  const cry = new Audio(`https://play.pokemonshowdown.com/audio/cries/${name}.mp3`);
  cry.play();
});

     
     // Create the image element
     let img = document.createElement("img");
     img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${cellIndex}.png`;
     img.alt = `Pokemon ${cellIndex}`;

     // Make sure the image fits inside the tile
     img.style.width = "100%";
     img.style.height = "100%";
     img.style.objectFit = "contain";


     tile.appendChild(img); // <--- THIS LINE ADDS THE IMAGE TO THE TILE


     cellIndex++;
   }
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
const links = document.querySelectorAll(".sidebar a");
let isSidebarOpen = false;
let productsInCart = [];
let cartList = [];

// Event listener to handle clicking the menu icon
menuIcon.addEventListener("click", () => {
  // Toggle the 'open' class for all screen sizes
  sidebar.classList.toggle("open");
  isSidebarOpen = !isSidebarOpen;
});

// Function to close the sidebar and navigate to a page
function selectPage(event) {
  event.preventDefault(); // Prevent the default link navigation to ensure the sidebar closes first
  const targetUrl = event.target.getAttribute("href"); // Get the target URL from the clicked link

  // Close the sidebar with a smooth transition
  if (window.innerWidth <= 768) {
    sidebar.classList.remove("open"); // Close the sidebar on mobile
  } else {
    sidebar.style.left = "-200px"; // Close the sidebar on desktop
  }

  // Wait for the transition to complete before navigating
  setTimeout(() => {
    window.location.href = targetUrl; // Navigate to the new page after the sidebar closes
  }, 500); // Delay matches the CSS transition time (0.5s)
}

// Add event listeners to all sidebar links
links.forEach((link) => {
  link.addEventListener("click", selectPage);
});
