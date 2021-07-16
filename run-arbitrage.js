require("dotenv").config();
const { ChainId, Token, TokenAmount, Fetcher } = require('@pancakeswap/sdk');
const Web3 = require("web3");
const { mainnet: addresses } = require("./addresses");
//const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.ANKR_URL));
const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://bsc-ws-node.nariox.org:443'));

const AMOUNT_BUSD_WEI = web3.utils.toBN(web3.utils.toWei('20000'));
const AMOUNT_BNB_WEI = web3.utils.toBN(web3.utils.toWei('1'));

const {JsonRpcProvider} = require("@ethersproject/providers");
const provider = new JsonRpcProvider('https://bsc-dataseed.binance.org/');

const init = async () => {

    const busd = await Fetcher.fetchTokenData(ChainId.MAINNET, addresses.tokens.busd, provider);
    const wbnb = await Fetcher.fetchTokenData(ChainId.MAINNET, addresses.tokens.wbnb, provider);    
    
    const busdWbnb = await Fetcher.fetchPairData(busd, wbnb, provider);

    web3.eth
        .subscribe("newBlockHeaders")
        .on("data", async (block) => {
            console.log(`New block received. Block # ${block.number}`);

            const pancakeswapResults = await Promise.all([
                busdWbnb.getOutputAmount(new TokenAmount(busd, AMOUNT_BUSD_WEI)),
                busdWbnb.getOutputAmount(new TokenAmount(wbnb, AMOUNT_BNB_WEI)),
            ]);

            console.log(pancakeswapResults);
            console.log('--> ' + pancakeswapResults[0][0].raw.toString());
            console.log('--> ' + pancakeswapResults[1][0].raw.toString());

        })
        .on("error", error => {
            console.log(error);
        });
}

init();