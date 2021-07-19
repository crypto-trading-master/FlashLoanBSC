require("dotenv").config();
const { ChainId: pancakeChainId, TokenAmount, Fetcher } = require('@pancakeswap/sdk');
const { ChainId: sushiChainId, Token, Pair } = require('@sushiswap/sdk');
//const { Sushi_ChainID, Sushi_TokenAmount, Sushi_Fetcher } = require('@sushiswap/sdk');
const Web3 = require("web3");
const { mainnet: addresses } = require("./addresses");

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://bsc-ws-node.nariox.org:443'));

const AMOUNT_BUSD_WEI = web3.utils.toBN(web3.utils.toWei('20000'));
const AMOUNT_BNB_WEI = web3.utils.toBN(web3.utils.toWei('1'));

const {JsonRpcProvider} = require("@ethersproject/providers");
const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');

const init = async () => {
    web3.eth
        .subscribe("newBlockHeaders")
        .on("data", async (block) => {
            console.log(`New block received. Block # ${block.number}`);

            const busd = await Fetcher.fetchTokenData(ChainId.MAINNET, addresses.tokens.busd, provider);
            const wbnb = await Fetcher.fetchTokenData(ChainId.MAINNET, addresses.tokens.wbnb, provider);    
    
            const sushi_busd = await Sushi_Fetcher.fetchTokenData(Sushi_ChainId.MAINNET, addresses.tokens.busd, provider);
            const sushi_wbnb = await Sushi_Fetcher.fetchTokenData(Sushi_ChainId.MAINNET, addresses.tokens.wbnb, provider);    
 
            const sushi_busdWbnb = await Fetcher.fetchPairData(sushi_busd, sushi_wbnb, provider);

            const pancakeswapResults = await Promise.all([
                busdWbnb.getOutputAmount(new TokenAmount(busd, AMOUNT_BUSD_WEI)),
                busdWbnb.getOutputAmount(new TokenAmount(wbnb, AMOUNT_BNB_WEI)),
            ]);

            const pancakeswapRates = {
                buy: parseFloat(AMOUNT_BUSD_WEI / (pancakeswapResults[0][0].toExact() * 10 ** 18)),
                sell: parseFloat(pancakeswapResults[1][0].toExact()),
            };
            console.log("Pancakeswap BNB/BUSD");
            console.log(pancakeswapRates);            

        })
        .on("error", error => {
            console.log(error);
        });
}

//console.log(Sushi_ChainID);
console.log(pancakeChainId);
console.log(sushiChainId);
//init();