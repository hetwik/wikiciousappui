import ButtonGroup from '@components/forms/ButtonGroup'
import Checkbox from '@components/forms/Checkbox'
import Input from '@components/forms/Input'
import Label from '@components/forms/Label'
import Button, { IconButton, LinkButton } from '@components/shared/Button'
import InlineNotification from '@components/shared/InlineNotification'
import Modal from '@components/shared/Modal'
import { Table, Td, Th, TrBody, TrHead } from '@components/shared/TableElements'
import Tooltip from '@components/shared/Tooltip'
import { KeyIcon, TrashIcon } from '@heroicons/react/20/solid'
import useLocalStorageState from 'hooks/useLocalStorageState'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { ModalProps } from 'types/modal'
import { HOT_KEYS_KEY } from 'utils/constants'

export type HotKey = {
  ioc: boolean
  keySequence: string
  margin: boolean
  orderSide: 'buy' | 'sell'
  orderSizeType: 'percentage' | 'notional'
  orderSize: string
  orderType: 'limit' | 'market'
  orderPrice: string
  postOnly: boolean
  reduceOnly: boolean
}

const HotKeysSettings = () => {
  const { t } = useTranslation('settings')
  const [hotKeys, setHotKeys] = useLocalStorageState(HOT_KEYS_KEY, [])
  const [showHotKeyModal, setShowHotKeyModal] = useState(false)

  const handleDeleteKey = (key: string) => {
    const newKeys = hotKeys.filter((hk: HotKey) => hk.keySequence !== key)
    setHotKeys([...newKeys])
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="mb-1 text-base">{t('hot-keys')}</h2>
        {hotKeys.length ? (
          <LinkButton onClick={() => setShowHotKeyModal(true)}>
            {t('create-new-key')}
          </LinkButton>
        ) : null}
      </div>
      <p className="mb-4">{t('hot-keys-desc')}</p>
      {hotKeys.length ? (
        <Table>
          <thead>
            <TrHead>
              <Th className="text-left">{t('key')}</Th>
              <Th className="text-right">{t('order-type')}</Th>
              <Th className="text-right">{t('side')}</Th>
              <Th className="text-right">{t('size')}</Th>
              <Th className="text-right">{t('price')}</Th>
              <Th className="text-right">{t('options')}</Th>
              <Th />
            </TrHead>
          </thead>
          <tbody>
            {hotKeys.map((hk: HotKey) => {
              const {
                keySequence,
                orderSide,
                orderPrice,
                orderSize,
                orderSizeType,
                orderType,
                ioc,
                margin,
                reduceOnly,
                postOnly,
              } = hk
              const size =
                orderSizeType === 'percentage'
                  ? `${orderSize}% of max`
                  : `$${orderSize}`
              const price = orderPrice ? `${orderPrice}% from oracle` : 'market'

              const options = {
                margin: margin,
                IOC: ioc,
                post: postOnly,
                reduce: reduceOnly,
              }

              return (
                <TrBody key={keySequence} className="text-right">
                  <Td className="text-left">{keySequence}</Td>
                  <Td className="text-right">{orderType}</Td>
                  <Td className="text-right">{orderSide}</Td>
                  <Td className="text-right">{size}</Td>
                  <Td className="text-right">{price}</Td>
                  <Td className="text-right">
                    {Object.entries(options).map((e) => {
                      return e[1]
                        ? `${e[0] !== 'margin' ? ', ' : ''}${e[0]}`
                        : ''
                    })}
                  </Td>
                  <Td>
                    <div className="flex justify-end">
                      <IconButton
                        onClick={() => handleDeleteKey(keySequence)}
                        size="small"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </Td>
                </TrBody>
              )
            })}
          </tbody>
        </Table>
      ) : (
        <div className="rounded-lg border border-th-bkg-3 p-6">
          <div className="flex flex-col items-center">
            <KeyIcon className="mb-2 h-6 w-6 text-th-fgd-4" />
            <p className="mb-4">{t('no-hot-keys')}</p>
            <Button onClick={() => setShowHotKeyModal(true)}>
              <div className="flex items-center">{t('create-hot-key')}</div>
            </Button>
          </div>
        </div>
      )}
      {showHotKeyModal ? (
        <HotKeyModal
          isOpen={showHotKeyModal}
          onClose={() => setShowHotKeyModal(false)}
        />
      ) : null}
    </>
  )
}

export default HotKeysSettings

type FormErrors = Partial<Record<keyof HotKeyForm, string>>

type HotKeyForm = {
  baseKey: string
  triggerKey: string
  price: string
  side: 'buy' | 'sell'
  size: string
  sizeType: 'percentage' | 'notional'
  orderType: 'limit' | 'market'
  ioc: boolean
  post: boolean
  margin: boolean
  reduce: boolean
}

const DEFAULT_FORM_VALUES: HotKeyForm = {
  baseKey: 'shift',
  triggerKey: '',
  price: '',
  side: 'buy',
  size: '',
  sizeType: 'percentage',
  orderType: 'limit',
  ioc: false,
  post: false,
  margin: false,
  reduce: false,
}

const HotKeyModal = ({ isOpen, onClose }: ModalProps) => {
  const { t } = useTranslation(['settings', 'trade'])
  const [hotKeys, setHotKeys] = useLocalStorageState<HotKey[]>(HOT_KEYS_KEY, [])
  const [hotKeyForm, setHotKeyForm] = useState<HotKeyForm>({
    ...DEFAULT_FORM_VALUES,
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const handleSetForm = (propertyName: string, value: string | boolean) => {
    setFormErrors({})
    setHotKeyForm((prevState) => ({ ...prevState, [propertyName]: value }))
  }

  const handlePostOnlyChange = (postOnly: boolean) => {
    if (postOnly) {
      handleSetForm('ioc', !postOnly)
    }
    handleSetForm('post', postOnly)
  }

  const handleIocChange = (ioc: boolean) => {
    if (ioc) {
      handleSetForm('post', !ioc)
    }
    handleSetForm('ioc', ioc)
  }

  const isFormValid = (form: HotKeyForm) => {
    const invalidFields: FormErrors = {}
    setFormErrors({})
    const triggerKey: (keyof HotKeyForm)[] = ['triggerKey']
    const requiredFields: (keyof HotKeyForm)[] = ['size', 'price', 'triggerKey']
    const numberFields: (keyof HotKeyForm)[] = ['size', 'price']
    const alphanumericRegex = /^[a-zA-Z0-9]+$/
    for (const key of triggerKey) {
      const value = form[key] as string
      if (value.length > 1) {
        invalidFields[key] = t('error-too-many-characters')
      }
      if (!alphanumericRegex.test(value)) {
        invalidFields[key] = t('error-alphanumeric-only')
      }
    }
    for (const key of requiredFields) {
      const value = form[key] as string
      if (!value) {
        if (hotKeyForm.orderType === 'market') {
          console.log(key, invalidFields[key])
          if (key !== 'price') {
            invalidFields[key] = t('error-required-field')
          }
        } else {
          invalidFields[key] = t('error-required-field')
        }
      }
    }
    for (const key of numberFields) {
      const value = form[key] as string
      if (value) {
        if (isNaN(parseFloat(value))) {
          invalidFields[key] = t('error-must-be-number')
        }
        if (parseFloat(value) < 0) {
          invalidFields[key] = t('error-must-be-above-zero')
        }
        if (parseFloat(value) > 100) {
          if (key === 'price') {
            invalidFields[key] = t('error-must-be-below-100')
          } else {
            if (hotKeyForm.sizeType === 'percentage') {
              invalidFields[key] = t('error-must-be-below-100')
            }
          }
        }
      }
    }
    if (Object.keys(invalidFields).length) {
      setFormErrors(invalidFields)
    }
    return invalidFields
  }

  const handleSave = () => {
    const invalidFields = isFormValid(hotKeyForm)
    if (Object.keys(invalidFields).length) {
      return
    }
    const newHotKey = {
      keySequence: `${hotKeyForm.baseKey}+${hotKeyForm.triggerKey}`,
      orderSide: hotKeyForm.side,
      orderSizeType: hotKeyForm.sizeType,
      orderSize: hotKeyForm.size,
      orderType: hotKeyForm.orderType,
      orderPrice: hotKeyForm.price,
      ioc: hotKeyForm.ioc,
      margin: hotKeyForm.margin,
      postOnly: hotKeyForm.post,
      reduceOnly: hotKeyForm.reduce,
    }
    setHotKeys([...hotKeys, newHotKey])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <>
        <h2 className="mb-4 text-center">{t('create-hot-key')}</h2>
        <div className="mb-4">
          <Label text={t('base-key')} />
          <ButtonGroup
            activeValue={hotKeyForm.baseKey}
            onChange={(key) => handleSetForm('baseKey', key)}
            values={['shift', 'ctrl', 'option']}
          />
        </div>
        <div className="mb-4">
          <Label text={t('trigger-key')} />
          <Input
            hasError={formErrors.triggerKey !== undefined}
            type="text"
            value={hotKeyForm.triggerKey}
            onChange={(e) => handleSetForm('triggerKey', e.target.value)}
          />
          {formErrors.triggerKey ? (
            <div className="mt-1">
              <InlineNotification
                type="error"
                desc={formErrors.triggerKey}
                hideBorder
                hidePadding
              />
            </div>
          ) : null}
        </div>
        <div className="mb-4">
          <Label text={t('order-side')} />
          <ButtonGroup
            activeValue={hotKeyForm.side}
            onChange={(side) => handleSetForm('side', side)}
            values={['buy', 'sell']}
          />
        </div>
        <div className="mb-4">
          <Label text={t('order-type')} />
          <ButtonGroup
            activeValue={hotKeyForm.orderType}
            onChange={(type) => handleSetForm('orderType', type)}
            values={['limit', 'market']}
          />
        </div>
        <div className="mb-4">
          <Label text={t('order-size-type')} />
          <ButtonGroup
            activeValue={hotKeyForm.sizeType}
            onChange={(type) => handleSetForm('sizeType', type)}
            values={['percentage', 'notional']}
          />
        </div>
        <div className="flex items-start space-x-4">
          <div className="w-full">
            <Label text={t('size')} />
            <Input
              hasError={formErrors.size !== undefined}
              type="text"
              value={hotKeyForm.size}
              onChange={(e) => handleSetForm('size', e.target.value)}
              suffix={hotKeyForm.sizeType === 'percentage' ? '%' : 'USD'}
            />
            {formErrors.size ? (
              <div className="mt-1">
                <InlineNotification
                  type="error"
                  desc={formErrors.size}
                  hideBorder
                  hidePadding
                />
              </div>
            ) : null}
          </div>
          {hotKeyForm.orderType === 'limit' ? (
            <div className="w-full">
              <Tooltip content="Set a price as a percentage change from the oracle price">
                <Label className="tooltip-underline" text={t('price')} />
              </Tooltip>
              <Input
                hasError={formErrors.price !== undefined}
                type="text"
                value={hotKeyForm.price}
                onChange={(e) => handleSetForm('price', e.target.value)}
                placeholder="e.g. 1%"
                suffix="%"
              />
              {formErrors.price ? (
                <div className="mt-1">
                  <InlineNotification
                    type="error"
                    desc={formErrors.price}
                    hideBorder
                    hidePadding
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap md:flex-nowrap">
          {hotKeyForm.orderType === 'limit' ? (
            <div className="flex">
              <div className="mr-3 mt-4" id="trade-step-six">
                <Tooltip
                  className="hidden md:block"
                  delay={100}
                  content={t('trade:tooltip-post')}
                >
                  <Checkbox
                    checked={hotKeyForm.post}
                    onChange={(e) => handlePostOnlyChange(e.target.checked)}
                  >
                    {t('trade:post')}
                  </Checkbox>
                </Tooltip>
              </div>
              <div className="mr-3 mt-4" id="trade-step-seven">
                <Tooltip
                  className="hidden md:block"
                  delay={100}
                  content={t('trade:tooltip-ioc')}
                >
                  <div className="flex items-center text-xs text-th-fgd-3">
                    <Checkbox
                      checked={hotKeyForm.ioc}
                      onChange={(e) => handleIocChange(e.target.checked)}
                    >
                      IOC
                    </Checkbox>
                  </div>
                </Tooltip>
              </div>
            </div>
          ) : null}
          <div className="mt-4 mr-3" id="trade-step-eight">
            <Tooltip
              className="hidden md:block"
              delay={100}
              content={t('trade:tooltip-enable-margin')}
            >
              <Checkbox
                checked={hotKeyForm.margin}
                onChange={(e) => handleSetForm('margin', e.target.checked)}
              >
                {t('trade:margin')}
              </Checkbox>
            </Tooltip>
          </div>
          <div className="mr-3 mt-4">
            <Tooltip
              className="hidden md:block"
              delay={100}
              content={
                'Reduce will only decrease the size of an open position. This is often used for closing a position.'
              }
            >
              <div className="flex items-center text-xs text-th-fgd-3">
                <Checkbox
                  checked={hotKeyForm.reduce}
                  onChange={(e) => handleSetForm('reduce', e.target.checked)}
                >
                  {t('trade:reduce-only')}
                </Checkbox>
              </div>
            </Tooltip>
          </div>
        </div>
        <Button className="mt-6 w-full" onClick={handleSave}>
          {t('save-hot-key')}
        </Button>
      </>
    </Modal>
  )
}
