"use client"

import { Home, User, MessageSquare, Plus, Search, Briefcase } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@/context/user-context"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/context/notification-context"
import { useLanguage } from "@/context/language-context"

export default function BottomNavigation() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const { userType, userId } = useUser()
  const isWorker = userType === "worker"
  const isHirer = userType === "hirer"
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { unreadCount: unreadNotificationsCount } = useNotifications()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  useEffect(() => {
    // Fetch worker's applications
    async function fetchMyApplications() {
      try {
        if (!userId || !isWorker) return

        setLoading(true)
        setError(null)

        const response = await fetch(`/api/applications?worker_id=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          // Check if response is HTML (error page)
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("text/html")) {
            console.error("API returned HTML instead of JSON")
            return
          }

          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Handle both array response and object with data property
        let applicationsArray = []
        if (Array.isArray(data)) {
          applicationsArray = data
        } else if (data.data && Array.isArray(data.data)) {
          applicationsArray = data.data
        } else if (data.warning) {
          console.warn("Applications API warning:", data.warning)
          applicationsArray = []
        }

        setApplications(applicationsArray)

        // Calculate the number of pending applications
        const pendingCount = applicationsArray.filter((app: any) => app.status === "pending").length
        setPendingApplicationsCount(pendingCount)
      } catch (err: any) {
        console.error("Error fetching applications:", err)
        setError(err.message || "Failed to load applications")
        // Initialize applications as an empty array on error
        setApplications([])
        setPendingApplicationsCount(0)
      } finally {
        setLoading(false)
      }
    }

    if (userId && isWorker) {
      fetchMyApplications()
    }
  }, [userId, isWorker])

  // Worker navigation (5 columns)
  if (isWorker) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#2A2D47] z-50">
        <div className="grid grid-cols-5 h-20 px-2">
          <Link
            href="/home/worker"
            className={`flex flex-col items-center justify-center ${
              isActive("/home") ? "text-[#00E6CC]" : "text-gray-400"
            } transition-all duration-200`}
          >
            <Home className={`h-6 w-6 ${isActive("/home") ? "text-[#00E6CC]" : "text-gray-400"}`} />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>

          <Link
            href="/search"
            className={`flex flex-col items-center justify-center ${
              isActive("/search") ? "text-[#00E6CC]" : "text-gray-400"
            } transition-all duration-200`}
          >
            <Search className={`h-6 w-6 ${isActive("/search") ? "text-[#00E6CC]" : "text-gray-400"}`} />
            <span className="text-xs mt-1 font-medium">Find Jobs</span>
          </Link>

          <Link
            href="/my-jobs"
            className={`flex flex-col items-center justify-center ${
              isActive("/my-jobs") ? "text-[#00E6CC]" : "text-gray-400"
            } transition-all duration-200`}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#00E6CC] flex items-center justify-center -mt-2">
                <Plus className="h-6 w-6 text-white" />
              </div>
              {pendingApplicationsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-red-500 text-white text-[0.6rem] flex items-center justify-center animate-pulse">
                  {pendingApplicationsCount > 9 ? "9+" : pendingApplicationsCount}
                </Badge>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">My Jobs</span>
          </Link>

          <Link
            href="/messages"
            className={`flex flex-col items-center justify-center ${
              isActive("/messages") ? "text-[#00E6CC]" : "text-gray-400"
            } transition-all duration-200`}
          >
            <MessageSquare className={`h-6 w-6 ${isActive("/messages") ? "text-[#00E6CC]" : "text-gray-400"}`} />
            <span className="text-xs mt-1 font-medium">Messages</span>
          </Link>

          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center ${
              isActive("/profile") ? "text-[#00E6CC]" : "text-gray-400"
            } transition-all duration-200`}
          >
            <User className={`h-6 w-6 ${isActive("/profile") ? "text-[#00E6CC]" : "text-gray-400"}`} />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </Link>
        </div>
      </div>
    )
  }

  // Hirer navigation (5 columns with centered Post Job button)
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#2A2D47] z-50">
      <div className="grid grid-cols-5 h-20 px-2">
        <Link
          href="/home/hirer"
          className={`flex flex-col items-center justify-center ${
            isActive("/home") ? "text-[#00E6CC]" : "text-gray-400"
          } transition-all duration-200`}
        >
          <Home className={`h-6 w-6 ${isActive("/home") ? "text-[#00E6CC]" : "text-gray-400"}`} />
          <span className="text-xs mt-1 font-medium">Home</span>
        </Link>

        <Link
          href="/my-jobs/hirer"
          className={`flex flex-col items-center justify-center ${
            isActive("/my-jobs") ? "text-[#00E6CC]" : "text-gray-400"
          } transition-all duration-200`}
        >
          <div className="relative">
            <Briefcase className={`h-6 w-6 ${isActive("/my-jobs") ? "text-[#00E6CC]" : "text-gray-400"}`} />
            {unreadNotificationsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-red-500 text-white text-[0.6rem] flex items-center justify-center animate-pulse">
                {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
              </Badge>
            )}
          </div>
          <span className="text-xs mt-1 font-medium">My Jobs</span>
        </Link>

        <Link href="/post-job" className="flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-[#00E6CC] flex items-center justify-center -mt-2 transition-transform duration-200 hover:scale-105">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs mt-1 font-medium text-gray-400">Post</span>
        </Link>

        <Link
          href="/messages"
          className={`flex flex-col items-center justify-center ${
            isActive("/messages") ? "text-[#00E6CC]" : "text-gray-400"
          } transition-all duration-200`}
        >
          <MessageSquare className={`h-6 w-6 ${isActive("/messages") ? "text-[#00E6CC]" : "text-gray-400"}`} />
          <span className="text-xs mt-1 font-medium">Messages</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center ${
            isActive("/profile") ? "text-[#00E6CC]" : "text-gray-400"
          } transition-all duration-200`}
        >
          <User className={`h-6 w-6 ${isActive("/profile") ? "text-[#00E6CC]" : "text-gray-400"}`} />
          <span className="text-xs mt-1 font-medium">Profile</span>
        </Link>
      </div>
    </div>
  )
}
