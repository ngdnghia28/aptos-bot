import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { program } from 'commander';
import { callFaucet, createTxsendAptosTo, fromBech32File, generatePairAndSave, getBalance, myParseFloat, myParseInt, parseBalance, sleep } from "./utils";

(async () => {
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
        .option('-n, --count <number>', 'Number of times', myParseInt)
        .action(faucet)
    program
        .command("transfer")
        .description("transfer to address")
        .action(transfer)
        .argument('<string>', 'address to faucet')
        .requiredOption('-d, --destination <string>', 'Destination account to receive Aptos')
        .requiredOption('-v, --value <number>', 'Value to sent to each account in Aptos', myParseFloat)
        .option('-N, --network <string>', 'Network to work with', 'devnet');

    program.parse(process.argv)
})()

async function createPair() {
    const account = generatePairAndSave('keys');
    console.log(`create pair success: ${account.accountAddress.bcsToHex()}`)
}

async function balance(address: string, { network }: { network: Network }) {
    console.log(`Get balance for ${address}`);

    const config = new AptosConfig({ network });
    const client = new Aptos(config);

    console.log(`Current balance: ${parseBalance(await getBalance(client, address))}`)
}

async function faucet(address: string, { network, count = 1 }: { network: Network, count: number }) {
    console.log(`Faucet for ${address}`);

    const config = new AptosConfig({ network });
    const client = new Aptos(config);

    if (network === 'mainnet') {
        throw new Error('Cannot faucet from mainnet')
    }

    console.log(`Current balance: ${parseBalance(await getBalance(client, address))}`)

    for (let i = 0; i < count; i++) {
        console.log(`Process ${i}/${count} times`);
        await sleep(1000);
        // ignore error
        await callFaucet(address, 100_000_000).catch(console.error);
    }


    await sleep(10000);
    console.log(`Current balance: ${parseBalance(await getBalance(client, address))}`)
}

async function transfer(address: string, { value, destination, network }: { value: number, destination: string, network: Network }) {
    const source = fromBech32File(`./keys/${address}.key`);
    const des = fromBech32File(`./keys/${destination}.key`);
    console.log('Start sending from address: ', source.accountAddress.toString())

    const config = new AptosConfig({ network });
    const client = new Aptos(config);

    console.log(`Current balance: ${parseBalance(await getBalance(client, source.accountAddress.toString()))}`)

    console.log(`Sending ${value} Aptos for address ${des.accountAddress.toString()} `)
    const transaction = await createTxsendAptosTo(client, source.accountAddress, des.accountAddress, value * 10**8);

    const senderAuthenticator = client.transaction.sign({
        signer: source,
        transaction,
    });

    await client.transaction.submit.simple({
        senderAuthenticator,
        transaction
    });

    await sleep(3000);
    console.log(`Current balance: ${parseBalance(await getBalance(client, source.accountAddress.toString()))}`)
}