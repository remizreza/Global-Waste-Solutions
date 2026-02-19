import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, ChevronRight, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/redoxy/logo.png";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, login, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = ["Technology", "Services", "Traction", "About"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-secondary/95 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          {/* 🚨 Here is the fix for the overlap! Added shrink-0 and hidden xl:block */}
          <div className="cursor-pointer flex items-center gap-3 hover:scale-105 transition-transform duration-300 shrink-0">
            <img
              src={logo}
              alt="Redoxy Logo"
              className="h-10 w-auto min-w-[40px]"
            />
            <span className="hidden xl:block text-2xl font-display font-bold tracking-tighter text-white">
              REDOXY
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`}>
              <a className="cursor-pointer text-sm font-tech text-gray-300 hover:text-primary hover:scale-110 transition-all duration-300 uppercase tracking-widest inline-block">
                {item}
              </a>
            </Link>
          ))}

          <Link href="/contact">
            <a className="cursor-pointer bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-sm font-tech font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-primary/20">
              Contact Us
            </a>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-white/20">
                    <AvatarImage src={user.profileImage} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      user@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              onClick={login} 
              disabled={isLoading}
              className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white hover:scale-110 transition-transform"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-secondary border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {[...navItems, "Contact"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`}>
                  <a
                    className="cursor-pointer text-lg font-tech text-gray-300 hover:text-primary flex items-center justify-between group transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </a>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-white/10">
                {user ? (
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-300">{user.username}</span>
                    <Button variant="ghost" size="sm" onClick={logout} className="ml-auto text-red-400">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={login} disabled={isLoading} className="w-full">
                    Login
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
