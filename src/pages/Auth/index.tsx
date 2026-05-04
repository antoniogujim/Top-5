import { useState } from 'react'

type Mode = 'login' | 'register'

function Input({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold dark:text-green-200">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="px-4 py-2 rounded-xl border border-green-200 dark:border-green-700 bg-white dark:bg-green-950 dark:text-green-50 outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300 dark:placeholder:text-green-800"
      />
    </div>
  )
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <Input label="Email" type="email" placeholder="tu@email.com" />
      <Input label="Contraseña" type="password" placeholder="••••••••" />

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium"
      >
        Entrar
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-green-500">
        ¿No tienes cuenta?{' '}
        <button onClick={onSwitch} className="text-green-700 dark:text-green-300 font-semibold hover:underline">
          Regístrate
        </button>
      </p>
    </div>
  )
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <Input label="Nombre de usuario" type="text" placeholder="tunombre" />
      <Input label="Email" type="email" placeholder="tu@email.com" />
      <Input label="Contraseña" type="password" placeholder="••••••••" />
      <Input label="Confirmar contraseña" type="password" placeholder="••••••••" />

      <button
        type="submit"
        className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium"
      >
        Crear cuenta
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-green-500">
        ¿Ya tienes cuenta?{' '}
        <button onClick={onSwitch} className="text-green-700 dark:text-green-300 font-semibold hover:underline">
          Inicia sesión
        </button>
      </p>
    </div>
  )
}

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login')

  return (
    <div className="max-w-sm mx-auto px-6 py-16">

      {/* Toggle */}
      <div className="flex rounded-xl border border-green-200 dark:border-green-700 overflow-hidden mb-8">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 py-2 text-sm font-medium ${
            mode === 'login'
              ? 'bg-green-600 text-white'
              : 'dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900'
          }`}
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 py-2 text-sm font-medium ${
            mode === 'register'
              ? 'bg-green-600 text-white'
              : 'dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900'
          }`}
        >
          Registrarse
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={(e) => e.preventDefault()}>
        {mode === 'login'
          ? <LoginForm onSwitch={() => setMode('register')} />
          : <RegisterForm onSwitch={() => setMode('login')} />
        }
      </form>

      {/* Aviso */}
      <p className="mt-8 text-center text-xs text-gray-400 dark:text-green-700">
        La autenticación estará disponible próximamente.
      </p>

    </div>
  )
}
