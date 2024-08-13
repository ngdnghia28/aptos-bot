import { AccountAddress, Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { program } from 'commander';
import { callFaucet, createTxsendAptosTo, fromBech32File, generatePairAndSave, getBalance, myParseBoolean, myParseFloat, myParseInt, parseBalance, sleep } from "./utils";
import { gamePlay } from './game';

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
        .option('-m, --movement <string>', 'Is momenvent network', myParseBoolean, false)
        .action(faucet)
    program
        .command("transfer")
        .description("transfer to address")
        .action(transfer)
        .argument('<string>', 'address to faucet')
        .requiredOption('-d, --destination <string>', 'Destination account to receive Aptos')
        .requiredOption('-v, --value <number>', 'Value to sent to each account in Aptos', myParseFloat)
        .option('-N, --network <string>', 'Network to work with', 'devnet')
    program.command('play')
        .description("play")
        .argument('<string>', 'address to play')
        .option('-N, --network <string>', 'Network to work with', 'devnet')
        .option('-n, --count <number>', 'Number of times', myParseInt)
        .action(play)

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

async function faucet(address: string, { network, count = 1, movement }: { network: Network, count: number, movement: boolean }) {
    console.log(`Faucet for ${address}`);

    let config = new AptosConfig({ network });
    if (movement) {
        config = new AptosConfig({ fullnode: "https://aptos.testnet.suzuka.movementlabs.xyz/v1" });
    }
    const client = new Aptos(config);

    if (network === 'mainnet') {
        throw new Error('Cannot faucet from mainnet')
    }

    console.log(`Current balance: ${parseBalance(await getBalance(client, address))}`)

    for (let i = 0; i < count; i++) {
        console.log(`Process ${i}/${count} times`);
        await sleep(1000);
        // ignore error
        if (movement) {
            await callFaucet(address, 1_000_000_000, "https://faucet.testnet.suzuka.movementlabs.xyz").catch(console.error);
        } else {
            await callFaucet(address, 1_000_000_000).catch(console.error);
        }
    }


    await sleep(10000);
    console.log(`Current balance: ${parseBalance(await getBalance(client, address))}`)
}

async function transfer(address: string, { value, destination, network }: { value: number, destination: string, network: Network }) {
    const source = fromBech32File(`./keys/${address}.key`);
    console.log('Start sending from address: ', source.accountAddress.toString())

    const config = new AptosConfig({ network });
    const client = new Aptos(config);

    console.log(`Current balance: ${parseBalance(await getBalance(client, source.accountAddress.toString()))}`)

    console.log(`Sending ${value} Aptos for address ${destination} `)
    const transaction = await createTxsendAptosTo(client, source.accountAddress, AccountAddress.fromString(destination), value * 10 ** 8);

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

async function play(address: string, { network, count = 1 }: { network: Network, count: number }) {
    console.log(`Play for ${address}`);
    const account = fromBech32File(`./keys/${address}.key`);

    const config = new AptosConfig({ fullnode: "https://aptos.testnet.suzuka.movementlabs.xyz/v1" });
    const client = new Aptos(config);

    console.log(`Current balance: ${parseBalance(await getBalance(client, address))}`)

    for (let i = 0; i < count; i++) {
        console.log(`Process ${i}/${count} times`);
        await sleep(1000);
        // ignore error
        await gamePlay(client, account).catch(console.error);
    }

    await sleep(1000);
    console.log(`Current balance: ${parseBalance(await getBalance(client, address))}`)
}
