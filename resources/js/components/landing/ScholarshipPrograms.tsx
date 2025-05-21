import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCapIcon,
  BookOpenIcon,
  CalendarIcon,
  DollarSignIcon,
  ClockIcon,
  UsersIcon,
  CheckIcon,
  ArrowRightIcon,
  LightbulbIcon,
  TrophyIcon,
  HeartHandshakeIcon,
  BrainIcon
} from "lucide-react";
import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

// Feature card component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  iconColor: string;
}

function FeatureCard({ icon, title, description, delay, iconColor }: FeatureCardProps) {
  return (
    <motion.div
      className="group relative rounded-xl border bg-card p-6 hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={cn(
        "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
        iconColor
      )}>
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}

// Requirement item component
interface RequirementItemProps {
  text: string;
  delay: number;
}

function RequirementItem({ text, delay }: RequirementItemProps) {
  return (
    <motion.li
      className="flex items-start gap-2"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
    >
      <CheckIcon className="mt-1 h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-sm">{text}</span>
    </motion.li>
  );
}

// Scholarship detail component
interface ScholarshipDetailProps {
  title: string;
  description: string;
  amount: string;
  slots: number;
  gpa: string;
  additionalRequirement: {
    icon: React.ReactNode;
    label: string;
    value: string;
  };
  requirements: string[];
  benefits: string[];
  icon: React.ReactNode;
  iconBg: string;
  type: string;
}

function ScholarshipDetail({
  title,
  description,
  amount,
  slots,
  gpa,
  additionalRequirement,
  requirements,
  benefits,
  icon,
  iconBg,
  type
}: ScholarshipDetailProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Left column - Details */}
      <div>
        <motion.div
          className="mb-6 flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full",
            iconBg
          )}>
            {icon}
          </div>
          <div>
            <Badge className="mb-1">{type}</Badge>
            <h3 className="text-2xl font-bold">{title}</h3>
          </div>
        </motion.div>

        <motion.p
          className="mb-6 text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {description}
        </motion.p>

        <motion.div
          className="mb-8 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="rounded-lg border bg-card/50 p-4">
            <DollarSignIcon className="mb-2 h-5 w-5 text-green-500" />
            <div className="text-2xl font-bold text-primary">{amount}</div>
            <div className="text-xs text-muted-foreground">Award Amount</div>
          </div>

          <div className="rounded-lg border bg-card/50 p-4">
            <UsersIcon className="mb-2 h-5 w-5 text-blue-500" />
            <div className="text-2xl font-bold text-primary">{slots}</div>
            <div className="text-xs text-muted-foreground">Available Slots</div>
          </div>

          <div className="rounded-lg border bg-card/50 p-4">
            <GraduationCapIcon className="mb-2 h-5 w-5 text-purple-500" />
            <div className="text-2xl font-bold text-primary">{gpa}</div>
            <div className="text-xs text-muted-foreground">Minimum GPA</div>
          </div>

          <div className="rounded-lg border bg-card/50 p-4">
            {additionalRequirement.icon}
            <div className="text-2xl font-bold text-primary">{additionalRequirement.value}</div>
            <div className="text-xs text-muted-foreground">{additionalRequirement.label}</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button asChild size="lg" className="w-full group">
            <Link href={route('register')}>
              Apply for this Scholarship
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Right column - Requirements & Benefits */}
      <div className="space-y-8">
        <motion.div
          className="rounded-xl border p-6"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="mb-4 text-lg font-semibold flex items-center">
            <CheckIcon className="mr-2 h-5 w-5 text-primary" />
            Requirements
          </h4>
          <ul className="space-y-3">
            {requirements.map((req, index) => (
              <RequirementItem
                key={index}
                text={req}
                delay={0.3 + (index * 0.1)}
              />
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="rounded-xl border p-6"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h4 className="mb-4 text-lg font-semibold flex items-center">
            <TrophyIcon className="mr-2 h-5 w-5 text-amber-500" />
            Benefits
          </h4>
          <ul className="space-y-3">
            {benefits.map((benefit, index) => (
              <RequirementItem
                key={index}
                text={benefit}
                delay={0.5 + (index * 0.1)}
              />
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

// Main component
export function ScholarshipPrograms() {
  // Track active tab for potential future enhancements
  const [_, setActiveTab] = useState("college");
  const sectionRef = useRef<HTMLDivElement>(null);

  const scholarshipData = {
    college: {
      title: "Merit Academic Excellence Scholarship",
      description: "This prestigious scholarship rewards academic excellence and is designed for college students who maintain a high GPA. Recipients are expected to maintain their academic standing and contribute to the community through service.",
      amount: "$10,000",
      slots: 50,
      gpa: "85%",
      additionalRequirement: {
        icon: <BookOpenIcon className="mb-2 h-5 w-5 text-orange-500" />,
        label: "Minimum Units",
        value: "15"
      },
      requirements: [
        "Currently enrolled in an accredited college or university",
        "Maintain a minimum GPA of 85% or equivalent",
        "Enrolled in at least 15 units per semester",
        "Complete 6 days of community service",
        "Submit all required documentation",
        "Attend scholarship orientation program"
      ],
      benefits: [
        "Financial support of $10,000 per academic year",
        "Mentorship from industry professionals",
        "Access to exclusive career development workshops",
        "Networking opportunities with alumni and professionals",
        "Recognition at annual scholarship ceremony"
      ],
      icon: <GraduationCapIcon className="h-6 w-6 text-white" />,
      iconBg: "bg-gradient-to-br from-blue-500 to-violet-600 text-white",
      type: "College"
    },
    highschool: {
      title: "Future Leaders Scholarship",
      description: "Designed for promising high school students who demonstrate leadership potential and academic achievement. This scholarship aims to nurture the next generation of leaders by providing financial support and mentoring opportunities.",
      amount: "$5,000",
      slots: 50,
      gpa: "80%",
      additionalRequirement: {
        icon: <ClockIcon className="mb-2 h-5 w-5 text-orange-500" />,
        label: "Service Days",
        value: "4"
      },
      requirements: [
        "Currently enrolled in an accredited high school",
        "Maintain a minimum GPA of 80% or equivalent",
        "Demonstrated leadership potential",
        "Complete 4 days of community service",
        "Submit all required documentation",
        "Parent/guardian authorization"
      ],
      benefits: [
        "Financial support of $5,000 per academic year",
        "Leadership development workshops",
        "Guidance counseling and academic support",
        "Community service opportunities",
        "Certificate of achievement"
      ],
      icon: <LightbulbIcon className="h-6 w-6 text-white" />,
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
      type: "High School"
    }
  };

  const features = [
    {
      icon: <DollarSignIcon className="h-5 w-5 text-white" />,
      title: "Financial Support",
      description: "Receive substantial funding to help cover your educational expenses and focus on your studies.",
      iconColor: "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
      delay: 0.1
    },
    {
      icon: <BrainIcon className="h-5 w-5 text-white" />,
      title: "Academic Excellence",
      description: "Be recognized and rewarded for your commitment to maintaining high academic standards.",
      iconColor: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
      delay: 0.2
    },
    {
      icon: <HeartHandshakeIcon className="h-5 w-5 text-white" />,
      title: "Community Service",
      description: "Develop leadership skills and make a positive impact through meaningful community service.",
      iconColor: "bg-gradient-to-br from-red-500 to-pink-600 text-white",
      delay: 0.3
    },
    {
      icon: <UsersIcon className="h-5 w-5 text-white" />,
      title: "Networking",
      description: "Connect with fellow scholars, alumni, and professionals to build valuable relationships.",
      iconColor: "bg-gradient-to-br from-purple-500 to-violet-600 text-white",
      delay: 0.4
    }
  ];

  return (
    <div ref={sectionRef} className="relative overflow-hidden bg-background py-16 md:py-24" id="scholarships">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Applications Open for 2024-2025
            </Badge>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Scholarship Programs
          </motion.h2>

          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Philex offers comprehensive scholarship programs designed to support both high school and college students in achieving their academic goals.
          </motion.p>
        </div>

        {/* Features grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
              iconColor={feature.iconColor}
            />
          ))}
        </motion.div>

        {/* Scholarship tabs */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Tabs defaultValue="college" className="w-full" onValueChange={setActiveTab}>
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="college" className="text-sm">
                    <GraduationCapIcon className="mr-2 h-4 w-4" />
                    College Scholarship
                  </TabsTrigger>
                  <TabsTrigger value="highschool" className="text-sm">
                    <LightbulbIcon className="mr-2 h-4 w-4" />
                    High School Scholarship
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="college" className="mt-0">
                <ScholarshipDetail {...scholarshipData.college} />
              </TabsContent>

              <TabsContent value="highschool" className="mt-0">
                <ScholarshipDetail {...scholarshipData.highschool} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-muted-foreground mb-6">
            Ready to take the next step in your academic journey?
          </p>
          <Button asChild size="lg">
            <Link href={route('register')} className="group">
              Start Your Application Today
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
