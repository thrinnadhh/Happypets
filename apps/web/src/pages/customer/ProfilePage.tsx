import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/common/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Pet {
  id: string;
  name: string;
  image: string;
}

const mockPets: Pet[] = [
  { id: "1", name: "Buster", image: "🐕" },
  { id: "2", name: "Luna", image: "🐱" },
  { id: "3", name: "Milo", image: "🐕" },
];

export function ProfilePage(): JSX.Element {
  const { user } = useAuth();

  return (
    <PageTransition className="min-h-screen bg-gradient-to-b from-[#fef3c7] to-white">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-[24px] bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] p-6"
        >
          <div className="flex items-center gap-4">
            <div className="text-6xl">🐕😎</div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">
                Welcome,<br />{user?.email?.split("@")[0]}!
              </h1>
            </div>
          </div>
        </motion.div>

        {/* My Pack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="mb-4 font-heading text-2xl font-bold text-ink">My Pack</h2>
          <div className="grid grid-cols-3 gap-3">
            {mockPets.map((pet) => (
              <motion.button
                key={pet.id}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center rounded-[16px] border-2 border-[#d4af37] bg-white p-4 text-center transition"
              >
                <div className="mb-2 text-4xl">{pet.image}</div>
                <p className="font-semibold text-ink">{pet.name}</p>
                <p className="mt-2 text-xs text-[#20b2aa]">View Profile</p>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Link
            to="/orders"
            className="flex items-center justify-between rounded-[16px] border border-[#f0e5d8] bg-white p-4 transition hover:bg-[#fef9f3]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <span className="font-semibold text-ink">Order History</span>
            </div>
            <span className="text-xl text-[#d4af37]">›</span>
          </Link>

          <button className="w-full rounded-[16px] border border-[#f0e5d8] bg-white p-4 text-left transition hover:bg-[#fef9f3]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <span className="font-semibold text-ink">Payment Methods</span>
              </div>
              <span className="text-xl text-[#d4af37]">›</span>
            </div>
          </button>

          <button className="w-full rounded-[16px] border border-[#f0e5d8] bg-white p-4 text-left transition hover:bg-[#fef9f3]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏠</span>
                <span className="font-semibold text-ink">Addresses</span>
              </div>
              <span className="text-xl text-[#d4af37]">›</span>
            </div>
          </button>
        </motion.div>
      </main>
    </PageTransition>
  );
}
