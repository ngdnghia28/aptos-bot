import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { program } from 'commander';
import { createTxsendSUITo, fromBech32File, generatePairAndSave, myParseInt, parseBalance, sleep } from "./utils";
import { getFaucetHost, requestSuiFromFaucetV1 } from '@mysten/sui/faucet';
import { deposit_and_stake_entry } from './stocked';

(async () => {
    program
        .command("depositAndStake")
        .description("transfer to address")
        .action(depositAndStake)
        .requiredOption('-a, --address <string>', 'Source account to send SUI')
        .requiredOption('-n, --count <number>', 'Number of accounts to send', myParseInt)
        .requiredOption('-v, --value <number>', 'Value to sent to each account in SUI', myParseInt)
        .option('-N, --network <string>', 'Network to work with', 'devnet');
    program.command('balance')
        .description("get balance")
        .argument('<string>', 'address to query balance')
        .option('-N, --network <string>', 'Network to work with', 'devnet')
        .action(balance);
    program.command('create')
    .description("create a key pair")
    .action(createPair);
    program.command('faucet')
        .description("faucet")
        .argument('<string>', 'address to faucet')
        .option('-N, --network <string>', 'Network to work with', 'devnet')
        .action(faucet)

    program.parse(process.argv)
})()

async function createPair() {
    const keypair = generatePairAndSave('keys');
    console.log(`create pair success: ${keypair.toSuiAddress()}`)
}

async function balance(address: string, { network }: { network: "mainnet" | "testnet" | "devnet" | "localnet" }) {
    console.log(`Get balance for ${address}`);

    const suiClient = new SuiClient({ url: getFullnodeUrl(network) });
    console.log(`Current balance: ${parseBalance(await suiClient.getBalance({ owner: address }))}`)
}

async function faucet(address: string, { network }: { network: "mainnet" | "testnet" | "devnet" | "localnet" }) {
    console.log(`Faucet for ${address}`);

    const suiClient = new SuiClient({ url: getFullnodeUrl(network) });
    if (network === 'mainnet') {
        throw new Error('Cannot faucet from mainnet')
    }

    console.log(`Current balance: ${parseBalance(await suiClient.getBalance({ owner: address }))}`)
    await requestSuiFromFaucetV1({ host: getFaucetHost(network), recipient: address, });

    await sleep(10000);
    console.log(`Current balance: ${parseBalance(await suiClient.getBalance({ owner: address }))}`)
}

async function depositAndStake({ count, value, address, network }: { count: number, value: number, address: string, network: "mainnet" | "testnet" | "devnet" | "localnet" }) {
    const keypair = fromBech32File(`./keys/${address}.key`);

    console.log('Start sending from address: ', keypair.toSuiAddress())

    const suiClient = new SuiClient({ url: getFullnodeUrl(network) });

    console.log(`Current balance: ${parseBalance(await suiClient.getBalance({ owner: address }))}`)

    for (let i = 0; i < count; i++) {
        const pair = generatePairAndSave('temp');
        console.log(`Sending ${value} SUI for address ${pair.toSuiAddress()} `)
        const tx = createTxsendSUITo(pair.toSuiAddress(), value * Number(MIST_PER_SUI));

        await suiClient.signAndExecuteTransaction({ signer: keypair, transaction: tx });

        console.log(`Deposite and stake ${value} SUI for address ${pair.toSuiAddress()} `)
        // need to minus gas. for now fixed 0.1
        await deposit_and_stake_entry(suiClient, pair, (value - 0.1) * Number(MIST_PER_SUI));
    }

    await sleep(3000);

    console.log(`Current balance: ${parseBalance(await suiClient.getBalance({ owner: address }))}`)
}
