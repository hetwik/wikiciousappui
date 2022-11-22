import TradeAdvancedPage from '@components/trade/TradeAdvancedPage'
import mangoStore from '@store/mangoStore'
// import mangoStore from '@store/mangoStore'
import type { NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'onboarding',
        'onboarding-tours',
        'profile',
        'trade',
      ])),
    },
  }
}

const Trade: NextPage = () => {
  const router = useRouter()
  const { name: marketName } = router.query

  useEffect(() => {
    const set = mangoStore.getState().set
    const group = mangoStore.getState().group
    const serumMarkets = mangoStore.getState().serumMarkets
    const perpMarkets = mangoStore.getState().perpMarkets

    if (group && marketName && typeof marketName === 'string') {
      const mkt =
        serumMarkets.find((m) => m.name === marketName) ||
        perpMarkets.find((m) => m.name === marketName)
      if (mkt) {
        set((s) => {
          s.selectedMarket.name = marketName
          s.selectedMarket.current = mkt
        })
      }
    }
  }, [marketName])

  return (
    <div className="pb-16 md:pb-0">
      <TradeAdvancedPage />
    </div>
  )
}

export default Trade
