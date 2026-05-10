import { useState, useRef, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

type Mode = 'login' | 'register'

function Field({
  label, type, placeholder, inputRef,
}: {
  label: string
  type: string
  placeholder: string
  inputRef: RefObject<HTMLInputElement>
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold dark:text-green-200">{label}</label>
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        required
        className="px-4 py-2 rounded-xl border border-green-200 dark:border-green-700 bg-white dark:bg-green-950 dark:text-green-50 outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300 dark:placeholder:text-green-800"
      />
    </div>
  )
}

export default function Auth() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const usernameRef = useRef<HTMLInputElement>(null!)
  const emailRef    = useRef<HTMLInputElement>(null!)
  const passwordRef = useRef<HTMLInputElement>(null!)
  const confirmRef  = useRef<HTMLInputElement>(null!)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')

    const email    = emailRef.current.value.trim()
    const password = passwordRef.current.value

    if (mode === 'register') {
      const username = usernameRef.current.value.trim()
      const confirm  = confirmRef.current.value
      if (password !== confirm) {
        setError('Las contraseñas no coinciden')
        return
      }
      setLoading(true)
      try {
        await register(username, email, password)
        navigate('/')
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      try {
        await login(email, password)
        navigate('/')
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError('')
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">

      {/* Toggle */}
      <div className="flex rounded-xl border border-green-200 dark:border-green-700 overflow-hidden mb-8">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`flex-1 py-2 text-sm font-medium ${
            mode === 'login'
              ? 'bg-green-600 text-white'
              : 'dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => switchMode('register')}
          className={`flex-1 py-2 text-sm font-medium ${
            mode === 'register'
              ? 'bg-green-600 text-white'
              : 'dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900'
          }`}
        >
          Registrarse
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {mode === 'register' && (
          <Field label="Nombre de usuario" type="text" placeholder="tunombre" inputRef={usernameRef} />
        )}
        <Field label="Email"      type="email"    placeholder="tu@email.com" inputRef={emailRef} />
        <Field label="Contraseña" type="password" placeholder="••••••••"     inputRef={passwordRef} />
        {mode === 'register' && (
          <Field label="Confirmar contraseña" type="password" placeholder="••••••••" inputRef={confirmRef} />
        )}

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium"
        >
          {loading ? 'Cargando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-green-500">
          {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="text-green-700 dark:text-green-300 font-semibold hover:underline"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </form>

    </div>
  )
}
