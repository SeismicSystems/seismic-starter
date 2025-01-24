import { Abi, Transport, ContractFunctionArgs, ContractFunctionName, WriteContractReturnType, encodeFunctionData, EncodeFunctionDataParameters } from "viem"
import { BaseError } from "viem"
import { Client } from "viem"
import { Account } from "viem"
import { Chain } from "viem"
import { parseAccount } from "viem/accounts"
import { sendTransaction } from "viem/actions"
import { getContractError } from "viem/utils"
import { getAction } from "viem/utils"
import { WriteContractParameters } from "viem"

export async function writeContract<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WriteContractParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
): Promise<WriteContractReturnType> {
  const {
    abi,
    account: account_ = client.account,
    address,
    args,
    dataSuffix,
    functionName,
    ...request
  } = parameters as WriteContractParameters

  if (typeof account_ === 'undefined')
    throw new Error('Account not found')
  const account = account_ ? parseAccount(account_) : null

  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as EncodeFunctionDataParameters)

  try {
    console.log('request payload')
    console.log(JSON.stringify({ ... request, 
      data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
      to: address,
      account,
    }, null, 2))
    const tx = await getAction(
      client,
      sendTransaction,
      'sendTransaction',
    )({
      data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
      to: address,
      account,
      ...request,
    })
    console.log('tx', tx)
    return tx
  } catch (error) {
    throw getContractError(error as BaseError, {
      abi,
      address,
      args,
      docsPath: '/docs/contract/writeContract',
      functionName,
      sender: account?.address,
    })
  }
}
