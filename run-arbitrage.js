require("dotenv").config();
const { ChainId, Token, TokenAmount, Pair } = require('@pancakeswap/sdk');
const Web3 = require("web3");
const { mainnet: addresses } = require("./addresses");
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.ANKR_URL));

const init = async () => {
    const [busd, wbnb] = await Promise.all(
        [addresses.tokens.busd, addresses.tokens.wbnb].map((tokenAddress) =>
        Token.fetchData(ChainId.MAINNET, tokenAddress)));
    
    const busdWbnb = await Pair.fetchData(busd, wbnb);

    web3.eth
        .subscribe("newBlockHeaders")
        .on("data", async (block) => {
            console.log(`New block received. Block # ${block.number}`);

            const pancakeswapResults = await Promise.all([
                busdWbnb.getOutputAmount(new TokenAmount(busd, AMOUNT_BUSD_WEI)),
                busdWbnb.getOutputAmount(new TokenAmount(wbnb, AMOUNT_BNB_WEI)),
            ]);

            console.log(pancakeswapResults);

        })
        .on("error", error => {
            console.log(error);
        });
}

init();