"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Heart, 
  Shield, 
  MessageSquare, 
  BookOpen, 
  BarChart3,
  Volume2,
  VolumeX,
  Sparkles,
  Star,
  Users,
  Zap,
  Brain,
  Lock,
  Award,
  CheckCircle,
  LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const { isSignedIn } = useAuth();
  const router = useRouter();
  
  // Features data
  const features = [
    {
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      title: "Empathetic AI",
      description: "Experience conversations that understand and respond to your emotional needs.",
      color: "bg-blue-500",
      details: [
        "Natural language processing",
        "Emotion recognition",
        "Personalized responses"
      ]
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: "Privacy First",
      description: "Your data is encrypted and secure. We never share your personal information.",
      color: "bg-green-500",
      details: [
        "End-to-end encryption",
        "Zero data retention policy",
        "GDPR compliant"
      ]
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: "Personalized Insights",
      description: "Gain deeper understanding of your emotional patterns with AI-powered analysis.",
      color: "bg-purple-500",
      details: [
        "Mood pattern recognition",
        "Progress tracking",
        "Custom wellness reports"
      ]
    },
    {
      icon: <BookOpen className="h-6 w-6 text-white" />,
      title: "Journaling & Mood Tracking",
      description: "Document your thoughts and track emotional patterns with AI-generated prompts.",
      color: "bg-yellow-500",
      details: [
        "Guided journaling",
        "Mood visualization",
        "Reflection prompts"
      ]
    },
    {
      icon: <Heart className="h-6 w-6 text-white" />,
      title: "Safety & Support",
      description: "Built-in safety protocols and resources to guide you toward professional help.",
      color: "bg-pink-500",
      details: [
        "Crisis intervention protocols",
        "Resource directory",
        "Professional referrals"
      ]
    },
    {
      icon: <Brain className="h-6 w-6 text-white" />,
      title: "Cognitive Exercises",
      description: "Engage in scientifically-backed exercises to improve mental resilience.",
      color: "bg-indigo-500",
      details: [
        "Mindfulness practices",
        "Cognitive behavioral techniques",
        "Stress reduction exercises"
      ]
    }
  ];
  
  // Testimonials
  const testimonials = [
    {
      quote: "SerenAI has been a comforting presence during difficult times. It's like having a supportive friend available 24/7.",
      author: "Sarah, Premium User"
    },
    {
      quote: "The mood tracking feature helped me identify patterns I never noticed before. Truly transformative!",
      author: "Michael, Therapist"
    },
    {
      quote: "As someone who struggles to open up, SerenAI provided a safe space to express my feelings without judgment.",
      author: "Alex, Student"
    }
  ];
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video autoplay failed:", error);
      });
    }
    // Handle scroll for parallax effects
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Toggle audio
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  // Navigate to dashboard
  const goToDashboard = () => {
    router.push("/dashboard");
  };
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Audio */}
      <audio ref={audioRef} loop>
        <source src="/sound/ocean.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Audio Toggle Button */}
      <button 
        onClick={toggleAudio}
        className="fixed top-6 right-6 z-50 bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-all duration-300"
        aria-label={isAudioPlaying ? "Mute sound" : "Unmute sound"}
      >
        {isAudioPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>
      
      {/* User Profile Button (only visible when signed in) */}
      {isSignedIn && (
        <div className="fixed top-6 right-20 z-50">
          <UserButton afterSignOutUrl="/" />
        </div>
      )}
      
      {/* Video Background */}
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          onLoadedData={() => {
            setIsVideoLoaded(true);
            console.log("Video loaded:", isVideoLoaded);
          }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="h-4 w-4 text-blue-300" />
              <span className="text-blue-300 text-sm font-medium">Revolutionary AI Mental Wellness</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Find Peace with <span className="text-blue-400">SerenAI</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
              Your compassionate AI companion for mental wellness. Chat, journal, and track your mood with privacy-first
              design.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isSignedIn ? (
                <Button 
                  size="lg" 
                  onClick={goToDashboard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-blue-500/50"
                >
                  Go to Dashboard <LayoutDashboard className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-blue-500/50">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg backdrop-blur-sm bg-white/10 transition-all duration-300"
                    >
                      Create Account
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
            
            <motion.div 
              className="mt-12 flex justify-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">98%</div>
                <div className="text-sm text-blue-200">User Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">24/7</div>
                <div className="text-sm text-blue-200">Availability</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-300">1M+</div>
                <div className="text-sm text-blue-200">Active Users</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Features Section */}
        <div className="py-20 bg-gradient-to-b from-transparent to-black/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features for Your Wellness Journey</h2>
              <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                SerenAI combines cutting-edge AI with evidence-based therapeutic techniques to support your mental health.
              </p>
            </motion.div>
            
            {/* Feature Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {features.map((feature, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeFeature === index 
                      ? `${feature.color} text-white shadow-lg` 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {feature.title}
                </motion.button>
              ))}
            </div>
            
            {/* Active Feature Display */}
            <motion.div
              className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeFeature}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className={`${features[activeFeature].color} w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0`}>
                  {features[activeFeature].icon}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">{features[activeFeature].title}</h3>
                  <p className="text-lg text-blue-100 mb-4">{features[activeFeature].description}</p>
                  <ul className="space-y-2">
                    {features[activeFeature].details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-blue-100">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="py-20 bg-gradient-to-b from-black/30 to-black/50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How SerenAI Works</h2>
              <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                Getting started with SerenAI is simple and takes just a few minutes.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: 1,
                  title: "Create Your Account",
                  description: "Sign up in seconds with complete privacy protection.",
                  icon: <Users className="h-8 w-8 text-blue-400" />
                },
                {
                  step: 2,
                  title: "Share Your Feelings",
                  description: "Chat naturally with our AI companion about your thoughts and emotions.",
                  icon: <MessageSquare className="h-8 w-8 text-purple-400" />
                },
                {
                  step: 3,
                  title: "Gain Insights",
                  description: "Receive personalized insights and track your emotional patterns over time.",
                  icon: <BarChart3 className="h-8 w-8 text-green-400" />
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                    {step.icon}
                  </div>
                  <div className="text-blue-400 font-bold text-lg mb-2">Step {step.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-blue-100">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div className="py-20 bg-gradient-to-b from-black/50 to-black/70">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
              <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                Join thousands who have transformed their mental wellness journey with SerenAI.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg italic text-white mb-4">
                    &quot;{testimonial.quote}&quot;
                  </blockquote>
                  <p className="text-blue-300">- {testimonial.author}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-b from-black/70 to-black">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Your Wellness Journey?
              </h2>
              <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-8">
                Join thousands who have transformed their mental health with SerenAI.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isSignedIn ? (
                  <Button 
                    size="lg" 
                    onClick={goToDashboard}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-blue-500/50"
                  >
                    Go to Dashboard <LayoutDashboard className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-blue-500/50">
                        Get Started <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white text-white hover:bg-white hover:text-black px-8 py-3 text-lg backdrop-blur-sm bg-white/10 transition-all duration-300"
                      >
                        Create Account
                      </Button>
                    </SignUpButton>
                  </>
                )}
              </div>
              
              <motion.div 
                className="mt-12 flex justify-center gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-green-400" />
                  <span className="text-green-400">100% Private & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400">Clinically Validated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-400">Instant Access</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}