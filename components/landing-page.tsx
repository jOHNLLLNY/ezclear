"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Star, Users, Shield, Clock, CheckCircle, ArrowRight, Menu, X, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react'
import { ServiceCard } from "@/components/service-card"

const services = [
  {
    id: "snow-removal",
    title: "Snow Removal",
    icon: "❄️",
    image: "/images/services/snow-removal.png",
    description: "Professional snow clearing services"
  },
  {
    id: "lawn-mowing",
    title: "Lawn Mowing",
    icon: "🌱",
    image: "/images/services/lawn-mowing.png",
    description: "Keep your lawn perfectly maintained"
  },
  {
    id: "gutter-cleaning",
    title: "Gutter Cleaning",
    icon: "🏠",
    image: "/images/services/gutter-cleaning.png",
    description: "Professional gutter maintenance"
  },
  {
    id: "leaf-cleanup",
    title: "Leaf Cleanup",
    icon: "🍂",
    image: "/images/services/leaf-cleanup.png",
    description: "Seasonal yard cleanup services"
  },
  {
    id: "pressure-washing",
    title: "Pressure Washing",
    icon: "💧",
    image: "/images/services/pressure-washing.png",
    description: "Deep cleaning for your property"
  },
  {
    id: "tree-trimming",
    title: "Tree Trimming",
    icon: "🌳",
    image: "/images/services/tree-trimming.png",
    description: "Professional tree care services"
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    rating: 5,
    comment: "Amazing service! Found a reliable contractor within minutes.",
    service: "Snow Removal"
  },
  {
    name: "Mike Chen",
    rating: 5,
    comment: "Professional and affordable. Highly recommend EZ Clear!",
    service: "Lawn Mowing"
  },
  {
    name: "Emily Davis",
    rating: 5,
    comment: "The best platform for finding local service providers.",
    service: "Gutter Cleaning"
  }
]

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1B1F25] shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/images/ez-clear-logo-white.png" 
                alt="EZ Clear" 
                width={40} 
                height={40} 
                className="h-10 w-10" 
              />
              <span className="text-xl font-bold text-[#06C0B3]">EZ Clear</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#services" className="text-white hover:text-[#06C0B3] transition-colors">
                Services
              </Link>
              <Link href="#how-it-works" className="text-white hover:text-[#06C0B3] transition-colors">
                How It Works
              </Link>
              <Link href="#about" className="text-white hover:text-[#06C0B3] transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-white hover:text-[#06C0B3] transition-colors">
                Contact
              </Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/sign-in">
                <Button variant="ghost" className="text-white hover:text-[#06C0B3]">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/create-account">
                <Button className="bg-[#06C0B3] hover:bg-[#05a394] text-white">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              <nav className="flex flex-col space-y-4">
                <Link href="#services" className="text-white hover:text-[#06C0B3] transition-colors">
                  Services
                </Link>
                <Link href="#how-it-works" className="text-white hover:text-[#06C0B3] transition-colors">
                  How It Works
                </Link>
                <Link href="#about" className="text-white hover:text-[#06C0B3] transition-colors">
                  About
                </Link>
                <Link href="#contact" className="text-white hover:text-[#06C0B3] transition-colors">
                  Contact
                </Link>
                <div className="flex flex-col space-y-2 pt-4">
                  <Link href="/auth/sign-in">
                    <Button variant="ghost" className="w-full text-white hover:text-[#06C0B3]">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/create-account">
                    <Button className="w-full bg-[#06C0B3] hover:bg-[#05a394] text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#1B1F25] to-[#2A2F35] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/winter-street-clearing.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Local Service Providers
              <span className="text-[#06C0B3] block">In Minutes</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Connect with trusted professionals for snow removal, lawn care, cleaning, and more
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-white text-black border-0 rounded-xl"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Enter your location"
                    className="pl-10 h-12 bg-white text-black border-0 rounded-xl md:w-64"
                  />
                </div>
                <Button className="h-12 px-8 bg-[#06C0B3] hover:bg-[#05a394] text-white rounded-xl">
                  Search
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#06C0B3] mb-2">10,000+</div>
                <div className="text-gray-300">Service Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#06C0B3] mb-2">50,000+</div>
                <div className="text-gray-300">Jobs Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#06C0B3] mb-2">4.9★</div>
                <div className="text-gray-300">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Popular Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From seasonal maintenance to emergency repairs, find the right professional for any job
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                icon={service.icon}
                image={service.image}
                description={service.description}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button className="bg-[#06C0B3] hover:bg-[#05a394] text-white px-8 py-3 rounded-xl">
                View All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              How EZ Clear Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Getting help has never been easier. Just three simple steps to connect with professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#06C0B3] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">1. Search & Browse</h3>
              <p className="text-muted-foreground">
                Tell us what you need and browse through qualified service providers in your area.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#06C0B3] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">2. Connect & Compare</h3>
              <p className="text-muted-foreground">
                View profiles, read reviews, and get quotes from multiple professionals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#06C0B3] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">3. Book & Relax</h3>
              <p className="text-muted-foreground">
                Choose your preferred professional and let them handle the job with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why Choose EZ Clear?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Verified Professionals</h3>
              <p className="text-muted-foreground text-sm">
                All service providers are background checked and verified
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Fast Response</h3>
              <p className="text-muted-foreground text-sm">
                Get responses from professionals within minutes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Quality Guaranteed</h3>
              <p className="text-muted-foreground text-sm">
                Read reviews and ratings from real customers
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#06C0B3]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-[#06C0B3]" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Local Focus</h3>
              <p className="text-muted-foreground text-sm">
                Connect with professionals in your neighborhood
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background border-border">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.comment}"</p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.service}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#06C0B3] to-[#05a394] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who trust EZ Clear for their service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/create-account">
              <Button className="bg-white text-[#06C0B3] hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold">
                Find Services
              </Button>
            </Link>
            <Link href="/auth/select-account-type">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#06C0B3] px-8 py-3 rounded-xl font-semibold">
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1B1F25] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image 
                  src="/images/ez-clear-logo-white.png" 
                  alt="EZ Clear" 
                  width={32} 
                  height={32} 
                  className="h-8 w-8" 
                />
                <span className="text-xl font-bold text-[#06C0B3]">EZ Clear</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting homeowners with trusted local service providers for all their maintenance needs.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-[#06C0B3] cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-400 hover:text-[#06C0B3] cursor-pointer" />
                <Instagram className="h-5 w-5 text-gray-400 hover:text-[#06C0B3] cursor-pointer" />
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services" className="hover:text-[#06C0B3]">Snow Removal</Link></li>
                <li><Link href="/services" className="hover:text-[#06C0B3]">Lawn Care</Link></li>
                <li><Link href="/services" className="hover:text-[#06C0B3]">Cleaning</Link></li>
                <li><Link href="/services" className="hover:text-[#06C0B3]">Repairs</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#about" className="hover:text-[#06C0B3]">About Us</Link></li>
                <li><Link href="#" className="hover:text-[#06C0B3]">Careers</Link></li>
                <li><Link href="#" className="hover:text-[#06C0B3]">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-[#06C0B3]">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>1-800-EZ-CLEAR</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@ezclear.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EZ Clear. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
