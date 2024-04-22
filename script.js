const pokedexUrl = 'https://pokeapi.co/api/v2/pokemon';
const caughtPokemonList = document.querySelector('.caught-pokemon-list');
const pokemonList = document.querySelector('.pokemon-list');
const loadMoreButton = document.querySelector('.load-more');
let offset = 0;
let caughtPokemon = [];
function parseUrl(url) {
  return url.substring(url.substring(0, url.length - 2).lastIndexOf('/') + 1, url.length - 1);
}
async function fetchPokemon(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
function displayPokemonDetails(pokemonCard, url) {
  console.log('Fetching details for:', url);
  getPokemonDetails(url);
  const allPokemonCards = document.querySelectorAll('.pokemon-card');
  allPokemonCards.forEach(card => card.classList.remove('selected'));
  pokemonCard.classList.add('selected');
}
function handleCatchRelease(pokemonCard, pokeData) {
  pokemonCard.addEventListener('click', () => {
    const isCaught = pokemonCard.classList.contains('caught');
    if (!isCaught) {
      manageCaughtPokemon(pokeData, 'catch');
      pokemonCard.classList.add('caught');
    } else {
      manageCaughtPokemon(pokeData, 'release');
      pokemonCard.classList.remove('caught');
    }
  });
}
function displayPokemonList(pokemon) {
  pokemon.forEach(pokeData => {
    const pokemonCard = document.createElement('div');
    pokemonCard.className = 'pokemon-card';
    pokemonCard.dataset.url = pokeData.url;
    if (caughtPokemon.find(pokemon => pokemon.url === pokeData.url)) {
      pokemonCard.classList.add('caught');
    }
    pokemonCard.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${parseUrl(pokeData.url)}.png" alt="${pokeData.name}">
      <p>${pokeData.name}</p>`;
    pokemonCard.addEventListener('click', () => {
      displayPokemonDetails(pokemonCard, pokeData.url);
      handleCatchRelease(pokemonCard, pokeData);
    });
    pokemonList.appendChild(pokemonCard);
  });
}
async function getPokemonDetails(url) {
  const pokemonData = await fetchPokemon(url);
  const detailsSection = document.querySelector('.pokemon-details');
  detailsSection.innerHTML = `
    <h2>${pokemonData.name}</h2>
    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${parseUrl(pokemonData.url)}.png" alt="${pokemonData.name}">
    <p><strong>Abilities:</strong> ${pokemonData.abilities.map(ability => ability.ability.name).join(', ')}</p>
    <p><strong>Types:</strong> ${pokemonData.types.map(type => type.type.name).join(', ')}</p>
    `;
}
async function loadMorePokemon() {
  offset += 20;
  const nextUrl = `${pokedexUrl}?offset=${offset}&limit=20`;
  const data = await fetchPokemon(nextUrl);
  displayPokemonList(data.results);
}
function manageCaughtPokemon(pokemon, action) {
  const pokemonIndex = caughtPokemon.findIndex(p => p.url === pokemon.url);
  if (action === 'catch') {
    if (pokemonIndex === -1) {
      caughtPokemon.push(pokemon);
      localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
      displayCaughtPokemonList();
      markAsCaught(pokemon.url);
    }
  } else if (action === 'release') {
    if (pokemonIndex > -1) {
      caughtPokemon.splice(pokemonIndex, 1);
      localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
      displayCaughtPokemonList();
      markAsReleased(pokemon.url);
    }
  }
}
function markAsCaught(url) {
  const pokemonCards = document.querySelectorAll('.pokemon-card');
  pokemonCards.forEach(card => {
    if (card.dataset.url === url) {
      card.classList.add('caught');
    }
  });
}
function markAsReleased(url) {
  const pokemonCards = document.querySelectorAll('.pokemon-card');
  pokemonCards.forEach(card => {
    if (card.dataset.url === url) {
      card.classList.remove('caught');
    }
  });
}
function displayCaughtPokemonList() {
  caughtPokemonList.innerHTML = '';
  caughtPokemon.forEach(pokemon => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span>${pokemon.name}</span>
      <button>Release</button>`;
    listItem.querySelector('button').addEventListener('click', () => {
      manageCaughtPokemon(pokemon, 'release');
    });
    caughtPokemonList.appendChild(listItem);
  });
}
caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
displayCaughtPokemonList();
loadMoreButton.addEventListener('click', loadMorePokemon);
fetchPokemon(`${pokedexUrl}?offset=${offset}&limit=20`)
  .then(data => displayPokemonList(data.results));
