import { Button } from "@/components/ui/button";
import {
  GraduationCapIcon,
  ArrowRightIcon,
  BookOpenIcon,
  UsersIcon,
  LightbulbIcon,
  HeartHandshakeIcon,
  TrendingUpIcon,
  CheckCircle2Icon,
  MousePointerIcon
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Animated step card component
interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

function StepCard({ number, title, description, icon, delay }: StepCardProps) {
  return (
    <motion.div
      className="relative flex flex-col rounded-xl bg-card border p-6 shadow-sm hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
        {number}
      </div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}

// Scholarship card component with hover effects
interface ScholarshipCardProps {
  title: string;
  amount: string;
  type: string;
  requirements: string;
  icon: React.ReactNode;
  delay: number;
}

function ScholarshipCard({ title, amount, type, requirements, icon, delay }: ScholarshipCardProps) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: delay }}
    >
      {/* Background gradient that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <Badge className="mb-2">{type}</Badge>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-3xl font-bold text-primary">{amount}</div>
          <div className="text-sm text-muted-foreground">Scholarship Award</div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="h-4 w-4 text-primary" />
            <span>{requirements}</span>
          </div>
        </div>

        <Button asChild className="w-full group">
          <Link href={route('register')}>
            Apply Now
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

// Animated statistic component
interface StatProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  delay: number;
}

function AnimatedStat({ value, label, icon, delay }: StatProps) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

// Animated scroll indicator
function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
      initial={{ opacity: 1, y: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 20
      }}
      transition={{ duration: 0.3 }}
    >
      <span className="mb-2 text-sm text-muted-foreground">Scroll to explore</span>
      <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-primary/30 p-1">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-primary"
          animate={{
            y: [0, 4, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}

// Main hero section component
export function HeroSection() {
  // State is managed by useEffect
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add parallax effect on scroll
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        const heroElement = heroRef.current;
        const parallaxElements = heroElement.querySelectorAll('.parallax');

        parallaxElements.forEach((element, index) => {
          const speed = 0.1 + (index * 0.05);
          const yPos = scrollY * speed;
          (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={heroRef} className="relative overflow-hidden bg-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl parallax"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1.5 }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl parallax"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />

      {/* Main content */}
      <div className="container relative z-10 mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Hero header */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary"></span>
              Applications Open for 2024-2025
            </Badge>
          </motion.div>

          <motion.h1
            className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="block">Unlock Your Potential with</span>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Philex Scholarships
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Empowering exceptional students through financial support, mentorship, and community engagement to build the leaders of tomorrow.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button asChild size="lg" className="group">
              <Link href={route('register')}>
                Start Your Application
                <motion.div
                  className="ml-2 inline-flex"
                  whileHover={{
                    scale: [1, 1.2, 0.9, 1.1, 1],
                    rotate: [0, 0, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <MousePointerIcon className="h-4 w-4" />
                </motion.div>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#scholarships" className="group">
                Explore Scholarships
                <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

       

        {/* Stats section */}
        <div className="mt-20">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <AnimatedStat
              value="100+"
              label="Scholars Supported"
              icon={<UsersIcon className="h-6 w-6" />}
              delay={1.4}
            />
            <AnimatedStat
              value="$750,000"
              label="Annual Funding"
              icon={<BookOpenIcon className="h-6 w-6" />}
              delay={1.5}
            />
            <AnimatedStat
              value="85%"
              label="Graduation Rate"
              icon={<TrendingUpIcon className="h-6 w-6" />}
              delay={1.6}
            />
            <AnimatedStat
              value="1,000+"
              label="Service Hours"
              icon={<HeartHandshakeIcon className="h-6 w-6" />}
              delay={1.7}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
