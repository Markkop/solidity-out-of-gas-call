import { ethers } from "hardhat";

export async function deployContract(contractName: string) {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  await contract.deployed();
  console.log(`${contractName} deployed to:`, contract.address);
  return contract;
}
