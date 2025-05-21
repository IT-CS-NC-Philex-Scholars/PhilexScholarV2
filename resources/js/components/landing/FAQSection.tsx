import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "Who is eligible to apply for Philex Scholarships?",
      answer: "Eligibility varies by program. College scholarships require a minimum GPA of 85% and enrollment in at least 15 units. High school scholarships require a minimum GPA of 80%. All applicants must be currently enrolled in an accredited institution and willing to complete the required community service."
    },
    {
      question: "What documents do I need to submit with my application?",
      answer: "College students need to submit proof of enrollment, grade transcripts, and government ID. High school students need to submit a school ID, report card, and parent/guardian authorization form. Additional documents may be requested during the review process."
    },
    {
      question: "How is the scholarship funding disbursed?",
      answer: "Scholarship funds are disbursed after all requirements are met, including document verification and completion of community service hours. Disbursements are typically processed at the beginning of each semester."
    },
    {
      question: "What are the community service requirements?",
      answer: "College scholarship recipients must complete 6 days of community service, while high school recipients must complete 4 days. Service opportunities are coordinated through the Philex Scholarship program and can include various community projects."
    },
    {
      question: "Can I apply for multiple scholarship programs?",
      answer: "Students may only apply for one scholarship program at a time that matches their current academic level (high school or college). However, high school scholars may apply for the college scholarship upon graduation."
    },
    {
      question: "How competitive is the selection process?",
      answer: "The selection process is competitive, with a limited number of slots available each academic year. Applications are evaluated based on academic achievement, financial need, and potential for community impact."
    }
  ];

  return (
    <div className="bg-background py-16 md:py-24" id="faq">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about the Philex Scholarship program and application process.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Have more questions? <a href="#contact" className="text-primary underline underline-offset-4">Contact our support team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
