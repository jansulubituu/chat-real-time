"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  // Nếu đã đăng nhập, chuyển hướng đến trang chat
  React.useEffect(() => {
    if (!isLoading && user) {
      // router.push('/chat');
    }
  }, [user, isLoading, router]);

  // Hiển thị loading nếu đang kiểm tra trạng thái đăng nhập
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-white overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-full py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-10 backdrop-blur-lg bg-white/70"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
            >
              Realtime Chat
            </motion.div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login" className="hidden sm:block">
              <Button variant="outline" size="sm" className="transition-all hover:scale-105">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="transition-all hover:scale-105">Sign Up</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="flex flex-col space-y-8"
            >
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-800 via-indigo-700 to-blue-600 text-transparent bg-clip-text leading-tight">
                Connect and chat in real-time with anyone, anywhere
              </h1>
              <p className="text-lg text-gray-600 md:pr-10">
                Experience seamless communication with our fast, secure, and feature-rich chat application. Stay connected with friends, family, or colleagues with instant messaging.
              </p>
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <motion.div variants={fadeIn} className="w-full sm:w-auto">
                  <Link href="/register" className="block">
                    <Button 
                      size="lg" 
                      fullWidth 
                      className="transition-all duration-300 transform hover:translate-y-[-4px] hover:shadow-lg"
                    >
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={fadeIn} className="w-full sm:w-auto">
                  <Link href="/login" className="block">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      fullWidth
                      className="transition-all duration-300 transform hover:translate-y-[-4px] hover:shadow-md"
                    >
                      I already have an account
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-md h-96 sm:h-[450px] perspective-1000">
                <div className="absolute inset-0 bg-blue-600 rounded-lg transform rotate-3 opacity-10 animate-pulse"></div>
                <div className="absolute inset-0 bg-blue-500 rounded-lg transform -rotate-3 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <motion.div 
                  initial={{ y: 20, opacity: 0.8 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }}
                  className="relative h-full w-full bg-white rounded-lg shadow-2xl p-6 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">RC</div>
                      <div className="ml-4">
                        <p className="font-medium">Chat App</p>
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                          <p className="text-sm text-gray-500">Online</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow py-4 space-y-4 overflow-hidden">
                    {/* Sample messages with typing animation */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-start"
          >
                      <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                        <p className="text-sm">Hi there! Welcome to our chat application.</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="flex justify-end"
                    >
                      <div className="bg-blue-600 text-white rounded-lg p-3 max-w-[70%]">
                        <p className="text-sm">Thanks! This looks awesome.</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                        <TypewriterText text="Sign up to start chatting with friends!" delay={50} />
                      </div>
                    </motion.div>
                  </div>
                  <div className="flex items-center border-t pt-4">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      disabled
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-r-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ 
            visible: { 
              transition: { staggerChildren: 0.1 } 
            },
            hidden: {}
          }}
          className="py-16 lg:py-24 bg-white relative"
        >
          {/* Background Decorations */}
          <div className="absolute top-0 inset-0 opacity-5 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-96 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
            <div className="absolute -bottom-24 left-96 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" style={{ animationDelay: '8s' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              variants={fadeIn}
              className="text-center mb-12 lg:mb-20"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Everything you need for seamless communication</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <FeatureCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                title="Real-time Messaging"
                description="Send and receive messages instantly without refreshing the page. Experience true real-time communication."
              />
              <FeatureCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                title="Secure Communication"
                description="All messages are encrypted and transmitted securely. Your privacy is our top priority."
              />
              <FeatureCard 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                }
                title="User Friendly"
                description="Intuitive interface designed for the best user experience. Connect with friends and family without any hassle."
              />
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to start chatting?
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-100 max-w-2xl mx-auto">
              Join thousands of users already connecting through our platform.
            </p>
            <div className="mt-8 flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/register">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 transition-all shadow-xl"
                  >
                    Get Started For Free
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-gray-500 text-sm mb-4 md:mb-0"
            >
              © {new Date().getFullYear()} Realtime Chat. All rights reserved.
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex space-x-6"
            >
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Contact</a>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// TypewriterText Component
const TypewriterText = ({ text, delay = 70 }: { text: string, delay?: number }) => {
  const [displayedText, setDisplayedText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <p className="text-sm">{displayedText}<span className="animate-blink">|</span></p>;
};

// FeatureCard Component
const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) => {
  return (
    <motion.div 
      variants={fadeIn}
      className="bg-blue-50 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};
