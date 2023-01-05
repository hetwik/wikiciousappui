import { Serum3Market } from '@blockworks-foundation/mango-v4'
import MaxAmountButton from '@components/shared/MaxAmountButton'
import { FadeInFadeOut } from '@components/shared/Transitions'
import mangoStore from '@store/mangoStore'
import useMangoAccount from 'hooks/useMangoAccount'
import useSelectedMarket from 'hooks/useSelectedMarket'
import { useTranslation } from 'next-i18next'
import { useCallback, useMemo } from 'react'
import { trimDecimals } from 'utils/numbers'

const MaxSizeButton = ({
  minOrderDecimals,
  tickDecimals,
}: {
  minOrderDecimals: number
  tickDecimals: number
}) => {
  const { t } = useTranslation(['common', 'trade'])
  const { mangoAccount } = useMangoAccount()
  const { selectedMarket, price: oraclePrice } = useSelectedMarket()
  const { price, side, tradeType } = mangoStore((s) => s.tradeForm)

  const leverageMax = useMemo(() => {
    const group = mangoStore.getState().group
    if (!mangoAccount || !group || !selectedMarket) return 0

    try {
      if (selectedMarket instanceof Serum3Market) {
        if (side === 'buy') {
          return mangoAccount.getMaxQuoteForSerum3BidUi(
            group,
            selectedMarket.serumMarketExternal
          )
        } else {
          return mangoAccount.getMaxBaseForSerum3AskUi(
            group,
            selectedMarket.serumMarketExternal
          )
        }
      } else {
        if (side === 'buy') {
          return mangoAccount.getMaxQuoteForPerpBidUi(
            group,
            selectedMarket.perpMarketIndex
          )
        } else {
          return mangoAccount.getMaxBaseForPerpAskUi(
            group,
            selectedMarket.perpMarketIndex
          )
        }
      }
    } catch (e) {
      console.error('Error calculating max leverage: spot btn group: ', e)
      return 0
    }
  }, [mangoAccount, side, selectedMarket])

  const handleMax = useCallback(() => {
    const set = mangoStore.getState().set
    set((state) => {
      if (side === 'buy') {
        state.tradeForm.quoteSize = trimDecimals(
          leverageMax,
          tickDecimals
        ).toFixed(tickDecimals)
        if (tradeType === 'Market' || !price) {
          state.tradeForm.baseSize = trimDecimals(
            leverageMax / oraclePrice,
            minOrderDecimals
          ).toFixed(minOrderDecimals)
        } else {
          state.tradeForm.baseSize = trimDecimals(
            leverageMax / parseFloat(price),
            minOrderDecimals
          ).toFixed(minOrderDecimals)
        }
      } else {
        state.tradeForm.baseSize = trimDecimals(
          leverageMax,
          tickDecimals
        ).toFixed(tickDecimals)
        if (tradeType === 'Market' || !price) {
          state.tradeForm.quoteSize = trimDecimals(
            leverageMax * oraclePrice,
            minOrderDecimals
          ).toFixed(minOrderDecimals)
        } else {
          state.tradeForm.quoteSize = trimDecimals(
            leverageMax * parseFloat(price),
            minOrderDecimals
          ).toFixed(minOrderDecimals)
        }
      }
    })
  }, [leverageMax, price, side, tradeType])

  const maxAmount = useMemo(() => {
    const tradePrice = tradeType === 'Market' ? oraclePrice : Number(price)
    if (side === 'buy') {
      return trimDecimals(leverageMax / tradePrice, tickDecimals).toFixed(
        tickDecimals
      )
    } else {
      return trimDecimals(leverageMax, minOrderDecimals).toFixed(
        minOrderDecimals
      )
    }
  }, [leverageMax, minOrderDecimals, tickDecimals, price, side, tradeType])

  return (
    <div className="mb-2 mt-3 flex items-center justify-between">
      <p className="text-xs text-th-fgd-3">{t('trade:size')}</p>
      <FadeInFadeOut show={!!price}>
        <MaxAmountButton
          className="text-xs"
          label={t('max')}
          onClick={handleMax}
          value={maxAmount}
        />
      </FadeInFadeOut>
    </div>
  )
}

export default MaxSizeButton