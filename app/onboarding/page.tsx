"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Users, DollarSign, Calendar, Award, Smartphone, Shield, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion";

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  const slides = [
    {
      icon: () => (
        <Image src="/images/semente-bendita-logo.png" alt="Connectus" width={80} height={80} className="mx-auto" />
      ),
      title: "Welcome to Connectus",
      subtitle: "Mobile Church Platform",
      description: "Your all-in-one solution for modern church administration, connecting your community digitally.",
      features: ["Member Management", "Financial Tracking", "Event Planning"],
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
    },
    {
      icon: Users,
      title: "Member Management",
      subtitle: "Know Your Flock",
      description: "Track members, families, and attendance with face recognition for child safety.",
      features: ["Family Grouping", "Attendance Tracking", "Child Safety"],
      color: "from-green-500 to-emerald-600",
      iconBg: "bg-gradient-to-br from-green-400 to-emerald-500",
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      subtitle: "PIX & Mobile Integration",
      description: "Accept tithes and offerings through PIX, credit cards, and mobile payments.",
      features: ["PIX Payments", "Budget Tracking", "AI Insights"],
      color: "from-purple-500 to-violet-600",
      iconBg: "bg-gradient-to-br from-purple-400 to-violet-500",
    },
    {
      icon: Calendar,
      title: "Events & Ministries",
      subtitle: "Stay Connected",
      description: "Manage church events, choir practice, and private ministry hubs.",
      features: ["Event Planning", "RSVP System", "Ministry Hubs"],
      color: "from-orange-500 to-red-600",
      iconBg: "bg-gradient-to-br from-orange-400 to-red-500",
    },
    {
      icon: Award,
      title: "Gamification",
      subtitle: "Spiritual Growth",
      description: "Earn badges and track spiritual milestones with our reward system.",
      features: ["Achievement Badges", "Leaderboards", "Streak Tracking"],
      color: "from-pink-500 to-rose-600",
      iconBg: "bg-gradient-to-br from-pink-400 to-rose-500",
    },
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      router.push("/auth")
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-3">
          <Image src="/images/semente-bendita-logo.png" alt="Connectus" width={32} height={32} />
          <div>
            <span className="font-semibold text-gray-900 block text-sm">Connectus</span>
            <span className="font-semibold text-gray-900 block text-sm">Mobile Church</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/auth")}>Skip</Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-full"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-10 text-center">
                {/* Icon */}
                <motion.div
                  className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg ${slide.iconBg}`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  {currentSlide === 0 ? <slide.icon /> : <slide.icon className="h-12 w-12 text-white" />}
                </motion.div>

                {/* Title */}
                <motion.h1
                  className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  className="text-lg text-indigo-600 font-semibold mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {slide.subtitle}
                </motion.p>

                {/* Description */}
                <motion.p
                  className="text-gray-600 mb-6 leading-relaxed"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {slide.description}
                </motion.p>

                {/* Features */}
                <motion.div
                  className="flex flex-wrap justify-center gap-2 mb-8"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: { staggerChildren: 0.08 }
                    }
                  }}
                >
                  {slide.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.25 + index * 0.08 }}
                    >
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 shadow">
                        {feature}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button variant="ghost" onClick={prevSlide} disabled={currentSlide === 0} className="text-gray-500">
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {slides.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === currentSlide ? "bg-indigo-600 scale-125" : "bg-gray-300 scale-100"
                        }`}
                        initial={{ scale: 0.8, opacity: 0.5 }}
                        animate={{ scale: index === currentSlide ? 1.25 : 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    ))}
                  </div>

                  <Button onClick={nextSlide} className="bg-indigo-600 hover:bg-indigo-700">
                    {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Features Preview */}
        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-14 h-14 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center shadow">
              <Smartphone className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Offline Mode</p>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="w-14 h-14 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center shadow">
              <Shield className="h-7 w-7 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Secure</p>
          </motion.div>
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-14 h-14 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center shadow">
              <Globe className="h-7 w-7 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Multi-language</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
