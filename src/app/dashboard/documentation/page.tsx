"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Search, 
  ChevronLeft, 
  FileText, 
  Video, 
  Download,
  CheckCircle,
  Clock,
  Users,
  Shield,
  MessageSquare,
  BarChart3,
  Settings,
  Activity,
  Brain,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/contexts/SidebarContext";
import Link from "next/link";

interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  difficulty: "beginner" | "intermediate" | "advanced";
  readTime: string;
  lastUpdated: string;
  content: string;
}

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<DocumentationItem | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { collapsed } = useSidebar();
  const documentationRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: "all", name: "All Topics", icon: <BookOpen className="h-4 w-4" /> },
    { id: "getting-started", name: "Getting Started", icon: <CheckCircle className="h-4 w-4" /> },
    { id: "features", name: "Features", icon: <Settings className="h-4 w-4" /> },
    { id: "chat", name: "AI Chat", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "journal", name: "Journaling", icon: <FileText className="h-4 w-4" /> },
    { id: "mood", name: "Mood Tracking", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "activities", name: "Activities", icon: <Activity className="h-4 w-4" /> },
    { id: "insights", name: "Insights", icon: <Brain className="h-4 w-4" /> },
    { id: "privacy", name: "Privacy & Security", icon: <Shield className="h-4 w-4" /> },
  ];

  const documentationItems: DocumentationItem[] = [
    {
      id: "intro",
      title: "Introduction to SerenAI",
      description: "Learn about SerenAI and how it can support your mental wellness journey.",
      category: "getting-started",
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
      difficulty: "beginner",
      readTime: "5 min",
      lastUpdated: "2 days ago",
      content: `
# Introduction to SerenAI
SerenAI is an innovative mental wellness platform designed to support you on your journey toward better mental health. By combining artificial intelligence with evidence-based therapeutic techniques, SerenAI provides personalized support, guidance, and tools to help you navigate life's challenges.
## What is SerenAI?
SerenAI is a comprehensive mental wellness companion that offers:
- **AI-Powered Conversations**: Chat with our AI assistant trained to provide supportive, non-judgmental conversations.
- **Journaling Tools**: Express your thoughts and feelings through guided journaling exercises.
- **Mood Tracking**: Monitor your emotional patterns and gain insights into your mental well-being.
- **Wellness Activities**: Access a variety of activities designed to reduce stress and improve mental health.
- **Personalized Insights**: Receive AI-generated insights based on your journal entries and mood patterns.
## How SerenAI Can Help
SerenAI supports your mental wellness journey by:
1. **Daily Support**: Available 24/7 for conversations whenever you need support.
2. **Self-Reflection**: Through journaling and mood tracking, helps develop greater self-awareness.
3. **Coping Strategies**: Learn evidence-based techniques to manage stress, anxiety, and other mental health challenges.
4. **Progress Tracking**: Monitor your mental wellness journey and celebrate your progress.
## Who Can Benefit from SerenAI?
SerenAI is designed for anyone looking to improve their mental well-being, including:
- Individuals experiencing stress or anxiety
- Those seeking healthier coping mechanisms
- People interested in self-reflection and personal growth
- Anyone wanting to build resilience and emotional intelligence
## Getting Started
1. Create an account and complete the initial setup process
2. Explore the dashboard to access all features
3. Start with a conversation in the AI chat or create your first journal entry
4. Track your mood regularly to establish patterns
Remember, while SerenAI is a powerful tool for mental wellness, it's not a replacement for professional mental health care.
      `
    },
    {
      id: "first-steps",
      title: "First Steps with SerenAI",
      description: "A quick guide to get you started with your first conversation and journal entry.",
      category: "getting-started",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      difficulty: "beginner",
      readTime: "8 min",
      lastUpdated: "1 week ago",
      content: `
# First Steps with SerenAI
Welcome to SerenAI! This guide will walk you through your first steps with the platform.
## Setting Up Your Account
1. **Create Your Profile**: When you first sign up, you'll be asked to create a profile with basic information.
2. **Complete the Wellness Assessment**: This brief assessment helps personalize your experience.
3. **Set Your Goals**: Identify what you hope to achieve with SerenAI.
## Your First Conversation
1. Navigate to the **Chat** section from the main menu.
2. You'll see a welcome message from your AI assistant.
3. Share what's on your mind, how you're feeling, or what you'd like to work on.
4. The AI will respond with supportive, thoughtful responses.
**Tips for Effective Conversations**:
- Be open and honest about your feelings
- Don't worry about judgment—the AI is programmed to be supportive
- Take your time and respond at your own pace
## Your First Journal Entry
1. Go to the **Journal** section from the main menu.
2. Click on "New Entry" to start a new journal post.
3. You'll see optional prompts to guide your writing.
4. Express your thoughts, feelings, and experiences without censorship.
**Journaling Prompts for Beginners**:
- How am I feeling today, and why?
- What was a highlight of my day?
- What's something I'm grateful for right now?
## Exploring Mood Tracking
1. Navigate to the **Mood** section from the main menu.
2. Select how you're feeling from the mood options provided.
3. Optionally, add notes about what might be influencing your mood.
4. Over time, you'll be able to see patterns and trends.
## Trying Wellness Activities
1. Go to the **Activities** section from the main menu.
2. Browse activities like guided meditations, breathing exercises, and more.
3. Select an activity that interests you and follow the instructions.
4. After completing, rate its effectiveness and note any insights.
## Next Steps
- Set a regular time each day to check in with your mood
- Schedule journaling sessions at consistent times
- Explore different wellness activities to find what works best
- Return to the AI chat whenever you need support
      `
    },
    {
      id: "ai-chat",
      title: "Using the AI Chat Feature",
      description: "Learn how to have meaningful conversations with SerenAI and get the most out of your sessions.",
      category: "chat",
      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
      difficulty: "beginner",
      readTime: "10 min",
      lastUpdated: "3 days ago",
      content: `
# Using the AI Chat Feature
The AI Chat feature is one of the core components of SerenAI, designed to provide supportive, non-judgmental conversations whenever you need them.
## What is the AI Chat?
The AI Chat is an interactive conversation interface where you can communicate with SerenAI's artificial intelligence. The AI has been trained on therapeutic principles and is designed to:
- Provide supportive, empathetic responses
- Help you explore your thoughts and feelings
- Offer perspective on challenges you're facing
- Suggest coping strategies and techniques
- Guide you through self-reflection exercises
## Starting a Conversation
1. Navigate to the **Chat** section from the main menu.
2. You'll see a welcome message and suggested conversation starters.
3. Type your message in the input field and press send to begin.
## Types of Conversations You Can Have
### Emotional Support
If you're feeling upset, anxious, or overwhelmed, share these feelings with the AI. It will provide validation and help you process your emotions.
### Problem Solving
When facing a specific challenge, the AI can help you explore potential solutions and consider different perspectives.
### Self-Reflection
The AI can guide you through reflective exercises to help you gain insight into your thoughts and behaviors.
### Skill Building
Learn and practice specific mental wellness skills, such as cognitive restructuring, mindfulness, or communication techniques.
## Tips for Effective Conversations
- Be open and honest about your thoughts and feelings
- Provide context for better understanding
- Ask specific questions for more relevant guidance
- Take your time without rushing
- Be open to exploring new perspectives
## Understanding the AI's Responses
The AI provides responses that are:
- **Supportive**: Validating your feelings and experiences
- **Non-judgmental**: Accepting your thoughts without criticism
- **Guiding**: Helping you explore your own insights
- **Educational**: Providing information about mental wellness concepts
## Limitations of the AI Chat
- The AI is not a licensed therapist and cannot provide professional treatment
- It cannot diagnose mental health conditions
- It's not designed for crisis intervention
## Privacy and Confidentiality
Your conversations are private and secure. We use industry-standard encryption to protect your data.
## Making Chat Part of Your Routine
- Schedule daily or weekly check-ins
- Use during times of stress or emotional difficulty
- Reflect on conversations through journaling
- Track how you feel before and after sessions
      `
    },
    {
      id: "journaling",
      title: "Journaling for Mental Wellness",
      description: "Discover how journaling can help you process emotions and track your mental health journey.",
      category: "journal",
      icon: <FileText className="h-6 w-6 text-yellow-500" />,
      difficulty: "intermediate",
      readTime: "12 min",
      lastUpdated: "5 days ago",
      content: `
# Journaling for Mental Wellness
Journaling is a powerful tool for mental wellness that can help you process emotions, gain clarity, and track your personal growth.
## The Benefits of Journaling
- **Emotional Processing**: Writing about feelings helps process complex emotions and reduce intensity.
- **Stress Reduction**: Journaling lowers stress by helping organize thoughts and prioritize concerns.
- **Self-Awareness**: Regular journaling increases self-awareness by identifying patterns in thoughts and behaviors.
- **Problem Solving**: Writing about challenges often leads to new perspectives and solutions.
- **Gratitude Practice**: Journaling helps cultivate gratitude by acknowledging positive aspects of life.
## Getting Started with Journaling in SerenAI
1. Navigate to the **Journal** section from the main menu.
2. Click "New Entry" to create a new journal post.
3. You'll see optional prompts if you'd like guidance, or you can write freely.
4. Express yourself without censorship—this is your space for honest reflection.
5. When finished, save your entry to return to later.
## Types of Journaling
### Free Writing
Write continuously without worrying about grammar or structure. Let thoughts flow naturally.
### Prompted Journaling
Use specific questions or prompts to guide your writing. SerenAI offers various prompts based on your needs.
### Gratitude Journaling
List things you're grateful for each day to shift focus to positive aspects of life.
### Reflective Journaling
Reflect on specific experiences, interactions, or emotions to gain deeper understanding.
### Goal-Oriented Journaling
Track progress toward personal goals and note successes and challenges.
## Journaling Prompts to Get You Started
### For Self-Reflection
- What emotions am I experiencing right now, and what might be causing them?
- What's something I learned about myself today?
- When did I feel most like myself today, and why?
### For Processing Challenges
- What's been on my mind lately, and how is it affecting me?
- What's a challenge I'm facing, and what small step could I take?
- How have I successfully handled similar situations in the past?
### For Cultivating Gratitude
- What's something good that happened today, no matter how small?
- Who is someone I'm grateful for, and why?
- What's something I often take for granted that I appreciate?
## Making Journaling a Habit
- Set a regular time each day for journaling
- Start small with just 5-10 minutes per day
- Create a ritual by pairing it with a comforting beverage or calming music
- Use reminders in SerenAI to journal at your chosen time
- Be flexible if you miss a day
## Overcoming Common Journaling Challenges
### "I Don't Know What to Write"
Use prompts, write about your day, or describe what you're seeing or feeling in the moment.
### "I'm Afraid of Someone Reading My Journal"
Remember that SerenAI journals are private and secure.
### "I Don't Have Time"
Even brief journaling can be beneficial. Try bullet points or quick sentences.
### "I'm Not a Good Writer"
Journaling isn't about perfect prose. It's about honest expression.
## Advanced Journaling Techniques
### Dialogue Journaling
Write a conversation between different parts of yourself or with a person or situation.
### Unsent Letters
Write letters you never intend to send, expressing feelings you might not share directly.
### Future Self Journaling
Write to or as your future self, exploring aspirations and envisioning the person you want to become.
## Integrating Journaling with Other Features
- Journal before using the AI Chat to organize your thoughts
- Reflect on insights from your conversations with the AI
- Note how journaling affects your mood over time
- Journal about your experiences with wellness activities
Journaling is a personal practice. Experiment with different approaches to find what works best for you.
      `
    },
    {
      id: "mood-tracking",
      title: "Understanding Mood Patterns",
      description: "Learn how to track your mood and identify patterns that affect your mental well-being.",
      category: "mood",
      icon: <BarChart3 className="h-6 w-6 text-red-500" />,
      difficulty: "intermediate",
      readTime: "15 min",
      lastUpdated: "1 week ago",
      content: `
# Understanding Mood Patterns
Mood tracking is a powerful tool for gaining insight into your emotional well-being. By regularly monitoring your moods, you can identify patterns, recognize triggers, and make more informed decisions about your mental health care.
## Why Track Your Mood?
- **Identify Patterns**: Recognize recurring patterns in your emotional states.
- **Recognize Triggers**: Identify specific triggers that affect your emotional well-being.
- **Measure Progress**: Track your emotional journey over time.
- **Inform Treatment**: Provide valuable information to guide treatment decisions.
- **Increase Self-Awareness**: Develop greater emotional intelligence.
## Getting Started with Mood Tracking
1. Navigate to the **Mood** section from the main menu.
2. Select the option that best represents how you're feeling.
3. Optionally, add notes about what might be influencing your mood.
4. Save your entry to track over time.
## How to Rate Your Mood
### Emoji Scale
Select from emojis representing different emotional states, from very positive to very negative.
### Numerical Scale
Rate your mood on a numerical scale, typically from 1 (very negative) to 10 (very positive).
### Specific Emotions
Choose from specific emotions that best describe your current state.
## What to Note When Tracking Your Mood
### External Factors
- Weather, significant events, social interactions, work or school stressors
### Internal Factors
- Sleep quality, physical health, medication changes, hormonal cycles
### Behaviors
- Exercise, diet, substance use, screen time
## Analyzing Your Mood Data
SerenAI helps you make sense of your mood data through:
- Visual charts showing your mood trends over time
- Pattern recognition for recurring emotional states
- Correlation analysis between mood and other factors
- AI-generated insights and suggestions
## Making the Most of Mood Tracking
- Be consistent with your tracking times
- Be honest about your feelings
- Provide context for more valuable data
- Review your data regularly to identify trends
- Use insights to inform your mental health care
## Interpreting Mood Patterns
### Daily Rhythms
Natural fluctuations in mood throughout the day, such as lower energy in the morning or evening.
### Weekly Patterns
Mood differences related to specific days, such as "Sunday scaries" or "Monday blues."
### Seasonal Variations
Seasonal changes that can significantly impact mood, particularly during winter months.
## Using Mood Data for Better Mental Health
- Identify triggers to develop management strategies
- Create environments that support positive moods
- Schedule important tasks during optimal mood times
- Share data with mental health providers
## Privacy and Mood Data
Your mood data is private and secure. We use industry-standard encryption to protect your information.
## Integrating Mood Tracking with Other Features
- Combine with journaling for deeper reflection
- Discuss patterns with the AI for management strategies
- Use mood data to select appropriate wellness activities
- Combine with other data for comprehensive insights
Mood tracking is a journey of self-discovery. With consistent practice, you'll gain valuable insights into your emotional patterns.
      `
    },
    {
      id: "activities",
      title: "Wellness Activities Guide",
      description: "Explore different activities designed to improve your mental wellness and reduce stress.",
      category: "activities",
      icon: <Activity className="h-6 w-6 text-green-500" />,
      difficulty: "beginner",
      readTime: "7 min",
      lastUpdated: "4 days ago",
      content: `
# Wellness Activities Guide
Wellness activities are structured exercises designed to support your mental health and emotional well-being. SerenAI offers a variety of activities that you can incorporate into your daily routine.
## Types of Wellness Activities
### Mindfulness and Meditation
Activities that develop present-moment awareness and cultivate a calm, focused state of mind.
### Breathing Exercises
Techniques to regulate your nervous system and reduce stress through controlled breathing.
### Physical Movement
Gentle exercises that connect mind and body, reducing tension and improving mood.
### Cognitive Exercises
Activities designed to challenge unhelpful thought patterns and develop healthier thinking.
### Gratitude Practices
Exercises to cultivate appreciation and positive emotions.
### Creative Expression
Activities that use creativity as a form of emotional release and self-expression.
## Getting Started with Wellness Activities
1. Navigate to the **Activities** section from the main menu.
2. Browse activities by category or search for specific types.
3. Select an activity that interests you.
4. Follow the guided instructions provided.
5. After completing, rate its effectiveness and note any insights.
## Mindfulness and Meditation
**Benefits**:
- Reduces stress and anxiety
- Improves focus and concentration
- Enhances emotional regulation
- Promotes better sleep
**Available Activities**:
- Body Scan Meditation
- Mindful Breathing
- Loving-Kindness Meditation
- Walking Meditation
**Tips for Success**:
- Start with short sessions (3-5 minutes)
- Find a quiet, comfortable space
- Be patient with wandering thoughts
- Practice regularly, even briefly
## Breathing Exercises
**Benefits**:
- Activates the relaxation response
- Reduces anxiety and stress
- Lowers blood pressure
- Improves focus
**Available Activities**:
- Box Breathing
- 4-7-8 Breathing
- Diaphragmatic Breathing
- Coherent Breathing
**Tips for Success**:
- Practice when you're not stressed first
- Find a comfortable position
- Focus on the sensation of breathing
- Use throughout the day for quick stress relief
## Physical Movement
**Benefits**:
- Releases endorphins that improve mood
- Reduces muscle tension
- Improves sleep quality
- Builds resilience to stress
**Available Activities**:
- Progressive Muscle Relaxation
- Gentle Yoga
- Stretching Routines
- Mindful Walking
**Tips for Success**:
- Move at your own pace
- Pay attention to bodily sensations
- Don't force uncomfortable positions
- Combine with breathing techniques
## Cognitive Exercises
**Benefits**:
- Reduces negative thinking
- Improves problem-solving
- Builds cognitive flexibility
- Enhances emotional regulation
**Available Activities**:
- Thought Challenging
- Cognitive Restructuring
- Socratic Questioning
- Decatastrophizing
**Tips for Success**:
- Be curious about your thoughts
- Look for evidence that supports and contradicts your thoughts
- Consider alternative perspectives
- Practice with small concerns first
## Gratitude Practices
**Benefits**:
- Increases happiness and life satisfaction
- Reduces depression and anxiety
- Improves sleep
- Strengthens relationships
**Available Activities**:
- Gratitude Journaling
- Gratitude Letter
- Gratitude Meditation
- Three Good Things
**Tips for Success**:
- Be specific about what you're grateful for
- Include both big and small things
- Focus on people and experiences, not just possessions
- Make it a daily practice
## Creative Expression
**Benefits**:
- Reduces stress
- Provides emotional release
- Improves mood
- Enhances self-awareness
**Available Activities**:
- Guided Imagery
- Expressive Writing
- Art Therapy
- Music Therapy
**Tips for Success**:
- Focus on the process, not the outcome
- Don't judge your creative efforts
- Use colors, shapes, or sounds that feel right to you
- Let it be playful and enjoyable
## Incorporating Activities into Your Routine
- Start small with short sessions (5-10 minutes)
- Schedule activities at specific times
- Link to existing habits (after brushing teeth, during lunch)
- Set reminders in SerenAI
- Mix different activities to keep it interesting
## Overcoming Common Challenges
### Lack of Time
Try 2-3 minute sessions when you're short on time.
### Difficulty Focusing
Start with guided activities that provide clear instructions.
### Physical Limitations
Choose activities that accommodate your physical abilities.
### Feeling Self-Conscious
Remember that these activities are personal and private.
### Forgetting to Practice
Set reminders and link activities to existing habits.
## Measuring the Impact
- Note your mood before and after activities
- Journal about your experiences and insights
- Use SerenAI's tracking features to monitor consistency
- Reflect on which activities you find most beneficial
Wellness activities are tools for building mental resilience. By regularly incorporating these practices, you'll develop valuable skills for navigating life's challenges.
      `
    },
    {
      id: "insights",
      title: "Understanding Your Insights",
      description: "Learn how to interpret the AI-generated insights and use them to improve your mental health.",
      category: "insights",
      icon: <Brain className="h-6 w-6 text-indigo-500" />,
      difficulty: "advanced",
      readTime: "18 min",
      lastUpdated: "2 weeks ago",
      content: `
# Understanding Your Insights
SerenAI's Insights feature uses artificial intelligence to analyze your journal entries, mood data, and wellness activities to provide personalized observations about your mental health patterns.
## What Are AI-Generated Insights?
Insights are observations and patterns identified by SerenAI's AI based on the data you've provided. These insights help you:
- Recognize patterns you might miss
- Identify correlations between different aspects of your life
- Understand how your thoughts, feelings, and behaviors interact
- Discover areas for growth and improvement
- Track your progress over time
## How Insights Are Generated
The AI analyzes your data using several techniques:
- Pattern recognition for recurring themes and emotions
- Correlation analysis between different factors
- Sentiment analysis of journal entries
- Trend analysis of mood and experiences
- Comparison to established psychological frameworks
## Accessing Your Insights
1. Navigate to the **Insights** section from the main menu.
2. You'll see various categories of insights based on your data.
3. Select an insight to learn more about what it means and how to apply it.
4. Filter insights by time period or category.
## Types of Insights You Might Receive
### Mood Patterns
Observations about your emotional states over time, such as:
- "Your mood tends to be highest on weekends"
- "You report feeling more anxious in the mornings"
- "Your mood has been improving over the past month"
### Trigger Identification
Potential triggers for emotional states, such as:
- "Work stress seems to correlate with lower mood ratings"
- "Social interactions appear to boost your energy levels"
- "Poor sleep quality is associated with more negative thoughts"
### Thought Patterns
Patterns in your thinking style, such as:
- "You often express self-critical thoughts"
- "You tend to focus on future worries"
- "You frequently use black-and-white thinking"
### Behavioral Insights
Observations about your behaviors and their impact, such as:
- "Journaling appears to improve your mood"
- "Exercise correlates with better sleep quality"
- "You're most productive in the morning"
### Growth Opportunities
Suggestions for areas to explore, such as:
- "Consider setting boundaries to reduce work stress"
- "Practicing gratitude might help with negative thoughts"
- "Mindfulness could help with morning anxiety"
## Interpreting Your Insights
- Look for recurring themes or correlations
- Consider context for the time period mentioned
- Be open to surprising connections
- Avoid overgeneralization
- Use insights as starting points for exploration
## Applying Insights to Your Wellness Journey
- Highlight areas for growth and attention
- Adjust your approach based on what's working
- Set specific, measurable goals
- Track changes after implementing new strategies
- Discuss relevant insights with mental health providers
## Examples of Insights in Action
### Sleep and Mood
**Insight**: "Poor sleep quality correlates with lower mood ratings the next day."
**Action**: Prioritize sleep hygiene, establish a bedtime routine, and track how improved sleep affects mood.
### Social Connection
**Insight**: "After social interactions, you report higher energy and better mood."
**Action**: Schedule regular social activities to boost well-being.
### Negative Thinking
**Insight**: "You frequently use all-or-nothing thinking in your journal entries."
**Action**: Practice cognitive restructuring techniques to challenge these thought patterns.
### Exercise Benefits
**Insight**: "On days you exercise, you report better sleep quality."
**Action**: Incorporate regular physical activity to improve both mood and sleep.
## Limitations of AI Insights
- Insights are not professional advice
- Based on available data (incomplete data may lead to incomplete insights)
- Identify correlations, not necessarily causation
- Use simplified models of complex human experiences
- Potential biases in AI systems
## Privacy and Your Data
Your personal data is secure and private. Insights are generated with secure processing, and your data is not shared without consent.
## Integrating Insights with Other Features
- Explore insights more deeply through reflective journaling
- Discuss insights with the AI to develop strategies
- Track how implementing insights affects your mood over time
- Select activities that address areas highlighted in insights
## Common Questions About Insights
### How Accurate Are Insights?
Insights are based on patterns in your data and are generally reliable, but they're interpretations, not facts.
### Can I Trust AI to Understand My Experiences?
AI is trained on psychological principles and can identify meaningful patterns, but it doesn't have human understanding.
### What If I Disagree with an Insight?
Your perspective is most important. Insights are tools for consideration, not absolute truths.
### How Often Are Insights Updated?
Insights update as you add more data. Regular use provides more accurate insights.
### Can Insights Replace Therapy?
No, insights are designed to support, not replace, professional mental health care.
## Getting the Most from Your Insights
- Provide consistent data through regular journaling and mood tracking
- Be honest and detailed in your entries
- Reflect on insights and how they relate to your experiences
- Experiment with applying insights and track results
- Discuss relevant insights with mental health providers
AI-generated insights are powerful tools for self-discovery. By thoughtfully considering and applying these insights, you can develop greater self-awareness and make informed decisions about your mental wellness.
      `
    },
    {
      id: "privacy",
      title: "Privacy and Data Security",
      description: "Understand how we protect your data and ensure your privacy while using SerenAI.",
      category: "privacy",
      icon: <Shield className="h-6 w-6 text-gray-500" />,
      difficulty: "intermediate",
      readTime: "10 min",
      lastUpdated: "3 weeks ago",
      content: `
# Privacy and Data Security
At SerenAI, we take your privacy and data security seriously. This guide explains how we protect your information and ensure your confidentiality.
## Our Privacy Commitment
We are committed to:
- Protecting your personal information
- Being transparent about data practices
- Giving you control over your information
- Complying with applicable privacy laws
- Continuously improving our security measures
## What Data We Collect
### Account Information
- Name and email address
- Profile information you choose to provide
- Preferences and settings
### Usage Data
- Journal entries and mood ratings
- Chat conversations with the AI
- Activities completed
- Time spent using features
- Frequency of use
### Technical Data
- Device information
- IP address
- Browser information
- App performance data
## How We Use Your Data
- Personalize your experience
- Generate insights and recommendations
- Respond to your inquiries
- Improve AI responses
- Enhance features and functionality
- Fix bugs and technical issues
- Ensure security and prevent fraud
- Communicate with you about services
## Data Security Measures
### Encryption
- All data is encrypted in transit using TLS
- Sensitive data is encrypted at rest
- End-to-end encryption for journal entries and chat conversations
### Access Controls
- Strict access controls limit who can view your data
- Multi-factor authentication for employee access
- Regular access reviews
### Secure Infrastructure
- Secure data centers with physical protections
- Regular security audits
- Continuous monitoring for threats
### Data Minimization
- Only collect data necessary for services
- Retain data only as long as needed
- Anonymize data when possible
## Your Privacy Choices
### Access and Correction
- View and update your profile information
- Export your data
- Request corrections to inaccurate information
### Data Deletion
- Delete your account and associated data
- Request specific data deletion
- Opt out of certain data collection
### Communication Preferences
- Choose what communications you receive
- Unsubscribe from marketing emails
- Manage notification settings
### Privacy Settings
- Control who can see your profile
- Manage data sharing preferences
- Adjust privacy settings
## AI and Privacy
### Local Processing
- Some AI processing occurs on your device
- Sensitive data may not leave your device
- Minimize data sent to servers
### Anonymization
- Personal identifiers removed when training AI models
- Aggregate data used for improvements
- Individual data not sold or shared
### Transparency
- Clear explanations of how AI uses your data
- Options to opt out of certain AI features
- Understandable privacy settings
## Children's Privacy
- We don't knowingly collect data from children under 13
- Parental consent required for minors
- Special protections for younger users
- Age-appropriate privacy information
## International Data Transfers
- Data may be processed in different countries
- Adequate safeguards for international transfers
- Compliance with international privacy laws
- Standard contractual clauses where required
## Data Retention
- Account information while account is active
- Usage data to provide services
- Legal compliance where required
- Your preferences for deletion
## Changes to Privacy Practices
- Notify users of significant changes
- Provide clear explanations of changes
- Allow time for review and adjustment
- Maintain historical versions for reference
## How to Report Privacy Concerns
### Contact Us
- Privacy contact information available in app
- Dedicated privacy team
- Prompt response to inquiries
### Regulatory Complaints
- Information about regulatory bodies
- How to file complaints
- Cooperation with investigations
### Security Incidents
- Notification process for breaches
- Timely communication
- Support for affected users
## Comparisons to Other Platforms
- No selling of personal data
- Limited data sharing with third parties
- Clear opt-in for data uses
- More control over your information
## Tips for Protecting Your Privacy
### Strong Passwords
- Use unique, complex passwords
- Enable two-factor authentication
- Change passwords regularly
### Device Security
- Keep devices updated
- Use security software
- Lock devices when not in use
### Sharing Information
- Be cautious about what you share
- Review privacy settings
- Consider implications before sharing
### Regular Reviews
- Periodically review privacy settings
- Check connected applications
- Update preferences as needed
## Privacy Resources
- Detailed Privacy Policy
- Security Whitepaper
- FAQ section
- Contact information for privacy questions
## Future Privacy Enhancements
- Enhanced encryption methods
- More user control options
- Transparent AI explanations
- Improved data minimization
At SerenAI, we believe privacy is fundamental to trust. We're committed to protecting your information while providing valuable mental wellness services.
      `
    },
  ];

  const filteredItems = documentationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Dynamically import jsPDF only on the client side
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Set up document properties
      doc.setProperties({
        title: 'SerenAI Documentation',
        subject: 'User Guide and Documentation',
        author: 'SerenAI Team',
        keywords: 'mental health, wellness, documentation',
        creator: 'SerenAI'
      });
      
      // Add title page
      doc.setFontSize(24);
      doc.text('SerenAI Documentation', 105, 30, { align: 'center' });
      doc.setFontSize(16);
      doc.text('Your Complete Guide to Mental Wellness', 105, 45, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Generated on: ' + new Date().toLocaleDateString(), 105, 60, { align: 'center' });
      
      // Add table of contents
      doc.setFontSize(16);
      doc.text('Table of Contents', 20, 80);
      doc.setFontSize(12);
      
      let yPosition = 90;
      filteredItems.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.title}`, 25, yPosition);
        yPosition += 10;
      });
      
      // Add documentation items
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Documentation Articles', 20, 20);
      
      yPosition = 35;
      filteredItems.forEach((item) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.text(item.title, 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        const descriptionLines = doc.splitTextToSize(item.description, 170);
        descriptionLines.forEach((line: string) => {
          doc.text(line, 25, yPosition);
          yPosition += 6;
        });
        
        doc.text(`Category: ${item.category} | Difficulty: ${item.difficulty} | Read Time: ${item.readTime}`, 25, yPosition);
        yPosition += 10;
        
        doc.text(`Last Updated: ${item.lastUpdated}`, 25, yPosition);
        yPosition += 15;
      });
      
      // Add additional resources section
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Additional Resources', 20, yPosition);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.text('Video Tutorials', 25, yPosition);
      yPosition += 8;
      doc.text('Watch our video guides to learn how to use SerenAI effectively.', 25, yPosition);
      yPosition += 12;
      
      doc.text('Community Forum', 25, yPosition);
      yPosition += 8;
      doc.text('Connect with other users and share your experiences with SerenAI.', 25, yPosition);
      yPosition += 12;
      
      doc.text('Webinars & Workshops', 25, yPosition);
      yPosition += 8;
      doc.text('Join our live sessions to learn more about mental wellness.', 25, yPosition);
      
      // Save the PDF
      doc.save('serenai-documentation.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again later.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const scrollToDocumentation = () => {
    documentationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Documentation</h1>
        </div>
        
        {/* Hero Section */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Everything you need to know about SerenAI</h2>
                  <p className="mb-6 text-blue-100 max-w-2xl">
                    Explore our comprehensive documentation to learn how to make the most of SerenAI&apos;s features 
                    and support your mental wellness journey.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="secondary" 
                      className="bg-white text-blue-600 hover:bg-gray-100"
                      onClick={scrollToDocumentation}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Getting Started
                    </Button>
                    <Link href="/dashboard/video-tutorials">
                      <Button className="bg-white/20 backdrop-blur-sm text-white border-white hover:bg-white hover:text-blue-600 shadow-md">
                        <Video className="h-4 w-4 mr-2" />
                        Video Tutorials
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="w-64 h-64 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <BookOpen className="h-24 w-24 text-white/80" />
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Categories */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-9">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <div className="flex items-center gap-1">
                    {category.icon}
                    <span className="hidden sm:inline">{category.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Documentation Items */}
        <div ref={documentationRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {item.icon}
                    </div>
                    <Badge className={getDifficultyColor(item.difficulty)}>
                      {item.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.readTime} read
                    </div>
                    <div>Updated {item.lastUpdated}</div>
                  </div>
                  <Button className="w-full" onClick={() => setSelectedArticle(item)}>
                    Read Article
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documentation found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Additional Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold mb-2">Video Tutorials</h3>
                <p className="text-gray-600 mb-4">Watch our video guides to learn how to use SerenAI effectively.</p>
                <Link href="/dashboard/video-tutorials">
                  <Button variant="outline" className="w-full">
                    Watch Videos
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold mb-2">Community</h3>
                <p className="text-gray-600 mb-4">Connect with other users and share your experiences with SerenAI.</p>
                <Link href="/dashboard/community">
                  <Button variant="outline" className="w-full">
                    Join Community
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold mb-2">Webinars & Workshops</h3>
                <p className="text-gray-600 mb-4">Join our live sessions to learn more about mental wellness.</p>
                <Link href="/dashboard/webinars-workshops">
                  <Button variant="outline" className="w-full">
                    View Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedArticle.readTime} read
                  </div>
                  <div>Updated {selectedArticle.lastUpdated}</div>
                  <Badge className={getDifficultyColor(selectedArticle.difficulty)}>
                    {selectedArticle.difficulty}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedArticle(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="prose max-w-none">
                {selectedArticle.content.split('\n').map((paragraph, index) => {
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-6 mb-4">{paragraph.substring(2)}</h1>;
                  } else if (paragraph.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold mt-5 mb-3">{paragraph.substring(3)}</h2>;
                  } else if (paragraph.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{paragraph.substring(4)}</h3>;
                  } else if (paragraph.startsWith('#### ')) {
                    return <h4 key={index} className="text-md font-bold mt-3 mb-2">{paragraph.substring(5)}</h4>;
                  } else if (paragraph.startsWith('- ')) {
                    return <li key={index} className="ml-5">{paragraph.substring(2)}</li>;
                  } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <p key={index} className="font-bold mt-2 mb-2">{paragraph.substring(2, paragraph.length - 2)}</p>;
                  } else if (paragraph.trim() === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="mt-2 mb-2">{paragraph}</p>;
                  }
                })}
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setSelectedArticle(null)}>
                Close Article
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}