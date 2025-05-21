import { GraduationCapIcon, UsersIcon, DollarSignIcon, HeartHandshakeIcon } from "lucide-react";

export function StatsSection() {
  const stats = [
    {
      icon: GraduationCapIcon,
      value: "100+",
      label: "Scholars Supported",
      description: "Students receiving financial aid annually"
    },
    {
      icon: DollarSignIcon,
      value: "$750K",
      label: "Scholarship Funding",
      description: "Total annual scholarship budget"
    },
    {
      icon: HeartHandshakeIcon,
      value: "1,000+",
      label: "Service Hours",
      description: "Community service completed by scholars"
    },
    {
      icon: UsersIcon,
      value: "85%",
      label: "Graduation Rate",
      description: "Scholars who complete their degrees"
    }
  ];

  return (
    <div className="bg-muted py-16" id="impact">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Our Impact</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The Philex Scholarship program has made a significant difference in the lives of students and communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card rounded-lg p-6 text-center border shadow-sm">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="font-medium text-sm mb-2">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
