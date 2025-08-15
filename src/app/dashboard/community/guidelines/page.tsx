"use client";
import { useState } from "react";
import { 
  ChevronLeft, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  MessageSquare,
  Shield,
  Heart,
  Flag,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

export default function CommunityGuidelinesPage() {
  const [activeSection, setActiveSection] = useState("all");
  const { collapsed } = useSidebar();
  
  const guidelines = {
    all: [
      {
        title: "Be Respectful and Kind",
        description: "Treat all community members with respect and kindness. Personal attacks, harassment, and discriminatory language are not tolerated.",
        icon: <Heart className="h-6 w-6 text-red-500" />,
        type: "essential"
      },
      {
        title: "Share Your Experiences",
        description: "Feel free to share your personal experiences with mental health. Your story might help others who are going through similar situations.",
        icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
        type: "encouraged"
      },
      {
        title: "No Spam or Self-Promotion",
        description: "Do not post spam or promote products/services without permission. All promotional content must be approved by moderators.",
        icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
        type: "prohibited"
      },
      {
        title: "Respect Privacy and Confidentiality",
        description: "Do not share personal information about others without their consent. Respect the privacy of all community members.",
        icon: <Shield className="h-6 w-6 text-green-500" />,
        type: "essential"
      },
      {
        title: "Report Inappropriate Content",
        description: "Help us maintain a safe environment by reporting posts or comments that violate our guidelines.",
        icon: <Flag className="h-6 w-6 text-purple-500" />,
        type: "encouraged"
      },
      {
        title: "Use Appropriate Language",
        description: "Avoid using offensive, vulgar, or inappropriate language. Keep discussions constructive and respectful.",
        icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
        type: "prohibited"
      },
      {
        title: "Stay On Topic",
        description: "Keep discussions relevant to the forum category. Off-topic posts may be moved or removed by moderators.",
        icon: <BookOpen className="h-6 w-6 text-indigo-500" />,
        type: "essential"
      },
      {
        title: "Be Open-Minded",
        description: "Respect different perspectives and be open to learning from others. Mental health journeys are unique to each individual.",
        icon: <Users className="h-6 w-6 text-teal-500" />,
        type: "encouraged"
      }
    ],
    essential: [],
    encouraged: [],
    prohibited: []
  };
  
  // Filter guidelines based on active section
  const filteredGuidelines = activeSection === "all" 
    ? guidelines.all 
    : guidelines[activeSection as keyof typeof guidelines] || [];
    
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/community">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Community Guidelines</h1>
          </div>
        </div>
        
        {/* Header */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-6 w-6 text-yellow-300" />
                  <Badge className="bg-yellow-500 text-white border-0">Guidelines</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-4">Our Community Standards</h2>
                <p className="text-blue-100">
                  These guidelines help us maintain a safe, supportive, and inclusive environment for all members of the SerenAI community. 
                  By participating, you agree to follow these standards.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button 
            variant={activeSection === "all" ? "default" : "outline"}
            onClick={() => setActiveSection("all")}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            All Guidelines
          </Button>
          <Button 
            variant={activeSection === "essential" ? "default" : "outline"}
            onClick={() => setActiveSection("essential")}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Essential Rules
          </Button>
          <Button 
            variant={activeSection === "encouraged" ? "default" : "outline"}
            onClick={() => setActiveSection("encouraged")}
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            Encouraged Behaviors
          </Button>
          <Button 
            variant={activeSection === "prohibited" ? "default" : "outline"}
            onClick={() => setActiveSection("prohibited")}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Prohibited Actions
          </Button>
        </div>
        
        {/* Guidelines List */}
        <div className="space-y-6">
          {filteredGuidelines.map((guideline, index) => (
            <Card key={index} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="mt-1">
                    {guideline.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium">{guideline.title}</h3>
                      <Badge 
                        variant={
                          guideline.type === "essential" ? "default" : 
                          guideline.type === "encouraged" ? "secondary" : "destructive"
                        }
                        className={
                          guideline.type === "essential" ? "bg-blue-100 text-blue-800" : 
                          guideline.type === "encouraged" ? "bg-green-100 text-green-800" : 
                          "bg-red-100 text-red-800"
                        }
                      >
                        {guideline.type === "essential" ? "Essential" : 
                         guideline.type === "encouraged" ? "Encouraged" : "Prohibited"}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{guideline.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Reporting Section */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flag className="h-5 w-5 text-blue-600" />
              How to Report Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you see content that violates these guidelines, please report it to our moderation team. 
              We take all reports seriously and will investigate promptly.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Click the Report Button</h4>
                  <p className="text-sm text-gray-600">Find the report button on the post or comment</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Select a Reason</h4>
                  <p className="text-sm text-gray-600">Choose the guideline that&apos;s being violated</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Add Details (Optional)</h4>
                  <p className="text-sm text-gray-600">Provide additional context to help moderators</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Submit Report</h4>
                  <p className="text-sm text-gray-600">Our team will review and take appropriate action</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Consequences Section */}
        <Card className="mt-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Consequences for Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Violations of these guidelines may result in actions ranging from warnings to permanent bans, 
              depending on the severity and frequency of the violations.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">First Violation</h4>
                  <p className="text-sm text-gray-600">Warning and content removal</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Second Violation</h4>
                  <p className="text-sm text-gray-600">Temporary suspension (1-7 days)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Severe or Repeated Violations</h4>
                  <p className="text-sm text-gray-600">Permanent ban from the community</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have questions about these guidelines or need to report a violation, 
              please contact our moderation team.
            </p>
            <Link href="/dashboard/contact-support">
              <Button className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Contact Moderators
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}