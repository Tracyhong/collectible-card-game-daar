import { DeployFunction } from 'hardhat-deploy/types'

const deployer: DeployFunction = async hre => {
  if (hre.network.config.chainId !== 31337) return
  const { deployer } = await hre.getNamedAccounts()
  // const mainContract = await hre.deployments.deploy('Main', { from: deployer, log: true })

  const { deploy, log } = hre.deployments
  
  // Deploy the Main contract
  const mainContractDeployment = await deploy('Main', {
    from: deployer,
    log: true,
  })

  // Get an instance of the deployed contract
  const mainContract = await hre.ethers.getContractAt('Main', mainContractDeployment.address)

  // Hard code some collections
  const collections = [
    { id: 'sv7', name: "Stellar Crown", total: 175 },
    { id: 'sv6pt5', name: "Shrouded Fable", total: 99 },
    // Add more collections as needed
    
    { id: 'base1', name: "Base", total: 102 },
    { id: 'base2', name: "Jungle", total: 64 },
  ]

  // Call the contract function to create collections and one booster per collection
  for (const collection of collections) {
    await mainContract.createCollection(collection.id, collection.total)
    console.log(`contract owner is ${await mainContract.owner()}`)
    console.log(`Created collection: ${collection.name}`)
    
    const boosterName = `${collection.name} Booster`
    await mainContract.createBooster(boosterName, collection.id)
    console.log(`Created booster: ${boosterName}`)
  }
}




deployer.tags = ['Main']
export default deployer
