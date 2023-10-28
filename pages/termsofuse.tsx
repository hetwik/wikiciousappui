import TermsOfUse from "@components/TermsOfUse"
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import type { NextPage } from 'next'

require('dayjs/locale/en')
require('dayjs/locale/es')
require('dayjs/locale/zh')
require('dayjs/locale/zh-tw')

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'notifications',
        'onboarding',
        'profile',
        'search',
        'settings',
        'trade',
      ])),
    },
  }
}
const Settings: NextPage = () => {
  return (
    <div className="p-8 pb-20 md:pb-16">
      <TermsOfUse />
    </div>
  )
}

export default Settings
