import { RegisterForm } from "@/components/register-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12 pt-24">
        <RegisterForm />
      </div>
      <Footer />
    </main>
  )
}
