import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { configDotenv } from "dotenv";

// Load .env file
configDotenv()

const fetchTokenTransfers = async () => {
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
  });

  const address = "0x7C58D971A5dAbd46BC85e81fDAE87b511431452E";
  const walletTransfers={}

  const chain = EvmChain.POLYGON;
  const response = await Moralis.EvmApi.token.getTokenTransfers({
    address,
    chain,
    limit: 100,  //Basic tier has 100 limit
  });

//   Extract results
  const {result:transfers}=response.toJSON()

//   Loop and store in an object as mapping, for easier access
  transfers.map((tx)=>{
    if(tx.to_address!=address){
        if(walletTransfers[tx.to_address]){
            walletTransfers[tx.to_address].received+=1,
            walletTransfers[tx.to_address].total+=1
        }else{

            // for new entry
            walletTransfers[tx.to_address]={received:1,sent:0,total:1}
        }
        
    }
    
    if(tx.from_address!=address){
        if(walletTransfers[tx.from_address]){
            walletTransfers[tx.from_address].sent+=1,
            walletTransfers[tx.from_address].total+=1
        }else{
            walletTransfers[tx.from_address]={received:0,sent:1,total:1}
        }
    }
  })

//   Sort in descending order and slice the first 5
  const topWallets = Object.entries(walletTransfers)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 5);

    console.log(topWallets)
};

fetchTokenTransfers();
