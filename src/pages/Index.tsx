import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Header />
        <Hero />
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default Index;
