//require("dotenv").config();
const { ChainId: pancakeChainId, TokenAmount, Fetcher } = require('@pancakeswap/sdk');
const { ChainId: sushiChainId, Token, Pair } = require('@sushiswap/sdk');

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

            const pancake_busd = await Fetcher.fetchTokenData(pancakeChainId.MAINNET, addresses.tokens.busd, provider);
            const pancake_wbnb = await Fetcher.fetchTokenData(pancakeChainId.MAINNET, addresses.tokens.wbnb, provider);
            
            const pancake_busdWbnb = await Fetcher.fetchPairData(pancake_busd, pancake_wbnb, provider);
            
            /*
            const sushi_busd = await Token.fetchData(sushiChainId.BSC, addresses.tokens.busd);
            const sushi_wbnb = await Token.fetchData(sushiChainId.BSC, addresses.tokens.busd);
            const sushi_busdWbnb = await Pair.fetchData(sushi_busd, sushi_wbnb);            
            */

            const pancakeswapResults = await Promise.all([
                pancake_busdWbnb.getOutputAmount(new TokenAmount(pancake_busd, AMOUNT_BUSD_WEI)),
                pancake_busdWbnb.getOutputAmount(new TokenAmount(pancake_wbnb, AMOUNT_BNB_WEI)),
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

//console.log(Pair.toString());
//console.log(Token.toString());
init();