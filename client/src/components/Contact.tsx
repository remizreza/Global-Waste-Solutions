import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Message Sent",
      description: "Thank you for contacting REDOXY. We will get back to you shortly.",
    });
    form.reset();
  }

  return (
    <section id="contact" className="py-24 bg-background relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Contact Info */}
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-display font-bold text-white mb-6">
              GET IN TOUCH
            </h2>
            <p className="text-gray-400 mb-10 text-lg font-light">
              Interested in our modular waste solutions? Contact our team in Jubail to discuss how REDOXY can optimize your industrial infrastructure.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-display font-bold mb-1">Headquarters</h4>
                  <p className="text-gray-400">Jubail, Saudi Arabia</p>
                  <p className="text-gray-500 text-sm mt-1">Operating in KSA & UAE</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-display font-bold mb-1">Email Us</h4>
                  <a href="mailto:info@redoxyksa.com" className="text-gray-400 hover:text-primary transition-colors">
                    info@redoxyksa.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:w-1/2">
            <div className="bg-card border border-white/5 p-8 rounded-lg">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} className="bg-background border-white/10 text-white focus:border-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@company.com" {...field} className="bg-background border-white/10 text-white focus:border-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="How can we help you?" {...field} className="bg-background border-white/10 text-white focus:border-primary/50 min-h-[120px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-primary text-background font-bold hover:bg-primary/90">
                    SEND MESSAGE
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
