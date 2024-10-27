require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Check if necessary environment variables are set
if (!process.env.RPC_URL || !process.env.PRIVATE_KEY || !process.env.POKEMON_TCG_API_KEY) {
  console.error('RPC_URL, PRIVATE_KEY, and POKEMON_TCG_API_KEY must be defined');
  process.exit(1);
}

// let pokemonSets = [] // Array to store Pokémon sets
const defaultBoosters = [
    { boosterName: 'Stellar Crown Booster', setId: 'sv7', image: "https://poke-collect.com/cdn/shop/files/scbp.png?v=1722980705" },
    { boosterName: 'Shrouded Fable Booster', setId: 'sv6pt5', image: "https://toysnowman.com/cdn/shop/files/ToySnowman.com1_36d35c58-b22b-49f0-a6de-e867bda01b4e_500x500.png?v=1724428266" },
    { boosterName: 'Base Booster', setId: 'base1', image: "https://loosepacks.com/cdn/shop/files/Untitled_-_2024-06-11T141531.068_590x590.png?v=1718133341" },
    { boosterName: 'Jungle Booster', setId: 'base2', image: "https://pokemonkel.nl/wp-content/uploads/2022/08/JUNGLE-BOX-box.png" },
  ]
  app.get('/get-setId-booster/:boosterName', async (req, res) => {
    console.log('get-setId-booster')
    const boosterName = req.params.boosterName
    //get set id from default boosters 
    let setId = ''
    for (const defaultBooster of defaultBoosters) {
      if (defaultBooster.boosterName === boosterName) {
        setId = defaultBooster.setId;
        break;
      }
    }
    res.json(setId);
  });

//-------------------- Initialize Pokémon sets --------------------
async function initPokemonSets(collections) {
  const result = []
  for (const setId of collections) {
    const set = await addPokemonSet(setId);
    if(set){
      //check if set exist in result
      for (let i = 0; i < result.length; i++) {
        if (result[i].name === set.name) {
          console.log(`Set Pokémon existe déjà: ${set.name}`)
          return
        }
      }
    }
    result.push(set);
  }
  return result;
}

// async function initializePokemonSets() {
//   const defaultSets = [
//     //'sv7', 'sv6pt5',   // HARD CODED SETS
//     'swsh6', 'sm12' //, 'sm11', 'sm10', 'xy12', 'xy11', 'xy10', 'bw11', 'bw10', 'bw9', base....
//   ];
//   for (const setId of defaultSets) {
//     await addPokemonSet(setId);
//   }
// }

async function addPokemonSet(setId) {
  try {
    const response = await axios.get(
      `https://api.pokemontcg.io/v2/sets/${setId}`,
      {
        headers: {
          'X-Api-Key': process.env.POKEMON_TCG_API_KEY,
        },
      }
    )
    const set = response.data.data
    console.log('add : ' + set.name + ' ' + set.total)
    // Store the set in the array
    //check if set exist in pokemon sets
    // for (let i = 0; i < pokemonSets.length; i++) {
    //   if (pokemonSets[i].name === set.name) {
    //     console.log(`Set Pokémon existe déjà: ${set.name}`)
    //     return
    //   }
    // }
    // pokemonSets.push(set)
    console.log(`Set Pokémon ajouté : ${set.name}`)
    return set
    // await contract.createCollection(set.name, set.total);
  } catch (error) {
    console.error("Erreur lors de l'ajout du set Pokémon:", error)
  }
}

app.get('/init-pokemon-sets', async (req, res) => {
  console.log('init-pokemon-sets')
  const collections = req.query.collections.split(',')
  console.log(collections)
  try {
    const pokemonSets = await initPokemonSets(collections)
    // res.json({ success: true, message: 'Sets Pokémon initialisés avec succès' });

    res.json(pokemonSets)
  } catch (error) {
    console.error("Erreur lors de l'initialisation des sets Pokémon:", error)
    res
      .status(500)
      .json({
        success: false,
        error: "Erreur serveur lors de l'initialisation des sets Pokémon",
      })
  }
})

//-------------------- Get all cards from a set --------------------
async function getSetCards(setId) {
  try {
    const response = await axios.get(
      `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`,
      {
        headers: {
          'X-Api-Key': process.env.POKEMON_TCG_API_KEY,
        },
      }
    )
    return response.data.data
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des cartes du set Pokémon:',
      error
    )
  }
}

// Get all cards from a set
app.get('/set-cards/:setId', async (req, res) => {
  const setId = req.params.setId
  const cards = await getSetCards(setId)
  res.json(cards)
})
//-------------------- Get user cards --------------------
async function getCards(cards) {
  let result = []
  for (const cardId of cards) {
    try {
      const response = await axios.get(
        `https://api.pokemontcg.io/v2/cards/${cardId}`,
        {
          headers: {
            'X-Api-Key': process.env.POKEMON_TCG_API_KEY,
          },
        }
      )
      card = response.data.data
      console.log(`Card added : ${card}`)
      result.push(card)
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des cartes du set Pokémon:',
        error
      )
    }
  }
  return result
}

app.get('/get-cards', async (req, res) => {
  console.log('get-cards')
  const cards = req.query.cards.split(',')
  console.log(cards)
  try {
    userCards = await getCards(cards)
    res.json(userCards)
  } catch (error) {
    console.error("Erreur lors de l'initialisation des sets Pokémon:", error)
    res
      .status(500)
      .json({
        success: false,
        error: "Erreur serveur lors de l'initialisation des sets Pokémon",
      })
  }
});

//-------------------- Get booster --------------------

async function fetchDefaultBoosters(boosters) {
  let result = []
  for (const booster of boosters) {
    for (const defaultBooster of defaultBoosters) {
      if (defaultBooster.boosterName === booster) {
        result.push(defaultBooster)
      }
    }
  }
  return result
}
// Endpoint to get the default boosters
app.get('/init-pokemon-boosters', async (req, res) => {
  console.log('init-pokemon-boosters')
  const boosters = req.query.boosters.split(',')
  try {
    boostersList = await fetchDefaultBoosters(boosters)
    res.json(boostersList)
  } catch (error) {
    console.error("Erreur lors de l'initialisation des sets Pokémon:", error)
    res
      .status(500)
      .json({
        success: false,
        error: "Erreur serveur lors de l'initialisation des sets Pokémon",
      })
  }

});
//-------------------- Get booster cards --------------------

async function getBoosterCards(setId) {
  //get the 10 first cards from the set
  const cards = await getSetCards(setId);
  // console.log(cards)
  const result = []
  for (let i = 0; i < 5; i++) {
    result.push(cards[i])
  }
  return result;
}
// Endpoint to get the default boosters
app.get('/get-booster-cards/:boosterName', async (req, res) => {
  console.log('get-booster-cards')
  const boosterName = req.params.boosterName
  console.log(boosterName)
  //get set id from default boosters 
  let setId = ''
  for (const defaultBooster of defaultBoosters) {
    if (defaultBooster.boosterName === boosterName) {
      setId = defaultBooster.setId;
      console.log(setId)
      break;
    }
  }
  const cards = await getBoosterCards(setId);
  res.json(cards);

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

