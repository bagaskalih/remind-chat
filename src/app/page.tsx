"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"USER" | "COUNSELOR" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Check if user is logged in and get role from localStorage or cookies
    if (session) {
      setIsLoggedIn(true);
      const role = session.user.role;
      if (role === "USER" || role === "COUNSELOR") {
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      console.log("User role:", role);
    }
  }, [session]);

  // Function to handle sign out
  const handleSignOut = () => {
    // Call sign out function from next-auth
    signOut();
    setIsLoggedIn(false);
    setUserRole(null);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        mobileMenuOpen &&
        !target.closest("#mobile-menu") &&
        !target.closest("#mobile-menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
              P
            </div>
            <h1 className="text-xl font-bold">PeerTalk</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cara Kerja
            </Link>
            <Link
              href="#about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Tentang Kami
            </Link>
            <Link
              href="#faq"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>

            {isLoggedIn ? (
              userRole === "COUNSELOR" ? (
                <>
                  <Link href="/counselor/dashboard">
                    <Button className="cursor-pointer">Dasbor</Button>
                  </Link>
                  <Button
                    className="cursor-pointer"
                    variant="destructive"
                    onClick={handleSignOut}
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/chat">
                    <Button>Obrolan</Button>
                  </Link>
                  <Button variant="outline" onClick={handleSignOut}>
                    Keluar
                  </Button>
                </>
              )
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button>Daftar</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              id="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              className="absolute top-16 left-0 right-0 bg-background border-b z-50 p-4 shadow-md"
            >
              <div className="flex flex-col space-y-4">
                <Link
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cara Kerja
                </Link>
                <Link
                  href="#about"
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tentang Kami
                </Link>
                <Link
                  href="#faq"
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </Link>

                {isLoggedIn ? (
                  userRole === "COUNSELOR" ? (
                    <div className="flex flex-col space-y-2">
                      <Link
                        href="/counselor/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full cursor-pointer">
                          Dasbor
                        </Button>
                      </Link>
                      <Button
                        className="w-full cursor-pointer"
                        variant="destructive"
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Keluar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link
                        href="/chat"
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full">Obrolan</Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        Keluar
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link
                      href="/login"
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Masuk
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full">Daftar</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto py-12 md:py-24 px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
              Konseling Sebaya Anonim{" "}
              <span className="text-primary">Saat Anda Paling Membutuhkan</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Bicaralah dengan konselor sebaya terlatih tentang apa pun yang ada
              di pikiran Anda. Percakapan anonim, rahasia, dan mendukung untuk
              membantu Anda menghadapi tantangan hidup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="text-lg"
                onClick={() => router.push("/chat")}
              >
                Mulai Mengobrol Sekarang
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg"
                onClick={() => router.push("/register")}
              >
                Buat Akun
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center mt-8 md:mt-0">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-primary/20 rounded-full -z-10 animate-pulse"></div>
              <div className="bg-card border rounded-xl shadow-lg p-4 md:p-6 max-w-md">
                <div className="flex gap-4 mb-4">
                  <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                    C
                  </div>
                  <div>
                    <p className="font-semibold">Konselor</p>
                    <p className="text-xs text-muted-foreground">
                      Online sekarang
                    </p>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-lg mb-3 max-w-[80%]">
                  <p className="text-sm">
                    Hai! Bagaimana saya bisa membantu Anda hari ini?
                  </p>
                </div>
                <div className="bg-primary text-primary-foreground p-3 rounded-lg mb-3 ml-auto max-w-[80%]">
                  <p className="text-sm">
                    Saya merasa tertekan akhir-akhir ini...
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm">
                    Saya mengerti. Mari bicara tentang ini bersama-sama. Apa
                    yang sedang terjadi?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            Cara Kerja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex flex-col items-center text-center p-4 md:p-6">
              <div className="bg-primary/10 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-4">
                <span className="text-xl md:text-2xl font-bold text-primary">
                  1
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Mulai Percakapan
              </h3>
              <p className="text-muted-foreground">
                Pilih untuk mengobrol secara anonim atau buat akun untuk
                menyimpan percakapan Anda.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-6">
              <div className="bg-primary/10 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-4">
                <span className="text-xl md:text-2xl font-bold text-primary">
                  2
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Terhubung dengan Konselor
              </h3>
              <p className="text-muted-foreground">
                Dapatkan pencocokan dengan konselor sebaya terlatih yang dapat
                memberikan dukungan dan bimbingan.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 md:p-6">
              <div className="bg-primary/10 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mb-4">
                <span className="text-xl md:text-2xl font-bold text-primary">
                  3
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Dapatkan Dukungan
              </h3>
              <p className="text-muted-foreground">
                Lakukan percakapan rahasia dan terima dukungan yang Anda
                butuhkan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                Tentang PeerTalk
              </h2>
              <p className="text-base md:text-lg mb-4">
                PeerTalk dibuat untuk memberikan dukungan kesehatan mental yang
                mudah diakses melalui konseling sebaya.
              </p>
              <p className="text-base md:text-lg mb-4">
                Platform kami menghubungkan Anda dengan konselor sebaya terlatih
                yang dapat memberikan telinga yang mendengarkan, dukungan
                emosional, dan bimbingan saat Anda paling membutuhkannya.
              </p>
              <p className="text-base md:text-lg">
                Baik Anda menghadapi stres, masalah hubungan, tekanan akademik,
                atau hanya membutuhkan seseorang untuk diajak bicara, konselor
                kami siap membantu.
              </p>
            </div>
            <div className="flex-1 bg-muted rounded-lg p-6 md:p-8 mt-6 md:mt-0">
              <h3 className="text-xl font-semibold mb-4">Nilai-Nilai Kami</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 rounded-full p-1 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Kerahasiaan</span>
                    <p className="text-muted-foreground text-sm">
                      Privasi Anda adalah prioritas utama kami.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 rounded-full p-1 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Aksesibilitas</span>
                    <p className="text-muted-foreground text-sm">
                      Dukungan harus tersedia untuk semua orang.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 rounded-full p-1 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Empati</span>
                    <p className="text-muted-foreground text-sm">
                      Kami mendekati setiap percakapan dengan pengertian.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-primary/20 rounded-full p-1 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Tanpa Penilaian</span>
                    <p className="text-muted-foreground text-sm">
                      Ruang aman bebas dari penilaian dan kritik.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-5 md:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Apakah layanan ini benar-benar anonim?
              </h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Ya, Anda dapat menggunakan layanan kami dengan sepenuhnya
                anonim. Kami tidak memerlukan informasi pribadi apa pun untuk
                mulai mengobrol dengan konselor.
              </p>
            </div>
            <div className="bg-card p-5 md:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Siapa konselor-konselornya?
              </h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Konselor kami adalah rekan sebaya terlatih yang telah menjalani
                pelatihan khusus dalam mendengarkan aktif, empati, dan
                komunikasi yang mendukung.
              </p>
            </div>
            <div className="bg-card p-5 md:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Apakah layanan ini gratis?
              </h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Ya, layanan dasar kami sepenuhnya gratis. Kami menawarkan
                konseling sebaya anonim kepada siapa saja yang membutuhkan
                dukungan.
              </p>
            </div>
            <div className="bg-card p-5 md:p-6 rounded-lg shadow-sm">
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Bagaimana jika saya dalam krisis?
              </h3>
              <p className="text-muted-foreground text-sm md:text-base">
                Jika Anda mengalami situasi darurat kesehatan mental, silakan
                hubungi layanan darurat lokal atau hotline krisis segera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Siap Untuk Mulai Berbicara?
          </h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Baik Anda membutuhkan seseorang untuk mendengarkan atau saran
            tentang masalah tertentu, konselor sebaya kami siap membantu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-base md:text-lg"
              onClick={() => router.push("/chat")}
            >
              Obrolan Anonim
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="text-base md:text-lg border-primary-foreground"
              onClick={() => router.push("/register")}
            >
              Buat Akun
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-4 max-w-xs">
              <div className="flex items-center gap-2">
                <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                  P
                </div>
                <h3 className="text-xl font-bold">PeerTalk</h3>
              </div>
              <p className="text-muted-foreground">
                Konseling sebaya anonim saat Anda paling membutuhkannya.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-0">
              <div>
                <h4 className="font-semibold mb-3 text-base">Platform</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="#how-it-works"
                      className="hover:text-foreground transition-colors inline-block py-1"
                    >
                      Cara Kerja
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#about"
                      className="hover:text-foreground transition-colors inline-block py-1"
                    >
                      Tentang Kami
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#faq"
                      className="hover:text-foreground transition-colors inline-block py-1"
                    >
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-base">Akun</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="/login"
                      className="hover:text-foreground transition-colors inline-block py-1"
                    >
                      Masuk
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="hover:text-foreground transition-colors inline-block py-1"
                    >
                      Daftar
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/chat"
                      className="hover:text-foreground transition-colors inline-block py-1"
                    >
                      Mulai Obrolan
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1 mt-6 sm:mt-0">
                <h4 className="font-semibold mb-3 text-base">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-foreground transition-colors inline-block py-1"
                    >
                      Kebijakan Privasi
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-foreground transition-colors inline-block py-1"
                    >
                      Ketentuan Layanan
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 md:mt-8 md:pt-8 border-t text-center text-muted-foreground text-sm">
            <p>
              &copy; {new Date().getFullYear()} PeerTalk. Seluruh hak cipta
              dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
