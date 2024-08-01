import { InvalidArgumentError } from "commander";
import fs from "fs";
import { Account, Ed25519PrivateKey, Aptos, Network, AccountAddress } from '@aptos-labs/ts-sdk'
import {
    AptosFaucetClient,
    FundRequest,
} from "@aptos-labs/aptos-faucet-client";

export function myParseInt(value: string) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}

export function myParseFloat(value: string) {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}

export function myParseBoolean(value: string) {
    if (value === undefined) return false;

    if (['1', 'true'].indexOf(value) === -1) {
        throw new InvalidArgumentError('Not a number.');
    }

    return true;
}

export function fromBech32File(path: string) {
    const privateStr = fs.readFileSync(path).toString();

    return Account.fromPrivateKey({ privateKey: new Ed25519PrivateKey(privateStr) });
}

export function generatePairAndSave(folder: string) {
    const account = Account.generate();

    const address = account.accountAddress.bcsToHex();

    fs.writeFileSync(`./${folder}/${address}.key`, account.privateKey.toString());

    return account;
}

export async function createTxsendAptosTo(client: Aptos, sender: AccountAddress, receiver: AccountAddress, value: number) {
    const transaction = await client.transaction.build.simple({
        sender: sender,
        data: {
            function: "0x1::aptos_account::transfer",
            functionArguments: [receiver, value],
        },
    });

    return transaction;
}

export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

export async function getBalance(client: Aptos, accountAddress: string) {
    // Fetch account resources
    const resources = await client.getAccountResources({ accountAddress }).catch(() => []);

    // Find the coin resource
    const accountResource = resources.find((r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');

    // Extract balance
    if (accountResource) {
        const balance = (accountResource.data as any).coin.value;
        return balance;
    } else {
        return 0;
    }
}

export async function callFaucet(address: string, value: number, faucetUrl?: string): Promise<string[]> {
    const faucetClient = new AptosFaucetClient({
        BASE: faucetUrl || "https://faucet.testnet.aptoslabs.com",
    });
    const request: FundRequest = {
        amount: value,
        address,
    };
    const response = await faucetClient.fund.fund({ requestBody: request });
    return response.txn_hashes;
}

export function parseBalance(balance: number) {
    return balance / 10 ** 8;
}