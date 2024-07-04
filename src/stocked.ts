import { MIST_PER_SUI } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

export async function deposit_and_stake_entry(client: SuiClient, signer: Ed25519Keypair, value: number) {
    const txb = new Transaction();
    // need to minus gas. for now fixed 0.1
    const [coin] = txb.splitCoins(txb.gas, [(value - 0.1) * Number(MIST_PER_SUI)]);

    // TODO remove hardcode
    txb.moveCall({
        target: `0x1a516d4063ae9ac7eb0c8cc274e10987f3f3588dd94b0378ec4c6335c56aa141::stoked_app::deposit_and_stake_entry`,
        arguments: [txb.object('0x5'), txb.object("0xafbfd7d6e70eff3005ee9bfe56b17b47eec018181700eab4fe5794a28a36600f"), coin],
    });

    return client.signAndExecuteTransaction({
        transaction: txb,
        signer,
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });
}

export async function stake() {

}
