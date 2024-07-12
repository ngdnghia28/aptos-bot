# How to use:

## Help
```
ts-node src/index.ts --help
```

## Create pair
```
ts-node src/index.ts create
```

## Get balance
```
ts-node src/index.ts balance 0xebe83716d56a8bc355ffb68f4f491a7dc5a8d9161cb23bab8da4790bcd0566c4 -N testnet
```

## Faucet
```
ts-node src/index.ts faucet 0xb365f1a552a13e3e98fd1745f032130b7d30b47a7ae7e49b9ab6922ae37e8130 -N testnet -n 10000
```

## Deposite and stake SUI
``` 
ts-node src/index.ts depositAndStake -n 2 -v 3 -a 0xb365f1a552a13e3e98fd1745f032130b7d30b47a7ae7e49b9ab6922ae37e8130 -N testnet
```

## Auto deposite and stake SUI
``` 
ts-node src/index.ts autoDepositAndStake -n 10 -v 3 -a 0xb365f1a552a13e3e98fd1745f032130b7d30b47a7ae7e49b9ab6922ae37e8130 -N testnet
```