import { Account, Aptos } from "@aptos-labs/ts-sdk";

const moduleAddress = 'd2020a414cb037c45455fe464fb4e09a0f1a524cbd35d7d1eda472179c10e773';

export async function gamePlay(client: Aptos, account: Account) {

    const transaction = await client.transaction.build.simple({
        sender: account.accountAddress,
        data: {
            function: `${moduleAddress}::tapos::play`,
            functionArguments: [],
        },
    });

    const senderAuthenticator = client.transaction.sign({
        signer: account,
        transaction,
    });

    const submittedTransaction = await client.transaction.submit.simple({
        transaction,
        senderAuthenticator,
    });

    const executedTransaction = await client.waitForTransaction({ transactionHash: submittedTransaction.hash });
    console.log(executedTransaction)
}
