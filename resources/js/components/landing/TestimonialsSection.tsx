import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteIcon } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "The Philex Scholarship has been life-changing. Not only did it ease my financial burden, but the community service component helped me grow as a person.",
      name: "Maria Santos",
      role: "College Scholar",
      initials: "MS"
    },
    {
      quote: "As a high school student, the Future Leaders Scholarship gave me confidence and resources to pursue my academic goals. The mentorship was invaluable.",
      name: "James Wilson",
      role: "High School Scholar",
      initials: "JW"
    },
    {
      quote: "The application process was straightforward, and the support from the Philex team throughout my academic journey has been exceptional.",
      name: "Sophia Chen",
      role: "College Scholar",
      initials: "SC"
    }
  ];

  return (
    <div className="bg-muted/50 py-16 md:py-24" id="testimonials">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Scholar Testimonials</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from students whose academic journeys have been transformed by the Philex Scholarship program.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border">
              <CardContent className="p-6">
                <QuoteIcon className="h-8 w-8 text-primary/20 mb-4" />
                <p className="mb-6 text-muted-foreground">{testimonial.quote}</p>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
