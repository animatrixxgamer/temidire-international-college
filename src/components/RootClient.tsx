"use client";
import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/motion/SmoothReveal";
import { TransitionProvider } from "@/components/motion/PageTransition";
import { ToastProvider } from "@/components/motion/Portal";
import Preloader from "@/components/motion/Preloader";
import CustomCursor from "@/components/motion/CustomCursor";
import { ScrollProgress } from "@/components/motion/primitives";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function RootClient({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <TransitionProvider>
        <ToastProvider>
          <Preloader />
          <CustomCursor />
          <ScrollProgress />
          <Header />
          {children}
          <Footer />
          <WhatsAppButton />
        </ToastProvider>
      </TransitionProvider>
    </SmoothScroll>
  );
}
