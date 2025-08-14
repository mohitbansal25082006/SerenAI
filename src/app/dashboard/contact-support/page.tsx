"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  MessageSquare, 
  Phone, 
  Clock, 
  CheckCircle, 
  Send,
  Users,
  Headphones,
  BookOpen,
  ExternalLink,
  Shield,
  Heart,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";
import { toast } from "sonner";

export default function ContactSupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { collapsed } = useSidebar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Your message has been sent! We&apos;ll get back to you soon.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 1500);
  };

  const supportTeam = [
    {
      name: "Sarah Johnson",
      role: "Mental Health Specialist",
      bio: "Licensed therapist with 8+ years of experience in digital mental health solutions.",
      avatar: <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><Users className="h-6 w-6 text-blue-600" /></div>
    },
    {
      name: "Michael Chen",
      role: "Technical Support Lead",
      bio: "Expert in AI systems and user experience with a background in psychology.",
      avatar: <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><Headphones className="h-6 w-6 text-green-600" /></div>
    },
    {
      name: "Emma Rodriguez",
      role: "Community Manager",
      bio: "Passionate about building supportive communities and connecting users with resources.",
      avatar: <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><Heart className="h-6 w-6 text-purple-600" /></div>
    }
  ];

  const supportHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM EST" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM EST" },
    { day: "Sunday", hours: "Closed" }
  ];

  const faqItems = [
    {
      question: "How quickly will I receive a response?",
      answer: "We typically respond to all inquiries within 24 business hours. For urgent matters, please use our crisis resources."
    },
    {
      question: "Can I schedule a call with support?",
      answer: "Yes, premium users can schedule a 30-minute call with our support team through the dashboard."
    },
    {
      question: "Do you offer support in languages other than English?",
      answer: "Currently, our support is available in English, but we&apos;re working on adding more languages soon."
    }
  ];

  const crisisResources = [
    {
      name: "National Suicide Prevention Lifeline",
      description: "24/7, free and confidential support for people in distress",
      contact: "Call or text 988",
      url: "https://suicidepreventionlifeline.org"
    },
    {
      name: "Crisis Text Line",
      description: "Text with a trained crisis counselor",
      contact: "Text HOME to 741741",
      url: "https://www.crisistextline.org"
    },
    {
      name: "The Trevor Project",
      description: "Crisis intervention and suicide prevention services for LGBTQ youth",
      contact: "Call 1-866-488-7386",
      url: "https://www.thetrevorproject.org"
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Contact Support</h1>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">We&apos;re here to help</h2>
                  <p className="mb-6 text-blue-100 max-w-2xl">
                    Our dedicated support team is ready to assist you with any questions or concerns you may have about SerenAI. 
                    We typically respond within 24 business hours.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send a Message
                    </Button>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Us
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="w-48 h-48 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Headphones className="h-20 w-20 text-white/80" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="team">Our Team</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Contact Form Tab */}
          <TabsContent value="contact" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Send us a message
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below and we&apos;ll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Name</label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email</label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Subject</label>
                        <Input
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="What can we help you with?"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Message</label>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Tell us more about your question or issue..."
                          rows={5}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-gray-600">support@serenai.app</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Hours</h3>
                      <div className="space-y-1">
                        {supportHours.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.day}</span>
                            <span className="text-gray-600">{item.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {faqItems.map((item, index) => (
                      <div key={index}>
                        <h3 className="font-medium mb-1">{item.question}</h3>
                        <p className="text-sm text-gray-600">{item.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Our Team Tab */}
          <TabsContent value="team" className="mt-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Meet our support team</h2>
              <p className="text-gray-600 max-w-2xl">
                Our dedicated team of professionals is here to provide you with the best possible support experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportTeam.map((member, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="pt-8 text-center">
                    <div className="flex justify-center mb-4">
                      {member.avatar}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                    <Badge variant="outline" className="mb-3">{member.role}</Badge>
                    <p className="text-gray-600 text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Additional Resources</h2>
              <p className="text-gray-600 max-w-2xl">
                Explore these resources for additional support and information about mental health and wellness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crisis Resources */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Shield className="h-5 w-5" />
                    Crisis Resources
                  </CardTitle>
                  <CardDescription>
                    If you&apos;re in crisis, please reach out to these resources immediately
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {crisisResources.map((resource, index) => (
                    <div key={index} className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-medium mb-1">{resource.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{resource.contact}</span>
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Educational Resources */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                    Educational Resources
                  </CardTitle>
                  <CardDescription>
                    Learn more about mental health and wellness from these trusted sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-1">National Institute of Mental Health</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Information on mental disorders, treatments, and the latest research
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://www.nimh.nih.gov" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </a>
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-1">Mental Health America</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Screening tools, resources, and advocacy for mental health
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://www.mhanational.org" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </a>
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-1">Anxiety and Depression Association of America</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Resources for understanding and managing anxiety and depression
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://adaa.org" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}