import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { configDotenv } from "dotenv";
import { NextResponse } from "next/server";
import { balanceOfABI } from "@/helpers/abi";

import { numData } from "../../../../public/global";
import { tokenContractAddress, web3 } from "@/app/constants";

// Load .env file
configDotenv()

const tokenHolders = async () => {
    if (!Moralis.Core.isStarted) {
        await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
      }

  const walletTransfers:any={}

  const chain = EvmChain.POLYGON;
  const response = await Moralis.EvmApi.token.getTokenTransfers({
    address:tokenContractAddress,
    chain,
    limit: 100,  //Basic tier has 100 limit
  });

//   Extract results
  const {result:transfers}=response.toJSON()

//   Loop and store in an object as mapping, to remove repeating addresses
  transfers.map((tx)=>{
    walletTransfers[tx.to_address]=true
    walletTransfers[tx.from_address]=true
  })

  return walletTransfers
};




export async function GET() {

    const wallets=await tokenHolders()
    
    let tokenHoldersByCountry: {[key: string]: any[]} = {};

    // Fetch balance for all wallets involved in transactions of the token
    // Create an array to hold all the promises
    const promises = Object.keys(wallets).map((wallet)=>{
        const contractMethodData = web3.eth.abi.encodeFunctionCall(balanceOfABI, [wallet]);

        return web3.eth.call({
            to: tokenContractAddress,
            data: contractMethodData
          }).then((result: string) => {
            const balance: number = Number(web3.eth.abi.decodeParameter('uint256', result));
            
            // if balance is greater than 0, assign a random country and store it
            if(balance>0){
                const country = numData[Math.floor(1+Math.random()*numData.length)].name;
                const record = {wallet:wallet,balance:balance};

                if (!tokenHoldersByCountry[country]) {
                    tokenHoldersByCountry[country] = [];
                }

                tokenHoldersByCountry[country].push(record);

            }
          }).catch((err: Error) => {
            console.error('Error: ', err);

            throw Error("error in api call, check logs")
          });
    })

    // Wait for all promises to resolve
    await Promise.all(promises);
    
    return NextResponse.json({tokenHoldersByCountry})
}
