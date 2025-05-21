import { ethers } from 'ethers';
import ArcadeHubABI from '../abis/ArcadeHub.json'; // Your ArcadeHub contract ABI
import ArcadeNFTABI from '../abis/ArcadeNFT.json'; // Your NFT contract ABI
import ARCTokenABI from '../abis/ARCToken.json'; // Your ERC20 token ABI
import { CONTRACT_ADDRESSES } from '../config';

export const getArcadeHubContract = (signer: ethers.Signer) => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.arcadeHub,
      ArcadeHubABI,
      signer
    );
    return contract;
  } catch (error) {
    console.error("Failed to create ArcadeHub contract:", error);
    throw new Error("Failed to initialize contract");
  }
};

export const getArcadeNFTContract = (signer: ethers.Signer) => {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.arcadeNFT,
    ArcadeNFTABI, // Your NFT contract ABI
    signer
  );
};

export const getARCTokenContract = (signer: ethers.Signer) => {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.arcToken,
    ARCTokenABI, // Your ERC20 token ABI
    signer
  );
};


export const claimPayout = async (signer: ethers.Signer) => {
  const contract = getArcadeHubContract(signer);
  const tx = await contract.claimPayout();
  return tx.wait();
};

export const mintNFT = async (signer: ethers.Signer, to: string, uri: string) => {
  const contract = getArcadeNFTContract(signer);
  const tx = await contract.mint(to, uri);
  return tx.wait();
};


export const approveArcToken = async (
  signer: ethers.Signer,
  spender: string,
  amount: string
) => {
  const contract = getARCTokenContract(signer);
  const tx = await contract.approve(
    spender,
    ethers.parseEther(amount)
  );
  return tx.wait();
};
