import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { CoinBalance } from "@mysten/sui/dist/cjs/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { InvalidArgumentError } from "commander";
import fs from "fs";

export function myParseInt(value: string) {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}

export function fromBech32File(path: string) {
    const privateStr = fs.readFileSync(path).toString();
    const { secretKey } = decodeSuiPrivateKey(privateStr);
    return Ed25519Keypair.fromSecretKey(secretKey);
}

export function generatePairAndSave(folder: string) {
    const keypair = new Ed25519Keypair();

    const privateKey = keypair.getSecretKey();
    const publicKey = keypair.getPublicKey();

    const address = publicKey.toSuiAddress();

    fs.writeFileSync(`./${folder}/${address}.key`, privateKey);
    fs.writeFileSync(`./${folder}/${address}.pub`, publicKey.toSuiPublicKey());

    return keypair;
}

export function createTxsendSUITo(address: string, value: number) {
    const tx = new Transaction();

    const [coin] = tx.splitCoins(tx.gas, [value]);
    tx.transferObjects([coin], address);

    return tx;
}

export function parseBalance(balance: CoinBalance){
	return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
};

export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))
