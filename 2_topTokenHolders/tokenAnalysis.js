import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { configDotenv } from "dotenv";

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
    limit: 100,
  });

  const {result:transfers}=response.toJSON()

  transfers.map((tx)=>{
    console.log(tx)
    if(tx.to_address!=address){
        if(walletTransfers[tx.to_address]){
            walletTransfers[tx.to_address].received+=1,
            walletTransfers[tx.to_address].total+=1
        }else{
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

  console.log(walletTransfers)
  const topWallets = Object.entries(walletTransfers)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 5);

    console.log(topWallets)
};

fetchTokenTransfers();
