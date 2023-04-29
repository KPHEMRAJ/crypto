const {accountBlock, ViteAPI, abi} = require('@vite/vitejs');
const {HTTP_RPC } = require('@vite/vitejs-http')
const{get_key}=require('./vite_hex.js')
const viteProvider =new ViteAPI(new HTTP_RPC("https://node-vite.thomiz.dev"), () => {})
const {BigNumber} = require('bignumber.js');
const {multiplier}=require('./objects.js')
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function get_difficulty(myAccountBlock)
{const { difficulty } = await viteProvider.request('ledger_getPoWDifficulty', {
        address: myAccountBlock.address,
        previousHash: myAccountBlock.previousHash,
        blockType: myAccountBlock.blockType,
        toAddress: myAccountBlock.toAddress,
        data: myAccountBlock.data
    });
    if (difficulty) {
        // Call GVite-RPC API to calculate nonce from difficulty
        const getNonceHashBuffer = Buffer.from(myAccountBlock.originalAddress + myAccountBlock.previousHash, 'hex');
        const getNonceHash = utils.blake2bHex(getNonceHashBuffer, null, 32);
        const nonce = await viteProvider.request('util_getPoWNonce', difficulty, getNonceHash)

        myAccountBlock.setDifficulty(difficulty);
        myAccountBlock.setNonce(nonce);
    }

}

async function vitex_send(token_id,amount,n,count){
    if(count==6)
    return
    await sleep(1500)
    key=await get_key(n)
    am=amount
    amount=BigNumber(amount)
    amount=amount*BigNumber(10**multiplier[token_id])
    amount=amount.toLocaleString('fullwide', { useGrouping: false }) ;
result=abi.encodeFunctionCall({
	'type': 'function', 'name': 'DexFundUserDeposit', 'inputs': [] 
    });
var base_64 = Buffer.from(result, 'hex').toString('base64')
const AccountBlock = accountBlock.AccountBlock;

const myAccountBlock = new AccountBlock({
    blockType: 2,
    address:key[1],
    toAddress:"vite_0000000000000000000000000000000000000006e82b8ba657",
    tokenId: token_id,
    amount: amount,
    data:base_64
});
myAccountBlock.setProvider(viteProvider).setPrivateKey(key[0]);
await myAccountBlock.autoSetPreviousAccountBlock().catch(()=>{ return vitex_send(token_id,am,n,count+1)});
 await get_difficulty(myAccountBlock).catch(()=>{ return vitex_send(token_id,am,n,count+1)});
await myAccountBlock.autoSend().catch((err)=>{return vitex_send(token_id,am,n,count+1)})}
