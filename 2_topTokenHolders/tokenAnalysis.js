const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");

const fetchTokenTransfers = async () => {
  await Moralis.start({
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjAxMDU5M2E1LTdmNTktNGVjNS1hNGY1LThlNGJlMzdmYzk0MyIsIm9yZ0lkIjoiMzkwMjQyIiwidXNlcklkIjoiNDAwOTk1IiwidHlwZUlkIjoiYjQ5ZjJiNjUtN2ZkNy00MTk0LTkzZmMtOTE2ZGE1YTFmYjRmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTQ0NTgzOTIsImV4cCI6NDg3MDIxODM5Mn0.KKAvSDa4yZBgqe0IGCf1etRRQbnzn1HC2WPpCQHuJJM",
  });

  const address = "0x7C58D971A5dAbd46BC85e81fDAE87b511431452E";
  const walletTransfers={}

  const chain = EvmChain.POLYGON;
  const response = await Moralis.EvmApi.token.getTokenTransfers({
    address,
    chain,
    limit: 10,
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

};

fetchTokenTransfers();
