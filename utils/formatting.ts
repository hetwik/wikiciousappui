import { PublicKey } from '@solana/web3.js'
import { formatDecimal, numberCompacter } from './numbers'

export function abbreviateAddress(address: PublicKey, size = 5) {
  const base58 = address.toBase58()
  return base58.slice(0, size) + '…' + base58.slice(-size)
}

export const formatYAxis = (value: number) => {
  return Math.abs(value) > 1
    ? numberCompacter.format(value)
    : formatDecimal(value, 2)
}
