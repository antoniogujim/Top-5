const FEATURES = [
  { label: 'Rankings guardados',   free: 'Hasta 10',    premium: 'Ilimitados' },
  { label: 'Top 5 por ranking',    free: true,          premium: true },
  { label: 'Compartir rankings',   free: true,          premium: true },
  { label: 'Categorías propias',   free: true,          premium: true },
  { label: 'Acceso anticipado',    free: false,         premium: true },
]

function Check() {
  return <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
}
function Cross() {
  return <span className="text-gray-300 dark:text-green-900 font-bold">✕</span>
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true)  return <Check />
  if (value === false) return <Cross />
  return <span className="text-sm dark:text-green-200">{value}</span>
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Modal } from '../../components/ui/Modal'

export default function Premium() {
  const { user, upgrade, downgrade } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const handleUpgrade = async () => {
    if (!user) { navigate('/auth'); return }
    setLoading(true)
    try {
      await upgrade()
    } finally {
      setLoading(false)
    }
  }

  const handleDowngrade = async () => {
    setLoading(true)
    try {
      await downgrade()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold dark:text-green-50">Premium</h1>
        <p className="mt-2 text-gray-500 dark:text-green-400">
          Sin límite de rankings. Siempre Top 5.
        </p>
      </div>

      {/* Comparativa */}
      <div className="bg-white dark:bg-green-950 rounded-2xl border border-green-100 dark:border-green-800 overflow-hidden mb-8">

        {/* Cabecera columnas */}
        <div className="grid grid-cols-3 border-b border-green-100 dark:border-green-800">
          <div className="p-4" />
          <div className="p-4 text-center">
            <span className="text-sm font-semibold dark:text-green-200">Gratis</span>
          </div>
          <div className="p-4 text-center bg-green-600 dark:bg-green-700">
            <span className="text-sm font-semibold text-white">Premium</span>
          </div>
        </div>

        {/* Filas */}
        {FEATURES.map((feature, i) => (
          <div
            key={feature.label}
            className={`grid grid-cols-3 ${i < FEATURES.length - 1 ? 'border-b border-green-100 dark:border-green-800' : ''}`}
          >
            <div className="p-4 text-sm dark:text-green-200">{feature.label}</div>
            <div className="p-4 flex items-center justify-center">
              <FeatureValue value={feature.free} />
            </div>
            <div className="p-4 flex items-center justify-center bg-green-50 dark:bg-green-900">
              <FeatureValue value={feature.premium} />
            </div>
          </div>
        ))}
      </div>

      {/* Precio y CTA */}
      <div className="text-center">
        <p className="text-gray-400 dark:text-green-500 text-sm mb-1">Precio estimado</p>
        <p className="text-3xl font-bold dark:text-green-50">
          2,99 €<span className="text-base font-normal text-gray-400 dark:text-green-500"> / mes</span>
        </p>
        {user?.isPremium ? (
          <>
            <div className="mt-6 w-full py-3 rounded-xl bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium text-center">
              Ya eres Premium
            </div>
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={loading}
              className="mt-3 w-full py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-500 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Cancelar suscripción'}
            </button>
            {showCancelModal && (
              <Modal
                title="Cancelar suscripción Premium"
                confirmLabel="Cancelar suscripción"
                confirmDanger
                onConfirm={() => { setShowCancelModal(false); handleDowngrade() }}
                onCancel={() => setShowCancelModal(false)}
              >
                <p>Al cancelar perderás inmediatamente:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Rankings ilimitados (solo podrás conservar los 10 primeros)</li>
                  <li>Acceso anticipado a nuevas funciones</li>
                </ul>
                <p className="mt-2">¿Seguro que quieres volver al plan Gratis?</p>
              </Modal>
            )}
          </>
        ) : (
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="mt-6 w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Activando...' : user ? 'Activar Premium' : 'Acceder para activar'}
          </button>
        )}
      </div>

    </div>
  )
}
