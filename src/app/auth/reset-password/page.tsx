export default function ResetPasswordPage() {
  return (
    <div className="container py-24 min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 md:p-12 w-full max-w-md animate-fade-up">
        <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
        <p className="text-platinum-dim mb-8">Enter your email and we'll send a secure link.</p>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-platinum uppercase tracking-wider mb-2">Email Address</label>
            <input 
              name="email"
              type="email" 
              required 
              className="w-full bg-tertiary-bg border border-glass-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-platinum transition-colors"
              placeholder="john@example.com"
            />
          </div>
          <button type="submit" className="btn-platinum w-full py-4 mt-4">
            Send Reset Link
          </button>
        </form>

        <div className="mt-8 text-center text-platinum-dim">
          Remember your password? <a href="/login" className="text-platinum hover:text-white underline">Sign In</a>
        </div>
      </div>
    </div>
  )
}
