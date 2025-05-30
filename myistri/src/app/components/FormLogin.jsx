'use client'

import HeaderLogin from './headerLogin';
import ErrorAlert from './errorAlert';
import InputLogin from './inputLogin';
import SubmitButton from './submitButton';
import SwitchUserButton from './switchUserButton';

export default function FormLogin({
  mode,
  formData,
  showPassword,
  showConfirmPassword,
  error,
  loading,
  onModeSwitch,
  onChange,
  onSubmit,
  onTogglePassword,
  onToggleConfirmPassword
}) {
  return (
    <div className="flex w-full lg:w-2/5 items-center justify-center p-8 h-full overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50 p-6">
          <HeaderLogin mode={mode} />
          
          {error && <ErrorAlert message={error} />}

          <form onSubmit={onSubmit}>
            <div className="space-y-3">
              <InputLogin
                mode={mode}
                formData={formData}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                onChange={onChange}
                onTogglePassword={onTogglePassword}
                onToggleConfirmPassword={onToggleConfirmPassword}
              />
              
              <SubmitButton mode={mode} loading={loading} />
            </div>
          </form>

          <SwitchUserButton mode={mode} onModeSwitch={onModeSwitch} />
        </div>
      </div>
    </div>
  );
}
